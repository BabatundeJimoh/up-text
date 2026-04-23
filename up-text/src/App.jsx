// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast'
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./App.css";



export default function App() {
  return (
    <>
  <Toaster
  position="top-center"
  toastOptions={{
    style: {
      borderRadius: '14px',
      background: 'linear-gradient(135deg, rgba(123,97,255,0.9), rgba(159,107,255,0.8))',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 10px 30px rgba(123, 97, 255, 0.35)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      padding: '12px 16px',
    },
  }}
/>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/*" element={<Dashboard />} /> {/* Nested routes */}
      </Routes>
    </Router>
  
    </>
  );
  
}