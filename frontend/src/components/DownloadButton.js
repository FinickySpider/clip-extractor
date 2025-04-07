import React, { useState } from 'react';
import { Button, CircularProgress, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';

function DownloadButton({ youtubeUrl, startTime, endTime }) {
  const [loading, setLoading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("Mp4");

  const handleDownload = async () => {
    if (!youtubeUrl) {
      alert("Please enter a valid YouTube URL before downloading.");
      return;
    }
    setLoading(true);
    try {
      const secondsToHHMMSS = (secs) => {
        const hrs = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        const s = Math.floor(secs % 60);
        return hrs > 0
          ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          : `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      };

      const response = await axios.post(
        "http://localhost:8000/download",
        {
          url: youtubeUrl,
          startTime: secondsToHHMMSS(startTime),
          endTime: secondsToHHMMSS(endTime),
          downloadFormat: downloadFormat
        },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', `clip.${downloadFormat.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed", error);
      alert("Download failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <Box mt={2}>
      <FormControl variant="outlined" style={{ minWidth: 200, marginRight: 16 }}>
        <InputLabel id="download-format-label">Download Format</InputLabel>
        <Select
          labelId="download-format-label"
          value={downloadFormat}
          onChange={(e) => setDownloadFormat(e.target.value)}
          label="Download Format"
        >
          <MenuItem value="Mp4">Video - Mp4</MenuItem>
          <MenuItem value="Webm">Video - Webm</MenuItem>
          <MenuItem value="Mp3">Audio - Mp3</MenuItem>
          <MenuItem value="M4a">Audio - M4a</MenuItem>
          <MenuItem value="Vorbis">Audio - Vorbis</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" color="secondary" onClick={handleDownload} disabled={!youtubeUrl}>
        Process & Download Clip
      </Button>

      {loading && (
        <Box mt={2} display="flex" alignItems="center">
          <CircularProgress size={24} />
          <Box ml={2}>Processing...</Box>
        </Box>
      )}
    </Box>
  );
}

export default DownloadButton;
