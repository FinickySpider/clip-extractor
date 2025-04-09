import React from 'react';
import { TextField } from '@mui/material';

function URLInput({ youtubeUrl, setYoutubeUrl }) {
  const handleChange = (e) => {
    setYoutubeUrl(e.target.value);
  };

  return (
    <TextField
      label="YouTube URL"
      variant="outlined"
      fullWidth
      value={youtubeUrl}
      onChange={handleChange}
      placeholder="Enter a YouTube URL"
      margin="normal"
    />
  );
}

export default URLInput;
