import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Boletim from './pages/Boletim';
import Calendario from './pages/Calendario';
import Analises from './pages/Analises';
import Perfil from './pages/Perfil';
import './App.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Boletim" element={<Boletim />} />
        <Route path="/Calendario" element={<Calendario />} />
        <Route path="/Analises" element={<Analises />} />
        <Route path="/Perfil" element={<Perfil />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;