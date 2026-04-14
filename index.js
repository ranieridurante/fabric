const express = require('express');
const odbc = require('odbc');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Puente de Fabric Activo y funcionando con ODBC.');
});

app.post('/fabric-query', async (req, res) => {
    const body = req.body;

    if (!body || !body.server || !body.database || !body.clientId || !body.tenantId || !body.clientSecret) {
        return res.status(400).json({ success: false, error: "Faltan credenciales en la petición." });
    }

    // Fabric usa el formato ClientID@TenantID para el usuario
    const uid = `${body.clientId}@${body.tenantId}`;
    const pwd = body.clientSecret;

    // Cadena de conexión oficial de Microsoft ODBC
    const connectionString = `DRIVER={ODBC Driver 18 for SQL Server};SERVER=${body.server};DATABASE=${body.database};UID=${uid};PWD=${pwd};Authentication=ActiveDirectoryServicePrincipal;Encrypt=yes;TrustServerCertificate=yes;`;

    try {
        const connection = await odbc.connect(connectionString);
        const result = await connection.query(body.query);
        await connection.close();
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Puente de Fabric escuchando en el puerto ${PORT}`);
});
