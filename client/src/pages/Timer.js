import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { goalsAPI } from '../services/api';
import { useTimer } from '../context/TimerContext';
import { useWindowTracker } from '../hooks/useWindowTracker';
import { Play, Pause, RotateCcw, Monitor, MonitorOff, Camera, CameraOff, AlertTriangle, X } from 'lucide-react';
import * as faceapi from 'face-api.js';

const Timer = () => {
  const videoRef = useRef(null);
  const [userPresent, setUserPresent] = useState(true);
  const [alertAudio, setAlertAudio] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceTrackingEnabled, setFaceTrackingEnabled] = useState(false);
  const [showTrackingOptions, setShowTrackingOptions] = useState(false);

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
    onFocusLost: () => {
      console.log('Window focus lost!');
    },
    onFocusRegained: () => {
      console.log('Window focus regained');
    },
    enabled: isRunning && !isBreak
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

  // Start webcam for face detection when enabled
  useEffect(() => {
    if (faceTrackingEnabled && isRunning && !isBreak) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Webcam error:', err);
          setFaceTrackingEnabled(false);
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
  }, [faceTrackingEnabled, isRunning, isBreak]);

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

  // Face detection interval
  useEffect(() => {
    if (!faceTrackingEnabled || !modelsLoaded || !videoRef.current || !isRunning || isBreak) {
      setUserPresent(true);
      return;
    }

    const interval = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );
        
        if (detections.length === 0) {
          setUserPresent(false);
        } else {
          setUserPresent(true);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [faceTrackingEnabled, modelsLoaded, isRunning, isBreak]);

  // Play/stop alert audio based on detection state
  useEffect(() => {
    if (!alertAudio) return;
    
    const shouldAlert = isRunning && !isBreak && (
      (faceTrackingEnabled && !userPresent) || 
      (isWindowTracking && !isWindowFocused)
    );
    
    if (shouldAlert) {
      alertAudio.play().catch(() => {});
    } else {
      alertAudio.pause();
      alertAudio.currentTime = 0;
    }
  }, [alertAudio, userPresent, isWindowFocused, isRunning, isBreak, faceTrackingEnabled, isWindowTracking]);

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
    (faceTrackingEnabled && !userPresent) || 
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
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white py-3 px-4 z-50 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
            <span className="font-medium">
              {faceTrackingEnabled && !userPresent && 'Face not detected! '}
              {isWindowTracking && !isWindowFocused && 'Window focus lost! '}
              Return to your focus session.
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
            className="p-1 hover:bg-red-500 rounded"
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
            <div className="flex items-center space-x-2">
              <span className="text-slate-700 font-medium">
                {currentSession?.type === 'break' ? 'Break period' : 'Focus period'}
              </span>
              <span className="text-slate-500 text-sm">
                ({currentSessionIndex + 1} of {sessionPlan.length || 1})
              </span>
            </div>
            <button 
              onClick={() => setShowTrackingOptions(!showTrackingOptions)}
              className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition"
              title="Tracking Options"
            >
              <Monitor className="w-5 h-5" />
            </button>
          </div>

          {/* Tracking Options Panel */}
          {showTrackingOptions && (
            <div className="mb-6 p-4 bg-slate-50 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Focus Tracking</h3>
              
              {/* Face Detection Toggle */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center space-x-3">
                  {faceTrackingEnabled ? (
                    <Camera className="w-5 h-5 text-green-600" />
                  ) : (
                    <CameraOff className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">Face Detection</p>
                    <p className="text-xs text-slate-500">Alert when you leave your desk</p>
                  </div>
                </div>
                <button
                  onClick={() => setFaceTrackingEnabled(!faceTrackingEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    faceTrackingEnabled ? 'bg-green-600' : 'bg-slate-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    faceTrackingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Window Tracking */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center space-x-3">
                  {isWindowTracking ? (
                    <Monitor className="w-5 h-5 text-blue-600" />
                  ) : (
                    <MonitorOff className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">Window Tracking</p>
                    <p className="text-xs text-slate-500">
                      {isWindowTracking && selectedWindow 
                        ? `Tracking: ${selectedWindow.label}` 
                        : 'Select a window to track'}
                    </p>
                  </div>
                </div>
                {isWindowTracking ? (
                  <button
                    onClick={stopWindowTracking}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={startWindowTracking}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    Select Window
                  </button>
                )}
              </div>

              {windowTrackingError && (
                <p className="text-xs text-red-600 mt-2">{windowTrackingError}</p>
              )}
              
              {/* Tracking Status */}
              <div className="flex items-center space-x-4 text-xs text-slate-500 pt-2">
                {faceTrackingEnabled && (
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-1.5 ${userPresent ? 'bg-green-500' : 'bg-red-500'}`} />
                    Face: {userPresent ? 'Detected' : 'Not found'}
                  </div>
                )}
                {isWindowTracking && (
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-1.5 ${isWindowFocused ? 'bg-green-500' : 'bg-red-500'}`} />
                    Window: {isWindowFocused ? 'Focused' : 'Lost'}
                  </div>
                )}
              </div>
            </div>
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
