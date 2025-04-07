import React, { useState, useEffect } from 'react';
import { Box, TextField } from '@mui/material';

const parseTime = (timeStr) => {
  // parse "MM:SS" or "HH:MM:SS" into seconds
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  } else if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }
  return 0;
};

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
};

function TimeControls({ startTime, endTime, setStartTime, setEndTime }) {
  const [startInput, setStartInput] = useState(formatTime(startTime));
  const [endInput, setEndInput] = useState(formatTime(endTime));

  useEffect(() => {
    setStartInput(formatTime(startTime));
  }, [startTime]);

  useEffect(() => {
    setEndInput(formatTime(endTime));
  }, [endTime]);

  const handleStartChange = (e) => {
    const val = e.target.value;
    setStartInput(val);
    const secs = parseTime(val);
    if (!isNaN(secs)) {
      setStartTime(secs);
    }
  };

  const handleEndChange = (e) => {
    const val = e.target.value;
    setEndInput(val);
    const secs = parseTime(val);
    if (!isNaN(secs)) {
      setEndTime(secs);
    }
  };

  return (
    <Box display="flex" justifyContent="space-between" my={2}>
      <TextField
        label="Start Time (HH:MM or HH:MM:SS)"
        variant="outlined"
        value={startInput}
        onChange={handleStartChange}
        style={{ marginRight: 10 }}
      />
      <TextField
        label="End Time (HH:MM or HH:MM:SS)"
        variant="outlined"
        value={endInput}
        onChange={handleEndChange}
      />
    </Box>
  );
}

export default TimeControls;
