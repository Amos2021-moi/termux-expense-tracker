import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [form, setForm] = useState({ description: '', amount: '', category: 'Food' })

  const fetchData = async () => {
    try {
      const [expRes, sumRes] = await Promise.all([
        fetch('http://localhost:3000/api/expenses'),
        fetch('http://localhost:3000/api/summary')
      ]);
      const expData = await expRes.json();
      const sumData = await sumRes.json();
      setExpenses(expData);
      setSummary(sumData);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  useEffect(() => { fetchData() }, [])

  const addExpense = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    await fetch('http://localhost:3000/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ description: '', amount: '', category: 'Food' });
    fetchData();
  }

  const deleteExpense = async (id) => {
    if(!window.confirm("Delete this transaction?")) return;
    await fetch(`http://localhost:3000/api/expenses/${id}`, { method: 'DELETE' });
    fetchData();
  }

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const grandTotal = summary.reduce((acc, curr) => acc + Number(curr.total), 0);

  return (
    <div className="app-container">
      <div className="card">
        <h1>Expense Dashboard</h1>
        
        {/* Total Display */}
        <div style={{ background: '#6366f1', color: 'white', padding: '25px', borderRadius: '16px', textAlign: 'center', marginBottom: '20px' }}>
          <small style={{ opacity: 0.8, textTransform: 'uppercase' }}>Total Spent</small>
          <h2 style={{ fontSize: '2.5rem', margin: '5px 0' }}>${grandTotal.toFixed(2)}</h2>
        </div>

        {/* PHASE 22: Visual Chart Breakdown */}
        <div style={{ marginBottom: '30px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#64748b' }}>Category Distribution</h3>
          {summary.map(s => {
            const percentage = ((Number(s.total) / grandTotal) * 100).toFixed(0);
            return (
              <div key={s.category} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>{s.category}</span>
                  <span style={{ fontWeight: 'bold' }}>{percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: '#6366f1', transition: 'width 0.5s ease-in-out' }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Add Form */}
        <form onSubmit={addExpense} style={{ display: 'grid', gap: '10px', marginBottom: '25px' }}>
          <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={{flex: 1}} />
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
              <option>Food</option>
              <option>Transport</option>
              <option>Rent</option>
              <option>Shopping</option>
              <option>Health</option>
              <option>Other</option>
            </select>
          </div>
          <button type="submit" className="btn-add">Log Expense</button>
        </form>

        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <input 
            placeholder="🔍 Filter transactions..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* List */}
        <div className="task-list">
          {filteredExpenses.map(exp => (
            <div key={exp.id} className="task-item">
              <div style={{ flex: 1 }}>
                <div className="task-text">{exp.description}</div>
                <small style={{ color: '#64748b' }}>{exp.category} • {exp.date_label}</small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: '700' }}>-${Number(exp.amount).toFixed(2)}</span>
                <button className="btn-delete" onClick={() => deleteExpense(exp.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App