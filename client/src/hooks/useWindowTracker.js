import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook for tracking a specific window/application focus using Screen Capture API.
 * Detects when user switches away from the tracked window by monitoring:
 * 1. If window is minimized (dark/black content)
 * 2. If window content is completely static (user switched to another app)
 * Shows desktop notifications when focus is lost.
 */
export const useWindowTracker = ({ onFocusLost, onFocusRegained }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const alertAudioRef = useRef(null);
  const isWindowFocusedRef = useRef(true);
  const lastFrameHashRef = useRef(null);
  const staticCountRef = useRef(0);
  const notificationRef = useRef(null);

  // Settings
  const STATIC_THRESHOLD = 3;
  const CHECK_INTERVAL_MS = 500;

  useEffect(() => {
    isWindowFocusedRef.current = isWindowFocused;
  }, [isWindowFocused]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    try {
      alertAudioRef.current = new Audio('/notification.mp3');
      alertAudioRef.current.loop = true;
      alertAudioRef.current.volume = 1.0;
    } catch (e) {
      console.warn('Could not create audio:', e);
    }
    
    return () => {
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current = null;
      }
      if (notificationRef.current) {
        notificationRef.current.close();
      }
    };
  }, []);

  // Show desktop notification
  const showDesktopNotification = useCallback((title, body) => {
    // Close any existing notification
    if (notificationRef.current) {
      notificationRef.current.close();
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        notificationRef.current = new Notification(title, {
          body: body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'deepfocus-alert', // Replaces existing notifications with same tag
          requireInteraction: true, // Stay visible until user interacts
          silent: false
        });

        // Click to focus the DeepFocus app
        notificationRef.current.onclick = () => {
          window.focus();
          notificationRef.current.close();
        };

        // Auto-close after 10 seconds
        setTimeout(() => {
          if (notificationRef.current) {
            notificationRef.current.close();
          }
        }, 10000);
      } catch (e) {
        console.warn('Could not show notification:', e);
      }
    }
  }, []);

  const playAlert = useCallback(() => {
    if (alertAudioRef.current) {
      alertAudioRef.current.currentTime = 0;
      alertAudioRef.current.play().catch(e => console.warn('Audio play failed:', e));
    }
  }, []);

  const stopAlert = useCallback(() => {
    if (alertAudioRef.current) {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
    }
    if (notificationRef.current) {
      notificationRef.current.close();
    }
  }, []);

  const handleFocusLost = useCallback(() => {
    if (!isWindowFocusedRef.current) return;
    
    console.log('🔴 WINDOW FOCUS LOST - ALERT!');
    setIsWindowFocused(false);
    isWindowFocusedRef.current = false;
    
    // Play audio alert
    playAlert();
    
    // Show desktop notification
    showDesktopNotification(
      '⚠️ DeepFocus Alert!',
      'You switched away from your tracked window! Return to your focus session.'
    );
    
    if (onFocusLost) onFocusLost();
  }, [onFocusLost, playAlert, showDesktopNotification]);

  const handleFocusRegained = useCallback(() => {
    if (isWindowFocusedRef.current) return;
    
    console.log('🟢 Window focus regained');
    setIsWindowFocused(true);
    isWindowFocusedRef.current = true;
    staticCountRef.current = 0;
    stopAlert();
    
    if (onFocusRegained) onFocusRegained();
  }, [onFocusRegained, stopAlert]);

  const getFrameHash = (data) => {
    let hash = 0;
    for (let i = 0; i < data.length; i += 160) {
      hash = ((hash << 5) - hash) + data[i] + data[i + 1] + data[i + 2];
      hash = hash & hash;
    }
    return hash;
  };

  const getAverageBrightness = (data) => {
    let sum = 0;
    for (let i = 0; i < data.length; i += 16) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return sum / (data.length / 16);
  };

  const stopTracking = useCallback(() => {
    console.log('Stopping window tracking');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }
    
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    stopAlert();
    lastFrameHashRef.current = null;
    staticCountRef.current = 0;
    
    setIsTracking(false);
    setSelectedWindow(null);
    setIsWindowFocused(true);
    isWindowFocusedRef.current = true;
    setTrackingError(null);
  }, [stopAlert]);

  const startTracking = useCallback(async () => {
    try {
      setTrackingError(null);
      console.log('🎯 Starting window tracking...');
      
      // Request notification permission if not granted
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setTrackingError('Screen sharing is not supported in this browser.');
        return;
      }
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 10 },
        audio: false
      });

      console.log('✅ Got display media stream');
      streamRef.current = stream;
      
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      
      const windowName = videoTrack.label || 'Selected Window';
      console.log('📺 Tracking window:', windowName);
      
      setSelectedWindow({
        label: windowName,
        displaySurface: settings.displaySurface || 'window'
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      videoRef.current = video;

      videoTrack.addEventListener('ended', () => {
        console.log('Screen share ended by user');
        stopTracking();
      });

      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 48;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      lastFrameHashRef.current = null;
      staticCountRef.current = 0;
      
      checkIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !streamRef.current) return;

        const vid = videoRef.current;
        if (vid.paused || vid.ended) {
          handleFocusLost();
          return;
        }

        const tracks = streamRef.current.getVideoTracks();
        if (tracks.length === 0 || tracks[0].readyState !== 'live') {
          handleFocusLost();
          return;
        }

        try {
          ctx.drawImage(vid, 0, 0, 64, 48);
          const frameData = ctx.getImageData(0, 0, 64, 48).data;
          const brightness = getAverageBrightness(frameData);
          
          if (brightness < 15) {
            staticCountRef.current += 0.5;
            console.log(`⚫ Dark frame (brightness: ${brightness.toFixed(1)}), count: ${staticCountRef.current}`);
          } else {
            const currentHash = getFrameHash(frameData);
            
            if (lastFrameHashRef.current !== null) {
              if (currentHash === lastFrameHashRef.current) {
                staticCountRef.current += 0.5;
                console.log(`⏸️ Static frame, count: ${staticCountRef.current}/${STATIC_THRESHOLD}`);
              } else {
                if (staticCountRef.current > 0) {
                  console.log('✨ Activity detected');
                }
                staticCountRef.current = 0;
                
                if (!isWindowFocusedRef.current) {
                  handleFocusRegained();
                }
              }
            }
            
            lastFrameHashRef.current = currentHash;
          }
          
          if (staticCountRef.current >= STATIC_THRESHOLD && isWindowFocusedRef.current) {
            console.log(`⚠️ Static for ${STATIC_THRESHOLD}s - switched apps!`);
            handleFocusLost();
          }
          
        } catch (e) {
          console.warn('Frame check error:', e);
        }
      }, CHECK_INTERVAL_MS);
      
      setIsTracking(true);
      setIsWindowFocused(true);
      isWindowFocusedRef.current = true;
      console.log('🎯 Window tracking ACTIVE');
      
    } catch (error) {
      console.error('Error starting window tracking:', error);
      if (error.name === 'NotAllowedError') {
        setTrackingError('Permission denied. Please allow window sharing.');
      } else {
        setTrackingError(`Failed to start: ${error.message}`);
      }
      setIsTracking(false);
    }
  }, [stopTracking, handleFocusLost, handleFocusRegained]);

  const dismissAlert = useCallback(() => {
    stopAlert();
    staticCountRef.current = 0;
  }, [stopAlert]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    trackingError,
    selectedWindow,
    isWindowFocused,
    startTracking,
    stopTracking,
    dismissAlert
  };
};

export default useWindowTracker;
