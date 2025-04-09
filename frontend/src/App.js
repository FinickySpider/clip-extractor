import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, Typography, Grid, Button } from '@mui/material';
import URLInput from './components/URLInput';
import VideoPlayer from './components/VideoPlayer';
import TimeControls from './components/TimeControls';
import SliderControl from './components/SliderControl';
import DownloadButton from './components/DownloadButton';

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const playerRef = useRef(null);

  // Reset state whenever the URL changes
  useEffect(() => {
    setVideoDuration(0);
    setStartTime(0);
    setEndTime(0);
    setCurrentPosition(0);
  }, [youtubeUrl]);

  useEffect(() => {
    if (videoDuration && endTime === 0) {
      setEndTime(videoDuration);
    }
  }, [videoDuration, endTime]);

  // Auto-seek if current position is out of the defined range
  useEffect(() => {
    if (playerRef.current && (currentPosition < startTime || currentPosition > endTime)) {
      playerRef.current.seekTo(startTime, true);
      setCurrentPosition(startTime);
    }
  }, [startTime, endTime, currentPosition]);

  // Reset/Clear button handler
  const handleReset = () => {
    setYoutubeUrl("");
    setVideoDuration(0);
    setStartTime(0);
    setEndTime(0);
    setCurrentPosition(0);
    if (playerRef.current) {
      playerRef.current.stopVideo();
    }
  };

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center">
          Youtube Clip Extractor
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <URLInput youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl} />
          </Grid>
          <Grid item xs={12} container justifyContent="center">
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
          </Grid>
          {youtubeUrl && (
            <>
              <Grid item xs={12}>
                <VideoPlayer
                  youtubeUrl={youtubeUrl}
                  setVideoDuration={setVideoDuration}
                  startTime={startTime}
                  endTime={endTime}
                  currentPosition={currentPosition}
                  setCurrentPosition={setCurrentPosition}
                  playerRef={playerRef}
                />
              </Grid>
              <Grid item xs={12}>
                <TimeControls
                  startTime={startTime}
                  endTime={endTime}
                  setStartTime={setStartTime}
                  setEndTime={setEndTime}
                />
              </Grid>
              <Grid item xs={12}>
                <SliderControl
                  videoDuration={videoDuration}
                  startTime={startTime}
                  endTime={endTime}
                  setStartTime={setStartTime}
                  setEndTime={setEndTime}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <DownloadButton
              youtubeUrl={youtubeUrl}
              startTime={startTime}
              endTime={endTime}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default App;
