import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

export default function Objetivos() {
  const { goals, setGoals, workouts } = useData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(goals);

  const last14Days = useMemo(() => {
    const days = [];
    const now = new Date();
    // Normalize to midnight
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const dayWorkouts = workouts.filter(w => {
        const wd = new Date(w.date);
        return wd.getFullYear() === d.getFullYear() && 
               wd.getMonth() === d.getMonth() && 
               wd.getDate() === d.getDate();
      });
      
      const totalDist = dayWorkouts.reduce((acc, w) => acc + parseFloat(w.distanceKm || 0), 0);
      days.push({
        label: d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase(),
        dist: totalDist,
        date: d
      });
    }
    return days;
  }, [workouts]);

  const maxDist = Math.max(...last14Days.map(d => d.dist), 5); // Avoid div by 0, min scaling to 5km
  
  const handleSave = (e) => {
    e.preventDefault();
    setGoals(editForm);
    setIsEditModalOpen(false);
  };

  const commingSoon = () => alert('Característica en desarrollo');

  return (
    <>
      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto space-y-8">
        {/* Welcome Header */}
        <section className="space-y-2">
          <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface">Objetivos</h2>
          <p className="font-label text-sm text-on-surface-variant tracking-wide">PANEL DE RENDIMIENTO Y ESTRATEGIA IA</p>
        </section>

        {/* Bento Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* IA Analysis Card (Featured) */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-surface-container relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-9xl">psychology</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">bolt</span>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">Análisis IA</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">Optimización Basada en Strava</h3>
              <div className="space-y-4">
                <div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-primary">
                  <p className="text-on-surface font-medium italic">"Has subido el volumen de desnivel un 18% esta semana. Tu variabilidad de frecuencia cardíaca indica fatiga acumulada. <strong>Descansa mañana</strong> para evitar sobrecarga en los sóleos."</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-xs font-bold font-label">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    PROGRESO SÓLIDO
                  </div>
                  <div className="flex items-center gap-2 bg-tertiary/10 text-tertiary px-4 py-2 rounded-full text-xs font-bold font-label">
                    <span className="material-symbols-outlined text-sm">opacity</span>
                    HIDRATACIÓN +20%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action: Edit Card */}
          <div className="md:col-span-4 bg-primary text-on-primary rounded-[2rem] p-8 flex flex-col justify-between kinetic-gradient group cursor-pointer active:scale-95 transition-all" onClick={() => setIsEditModalOpen(true)}>
            <div>
              <span className="material-symbols-outlined text-4xl mb-4 group-hover:-rotate-12 transition-transform">edit_note</span>
              <h3 className="font-headline text-2xl font-bold leading-tight">Ajusta tu Trayectoria</h3>
            </div>
            <button className="bg-on-primary text-primary font-label text-xs font-extrabold py-3 px-6 rounded-full self-start hover:scale-105 transition-transform mt-8">
              EDITAR OBJETIVOS
            </button>
          </div>

          {/* Challenge List */}
          <div className="md:col-span-12 space-y-6">
            <h4 className="font-headline text-xl font-bold">Retos Personales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Goal 1: Short Term / Main */}
              <div className="bg-surface-container-low rounded-[2rem] p-6 flex flex-col gap-6 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold">RETO ACTUAL</span>
                    <h5 className="font-headline text-xl font-bold">{goals.challengeName}</h5>
                    <p className="text-xs text-on-surface-variant">Corto plazo: {goals.shortTermLabel}</p>
                  </div>
                  <div className="text-primary">
                    <span className="material-symbols-outlined text-3xl">terrain</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-label text-[10px] font-bold">
                    <span>PROGRESO</span>
                    <span className="text-primary">{goals.shortTermProgress}%</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary shadow-[0_0_10px_rgba(0,107,10,0.3)] transition-all duration-500" style={{ width: `${goals.shortTermProgress}%` }}></div>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-surface-dim flex items-center justify-center text-[10px] font-bold">J</div>
                    <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-surface-dim flex items-center justify-center text-[10px] font-bold">M</div>
                  </div>
                  <span className="text-[10px] font-label font-medium text-on-surface-variant">2 compañeros se han unido</span>
                </div>
              </div>

              {/* Goal 2: Mid Term */}
              <div className="bg-surface-container-lowest rounded-[2rem] p-6 flex flex-col gap-6 border border-surface-container shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold">MEDIO PLAZO</span>
                    <h5 className="font-headline text-xl font-bold">{goals.midTermLabel}</h5>
                    <p className="text-xs text-on-surface-variant">Largo Plazo: {goals.longTermLabel}</p>
                  </div>
                  <div className="text-tertiary">
                    <span className="material-symbols-outlined text-3xl">timer</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-label text-[10px] font-bold">
                    <span>PROGRESO MEDIO PLAZO</span>
                    <span className="text-tertiary">{goals.midTermProgress}%</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary transition-all duration-500" style={{ width: `${goals.midTermProgress}%` }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-surface-container-low p-2 rounded-xl text-center">
                    <p className="text-[10px] font-label text-on-surface-variant">PASO</p>
                    <p className="font-headline font-bold text-sm">5:35</p>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-xl text-center">
                    <p className="text-[10px] font-label text-on-surface-variant">RESTANTE</p>
                    <p className="font-headline font-bold text-sm">14 sem</p>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-xl text-center">
                    <p className="text-[10px] font-label text-on-surface-variant">KM/SEM</p>
                    <p className="font-headline font-bold text-sm">45.2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Progress Chart Concept */}
          <div className="md:col-span-12 bg-surface-container-low rounded-[2rem] p-8 overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
              <div className="space-y-2">
                <h4 className="font-headline text-2xl font-bold">Curva de Carga de Entrenamiento</h4>
                <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Últimos 30 días vs Objetivos Anuales</p>
              </div>
              <div className="flex gap-2">
                <button onClick={commingSoon} className="p-2 rounded-full bg-surface-container-highest text-primary hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">zoom_in</span>
                </button>
                <button onClick={commingSoon} className="p-2 rounded-full bg-surface-container-highest text-primary hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">ios_share</span>
                </button>
              </div>
            </div>

            {/* Dynamic Training Load Chart */}
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="relative h-64 min-w-[600px] md:min-w-full flex items-end gap-1 px-2">
                {last14Days.map((day, i) => {
                  const heightPercent = (day.dist / maxDist) * 100;
                  const isMax = day.dist > 0 && day.dist === Math.max(...last14Days.map(d => d.dist));
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group/bar h-full justify-end">
                      <div className="relative w-full flex flex-col items-center justify-end h-full">
                        {isMax && (
                          <div className="absolute -top-10 bg-on-surface text-surface text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap z-10 animate-pulse shadow-lg">
                            MAX CARGA
                          </div>
                        )}
                        
                        {/* Bar with tooltip-like hover */}
                        <div 
                          className={`w-full rounded-t-xl transition-all duration-500 relative ${day.dist > 0 ? (isMax ? 'kinetic-gradient shadow-[0_-4px_15px_rgba(161,57,0,0.3)]' : 'bg-primary/40 group-hover/bar:bg-primary/60') : 'bg-surface-container-highest/30'}`} 
                          style={{ height: `${Math.max(heightPercent, 2)}%` }}
                        >
                          {day.dist > 0 && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-on-surface-variant text-white text-[9px] font-bold px-1.5 py-0.5 rounded pointer-events-none">
                              {day.dist.toFixed(1)}k
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="mt-3 font-label text-[9px] text-on-surface-variant font-bold opacity-60 group-hover/bar:opacity-100 transition-opacity">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Edit Goals Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 kinetic-blur transition-opacity">
          <div className="bg-surface rounded-[2rem] w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border border-outline-variant/20">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined flex">close</span>
            </button>
            <h3 className="font-headline text-2xl font-bold mb-6 text-on-surface">Editar Objetivos</h3>

            <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Nombre del Reto (Challenge)</label>
                <input required type="text" value={editForm.challengeName} onChange={e => setEditForm(prev => ({ ...prev, challengeName: e.target.value }))} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body text-on-surface" />
              </div>

              <div>
                <label className="block font-label text-xs uppercase text-on-surface-variant mb-1 mt-4">Corto Plazo - Descripción</label>
                <input required type="text" value={editForm.shortTermLabel} onChange={e => setEditForm(prev => ({ ...prev, shortTermLabel: e.target.value }))} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
              </div>
              <div>
                <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Objetivo Semanal (km)</label>
                <input required type="number" min="1" value={editForm.weeklyTarget} onChange={e => setEditForm(prev => ({ ...prev, weeklyTarget: parseInt(e.target.value) }))} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
              </div>

              <div>
                <label className="block font-label text-xs uppercase text-on-surface-variant mb-1 mt-4">Medio Plazo - Descripción</label>
                <input required type="text" value={editForm.midTermLabel} onChange={e => setEditForm(prev => ({ ...prev, midTermLabel: e.target.value }))} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
              </div>
              <div>
                <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Objetivo Mensual (km)</label>
                <input required type="number" min="1" value={editForm.monthlyTarget} onChange={e => setEditForm(prev => ({ ...prev, monthlyTarget: parseInt(e.target.value) }))} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
              </div>

              <div>
                <label className="block font-label text-xs uppercase text-on-surface-variant mb-1 mt-4">Largo Plazo - Descripción</label>
                <input required type="text" value={editForm.longTermLabel} onChange={e => setEditForm(prev => ({ ...prev, longTermLabel: e.target.value }))} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
              </div>
              <div>
                <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Objetivo Anual (km)</label>
                <input required type="number" min="1" value={editForm.yearlyTarget} onChange={e => setEditForm(prev => ({ ...prev, yearlyTarget: parseInt(e.target.value) }))} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full kinetic-gradient text-white font-bold py-4 rounded-full active:scale-95 transition-transform flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-sm">save</span>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
