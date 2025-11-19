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
      sessionsCompleted
    };
    localStorage.setItem('timerState', JSON.stringify(state));
  }, [timeLeft, isRunning, isBreak, currentGoal, focusDuration, breakDuration, sessionsCompleted]);

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
    setIsRunning(false);

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('DeepFocus', {
        body: isBreak ? 'Break time is over!' : 'Focus session completed!',
        icon: '/favicon.ico'
      });
    }

    if (!isBreak) {
      // Focus session completed - record it
      try {
        await sessionsAPI.create({
          goalId: currentGoal._id,
          durationMinutes: focusDuration,
          sessionType: 'focus'
        });
        setSessionsCompleted(prev => prev + 1);
      } catch (error) {
        console.error('Error recording session:', error);
      }
    }

    // Auto-start break or next session
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
      setIsRunning(true);
    } else {
      setIsBreak(false);
      setTimeLeft(focusDuration * 60);
    }
  }, [isBreak, breakDuration, focusDuration, currentGoal]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && currentGoal !== null) {
      handleTimerComplete();
    }
  }, [timeLeft, currentGoal, handleTimerComplete]);

  const startTimer = (goal, focus = 25, breakTime = 5) => {
    setCurrentGoal(goal);
    setFocusDuration(focus);
    setBreakDuration(breakTime);
    setTimeLeft(focus * 60);
    setIsRunning(true);
    setIsBreak(false);
    setSessionsCompleted(0);

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
    stopTimer
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};
