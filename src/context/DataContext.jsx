import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('runplanai_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.stravaConnected === undefined) parsed.stravaConnected = true;
      if (parsed.garminConnected === undefined) parsed.garminConnected = false;
      return parsed;
    }
    return {
      name: 'Marcos Segura',
      location: 'Madrid, ES',
      memberSince: '2022',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSQcqidWR3Pxd3lQs8-hOVe33yNi_Hs07tUTnjdTSqbl1tuf0d7N6R5ZRZguvY8_Ah4qawn4EfHdyr_8PeWFvL9_h7WF062qQE7z5OKf1kKC5QdZV_Yjlzpp62XDjf1th_1FT69iZYFSWg_ywfQUExgVX20ZjZleIr8Ku12xPdVd8SsGmXC6ZEwuaitHkmlz8D7xqzdP-3YncxO0KNZ_cXeeV9WnINeVLYUaJDsJN9VBMpZ4hhRb3TUpjAOTyH21H97pmYc5VJA-w',
      fcReposo: 54,
      calidadSueno: 88,
      desgasteCalzado: 342,
      racha: 14,
      stravaConnected: true,
      garminConnected: false,
    };
  });

  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem('runplanai_workouts');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        title: 'Tirada Larga Dominical',
        type: 'Run',
        date: new Date(Date.now() - 86400000).toISOString(),
        location: 'Madrid, Casa de Campo',
        distanceKm: 18.4,
        avgPace: '4:52',
        elevationM: 245
      }
    ];
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('runplanai_goals');
    if (saved) return JSON.parse(saved);
    return {
      challengeName: 'Maratón de Valencia',
      challengeDate: new Date(new Date().getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      weeklyTarget: 40,
      monthlyTarget: 150,
      yearlyTarget: 1000,
      shortTermLabel: '40km / semana',
      midTermLabel: 'Media Maratón (Sub 1:45)',
      longTermLabel: 'Finisher Maratón'
    };
  });

  useEffect(() => {
    localStorage.setItem('runplanai_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('runplanai_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('runplanai_goals', JSON.stringify(goals));
  }, [goals]);

  const addWorkout = (workout) => {
    setWorkouts([ { ...workout, id: Date.now() }, ...workouts]);
  };

  const calculateAnnualStats = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    const ytdWorkouts = workouts.filter(w => new Date(w.date).getFullYear() === currentYear);
    
    // Weekly: Since Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    monday.setHours(0,0,0,0);
    const weeklyWorkouts = workouts.filter(w => new Date(w.date) >= monday);
    const weeklyDist = weeklyWorkouts.reduce((acc, w) => acc + parseFloat(w.distanceKm || 0), 0);

    // Monthly: Since 1st of current month
    const monthlyWorkouts = workouts.filter(w => {
      const d = new Date(w.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const monthlyDist = monthlyWorkouts.reduce((acc, w) => acc + parseFloat(w.distanceKm || 0), 0);

    // Comparison period: Jan 1 to (Today - 1 Year)
    const pytdWorkouts = workouts.filter(w => {
      const d = new Date(w.date);
      if (d.getFullYear() !== currentYear - 1) return false;
      if (d.getMonth() < currentMonth) return true;
      if (d.getMonth() === currentMonth && d.getDate() <= currentDay) return true;
      return false;
    });

    const ytdDist = ytdWorkouts.reduce((acc, w) => acc + parseFloat(w.distanceKm || 0), 0);
    const pytdDist = pytdWorkouts.reduce((acc, w) => acc + parseFloat(w.distanceKm || 0), 0);
    
    const ytdElev = ytdWorkouts.reduce((acc, w) => acc + parseInt(w.elevationM || 0), 0);
    const pytdElev = pytdWorkouts.reduce((acc, w) => acc + parseInt(w.elevationM || 0), 0);

    const calculateDelta = (current, prev) => {
      if (prev <= 0) return current > 0 ? 100 : 0;
      return Math.round(((current - prev) / prev) * 100);
    };

    return {
      ytdDistance: ytdDist.toFixed(1),
      ytdElevation: ytdElev,
      distDelta: calculateDelta(ytdDist, pytdDist),
      elevDelta: calculateDelta(ytdElev, pytdElev),
      currentYear,
      // Concrete Progress for Goals
      shortTermProgress: Math.min(Math.round((weeklyDist / (goals.weeklyTarget || 40)) * 100), 100),
      midTermProgress: Math.min(Math.round((monthlyDist / (goals.monthlyTarget || 150)) * 100), 100),
      longTermProgress: Math.min(Math.round((ytdDist / (goals.yearlyTarget || 1000)) * 100), 100),
      weeklyDist: weeklyDist.toFixed(1),
      monthlyDist: monthlyDist.toFixed(1)
    };
  };

  const calculateAvgPace = () => {
    if (workouts.length === 0) return "0:00";
    const totalSecs = workouts.reduce((acc, w) => {
      const parts = String(w.avgPace).split(':');
      if(parts.length < 2) return acc;
      return acc + (parseInt(parts[0]||0) * 60 + parseInt(parts[1]||0));
    }, 0);
    const avgSecs = Math.floor(totalSecs / workouts.length);
    const mins = Math.floor(avgSecs / 60);
    const secs = (avgSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

    const annualStats = calculateAnnualStats();

    return (
      <DataContext.Provider value={{
        userProfile, setUserProfile,
        workouts, setWorkouts, addWorkout,
        goals: { 
          ...goals, 
          shortTermProgress: annualStats.shortTermProgress,
          midTermProgress: annualStats.midTermProgress,
          longTermProgress: annualStats.longTermProgress
        }, 
        setGoals,
        stats: {
          ...annualStats,
          avgPace: calculateAvgPace()
        }
      }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
