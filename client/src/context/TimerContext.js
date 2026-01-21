import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { sessionsAPI } from '../services/api';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [focusDuration, setFocusDuration] = useState(22);
  const [breakDuration, setBreakDuration] = useState(5);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sessionPlan, setSessionPlan] = useState([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [skipBreak, setSkipBreak] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Timestamp-based persistence for refresh resilience
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  
  const intervalRef = useRef(null);

  // Load timer state from localStorage on mount - with timestamp recalculation
  useEffect(() => {
    const savedState = localStorage.getItem('timerState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        
        // Restore all state first
        setIsBreak(state.isBreak || false);
        setCurrentGoal(state.currentGoal || null);
        setFocusDuration(state.focusDuration || 22);
        setBreakDuration(state.breakDuration || 5);
        setSessionsCompleted(state.sessionsCompleted || 0);
        setSessionPlan(state.sessionPlan || []);
        setCurrentSessionIndex(state.currentSessionIndex || 0);
        setSkipBreak(state.skipBreak || false);
        
        // Recalculate timeLeft based on stored timestamp if timer was running
        if (state.isRunning && state.sessionStartTime && state.sessionDuration > 0) {
          const now = Date.now();
          const elapsed = Math.floor((now - state.sessionStartTime) / 1000);
          const remaining = Math.max(0, state.sessionDuration - elapsed);
          
          console.log('Timer restored:', { elapsed, remaining, sessionDuration: state.sessionDuration });
          
          if (remaining > 0) {
            // Timer should still be running
            setTimeLeft(remaining);
            // Set new start time and remaining duration for accurate tracking
            setSessionStartTime(now);
            setSessionDuration(remaining);
            setIsRunning(true);
          } else {
            // Timer expired while away
            setTimeLeft(0);
            setSessionStartTime(null);
            setSessionDuration(0);
            setIsRunning(false);
          }
        } else if (state.timeLeft > 0 && !state.isRunning) {
          // Timer was paused
          setTimeLeft(state.timeLeft);
          setSessionDuration(state.timeLeft);
          setSessionStartTime(null);
          setIsRunning(false);
        } else {
          setTimeLeft(state.timeLeft || 0);
          setIsRunning(false);
        }
      } catch (error) {
        console.error('Error loading timer state:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save timer state to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    
    const state = {
      timeLeft,
      isRunning,
      isBreak,
      currentGoal,
      focusDuration,
      breakDuration,
      sessionsCompleted,
      sessionPlan,
      currentSessionIndex,
      skipBreak,
      sessionStartTime,
      sessionDuration
    };
    localStorage.setItem('timerState', JSON.stringify(state));
  }, [timeLeft, isRunning, isBreak, currentGoal, focusDuration, breakDuration, sessionsCompleted, sessionPlan, currentSessionIndex, skipBreak, sessionStartTime, sessionDuration, isHydrated]);

  // Timer countdown effect - only run after hydration
  useEffect(() => {
    if (!isHydrated) return;
    
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          return newTime >= 0 ? newTime : 0;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isHydrated]);

  // Update sessionStartTime and sessionDuration when timer starts/resumes
  useEffect(() => {
    if (!isHydrated) return;
    
    if (isRunning && timeLeft > 0 && !sessionStartTime) {
      setSessionStartTime(Date.now());
      setSessionDuration(timeLeft);
    }
  }, [isRunning, timeLeft, sessionStartTime, isHydrated]);

  const handleTimerComplete = useCallback(async () => {
    // Record focus session if just completed
    if (sessionPlan[currentSessionIndex]?.type === 'focus') {
      try {
        await sessionsAPI.create({
          goalId: currentGoal._id,
          durationMinutes: sessionPlan[currentSessionIndex].duration,
          sessionType: 'focus'
        });
        setSessionsCompleted(prev => prev + 1);
      } catch (error) {
        console.error('Error recording session:', error);
      }
    }

    // Show notification with sound
    if ('Notification' in window && Notification.permission === 'granted') {
      let title = 'DeepFocus';
      let body = '';
      if (sessionPlan[currentSessionIndex]?.type === 'break') {
        body = 'Break time is over! Focus session starting.';
      } else {
        body = 'Focus session completed! Break time starting.';
      }
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
      try {
        const audio = new window.Audio('/notification.mp3');
        audio.play();
      } catch (e) {
        // ignore
      }
    }

    // Move to next session in plan
    if (currentSessionIndex + 1 < sessionPlan.length) {
      const next = sessionPlan[currentSessionIndex + 1];
      const nextDuration = next.duration * 60;
      setCurrentSessionIndex(currentSessionIndex + 1);
      setIsBreak(next.type === 'break');
      setTimeLeft(nextDuration);
      setSessionStartTime(Date.now());
      setSessionDuration(nextDuration);
      setIsRunning(true);
    } else {
      // End of plan
      setIsRunning(false);
      setIsBreak(false);
      setCurrentSessionIndex(0);
      setSessionPlan([]);
      setTimeLeft(0);
      setSessionStartTime(null);
      setSessionDuration(0);
    }
  }, [currentSessionIndex, sessionPlan, currentGoal]);

  // Handle timer completion
  useEffect(() => {
    if (isHydrated && timeLeft === 0 && isRunning && currentGoal !== null && sessionPlan.length > 0) {
      setIsRunning(false);
      handleTimerComplete();
    }
  }, [timeLeft, currentGoal, handleTimerComplete, sessionPlan, isRunning, isHydrated]);

  // Helper to calculate session plan
  const calculateSessionPlan = (goal) => {
    const min = goal.dailyTargetMinutes;
    const skip = goal.skipBreak;
    let breaks = 0;
    if (skip) breaks = 0;
    else if (min >= 10 && min <= 25) breaks = 0;
    else if (min >= 26 && min <= 74) breaks = 1;
    else if (min >= 75 && min <= 99) breaks = 2;
    else if (min >= 100 && min <= 124) breaks = 3;
    else if (min >= 125 && min <= 149) breaks = 4;
    else if (min >= 150 && min <= 174) breaks = 5;
    else if (min >= 175 && min <= 199) breaks = 6;
    else if (min >= 200 && min <= 224) breaks = 7;
    else if (min >= 225 && min <= 240) breaks = 8;

    let totalFocus = min;
    let sessionLength = 22;
    let plan = [];
    if (breaks === 0) {
      plan.push({ type: 'focus', duration: totalFocus });
    } else {
      let numFocusSessions = Math.ceil(totalFocus / sessionLength);
      let focusDurations = Array(numFocusSessions).fill(sessionLength);
      let last = totalFocus - sessionLength * (numFocusSessions - 1);
      if (last > 0) focusDurations[focusDurations.length - 1] = last;
      for (let i = 0; i < focusDurations.length; i++) {
        plan.push({ type: 'focus', duration: focusDurations[i] });
        if (i < breaks) plan.push({ type: 'break', duration: 5 });
      }
    }
    return plan;
  };

  const startTimer = (goal) => {
    setCurrentGoal(goal);
    setSkipBreak(goal.skipBreak || false);
    setSessionsCompleted(0);
    const plan = calculateSessionPlan(goal);
    setSessionPlan(plan);
    setCurrentSessionIndex(0);
    setIsBreak(plan[0]?.type === 'break');
    const duration = (plan[0]?.duration || 0) * 60;
    setTimeLeft(duration);
    setSessionStartTime(Date.now());
    setSessionDuration(duration);
    setIsRunning(true);

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    // Store remaining time when paused
    setSessionStartTime(null);
    setSessionDuration(timeLeft);
  };

  const resumeTimer = () => {
    if (timeLeft > 0) {
      setSessionStartTime(Date.now());
      setSessionDuration(timeLeft);
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    const currentSession = sessionPlan[currentSessionIndex];
    const duration = currentSession ? currentSession.duration * 60 : (isBreak ? breakDuration * 60 : focusDuration * 60);
    setTimeLeft(duration);
    setSessionStartTime(null);
    setSessionDuration(duration);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsBreak(false);
    setCurrentGoal(null);
    setSessionsCompleted(0);
    setSessionPlan([]);
    setCurrentSessionIndex(0);
    setSessionStartTime(null);
    setSessionDuration(0);
    localStorage.removeItem('timerState');
  };

  const skipBreakSession = () => {
    if (!isBreak || !sessionPlan.length) return;
    
    let nextIndex = currentSessionIndex + 1;
    while (nextIndex < sessionPlan.length && sessionPlan[nextIndex].type === 'break') {
      nextIndex++;
    }
    
    if (nextIndex < sessionPlan.length) {
      const next = sessionPlan[nextIndex];
      const nextDuration = next.duration * 60;
      setCurrentSessionIndex(nextIndex);
      setIsBreak(false);
      setTimeLeft(nextDuration);
      setSessionStartTime(Date.now());
      setSessionDuration(nextDuration);
      setIsRunning(true);
    } else {
      stopTimer();
    }
  };

  const value = {
    timeLeft,
    isRunning,
    isBreak,
    currentGoal,
    focusDuration,
    breakDuration,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
    skipBreakSession,
    sessionPlan,
    currentSessionIndex,
    skipBreak
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};
