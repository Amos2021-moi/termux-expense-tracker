import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

const app = express();
const PORT = 3000;
const sql = neon(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

// 1. GET ALL EXPENSES
app.get('/api/expenses', async (req, res) => {
    try {
        const data = await sql`SELECT * FROM expenses ORDER BY created_at DESC`;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. ADD NEW EXPENSE
app.post('/api/expenses', async (req, res) => {
    const { description, amount, category } = req.body;
    
    // Convert amount to number to ensure database likes it
    const numericAmount = parseFloat(amount);

    try {
        const result = await sql`
            INSERT INTO expenses (description, amount, category) 
            VALUES (${description}, ${numericAmount}, ${category}) 
            RETURNING *`;
        res.status(201).json(result[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 3. DELETE EXPENSE
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await sql`DELETE FROM expenses WHERE id = ${req.params.id}`;
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Expense API Live on ${PORT}`));