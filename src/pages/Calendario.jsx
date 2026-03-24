import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

export default function Calendario() {
  const { stats, workouts } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Navigate months
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Format to standard week starting on Monday
  const startingEmptyCells = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const currentMonthName = monthNames[currentDate.getMonth()];

  // Active workout to show details on
  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [workouts]);

  const [activeWorkoutId, setActiveWorkoutId] = useState(sortedWorkouts.length > 0 ? sortedWorkouts[0].id : null);
  
  const activeWorkout = useMemo(() => {
    return sortedWorkouts.find(w => w.id === activeWorkoutId) || sortedWorkouts[0] || null;
  }, [activeWorkoutId, sortedWorkouts]);

  const getSportConfig = (type) => {
    switch(type) {
      case 'Run': return { color: 'bg-primary ring-primary', icon: 'directions_run', label: 'Running' };
      case 'TrailRun': return { color: 'bg-tertiary ring-tertiary', icon: 'terrain', label: 'Trail' };
      case 'Ride': return { color: 'bg-yellow-500 ring-yellow-500', icon: 'directions_bike', label: 'Ciclismo' };
      case 'Swim': return { color: 'bg-cyan-600 ring-cyan-600', icon: 'pool', label: 'Natación' };
      case 'Gym': return { color: 'bg-fuchsia-600 ring-fuchsia-600', icon: 'fitness_center', label: 'Gimnasio' };
      default: return { color: 'bg-slate-600 ring-slate-600', icon: 'sports', label: 'Actividad' };
    }
  };

  return (
    <>
      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto">

        {/* Calendar Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface capitalize">
              {currentMonthName} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-label text-[10px] uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Guardado
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface active:scale-95 transition-transform hover:bg-surface-container-highest">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-label text-xs font-bold active:scale-95 transition-transform hover:bg-surface-container-highest">
              HOY
            </button>
            <button onClick={handleNextMonth} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface active:scale-95 transition-transform hover:bg-surface-container-highest">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-4 mb-10">
          {/* Days labels */}
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
             <div key={day} className="text-center py-2 font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{day}</div>
          ))}

          {/* Empty cells */}
          {Array.from({ length: startingEmptyCells }).map((_, i) => (
             <div key={`empty-${i}`} className="aspect-square md:aspect-auto md:min-h-[120px] bg-transparent opacity-0"></div>
          ))}

          {/* Days cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const yearStr = currentDate.getFullYear();
            const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const fullDateString = `${yearStr}-${monthStr}-${dayStr}`;
            
            // Look for workouts on this day using local time parsing
            const dailyWorkouts = workouts.filter(w => {
               if(!w.date) return false;
               const d = new Date(w.date);
               const wy = d.getFullYear();
               const wm = String(d.getMonth() + 1).padStart(2, '0');
               const wd = String(d.getDate()).padStart(2, '0');
               return `${wy}-${wm}-${wd}` === fullDateString;
            });
            
            const now = new Date();
            const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const isToday = todayString === fullDateString;
            
            return (
              <div 
                key={dayNum} 
                className={`aspect-square md:aspect-auto md:min-h-[120px] rounded-xl p-2 md:p-4 transition-colors 
                  ${isToday ? 'border-2 border-primary-container bg-surface-container-highest' : 'bg-surface-container-lowest'}`}
              >
                <span className={`font-headline font-bold text-sm ${isToday ? 'text-primary' : 'text-on-surface'}`}>{dayNum}</span>
                
                {/* Render Workout Pills */}
                {dailyWorkouts.map(w => (
                   <div 
                     key={w.id} 
                     onClick={() => setActiveWorkoutId(w.id)}
                     className={`mt-2 p-1 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:opacity-80 active:scale-95 transition-all shadow-sm
                        ${activeWorkoutId === w.id ? `ring-2 ring-offset-2 ring-offset-surface ${getSportConfig(w.type).color}` : `${getSportConfig(w.type).color} opacity-85`}
                     `}
                     title={w.title}
                   >
                     <span className="material-symbols-outlined text-white text-xs md:text-sm">{getSportConfig(w.type).icon}</span>
                     <span className="hidden md:block font-label text-[8px] text-white mt-1 uppercase text-center truncate w-full px-1">{w.distanceKm > 0 ? `${w.distanceKm}k` : getSportConfig(w.type).label}</span>
                   </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Selected Session Detail Card */}
        {activeWorkout ? (
          <div className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(75,36,9,0.06)] border border-surface-container-highest relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-secondary/10 to-transparent pointer-events-none"></div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className={`w-14 h-14 ${getSportConfig(activeWorkout.type).color} rounded-full flex-shrink-0 flex items-center justify-center shadow-inner`}>
                <span className="material-symbols-outlined text-white text-3xl">{getSportConfig(activeWorkout.type).icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                      {new Date(activeWorkout.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
                    </p>
                    <h3 className="font-headline text-xl font-bold text-on-surface mt-1">{activeWorkout.title}</h3>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-xs">location_on</span> {activeWorkout.location || 'Localización no guardada'}
                    </p>
                  </div>
                  <button onClick={() => alert('Para editar, entra en Perfil > Gestionar')} className="p-3 hover:bg-surface-container rounded-full transition-colors group">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">edit</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="flex flex-col bg-surface-container-low p-3 rounded-2xl">
                    <span className="font-label text-[10px] uppercase text-on-surface-variant tracking-widest mb-1">Tiempo</span>
                    <span className="font-headline text-xl font-bold text-on-surface">{activeWorkout.movingTime || '--:--'}</span>
                  </div>
                  <div className="flex flex-col bg-surface-container-low p-3 rounded-2xl">
                    <span className="font-label text-[10px] uppercase text-on-surface-variant tracking-widest mb-1">Distancia</span>
                    <span className="font-headline text-xl font-bold text-primary">{activeWorkout.distanceKm} <span className="text-xs">km</span></span>
                  </div>
                  <div className="flex flex-col bg-surface-container-low p-3 rounded-2xl">
                    <span className="font-label text-[10px] uppercase text-on-surface-variant tracking-widest mb-1">Ritmo</span>
                    <span className="font-headline text-xl font-bold text-on-surface">{activeWorkout.avgPace} <span className="text-xs">/km</span></span>
                  </div>
                  <div className="flex flex-col bg-surface-container-low p-3 rounded-2xl">
                    <span className="font-label text-[10px] uppercase text-on-surface-variant tracking-widest mb-1">Desnivel</span>
                    <span className="font-headline text-xl font-bold text-secondary">+{activeWorkout.elevationM} <span className="text-xs">m</span></span>
                  </div>
                </div>

                {/* Series Details */}
                <div className="mt-8 relative">
                  <h4 className="font-label text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-surface-container-highest pb-2">
                    <span className="material-symbols-outlined text-sm text-primary">format_list_numbered</span>
                    Desglose de Series
                  </h4>
                  
                  {activeWorkout.splits && activeWorkout.splits.length > 0 ? (
                    <div className="space-y-2">
                      {activeWorkout.splits.map((split, i) => (
                        <div key={i} className="flex justify-between items-center py-2 px-4 bg-surface-container-lowest rounded-xl border border-surface-container-low">
                          <span className="font-label text-xs font-bold text-on-surface-variant">KM {split.km}</span>
                          <span className="font-mono font-medium text-sm">{split.pace} /km</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-surface-container-lowest rounded-2xl p-6 text-center border border-dashed border-outline-variant/30 text-on-surface-variant mx-auto">
                      <span className="material-symbols-outlined text-3xl mb-2 opacity-40">query_stats</span>
                      <p className="font-body text-sm font-medium">Buscando datos de series...</p>
                      <p className="font-label text-[10px] mt-1 opacity-70">Esta actividad requiere sincronización de nivel avanzado para obtener las métricas de intervalos.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-[2rem] p-8 text-center border-dashed border-2 border-outline-variant/30 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_available</span>
            <p className="font-body">No hay actividad seleccionada o no tienes entrenamientos registrados.</p>
          </div>
        )}

      </main>
    </>
  );
}
