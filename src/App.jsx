import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Calendario from './pages/Calendario';
import Objetivos from './pages/Objetivos';
import Perfil from './pages/Perfil';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="objetivos" element={<Objetivos />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
