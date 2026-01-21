import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { goalsAPI } from '../services/api';
import { useTimer } from '../context/TimerContext';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import * as faceapi from 'face-api.js';

const Timer = () => {
  const videoRef = useRef(null);
  const [userPresent, setUserPresent] = useState(true);
  const [alertAudio, setAlertAudio] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

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

  // Start webcam when focus session starts and cleanup on unmount
  useEffect(() => {
    if (isRunning && !isBreak) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Webcam error:', err);
        });
    } else {
      // Stop webcam when not in focus session
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    // Cleanup function: stop webcam on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isRunning, isBreak]);

  // Load face-api.js models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        console.log('Face detection models loaded successfully');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading face detection models:', error);
        console.warn('Face detection will not be available. Please download models from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights');
      }
    };
    loadModels();
  }, []);

  // Face detection for presence monitoring using face-api.js
  useEffect(() => {
    let interval;

    if (isRunning && !isBreak && modelsLoaded) {
      interval = setInterval(async () => {
        if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
          const video = videoRef.current;
          
          try {
            // Detect faces using TinyFaceDetector (faster, good for real-time)
            const detections = await faceapi.detectAllFaces(
              video,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 224,
                scoreThreshold: 0.5
              })
            );
            
            // User is present if at least one face is detected
            setUserPresent(detections.length > 0);
          } catch (error) {
            console.error('Error detecting face:', error);
            setUserPresent(true); // Assume present on error to avoid false alarms
          }
        }
      }, 1000); // Check every 1 second for fast detection
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isBreak, modelsLoaded]);

  // Alert audio for user absence with cleanup
  useEffect(() => {
    if (!alertAudio) {
      const audio = new window.Audio('/notification.mp3');
      audio.loop = true;
      audio.volume = 0.7;
      setAlertAudio(audio);
      return;
    }
    
    if (isRunning && !isBreak && !userPresent) {
      // User is absent - play alert sound
      if (alertAudio.paused) {
        alertAudio.play()
          .then(() => console.log('Alert audio playing'))
          .catch(err => {
            console.error('Audio play error:', err);
            console.warn('Please interact with the page to enable audio');
          });
      }
    } else {
      // User is present or timer stopped - stop alert sound
      if (!alertAudio.paused) {
        alertAudio.pause();
        alertAudio.currentTime = 0;
        console.log('Alert audio stopped');
      }
    }

    // Cleanup function: stop audio on component unmount
    return () => {
      if (alertAudio && !alertAudio.paused) {
        alertAudio.pause();
        alertAudio.currentTime = 0;
      }
    };
  }, [userPresent, isRunning, isBreak, alertAudio]);

  const handleToggleTimer = () => {
    if (!currentGoal) {
      startTimer(goal);
    } else if (isRunning) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  };

  const handleResetTimer = () => {
    resetTimer();
  };

  const handleStopTimer = () => {
    stopTimer();
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

  if (!goal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Hidden video for presence detection */}
      <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />
      {/* Warning if user is absent */}
      {!userPresent && isRunning && !isBreak && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-2 z-50">
          User not detected! Please return to your focus session.
        </div>
      )}
      
      <div className="max-w-lg mx-auto px-4">
        {/* Timer Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-medium">
                {currentSession?.type === 'break' ? 'Break period' : 'Focus period'}
              </span>
              <span className="text-gray-500">
                ({currentSessionIndex + 1} of {sessionPlan.length || 1})
              </span>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Circular Timer */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              {/* Background dashed circle */}
              <svg className="w-64 h-64" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  strokeDasharray="8 4"
                />
                {/* Progress arc */}
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  fill="none"
                  stroke={currentSession?.type === 'break' ? '#22c55e' : '#3b82f6'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 112}`}
                  strokeDashoffset={`${2 * Math.PI * 112 * (1 - progress / 100)}`}
                  transform="rotate(-90 128 128)"
                  className="transition-all duration-1000"
                />
                {/* Progress indicator dot */}
                <circle
                  cx={128 + 112 * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}
                  cy={128 + 112 * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}
                  r="6"
                  fill={currentSession?.type === 'break' ? '#22c55e' : '#3b82f6'}
                  className="transition-all duration-1000"
                />
              </svg>
              
              {/* Time display in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-5xl font-light text-gray-700">
                    {Math.floor(timeLeft / 60)}
                  </span>
                  <span className="text-2xl font-light text-gray-400 ml-1">min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            {/* Play/Pause Button */}
            <button
              onClick={handleToggleTimer}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${
                isRunning 
                  ? 'bg-gray-700 hover:bg-gray-800' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
            
            {/* Reset Button */}
            <button
              onClick={handleResetTimer}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            {/* More Options */}
            <button className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>

          {/* Status */}
          <p className="text-center text-gray-500 text-sm mt-4">
            {isRunning ? 'Running' : 'Paused'}
          </p>

          {/* Skip Break Button */}
          {isBreak && (
            <div className="mt-6 text-center">
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
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{goal.name}</h2>
          {goal.description && <p className="text-gray-500 text-sm mb-4">{goal.description}</p>}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{goal.currentStreak}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{goal.dailyTargetMinutes}</p>
              <p className="text-xs text-gray-500">Daily Target</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{sessionsCompleted}</p>
              <p className="text-xs text-gray-500">Sessions Done</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timer;
