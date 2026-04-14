const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.json());

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
            trustServerCertificate: true,
            port: 1433,
            connectTimeout: 60000
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

// Easypanel expone automáticamente el puerto 3000 por defecto en sus apps de Node
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Puente de Fabric escuchando en el puerto ${PORT}`);
});