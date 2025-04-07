import React from 'react';
import { Button } from '@mui/material';

function PreviewButton({ startTime, endTime }) {
  const handlePreview = () => {
    // Here you would integrate with the YouTube player API to seek and play the selected segment.
    console.log(`Previewing clip from ${startTime} to ${endTime}`);
    alert("Preview functionality not fully implemented yet.");
  };

  return (
    <Button variant="contained" color="primary" onClick={handlePreview} style={{ marginRight: 10 }}>
      Preview Clip
    </Button>
  );
}

export default PreviewButton;
