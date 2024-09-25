const express = require('express');
const sql = require('mssql');
const path = require('path');

const app = express();

const dbConfig = {
    user:'csd01',
    password:'CSD@Bnex#202404',
    server:'bnexanalytics01.database.windows.net',
    database:'bd-csd-01'
};

app.get('/api/genero', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`
            SELECT 
                genero,
                COUNT(*) AS quantidade,
                (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()) AS porcentagem
            FROM 
                trusted.cliente
            WHERE 
                genero IN ('MASCULINO', 'FEMININO')
            GROUP BY 
                genero;
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/faixaetaria', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`
            WITH Idades AS (
                SELECT 
                    idcliente,
                    nascimento,
                    DATEDIFF(YEAR, nascimento, GETDATE()) AS idade
                FROM 
                    trusted.cliente
                WHERE 
                    nascimento IS NOT NULL
            )
            SELECT 
                CASE 
                    WHEN idade BETWEEN 0 AND 18 THEN '0-18'
                    WHEN idade BETWEEN 19 AND 30 THEN '19-30'
                    WHEN idade BETWEEN 31 AND 45 THEN '31-45'
                    WHEN idade BETWEEN 46 AND 60 THEN '46-60'
                    ELSE '61+' 
                END AS "FaixaEtária",
                COUNT(*) AS "Quantidade",
                (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()) AS "Porcentagem"
            FROM 
                Idades
            GROUP BY 
                CASE 
                    WHEN idade BETWEEN 0 AND 18 THEN '0-18'
                    WHEN idade BETWEEN 19 AND 30 THEN '19-30'
                    WHEN idade BETWEEN 31 AND 45 THEN '31-45'
                    WHEN idade BETWEEN 46 AND 60 THEN '46-60'
                    ELSE '61+' 
                END
            ORDER BY 
                "FaixaEtária";
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
