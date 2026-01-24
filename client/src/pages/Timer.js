import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { goalsAPI } from '../services/api';
import { useTimer } from '../context/TimerContext';
import { useWindowTracker } from '../hooks/useWindowTracker';
import { Play, Pause, RotateCcw, Monitor, MonitorOff, AlertTriangle, X, Bell } from 'lucide-react';
import * as faceapi from 'face-api.js';

const Timer = () => {
  const videoRef = useRef(null);
  const [userPresent, setUserPresent] = useState(true);
  const [alertAudio, setAlertAudio] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const { goalId } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const {
    timeLeft,
    isRunning,
    isBreak,
    currentGoal,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
    skipBreakSession,
    sessionPlan,
    currentSessionIndex
  } = useTimer();

  // Window tracking hook
  const {
    isTracking: isWindowTracking,
    trackingError: windowTrackingError,
    selectedWindow,
    isWindowFocused,
    startTracking: startWindowTracking,
    stopTracking: stopWindowTracking,
    dismissAlert: dismissWindowAlert
  } = useWindowTracker({
    onFocusLost: () => console.log('Window focus lost!'),
    onFocusRegained: () => console.log('Window focus regained')
  });

  // Fetch goal data on mount
  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await goalsAPI.getOne(goalId);
        setGoal(response.data);
      } catch (error) {
        console.error('Failed to fetch goal:', error);
        navigate('/goals');
      }
    };
    fetchGoal();
  }, [goalId, navigate]);

  // Handle active session conflict
  useEffect(() => {
    if (currentGoal && currentGoal._id !== goalId) {
      const confirmSwitch = window.confirm(
        `You have an active session for "${currentGoal.name}". Do you want to stop it and start a new session for this goal?`
      );
      if (confirmSwitch) {
        stopTimer();
      } else {
        navigate(`/timer/${currentGoal._id}`);
      }
    }
  }, [currentGoal, goalId, navigate, stopTimer]);

  // Face detection is ALWAYS ON when timer is running (not during break)
  // Start webcam automatically when focus session starts
  useEffect(() => {
    if (isRunning && !isBreak) {
      setCameraError(null);
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Webcam error:', err);
          setCameraError('Camera access denied. Face detection disabled.');
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isRunning, isBreak]);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Error loading face models:', err);
      }
    };
    loadModels();
  }, []);

  // Initialize alert audio
  useEffect(() => {
    const audio = new Audio('/notification.mp3');
    audio.loop = true;
    setAlertAudio(audio);
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Face detection interval - always active during focus sessions
  useEffect(() => {
    if (!modelsLoaded || !videoRef.current || !isRunning || isBreak || cameraError) {
      setUserPresent(true);
      return;
    }

    const interval = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          );
          setUserPresent(detections.length > 0);
        } catch (e) {
          console.warn('Face detection error:', e);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [modelsLoaded, isRunning, isBreak, cameraError]);

  // Reference to track if we already showed notification for this absence
  const lastNotificationRef = useRef(0);

  // Show desktop notification helper
  const showDesktopNotification = useCallback((title, body) => {
    const now = Date.now();
    // Only show notification once every 10 seconds to avoid spam
    if (now - lastNotificationRef.current < 10000) return;
    lastNotificationRef.current = now;

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body: body,
          icon: '/favicon.ico',
          tag: 'deepfocus-face-alert',
          requireInteraction: true
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        setTimeout(() => notification.close(), 10000);
      } catch (e) {
        console.warn('Notification error:', e);
      }
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    const checkPermission = () => {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    };
    checkPermission();
  }, []);

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          // Show a test notification
          const testNotif = new Notification('✅ Notifications Enabled!', {
            body: 'You will now receive alerts when you lose focus.',
            icon: '/favicon.ico',
            tag: 'deepfocus-test'
          });
          setTimeout(() => testNotif.close(), 5000);
        }
      } catch (e) {
        console.error('Notification permission error:', e);
      }
    }
  };

  // Play/stop alert audio and show desktop notification based on detection state
  useEffect(() => {
    if (!alertAudio) return;
    
    const shouldAlert = isRunning && !isBreak && (
      !userPresent || 
      (isWindowTracking && !isWindowFocused)
    );
    
    if (shouldAlert) {
      alertAudio.play().catch(() => {});
      
      // Show desktop notification
      if (!userPresent) {
        showDesktopNotification(
          '⚠️ DeepFocus Alert!',
          'Face not detected! Please return to your focus session.'
        );
      }
    } else {
      alertAudio.pause();
      alertAudio.currentTime = 0;
    }
  }, [alertAudio, userPresent, isWindowFocused, isRunning, isBreak, isWindowTracking, showDesktopNotification]);

  const handleToggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else if (currentGoal?._id === goalId) {
      resumeTimer();
    } else {
      startTimer(goal);
    }
  };

  const handleResetTimer = () => {
    resetTimer();
  };

  const handleStopSession = () => {
    stopTimer();
    stopWindowTracking();
  };

  const handleSkipBreak = () => {
    skipBreakSession();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSession = sessionPlan && sessionPlan.length > 0 ? sessionPlan[currentSessionIndex] : null;
  const sessionTotalSeconds = currentSession ? currentSession.duration * 60 : 1;
  const progress = ((sessionTotalSeconds - timeLeft) / sessionTotalSeconds) * 100;
  
  // Check if any tracking alert is active
  const hasAlert = isRunning && !isBreak && (
    !userPresent || 
    (isWindowTracking && !isWindowFocused)
  );

  if (!goal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8">
      {/* Hidden video for face detection */}
      <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />
      
      {/* Alert Banner */}
      {hasAlert && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white py-3 px-4 z-50 flex items-center justify-between safe-top">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
            <span className="font-medium text-sm sm:text-base">
              {!userPresent && 'Face not detected! '}
              {isWindowTracking && !isWindowFocused && 'Window focus lost! '}
              Return to focus.
            </span>
          </div>
          <button 
            onClick={() => {
              dismissWindowAlert();
              if (alertAudio) {
                alertAudio.pause();
                alertAudio.currentTime = 0;
              }
            }}
            className="p-2 hover:bg-red-500 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <div className="max-w-lg mx-auto px-4">
        {/* Timer Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-slate-700 font-medium">
                {currentSession?.type === 'break' ? 'Break period' : 'Focus period'}
              </span>
              <span className="text-slate-500 text-sm ml-2">
                ({currentSessionIndex + 1} of {sessionPlan.length || 1})
              </span>
            </div>
          </div>

          {/* Tracking Status */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-xs">
            <div className="flex items-center px-3 py-1.5 bg-slate-100 rounded-full">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                cameraError ? 'bg-yellow-500' : (userPresent ? 'bg-green-500' : 'bg-red-500')
              }`} />
              <span className="text-slate-600">
                {cameraError ? 'Camera off' : (userPresent ? 'Face detected' : 'Face not found')}
              </span>
            </div>
            {isWindowTracking && (
              <div className="flex items-center px-3 py-1.5 bg-slate-100 rounded-full">
                <div className={`w-2 h-2 rounded-full mr-2 ${isWindowFocused ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-slate-600">
                  {isWindowFocused ? 'Window focused' : 'Window lost'}
                </span>
              </div>
            )}
            {/* Notification Permission Status */}
            {notificationPermission !== 'granted' ? (
              <button
                onClick={requestNotificationPermission}
                className="flex items-center px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded-full transition cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full mr-2 bg-amber-500" />
                <span className="text-amber-700 font-medium">Enable Notifications</span>
              </button>
            ) : (
              <div className="flex items-center px-3 py-1.5 bg-green-100 rounded-full">
                <div className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                <span className="text-green-700">Notifications on</span>
              </div>
            )}
          </div>

          {/* Window Tracking Button */}
          <div className="flex justify-center mb-6">
            {isWindowTracking ? (
              <button
                onClick={stopWindowTracking}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <MonitorOff className="w-4 h-4 mr-2" />
                Stop Window Tracking ({selectedWindow?.label?.slice(0, 20)}...)
              </button>
            ) : (
              <button
                onClick={startWindowTracking}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Track a Window (Optional)
              </button>
            )}
          </div>

          {windowTrackingError && (
            <p className="text-xs text-red-600 text-center mb-4">{windowTrackingError}</p>
          )}

          {/* Circular Timer */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <svg className="w-56 h-56 sm:w-64 sm:h-64" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="4"
                  strokeDasharray="8 4"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  fill="none"
                  stroke={hasAlert ? '#ef4444' : (currentSession?.type === 'break' ? '#22c55e' : '#3b82f6')}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 112}`}
                  strokeDashoffset={`${2 * Math.PI * 112 * (1 - progress / 100)}`}
                  transform="rotate(-90 128 128)"
                  className="transition-all duration-1000"
                />
                <circle
                  cx={128 + 112 * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}
                  cy={128 + 112 * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}
                  r="6"
                  fill={hasAlert ? '#ef4444' : (currentSession?.type === 'break' ? '#22c55e' : '#3b82f6')}
                  className="transition-all duration-1000"
                />
              </svg>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-4xl sm:text-5xl font-light ${hasAlert ? 'text-red-600' : 'text-slate-700'}`}>
                    {Math.floor(timeLeft / 60)}
                  </span>
                  <span className={`text-xl sm:text-2xl font-light ml-1 ${hasAlert ? 'text-red-400' : 'text-slate-400'}`}>min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={handleToggleTimer}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg touch-target ${
                isRunning 
                  ? 'bg-slate-700 hover:bg-slate-800' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
            
            <button
              onClick={handleResetTimer}
              className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition touch-target"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Status */}
          <p className="text-center text-slate-500 text-sm mt-4">
            {isRunning ? 'Running' : 'Paused'}
          </p>

          {/* Skip Break Button */}
          {isBreak && (
            <div className="mt-4 text-center">
              <button
                onClick={handleSkipBreak}
                className="px-6 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full font-medium text-sm transition"
              >
                Skip Break →
              </button>
            </div>
          )}
        </div>

        {/* Goal Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mt-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">{goal.name}</h2>
          {goal.description && <p className="text-slate-500 text-sm mb-4">{goal.description}</p>}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{goal.currentStreak}</p>
              <p className="text-xs text-slate-500">Day Streak</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{goal.dailyTargetMinutes}</p>
              <p className="text-xs text-slate-500">Daily Target</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{sessionsCompleted}</p>
              <p className="text-xs text-slate-500">Sessions</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-slate-700 font-medium text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timer;
