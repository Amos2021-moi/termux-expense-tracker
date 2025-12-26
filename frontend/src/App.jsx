import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({ description: '', amount: '', category: 'Food' })

  // Fetch data from backend
  const fetchExpenses = () => {
    fetch('http://localhost:3000/api/expenses')
      .then(res => res.json())
      .then(data => {
        console.log("Data received:", data); // Debugging
        setExpenses(data);
      })
      .catch(err => console.error("Fetch error:", err));
  }

  useEffect(() => { 
    fetchExpenses();
  }, []);

  const addExpense = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;

    fetch('http://localhost:3000/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    .then(res => res.json())
    .then(() => {
      setForm({ description: '', amount: '', category: 'Food' });
      fetchExpenses(); // Re-fetch list to update UI and Total
    })
    .catch(err => console.error("Add error:", err));
  }

  const deleteExpense = (id) => {
    fetch(`http://localhost:3000/api/expenses/${id}`, { method: 'DELETE' })
      .then(() => fetchExpenses());
  }

  // FIX: Ensure amount is treated as a number
  const total = expenses.reduce((acc, curr) => {
    return acc + Number(curr.amount);
  }, 0);

  return (
    <div className="app-container">
      <div className="card">
        <h1>Expense Tracker</h1>
        
        <div style={{ textAlign: 'center', marginBottom: '20px', padding: '15px', background: '#f1f5f9', borderRadius: '12px' }}>
          <small style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Spent</small>
          <h2 style={{ fontSize: '2.5rem', margin: '0', color: '#6366f1' }}>
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>

        <form onSubmit={addExpense} style={{ display: 'grid', gap: '10px', marginBottom: '25px' }}>
          <input 
            placeholder="Description (e.g. Lunch)" 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})} 
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="number" 
              step="0.01"
              placeholder="0.00" 
              value={form.amount} 
              onChange={e => setForm({...form, amount: e.target.value})} 
            />
            <select 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})}
              style={{ padding: '10px', borderRadius: '12px', border: '2px solid #e2e8f0', flex: 1 }}
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Rent</option>
              <option>Entertainment</option>
              <option>Other</option>
            </select>
          </div>
          <button type="submit" className="btn-add">Add Transaction</button>
        </form>

        <div className="task-list">
          {expenses.length === 0 ? <p style={{ textAlign: 'center', color: '#94a3b8' }}>No transactions yet</p> : 
           expenses.map(exp => (
            <div key={exp.id} className="task-item">
              <div>
                <div className="task-text">{exp.description}</div>
                <small style={{ color: '#64748b' }}>{exp.category}</small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: '700', color: '#1e293b' }}>
                  -${Number(exp.amount).toFixed(2)}
                </span>
                <button 
                  className="btn-delete" 
                  onClick={() => deleteExpense(exp.id)}
                  style={{ padding: '5px 10px' }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App