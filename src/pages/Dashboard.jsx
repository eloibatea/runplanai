import React from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import polyline from '@mapbox/polyline';

export default function Dashboard() {
  const { userProfile, workouts, goals, stats } = useData();

  // Sort workouts by date descending
  const sortedWorkouts = [...workouts].sort((a,b) => new Date(b.date) - new Date(a.date));
  
  // Prioritize Strava workouts with maps, otherwise grab the last manual workout
  const lastWorkout = sortedWorkouts[0] || null;
  const lastWorkoutWithMap = sortedWorkouts.find(w => w.polyline && w.polyline.trim() !== '') || lastWorkout;

  // Compute countdown to Challenge Date
  const calcTimeLeft = () => {
    const diff = new Date(goals.challengeDate) - new Date();
    if(diff <= 0) return { days: 0, hours: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24)
    };
  };
  const timeLeft = calcTimeLeft();

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

  let decodedPositions = [];
  if (lastWorkoutWithMap && lastWorkoutWithMap.polyline) {
    try {
      decodedPositions = polyline.decode(lastWorkoutWithMap.polyline);
    } catch(err) {
      console.error('Failed to decode polyline', err);
    }
  }

  return (
    <>
      <main className="pt-24 pb-32 px-4 max-w-7xl mx-auto space-y-8">
        {/* Main Countdown Hero: Asymmetric Overlap Layout */}
        <section className="relative group">
          <div className="kinetic-gradient rounded-full p-8 md:p-12 text-on-primary overflow-hidden relative shadow-[0_20px_40px_rgba(161,57,0,0.2)]">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <path d="M0,150 Q100,50 200,150 T400,50" fill="none" stroke="currentColor" strokeWidth="20" />
              </svg>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
              <div className="max-w-md">
                <span className="font-label text-xs uppercase tracking-[0.2em] opacity-80 mb-2 block">PRÓXIMO GRAN RETO</span>
                <h2 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-4 leading-none">{goals.challengeName}</h2>
                <div className="flex gap-4 items-baseline">
                  <div className="flex flex-col">
                    <span className="font-headline text-5xl md:text-7xl font-extrabold">{String(timeLeft.days).padStart(2,'0')}</span>
                    <span className="font-label text-[10px] uppercase text-center opacity-70">Días</span>
                  </div>
                  <span className="font-headline text-3xl opacity-50">:</span>
                  <div className="flex flex-col">
                    <span className="font-headline text-5xl md:text-7xl font-extrabold">{String(timeLeft.hours).padStart(2,'0')}</span>
                    <span className="font-label text-[10px] uppercase text-center opacity-70">Horas</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Link to="/objetivos" className="bg-surface-container-lowest text-primary font-bold px-6 py-3 rounded-full flex items-center gap-2 group-hover:scale-105 transition-transform">
                  <span>Ver plan de carrera</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block absolute -right-4 -top-4 w-24 h-24 bg-secondary rotate-12 rounded-xl flex items-center justify-center shadow-lg border-4 border-surface">
            <span className="material-symbols-outlined text-white text-4xl">timer</span>
          </div>
        </section>

        {/* Annual Stats Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 border border-outline-variant/20 relative overflow-hidden group hover:bg-surface-container transition-colors">
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <span className="material-symbols-outlined text-[10rem]">query_stats</span>
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">distance</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${stats.distDelta >= 0 ? 'bg-success-container text-on-success-container' : 'bg-error-container text-on-error-container'}`}>
                <span className="material-symbols-outlined text-xs">{stats.distDelta >= 0 ? 'trending_up' : 'trending_down'}</span>
                {Math.abs(stats.distDelta)}% vs {stats.currentYear - 1}
              </div>
            </div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Distancia Total {stats.currentYear}</p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-5xl font-bold tracking-tight text-on-surface">{stats.ytdDistance}</span>
              <span className="font-headline text-xl text-on-surface-variant font-medium">km</span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 border border-outline-variant/20 relative overflow-hidden group hover:bg-surface-container transition-colors">
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <span className="material-symbols-outlined text-[10rem]">landscape</span>
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">terrain</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${stats.elevDelta >= 0 ? 'bg-success-container text-on-success-container' : 'bg-error-container text-on-error-container'}`}>
                <span className="material-symbols-outlined text-xs">{stats.elevDelta >= 0 ? 'trending_up' : 'trending_down'}</span>
                {Math.abs(stats.elevDelta)}% vs {stats.currentYear - 1}
              </div>
            </div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Desnivel Acumulado {stats.currentYear}</p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-5xl font-bold tracking-tight text-on-surface">+{stats.ytdElevation}</span>
              <span className="font-headline text-xl text-on-surface-variant font-medium">m</span>
            </div>
          </div>
        </section>
        {/* Mobile App Install Tip */}
        <section className="md:hidden bg-primary/10 border border-primary/20 rounded-[2rem] p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">install_mobile</span>
            <h4 className="font-headline font-bold text-primary">Instalar App</h4>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Para una mejor experiencia, instala **RunPlanAI** en tu pantalla de inicio:
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold">
            <div className="bg-white/50 px-3 py-1.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">ios_share</span>
              iOS: Compartir &gt; Añadir a Inicio
            </div>
            <div className="bg-white/50 px-3 py-1.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">more_vert</span>
              Android: Menú &gt; Instalar
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Goal Summary */}
          <div className="md:col-span-8 bg-surface-container-low rounded-[2rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-headline text-2xl font-bold tracking-tight">Estado de Objetivos</h3>
              <div className="flex gap-2">
                <span className="font-label text-[10px] bg-secondary/10 text-secondary px-3 py-1 rounded-full border border-secondary/20">EN MARCHA</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Short Term */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8" />
                    <circle className="text-primary transition-all duration-1000" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364" strokeDashoffset={364 - (364 * goals.shortTermProgress) / 100} strokeWidth="8" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline text-2xl font-bold">{goals.shortTermProgress}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="font-label text-[10px] uppercase block opacity-60">Corto Plazo</span>
                  <span className="font-bold text-sm">{goals.shortTermLabel}</span>
                </div>
              </div>
              {/* Mid Term */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8" />
                    <circle className="text-secondary transition-all duration-1000" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364" strokeDashoffset={364 - (364 * goals.midTermProgress) / 100} strokeWidth="8" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline text-2xl font-bold">{goals.midTermProgress}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="font-label text-[10px] uppercase block opacity-60">Medio Plazo</span>
                  <span className="font-bold text-sm">{goals.midTermLabel}</span>
                </div>
              </div>
              {/* Long Term */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8" />
                    <circle className="text-tertiary transition-all duration-1000" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364" strokeDashoffset={364 - (364 * goals.longTermProgress) / 100} strokeWidth="8" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline text-2xl font-bold">{goals.longTermProgress}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="font-label text-[10px] uppercase block opacity-60">Largo Plazo</span>
                  <span className="font-bold text-sm">{goals.longTermLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="md:col-span-4 bg-tertiary text-on-tertiary rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 opacity-20 transform group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[120px]">bolt</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-tertiary-fixed">psychology</span>
                <span className="font-label text-xs uppercase tracking-widest font-bold">IA SUGGESTION</span>
              </div>
              <p className="font-headline text-xl font-medium leading-tight">
                "Basado en tus últimos entrenamientos, considera una <span className="text-tertiary-fixed font-bold">sesión de intervalos</span> para mejorar tu velocidad antes del fin de semana."
              </p>
            </div>
            <div className="relative z-10 mt-6 pt-6 border-t border-on-tertiary/10">
              <div className="flex items-center gap-2 justify-between">
                <img alt="Strava Logo" className="w-5 h-5 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCECxB_Sa65WfmY31QHJl9kQJh6jpWxDf-DKwuZWbHYIS9cQOeaQkPw8J2iiRiYG3Z6rX8NaKwDsSZ_JS8kHZzSstwJCAyljvRKLC3Zj4JIzJf1lJBDFsODZDMw1KrTqwZ-Le4chKfL1Ml46gLokzm7yg6QQigyP7z8kAoUEwyi9kgq0dQ0ng26256hIBq9BXVoXaWZWCWNs1xX7qz2wzQM6tH5xH8YX65d4llYW3UvHbGQXUXq8wJDX5sd7yj1pCkLp0FPZbn7GoY" />
                <span className="font-label text-[10px] opacity-70">Sincronizado vía Storage</span>
              </div>
            </div>
          </div>

          {/* Last Activity */}
          {lastWorkoutWithMap ? (
            <div className="md:col-span-12 lg:col-span-12 bg-white rounded-[2rem] p-1 shadow-xl overflow-hidden relative">
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-1/3 h-48 md:h-auto relative z-0">
                  {decodedPositions.length > 0 ? (
                    <MapContainer 
                      bounds={decodedPositions} 
                      zoomControl={false}
                      dragging={false}
                      scrollWheelZoom={false}
                      doubleClickZoom={false}
                      attributionControl={false}
                      className="w-full h-full min-h-[192px] rounded-t-[2rem] md:rounded-t-none md:rounded-l-[2rem]"
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                      <Polyline positions={decodedPositions} color="#FC4C02" weight={4} opacity={0.8} />
                    </MapContainer>
                  ) : (
                    <img alt="Map view" className="w-full h-full object-cover rounded-t-[2rem] md:rounded-t-none md:rounded-l-[2rem]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdG3TsNaFPRXixVNHvEaIl-Xgh7B9wBXBYjakwqu5_SUDqJv6kcYMhCgtiW4r-0bASqTpzVrhPR_nW_kAIorSq5yoeSbZG5e6XHvwp-yzVg0rK11rtiJRF3m6inOpAhC7wFM77hJSuPClSDmSlAJ2xzsEBIXZfIWMBFJBz3-99DbYoE75ruJDoscK7ZfvxBvU7gh5QQId2aMWeCgG7W-NptHgzCj4DtU-aBk5KLwZSjrgoHSYc-OEts-vrj4svUO6nbAoga_Ec6CE" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 pointer-events-none z-10"></div>
                  <div className="absolute top-4 left-4 md:left-8 bg-secondary text-white px-3 py-1 rounded-full font-label text-[10px] font-bold z-20 shadow-md">ÚLTIMO ENTRENO</div>
                </div>
                <div className="md:w-2/3 p-8 flex flex-col justify-center gap-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-headline text-2xl font-bold">{lastWorkoutWithMap.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white ${getSportConfig(lastWorkoutWithMap.type).color}`}>
                          {getSportConfig(lastWorkoutWithMap.type).label}
                        </span>
                        <p className="text-on-surface-variant flex items-center gap-1 text-sm">
                          <span className="material-symbols-outlined text-xs">calendar_today</span>
                          <span>{new Date(lastWorkoutWithMap.date).toLocaleDateString()} • {lastWorkoutWithMap.location}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined ${getSportConfig(lastWorkoutWithMap.type).color.replace('bg-', 'text-')} text-3xl`}>
                      {getSportConfig(lastWorkoutWithMap.type).icon}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface-container rounded-2xl px-4 md:px-6 py-4 flex flex-col">
                      <span className="font-label text-[10px] uppercase opacity-60">Tiempo</span>
                      <span className="font-headline text-2xl font-bold text-primary">{lastWorkoutWithMap.movingTime || '--:--'}</span>
                    </div>
                    <div className="bg-surface-container rounded-2xl px-4 md:px-6 py-4 flex flex-col">
                      <span className="font-label text-[10px] uppercase opacity-60">Distancia</span>
                      <span className="font-headline text-2xl font-bold text-primary">{lastWorkoutWithMap.distanceKm}<span className="text-sm ml-1">km</span></span>
                    </div>
                    <div className="bg-surface-container rounded-2xl px-4 md:px-6 py-4 flex flex-col">
                      <span className="font-label text-[10px] uppercase opacity-60">Ritmo Medio</span>
                      <span className="font-headline text-2xl font-bold text-primary">{lastWorkoutWithMap.avgPace}<span className="text-sm ml-1">/km</span></span>
                    </div>
                    <div className="bg-surface-container rounded-2xl px-4 md:px-6 py-4 flex flex-col">
                      <span className="font-label text-[10px] uppercase opacity-60">Elevación</span>
                      <span className="font-headline text-2xl font-bold text-secondary">+{lastWorkoutWithMap.elevationM}<span className="text-sm ml-1">m</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="md:col-span-12 lg:col-span-12 bg-surface-container-low rounded-[2rem] p-12 text-center text-on-surface-variant shadow-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">directions_run</span>
              <p className="font-headline">Aún no hay entrenamientos.</p>
              <p className="font-body text-sm mt-1">Usa el botón + para registrar uno.</p>
            </div>
          )}
        </div>

      </main>
    </>
  );
}
