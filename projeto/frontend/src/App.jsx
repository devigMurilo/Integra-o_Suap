import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/dashboard';
import Boletim from './pages/boletim';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Boletim" element={<Boletim />} />
        <Route path="/Calendario" element={<Calendario />} />
        <Route path="/Analises" element={<Analises />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;