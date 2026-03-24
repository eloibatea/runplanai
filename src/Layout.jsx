import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useData } from './context/DataContext';

export default function Layout() {
  const { userProfile, addWorkout } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    title: 'Recuperación Activa',
    type: 'Run',
    distanceKm: '5.0',
    movingTime: '27m 30s',
    avgPace: '5:30',
    elevationM: '50',
    location: 'Mi Ruta Habitual'
  });

  const handleAddWorkout = (e) => {
    e.preventDefault();
    addWorkout({
      ...newWorkout,
      date: new Date().toISOString()
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="bg-[#fff4f0]/80 dark:bg-stone-900/80 backdrop-blur-md fixed top-0 w-full z-40">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/perfil" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed hover:scale-105 transition-transform cursor-pointer">
              <img alt="Avatar" className="w-full h-full object-cover" src={userProfile.avatarUrl} />
            </Link>
            <h1 className="text-xl font-bold tracking-tighter text-[#a13900] dark:text-[#ff793e] uppercase font-headline">RUNPLANAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => alert('No tienes nuevas notificaciones en este momento.')} className="text-[#4b2409]/60 dark:text-[#fff4f0]/60 hover:opacity-80 transition-opacity active:scale-95 duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </header>

      <Outlet />

      <nav className="fixed bottom-0 left-0 w-full h-20 bg-white dark:bg-stone-950 flex justify-around items-center px-4 pb-safe rounded-t-[0.75rem] z-40 shadow-[0_-20px_40px_rgba(75,36,9,0.06)]">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center px-4 py-2 transition-all active:scale-90 duration-150 ${isActive ? 'bg-gradient-to-br from-[#a13900] to-[#ff793e] text-white rounded-[0.75rem] scale-110 -translate-y-1' : 'text-[#4b2409]/50 dark:text-[#fff4f0]/50 hover:text-[#a13900] dark:hover:text-[#ff793e]'}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-['Lexend'] text-[10px] font-medium uppercase tracking-widest mt-1">Dashboard</span>
        </NavLink>
        <NavLink to="/calendario" className={({ isActive }) => `flex flex-col items-center justify-center px-4 py-2 transition-all active:scale-90 duration-150 ${isActive ? 'bg-gradient-to-br from-[#a13900] to-[#ff793e] text-white rounded-[0.75rem] scale-110 -translate-y-1' : 'text-[#4b2409]/50 dark:text-[#fff4f0]/50 hover:text-[#a13900] dark:hover:text-[#ff793e]'}`}>
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="font-['Lexend'] text-[10px] font-medium uppercase tracking-widest mt-1">Calendario</span>
        </NavLink>
        <NavLink to="/objetivos" className={({ isActive }) => `flex flex-col items-center justify-center px-4 py-2 transition-all active:scale-90 duration-150 ${isActive ? 'bg-gradient-to-br from-[#a13900] to-[#ff793e] text-white rounded-[0.75rem] scale-110 -translate-y-1' : 'text-[#4b2409]/50 dark:text-[#fff4f0]/50 hover:text-[#a13900] dark:hover:text-[#ff793e]'}`}>
          <span className="material-symbols-outlined">ads_click</span>
          <span className="font-['Lexend'] text-[10px] font-medium uppercase tracking-widest mt-1">Objetivos</span>
        </NavLink>
        <NavLink to="/perfil" className={({ isActive }) => `flex flex-col items-center justify-center px-4 py-2 transition-all active:scale-90 duration-150 ${isActive ? 'bg-gradient-to-br from-[#a13900] to-[#ff793e] text-white rounded-[0.75rem] scale-110 -translate-y-1' : 'text-[#4b2409]/50 dark:text-[#fff4f0]/50 hover:text-[#a13900] dark:hover:text-[#ff793e]'}`}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-['Lexend'] text-[10px] font-medium uppercase tracking-widest mt-1">Perfil</span>
        </NavLink>
      </nav>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 kinetic-gradient text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all z-40 outline-none">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Add Workout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 kinetic-blur transition-opacity">
          <div className="bg-surface rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined flex">close</span>
            </button>
            <h3 className="font-headline text-2xl font-bold mb-6 text-on-surface">Nuevo Entrenamiento</h3>
            
            <form onSubmit={handleAddWorkout} className="space-y-4">
              <div className="grid grid-cols-[1fr_120px] gap-4">
                <div>
                  <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Título</label>
                  <input required type="text" value={newWorkout.title} onChange={e=>setNewWorkout({...newWorkout, title: e.target.value})} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body text-on-surface" />
                </div>
                <div>
                  <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Tipo</label>
                  <select value={newWorkout.type} onChange={e=>setNewWorkout({...newWorkout, type: e.target.value})} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface appearance-none">
                    <option value="Run">Run</option>
                    <option value="TrailRun">Trail</option>
                    <option value="Ride">Bici</option>
                    <option value="Swim">Nado</option>
                    <option value="Gym">Gym</option>
                    <option value="Other">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Distancia (km)</label>
                  <input required type="number" step="0.1" value={newWorkout.distanceKm} onChange={e=>setNewWorkout({...newWorkout, distanceKm: e.target.value})} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
                </div>
                <div>
                  <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Duración</label>
                  <input required type="text" placeholder="e.g 45m 20s" value={newWorkout.movingTime} onChange={e=>setNewWorkout({...newWorkout, movingTime: e.target.value})} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Ritmo (m:s)</label>
                  <input required type="text" placeholder="e.g 4:30" value={newWorkout.avgPace} onChange={e=>setNewWorkout({...newWorkout, avgPace: e.target.value})} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
                </div>
                <div>
                  <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Elevavión (m)</label>
                  <input type="number" value={newWorkout.elevationM} onChange={e=>setNewWorkout({...newWorkout, elevationM: e.target.value})} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
                </div>
              </div>

              <div>
                <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Lugar</label>
                <input type="text" value={newWorkout.location} onChange={e=>setNewWorkout({...newWorkout, location: e.target.value})} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full kinetic-gradient text-white font-bold py-4 rounded-full active:scale-95 transition-transform flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-sm">save</span>
                  Guardar Entrenamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
