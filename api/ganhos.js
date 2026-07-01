const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não foi configurada na Vercel.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') {
            const { rows } = await pool.query(
                'SELECT * FROM faturamento_diario ORDER BY dia DESC'
            );

            return res.status(200).json(rows);
        }

        if (req.method === 'POST') {
            const {
                dia,
                uber = 0,
                noventa_nove = 0,
                indrive = 0,
                outros = 0,
                kms_rodados = 0,
                valor_combustivel = 0,
                valor_litro = 0,
                quantidade_litros = 0,
                total_dia = 0
            } = req.body;

            if (!dia) {
                return res.status(400).json({
                    error: 'A data é obrigatória.'
                });
            }

            const query = `
                INSERT INTO faturamento_diario (
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
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `;

            const valores = [
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
            ];

            const { rows } = await pool.query(query, valores);

            return res.status(201).json(rows[0]);
        }

        return res.status(405).json({
            error: 'Método não permitido.'
        });
    } catch (error) {
        console.error('Erro na API:', error);

        return res.status(500).json({
            error: error.message
        });
    }
};
