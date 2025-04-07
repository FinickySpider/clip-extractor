import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Button, Box, Typography } from '@mui/material';

function VideoPlayer({
  youtubeUrl,
  setVideoDuration,
  startTime,
  endTime,
  currentPosition,
  setCurrentPosition,
  playerRef
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);

  const extractVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  // Calculate videoId even if youtubeUrl is empty (will be null)
  const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;

  const onReady = (event) => {
    playerRef.current = event.target; // store ref to the player
    const duration = event.target.getDuration();
    setVideoDuration(duration);
  };

  const onStateChange = (event) => {
    if (event.data === 1) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  // Poll current time every 300ms if playing
  useEffect(() => {
    let interval;
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        const pos = playerRef.current.getCurrentTime();
        setCurrentPosition(pos);
        if (pos >= endTime) {
          if (loopEnabled) {
            playerRef.current.seekTo(startTime, true);
          } else {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
          }
        }
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying, endTime, loopEnabled, startTime, setCurrentPosition, playerRef]);

  // Disable controls if no valid video is loaded.
  const controlsDisabled = !youtubeUrl || !videoId;

  const skipToStart = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(startTime, true);
      setCurrentPosition(startTime);
    }
  };

  const skipToEnd = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(endTime, true);
      setCurrentPosition(endTime);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    if (state === 1) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const toggleLoop = () => {
    setLoopEnabled(!loopEnabled);
  };

  return (
    <div>
      {youtubeUrl && videoId ? (
        <YouTube
          videoId={videoId}
          opts={{
            width: '100%',
            playerVars: {
              autoplay: 0,
              controls: 0,         // Hide native controls
              disablekb: 1,
              fs: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              playsinline: 1      // Play inline on mobile devices
            }
          }}
          onReady={onReady}
          onStateChange={onStateChange}
        />
      ) : (
        <Typography variant="body1" color="textSecondary">
          Please enter a YouTube URL above.
        </Typography>
      )}
      <Box mt={2} display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={skipToStart} disabled={controlsDisabled}>
          Skip to Start
        </Button>
        <Button variant="outlined" onClick={togglePlay} disabled={controlsDisabled}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button variant="outlined" onClick={skipToEnd} disabled={controlsDisabled}>
          Skip to End
        </Button>
        <Button variant="outlined" onClick={toggleLoop} disabled={controlsDisabled}>
          {loopEnabled ? 'Loop On' : 'Loop Off'}
        </Button>
      </Box>
    </div>
  );
}

export default VideoPlayer;
