import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const STRAVA_CLIENT_ID = '152427';
const STRAVA_CLIENT_SECRET = '8ea09d0411b0c1f7538bd302414e2ec07fd39b83';

export default function Perfil() {
  const { userProfile, setUserProfile, stats, setWorkouts } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(userProfile);

  useEffect(() => {
    setEditForm(userProfile);
  }, [userProfile]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUserProfile(editForm);
    setIsEditModalOpen(false);
  };

  const exchangeToken = async (code) => {
    setIsSyncing(true);
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code'
        })
      });
      const data = await response.json();
      
      if (data.access_token) {
        localStorage.setItem('strava_access_token', data.access_token);
        localStorage.setItem('strava_refresh_token', data.refresh_token);
        
        await syncStravaActivities(data.access_token);
        
        setUserProfile(prev => ({...prev, stravaConnected: true}));
        alert('✅ ¡Cuenta de Strava conectada y sincronizada con éxito!');
        navigate('/perfil', { replace: true });
      } else {
        throw new Error(data.message || 'Error en token de Strava');
      }
    } catch(err) {
      console.error(err);
      alert('Error al conectar con Strava. Revisa la consola y que la URL de redirección esté configurada en tu API de Strava.');
      navigate('/perfil', { replace: true });
    } finally {
      setIsSyncing(false);
      localStorage.removeItem('strava_pending_sync');
    }
  };

  const syncStravaActivities = async (token) => {
    try {
       // Pull last 30 activities
       const res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=30', {
         headers: { 'Authorization': `Bearer ${token}` }
       });
       if (!res.ok) throw new Error('Failed to fetch activities');
       const activities = await res.json();
       
       if (activities && Array.isArray(activities)) {
         const newWorkouts = activities.map(act => {
            const distKm = (act.distance / 1000).toFixed(1);
            let paceStr = "0:00";
            if (act.average_speed > 0) {
               const secondsPerKm = 1000 / act.average_speed;
               const mins = Math.floor(secondsPerKm / 60);
               const secs = Math.floor(secondsPerKm % 60).toString().padStart(2, '0');
               paceStr = `${mins}:${secs}`;
            }

            let movingTimeStr = "--:--";
            if (act.moving_time > 0) {
              const h = Math.floor(act.moving_time / 3600);
              const m = Math.floor((act.moving_time % 3600) / 60);
              const s = act.moving_time % 60;
              movingTimeStr = h > 0 
                ? `${h}h ${m.toString().padStart(2,'0')}m`
                : `${m}m ${s.toString().padStart(2,'0')}s`;
            }

            let sportCategory = 'Other';
            const sType = act.sport_type || act.type;
            if (['Run', 'VirtualRun'].includes(sType)) sportCategory = 'Run';
            else if (['TrailRun', 'Hike', 'Walk'].includes(sType)) sportCategory = 'TrailRun';
            else if (['Ride', 'VirtualRide', 'EBikeRide', 'MountainBikeRide', 'GravelRide'].includes(sType)) sportCategory = 'Ride';
            else if (['Swim'].includes(sType)) sportCategory = 'Swim';
            else if (['WeightTraining', 'Workout', 'Yoga', 'Crossfit'].includes(sType)) sportCategory = 'Gym';

            return {
               id: `strava-${act.id}`,
               title: act.name,
               type: sportCategory,
               distanceKm: distKm,
               avgPace: paceStr,
               elevationM: Math.round(act.total_elevation_gain),
               movingTime: movingTimeStr,
               date: new Date(act.start_date).toISOString(),
               location: act.location_city || 'Vía Strava',
               polyline: act.map?.summary_polyline || null
            }
         });

         // Merge while avoiding duplicates (newer fetches overwrite older ones)
         setWorkouts(prev => {
           const merged = [...prev, ...newWorkouts]; // new overwrites old
           const uniqueMap = new Map();
           merged.forEach(item => uniqueMap.set(item.id, item));
           const uniqueArray = Array.from(uniqueMap.values());
           return uniqueArray.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).reverse();
         });
       }
    } catch(err) {
      console.error('Failed to sync strava activities', err);
    }
  };

  const handleToggleStrava = () => {
    if(userProfile.stravaConnected) {
      if(window.confirm('¿Desvincular tu cuenta de Strava? Dejarás de recibir sincronización automática.')) {
        setUserProfile({...userProfile, stravaConnected: false});
        localStorage.removeItem('strava_access_token');
        localStorage.removeItem('strava_refresh_token');
      }
    } else {
      const redirectUri = `${window.location.protocol}//${window.location.host}/perfil`;
      const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=read,activity:read_all`;
      window.location.href = authUrl;
    }
  };

  const handleLogout = () => {
    if(window.confirm('¿Seguro que quieres cerrar sesión?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const commingSoon = () => alert('Característica en desarrollo');

  return (
    <>
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
        {/* Profile Hero */}
        <section className="relative flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <span className="font-label text-primary font-semibold uppercase tracking-widest text-xs">Atleta de Élite</span>
            <h2 className="font-headline text-5xl font-bold tracking-tighter leading-none mb-2">{userProfile.name}</h2>
            <div className="flex gap-4 items-center">
              <span className="flex items-center gap-1 font-label text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {userProfile.location}
              </span>
              <span className="flex items-center gap-1 font-label text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                Miembro desde {userProfile.memberSince}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="p-3 rounded-full bg-surface-container-high text-primary hover:scale-105 transition-transform shadow-sm">
            <span className="material-symbols-outlined">edit</span>
          </button>
        </section>

        {/* Connections Section */}
        <section className="space-y-4">
          <h3 className="font-headline text-xl font-bold tracking-tight px-2">Conexiones</h3>
          
          <div className={`bg-surface-container-highest/30 p-5 rounded-[2rem] flex items-center justify-between group transition-all ${userProfile.stravaConnected ? '' : 'opacity-60 grayscale'}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FC4C02] flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
              </div>
              <div>
                <p className="font-body font-bold text-on-surface">Strava</p>
                {userProfile.stravaConnected ? (
                  <p className="font-label text-[10px] text-secondary font-semibold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    Sincronizado
                  </p>
                ) : (
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Desconectado</p>
                )}
              </div>
            </div>
            <button onClick={handleToggleStrava} disabled={isSyncing} className={`px-4 py-2 rounded-full text-xs font-label font-bold transition-opacity ${userProfile.stravaConnected ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-surface-container-high text-primary hover:opacity-80'}`}>
              {isSyncing ? 'CONECTANDO...' : (userProfile.stravaConnected ? 'DESCONECTAR' : 'CONECTAR')}
            </button>
          </div>

          <div className="bg-surface-container-low p-5 rounded-[2rem] flex items-center justify-between opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#000] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-white">watch_button</span>
              </div>
              <div>
                <p className="font-body font-bold text-on-surface">Coros Cloud</p>
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider italic">Próximamente (Usa Strava)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Section */}
        <section className="space-y-4">
          <h3 className="font-headline text-xl font-bold tracking-tight px-2">Ajustes de la Aplicación</h3>
          <div className="bg-surface-container-lowest rounded-[1.5rem] overflow-hidden shadow-[0_4px_12px_rgba(75,36,9,0.04)]">
            <button onClick={() => setIsEditModalOpen(true)} className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">person_outline</span>
                <span className="font-body font-medium">Información Personal</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <div className="h-px bg-surface-container mx-5"></div>
            <button onClick={commingSoon} className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">notifications_active</span>
                <span className="font-body font-medium">Notificaciones Push</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <div className="h-px bg-surface-container mx-5"></div>
            <button onClick={commingSoon} className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">language</span>
                <div className="text-left">
                  <span className="font-body font-medium block">Idioma</span>
                  <span className="font-label text-[10px] text-on-surface-variant uppercase">Español (España)</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <div className="h-px bg-surface-container mx-5"></div>
            <button onClick={commingSoon} className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">lock</span>
                <span className="font-body font-medium">Privacidad y Seguridad</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Logout */}
        <section className="pb-12 text-center">
          <button onClick={handleLogout} className="text-error font-headline font-bold uppercase tracking-widest text-sm py-4 px-8 border-2 border-error/10 rounded-full hover:bg-error/5 transition-colors active:scale-95 duration-200">
            Cerrar Sesión
          </button>
        </section>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 kinetic-blur transition-opacity">
          <div className="bg-surface rounded-[2rem] w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border border-outline-variant/20">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined flex">close</span>
            </button>
            <h3 className="font-headline text-2xl font-bold mb-6 text-on-surface">Editar Perfil</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block font-label text-xs uppercase text-on-surface-variant mb-1">Nombre Completo</label>
                <input required type="text" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
              </div>

              <div>
                <label className="block font-label text-xs uppercase text-on-surface-variant mb-1 mt-4">Ubicación</label>
                <input required type="text" value={editForm.location} onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body text-on-surface" />
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
