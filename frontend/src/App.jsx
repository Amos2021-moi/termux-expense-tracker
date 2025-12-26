import { useEffect, useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import './App.css'

function App() {
  const { user } = useUser();
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState([])
  const [form, setForm] = useState({ description: '', amount: '', category: 'Food' })
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  
  // Phase 27: New Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")

  const MONTHLY_LIMIT = 1000;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    if (user) fetchData();
  }, [theme, user])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  const fetchData = async () => {
    if (!user) return;
    try {
      const [expRes, sumRes] = await Promise.all([
        fetch(`http://localhost:3000/api/expenses?userId=${user.id}`),
        fetch(`http://localhost:3000/api/summary?userId=${user.id}`)
      ]);
      setExpenses(await expRes.json());
      setSummary(await sumRes.json());
    } catch (err) { console.error("Sync Error:", err); }
  }

  const addExpense = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !user) return;
    await fetch('http://localhost:3000/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, userId: user.id })
    });
    setForm({ description: '', amount: '', category: 'Food' });
    fetchData();
  }

  const deleteExpense = async (id) => {
    if(!window.confirm("Delete this transaction?")) return;
    await fetch(`http://localhost:3000/api/expenses/${id}?userId=${user.id}`, { method: 'DELETE' });
    fetchData();
  }

  // Phase 27: Filtering Logic
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const grandTotal = summary.reduce((acc, curr) => acc + Number(curr.total), 0);
  const budgetPercent = Math.min((grandTotal / MONTHLY_LIMIT) * 100, 100);

  return (
    <div className="app-container">
      <SignedOut>
        <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
          <h1>TrackIt Pro</h1>
          <SignInButton mode="modal">
            <button className="btn-add" style={{width: '100%'}}>Sign In</button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="card">
          <div className="header">
            <div className="user-profile">
              <UserButton />
              <div>
                <h2>{user?.firstName}'s Finances</h2>
                <span className="status-badge">Live Sync</span>
              </div>
            </div>
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          
          <div className="analytics-card">
            <div className="total-main">
              <small>Total Spent This Month</small>
              <h1>${grandTotal.toFixed(2)}</h1>
            </div>
            
            <div className="budget-progress">
              <div className="progress-labels">
                <span>Budget Limit: ${MONTHLY_LIMIT}</span>
                <span>{budgetPercent.toFixed(0)}%</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${budgetPercent}%`,
                    backgroundColor: budgetPercent > 90 ? 'var(--danger)' : 'var(--primary)'
                  }}
                ></div>
              </div>
            </div>
          </div>

          <form onSubmit={addExpense} className="add-form no-print">
            <input 
              placeholder="What did you buy?" 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
            />
            <div className="input-group">
              <input 
                type="number" 
                placeholder="0.00" 
                value={form.amount} 
                onChange={e => setForm({...form, amount: e.target.value})} 
              />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option>Food</option>
                <option>Transport</option>
                <option>Rent</option>
                <option>Shopping</option>
                <option>Other</option>
              </select>
            </div>
            <button type="submit" className="btn-add">Add Transaction</button>
          </form>

          {/* Phase 27: Search & Filter UI */}
          <div className="filter-bar no-print">
            <input 
              className="search-input"
              placeholder="Search expenses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="filter-select"
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Rent">Rent</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="task-list">
            <div className="list-header">
              {searchTerm || filterCategory !== "All" ? "FILTERED RESULTS" : "RECENT ACTIVITY"}
            </div>
            {filteredExpenses.length === 0 ? (
              <p style={{textAlign: 'center', color: 'var(--sub-text)', padding: '20px'}}>No matching transactions.</p>
            ) : (
              filteredExpenses.map(exp => (
                <div key={exp.id} className="task-item">
                  <div className="item-info">
                    <span className="item-name">{exp.description}</span>
                    <span className="item-meta">{exp.category} • {exp.date_label}</span>
                  </div>
                  <div className="item-action">
                    <span className="item-price">-${Number(exp.amount).toFixed(2)}</span>
                    <button onClick={() => deleteExpense(exp.id)}>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SignedIn>
    </div>
  )
}

export default App