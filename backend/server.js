import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

const app = express();
const PORT = 3000;
const sql = neon(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

// GET all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const data = await sql`
            SELECT id, description, amount, category, 
            TO_CHAR(created_at, 'DD Mon, YYYY') as date_label 
            FROM expenses 
            ORDER BY created_at DESC
        `;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Summary for Visual Charts
app.get('/api/summary', async (req, res) => {
    try {
        const summary = await sql`
            SELECT category, SUM(amount) as total 
            FROM expenses 
            GROUP BY category
            ORDER BY total DESC
        `;
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/expenses', async (req, res) => {
    const { description, amount, category } = req.body;
    try {
        await sql`
            INSERT INTO expenses (description, amount, category) 
            VALUES (${description}, ${parseFloat(amount)}, ${category})
        `;
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await sql`DELETE FROM expenses WHERE id = ${req.params.id}`;
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Phase 22: Visuals Active on ${PORT}`));