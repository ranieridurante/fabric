const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.json());

// Ruta de comprobación de salud para que Easypanel sepa que la app está viva
app.get('/', (req, res) => {
    res.send('Puente de Fabric Activo y funcionando.');
});

app.post('/fabric-query', async (req, res) => {
    const body = req.body;

    if (!body || !body.access_token) {
        return res.status(400).json({ success: false, error: "Faltan datos en la petición." });
    }

    const config = {
        server: body.server,
        database: body.database,
        authentication: {
            type: 'azure-active-directory-access-token',
            options: { token: body.access_token }
        },
        options: {
            encrypt: true,
            trustServerCertificate: true, // Ignora errores de certificado SSL de Microsoft
            port: 1433,
            connectTimeout: 60000 // Da más tiempo para la primera conexión a Fabric
        }
    };

    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(body.query);
        pool.close();
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Forzamos a escuchar en 0.0.0.0 para compatibilidad total con el Docker de Easypanel
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Puente de Fabric escuchando en el puerto ${PORT}`);
});