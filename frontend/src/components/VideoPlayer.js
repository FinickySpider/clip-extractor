import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Button, Box, Typography, Grid, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import LoopIcon from '@mui/icons-material/Loop';

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

  // Extracts videoId from a given YouTube URL
  const extractVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;

  // On video ready, store reference to player and set total duration
  const onReady = (event) => {
    playerRef.current = event.target;
    const duration = event.target.getDuration();
    setVideoDuration(duration);
  };

  // Track whether video is playing or paused
  const onStateChange = (event) => {
    if (event.data === 1) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  // Poll current time every 300ms to update UI and handle end-time or loop
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

  // Helper to disable controls if no valid video is loaded
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
    <>
      {/* Original Sizing Logic: Full-width embed, no forced height. */}
      {youtubeUrl && videoId ? (
        <YouTube
          videoId={videoId}
          opts={{
            width: '100%',
            playerVars: {
              autoplay: 0,
              controls: 0,  // Hide native controls
              disablekb: 1,
              fs: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              playsinline: 1
            }
          }}
          onReady={onReady}
          onStateChange={onStateChange}
        />
      ) : (
        <Box
          sx={{
            bgcolor: 'grey.900',
            borderRadius: 1,
            p: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" color="textSecondary">
            Video will load here after entering a YouTube URL.
          </Typography>
        </Box>
      )}

      {/* Control Bar for Skip/Play/Loop Buttons */}
      <Box mt={2}>
        <Grid container spacing={1} justifyContent="center">
          <Grid item>
            <Tooltip title="Skip to Start">
              <Button variant="outlined" onClick={skipToStart} disabled={controlsDisabled}>
                <SkipPreviousIcon />
              </Button>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={isPlaying ? "Pause" : "Play"}>
              <Button variant="outlined" onClick={togglePlay} disabled={controlsDisabled}>
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </Button>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Skip to End">
              <Button variant="outlined" onClick={skipToEnd} disabled={controlsDisabled}>
                <SkipNextIcon />
              </Button>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={loopEnabled ? "Loop: On" : "Loop: Off"}>
              <Button
                variant={loopEnabled ? "contained" : "outlined"}
                onClick={toggleLoop}
                disabled={controlsDisabled}
              >
                <LoopIcon />
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default VideoPlayer;
