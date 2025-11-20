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
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sessionPlan, setSessionPlan] = useState([]); // [{type: 'focus'|'break', duration: minutes}]
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [skipBreak, setSkipBreak] = useState(false);
  const intervalRef = useRef(null);

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('timerState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setTimeLeft(state.timeLeft || 0);
        setIsRunning(state.isRunning || false);
        setIsBreak(state.isBreak || false);
        setCurrentGoal(state.currentGoal || null);
        setFocusDuration(state.focusDuration || 25);
        setBreakDuration(state.breakDuration || 5);
        setSessionsCompleted(state.sessionsCompleted || 0);
        setSessionPlan(state.sessionPlan || []);
        setCurrentSessionIndex(state.currentSessionIndex || 0);
        setSkipBreak(state.skipBreak || false);
      } catch (error) {
        console.error('Error loading timer state:', error);
      }
    }
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
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
      skipBreak
    };
    localStorage.setItem('timerState', JSON.stringify(state));
  }, [timeLeft, isRunning, isBreak, currentGoal, focusDuration, breakDuration, sessionsCompleted, sessionPlan, currentSessionIndex, skipBreak]);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

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
      // Play sound
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
      setCurrentSessionIndex(currentSessionIndex + 1);
      setIsBreak(next.type === 'break');
      setTimeLeft(next.duration * 60);
      setIsRunning(true);
    } else {
      // End of plan
      setIsRunning(false);
      setIsBreak(false);
      setCurrentSessionIndex(0);
      setSessionPlan([]);
      setTimeLeft(0);
    }
  }, [currentSessionIndex, sessionPlan, currentGoal]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && currentGoal !== null && sessionPlan.length > 0) {
      handleTimerComplete();
    }
  }, [timeLeft, currentGoal, handleTimerComplete, sessionPlan]);

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
    let sessionLength = 25;
    let plan = [];
    if (breaks === 0) {
      plan.push({ type: 'focus', duration: totalFocus });
    } else {
      // Split into focus/breaks
      let numFocusSessions = Math.ceil(totalFocus / sessionLength);
      let focusDurations = Array(numFocusSessions).fill(sessionLength);
      let last = totalFocus - sessionLength * (numFocusSessions - 1);
      if (last > 0) focusDurations[focusDurations.length - 1] = last;
      // Distribute breaks evenly (all breaks are 5 min)
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
    setTimeLeft((plan[0]?.duration || 0) * 60);
    setIsRunning(true);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? breakDuration * 60 : focusDuration * 60);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsBreak(false);
    setCurrentGoal(null);
    setSessionsCompleted(0);
    localStorage.removeItem('timerState');
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
