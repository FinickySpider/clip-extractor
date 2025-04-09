import React from 'react';
import { Box, Slider } from '@mui/material';

function SliderControl({ videoDuration, startTime, endTime, setStartTime, setEndTime }) {
  const handleChange = (event, newValue) => {
    setStartTime(newValue[0]);
    setEndTime(newValue[1]);
  };

  return (
    <Box my={2}>
      <Slider
        value={[startTime, endTime]}
        onChange={handleChange}
        valueLabelDisplay="auto"
        min={0}
        max={videoDuration}
        step={0.1}
        sx={{
          '& .MuiSlider-rail': {
            backgroundColor: 'grey.700',
          },
          '& .MuiSlider-track': {
            backgroundColor: 'primary.main',
          }
        }}
      />
    </Box>
  );
}

export default SliderControl;
