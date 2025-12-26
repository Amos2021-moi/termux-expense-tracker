import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

const app = express();
const PORT = 3000;

// Database Connection
const sql = neon("postgresql://neondb_owner:npg_rOkKjUIpu23E@ep-autumn-butterfly-ad1904ur-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

app.use(cors());
app.use(express.json());

// GET: Fetch expenses for the logged-in user
app.get('/api/expenses', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    try {
        const data = await sql`
            SELECT id, description, amount, category, 
            TO_CHAR(created_at, 'DD Mon, YYYY') as date_label 
            FROM expenses 
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SUMMARY: Calculate totals for the logged-in user
app.get('/api/summary', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    try {
        const summary = await sql`
            SELECT category, SUM(amount) as total 
            FROM expenses 
            WHERE user_id = ${userId}
            GROUP BY category
        `;
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Save new expense with owner ID
app.post('/api/expenses', async (req, res) => {
    const { description, amount, category, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    try {
        await sql`
            INSERT INTO expenses (description, amount, category, user_id) 
            VALUES (${description}, ${parseFloat(amount)}, ${category}, ${userId})
        `;
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Secure delete (Checks if user owns the record)
app.delete('/api/expenses/:id', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const result = await sql`
            DELETE FROM expenses 
            WHERE id = ${req.params.id} AND user_id = ${userId}
            RETURNING *
        `;
        
        if (result.length === 0) {
            return res.status(403).json({ error: "Permission denied" });
        }
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Secure Backend Active on ${PORT}`));