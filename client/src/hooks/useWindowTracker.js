import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook for tracking a specific window/application focus using Screen Capture API.
 * When the user selects a window to share, we monitor if it's still visible.
 * If the window loses focus (user switches away), we trigger an alert.
 */
export const useWindowTracker = ({ onFocusLost, onFocusRegained, enabled = true }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const alertAudioRef = useRef(null);
  const lastAlertTimeRef = useRef(0);

  // Initialize alert audio
  useEffect(() => {
    alertAudioRef.current = new Audio('/notification.mp3');
    alertAudioRef.current.loop = true;
    
    return () => {
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current = null;
      }
    };
  }, []);

  // Start tracking a window
  const startTracking = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setTrackingError(null);
      
      // Request screen/window share
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window', // Prefer window selection
          logicalSurface: true,
          cursor: 'never'
        },
        audio: false,
        preferCurrentTab: false,
        selfBrowserSurface: 'exclude', // Don't allow selecting the current browser
        systemAudio: 'exclude'
      });

      streamRef.current = stream;
      
      // Get track info
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      
      setSelectedWindow({
        label: videoTrack.label || 'Selected Window',
        displaySurface: settings.displaySurface || 'unknown'
      });

      // Create hidden video element to check if window is visible
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      videoRef.current = video;

      // Listen for track ended (user stops sharing)
      videoTrack.addEventListener('ended', () => {
        stopTracking();
      });

      // Start monitoring window visibility
      startVisibilityCheck();
      
      setIsTracking(true);
      setIsWindowFocused(true);
      
    } catch (error) {
      console.error('Error starting window tracking:', error);
      if (error.name === 'NotAllowedError') {
        setTrackingError('Permission denied. Please allow window sharing to track focus.');
      } else {
        setTrackingError('Failed to start window tracking. Your browser may not support this feature.');
      }
      setIsTracking(false);
    }
  }, [enabled]);

  // Check if the tracked window is still visible/has content
  const startVisibilityCheck = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    // Create canvas for checking video frames
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let lastFrameData = null;
    let unchangedFrameCount = 0;
    const MAX_UNCHANGED_FRAMES = 3; // Consider unfocused after 3 unchanged frames

    checkIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !streamRef.current) return;

      const video = videoRef.current;
      
      // Check if video is still playing
      if (video.paused || video.ended) {
        handleFocusLost();
        return;
      }

      // Check if stream is still active
      const tracks = streamRef.current.getVideoTracks();
      if (tracks.length === 0 || tracks[0].readyState !== 'live') {
        handleFocusLost();
        return;
      }

      // Sample the video frame to detect if window content is changing
      try {
        canvas.width = 100; // Small sample for performance
        canvas.height = 100;
        ctx.drawImage(video, 0, 0, 100, 100);
        const frameData = ctx.getImageData(0, 0, 100, 100);
        
        // Check if frame is mostly black/empty (window minimized or covered)
        const avgBrightness = calculateAverageBrightness(frameData.data);
        
        if (avgBrightness < 5) { // Very dark = window likely minimized
          unchangedFrameCount++;
        } else if (lastFrameData) {
          // Compare with last frame to detect if content is static
          const similarity = compareFrames(lastFrameData.data, frameData.data);
          if (similarity > 0.99) { // 99% similar means no activity
            // This is fine - window can be static while focused
          }
          unchangedFrameCount = 0;
        }
        
        lastFrameData = frameData;
        
        if (unchangedFrameCount >= MAX_UNCHANGED_FRAMES) {
          handleFocusLost();
        } else if (!isWindowFocused) {
          handleFocusRegained();
        }
        
      } catch (e) {
        // Canvas errors can happen if video isn't ready
        console.warn('Frame check error:', e);
      }
    }, 1000); // Check every second
  }, [isWindowFocused]);

  const calculateAverageBrightness = (data) => {
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return sum / (data.length / 4);
  };

  const compareFrames = (data1, data2) => {
    if (data1.length !== data2.length) return 0;
    let matches = 0;
    for (let i = 0; i < data1.length; i += 4) {
      if (Math.abs(data1[i] - data2[i]) < 10 &&
          Math.abs(data1[i+1] - data2[i+1]) < 10 &&
          Math.abs(data1[i+2] - data2[i+2]) < 10) {
        matches++;
      }
    }
    return matches / (data1.length / 4);
  };

  const handleFocusLost = useCallback(() => {
    if (!isWindowFocused) return; // Already alerted
    
    setIsWindowFocused(false);
    
    // Play alert sound (throttle to avoid spam)
    const now = Date.now();
    if (now - lastAlertTimeRef.current > 2000) {
      if (alertAudioRef.current) {
        alertAudioRef.current.play().catch(() => {});
      }
      lastAlertTimeRef.current = now;
    }
    
    if (onFocusLost) {
      onFocusLost();
    }
  }, [isWindowFocused, onFocusLost]);

  const handleFocusRegained = useCallback(() => {
    if (isWindowFocused) return;
    
    setIsWindowFocused(true);
    
    // Stop alert sound
    if (alertAudioRef.current) {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
    }
    
    if (onFocusRegained) {
      onFocusRegained();
    }
  }, [isWindowFocused, onFocusRegained]);

  const stopTracking = useCallback(() => {
    // Stop the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Stop video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }
    
    // Clear interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    // Stop alert sound
    if (alertAudioRef.current) {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
    }
    
    setIsTracking(false);
    setSelectedWindow(null);
    setIsWindowFocused(true);
    setTrackingError(null);
  }, []);

  // Dismiss alert (acknowledge but keep tracking)
  const dismissAlert = useCallback(() => {
    if (alertAudioRef.current) {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

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
