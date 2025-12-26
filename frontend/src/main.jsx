import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

// Get this from clerk.com dashboard
const PUBLISHABLE_KEY = "pk_test_bmF0aXZlLWJveGVyLTcxLmNsZXJrLmFjY291bnRzLmRldiQ" 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)