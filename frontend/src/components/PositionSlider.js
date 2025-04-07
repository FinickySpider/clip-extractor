import React, { useState } from 'react';
import { Box, Slider } from '@mui/material';

function PositionSlider({
  currentPosition,
  setCurrentPosition,
  videoDuration,
  startTime,
  endTime,
  playerRef
}) {
  // We'll highlight the outside range in a different color by using MUI's track styling
  // For a simpler approach, we just let the slider range from 0..videoDuration,
  // but visually indicate the valid portion.

  const [dragPosition, setDragPosition] = useState(currentPosition);

  const handleChange = (event, newValue) => {
    setDragPosition(newValue);
  };

  const handleChangeCommitted = (event, newValue) => {
    // Seek to the new position if it's within the 0..videoDuration range
    if (playerRef.current) {
      playerRef.current.seekTo(newValue, true);
    }
    setCurrentPosition(newValue);
  };

  // Optionally we can clamp newValue to [startTime, endTime], but let's allow
  // full 0..duration so the user can see everything.

  return (
    <Box mt={2}>
      <Slider
        value={dragPosition}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        min={0}
        max={videoDuration}
        step={0.1}
        valueLabelDisplay="auto"
        sx={{
          // Grey out the track outside the [startTime, endTime] region
          '& .MuiSlider-track': {
            color: '#1976d2' // main track color
          },
          '& .MuiSlider-rail': {
            opacity: 0.4,
            backgroundColor: '#999'
          }
        }}
      />
      <Box mt={1}>
        <p style={{ margin: 0 }}>
          Current: {dragPosition.toFixed(1)}s / {videoDuration.toFixed(1)}s
          <br/>
          Range: [{startTime.toFixed(1)}s - {endTime.toFixed(1)}s]
        </p>
      </Box>
    </Box>
  );
}

export default PositionSlider;
