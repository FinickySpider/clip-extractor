import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, Typography } from '@mui/material';
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

  // When youtubeUrl changes, reset all state values
  useEffect(() => {
    setVideoDuration(0);
    setStartTime(0);
    setEndTime(0);
    setCurrentPosition(0);
  }, [youtubeUrl]);

  // When the video loads, default endTime to videoDuration if not already set
  useEffect(() => {
    if (videoDuration && endTime === 0) {
      setEndTime(videoDuration);
    }
  }, [videoDuration, endTime]);

  // If start/end times are updated and currentPosition is out of range, auto-seek
  useEffect(() => {
    if (playerRef.current && (currentPosition < startTime || currentPosition > endTime)) {
      playerRef.current.seekTo(startTime, true);
      setCurrentPosition(startTime);
    }
  }, [startTime, endTime, currentPosition]);

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Clip Extraction Interface
        </Typography>

        <URLInput youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl} />

        <VideoPlayer
          youtubeUrl={youtubeUrl}
          setVideoDuration={setVideoDuration}
          startTime={startTime}
          endTime={endTime}
          currentPosition={currentPosition}
          setCurrentPosition={setCurrentPosition}
          playerRef={playerRef}
        />

        <TimeControls
          startTime={startTime}
          endTime={endTime}
          setStartTime={setStartTime}
          setEndTime={setEndTime}
        />

        <SliderControl
          videoDuration={videoDuration}
          startTime={startTime}
          endTime={endTime}
          setStartTime={setStartTime}
          setEndTime={setEndTime}
        />

        <DownloadButton
          youtubeUrl={youtubeUrl}
          startTime={startTime}
          endTime={endTime}
        />
      </Box>
    </Container>
  );
}

export default App;
