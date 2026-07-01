require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

const origensPermitidas = [
    'http://localhost:5500',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: origensPermitidas,
    methods: ['GET', 'POST']
}));

app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

app.get('/health', (req, res) => {
    res.json({ status: 'API online' });
});

app.get('/ganhos', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM faturamento_diario ORDER BY dia DESC'
        );

        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar ganhos:', error);
        res.status(500).json({ error: 'Erro ao buscar ganhos' });
    }
});

app.post('/ganhos', async (req, res) => {
    try {
        const { 
            dia, 
            uber, 
            noventa_nove, 
            indrive, 
            outros, 
            kms_rodados, 
            valor_combustivel, 
            valor_litro, 
            quantidade_litros, 
            total_dia 
        } = req.body;

        const query = `
            INSERT INTO faturamento_diario 
            (dia, uber, noventa_nove, indrive, outros, kms_rodados, valor_combustivel, valor_litro, quantidade_litros, total_dia) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [
            dia, 
            uber, 
            noventa_nove, 
            indrive, 
            outros, 
            kms_rodados, 
            valor_combustivel, 
            valor_litro, 
            quantidade_litros, 
            total_dia
        ]);

        res.status(201).json({ 
            id: result.insertId, 
            dia, uber, noventa_nove, indrive, outros, kms_rodados, valor_combustivel, valor_litro, quantidade_litros, total_dia 
        });

    } catch (error) {
        console.error('Erro ao adicionar ganho:', error);
        res.status(500).json({ error: 'Erro ao adicionar ganho' });
    }
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
});

