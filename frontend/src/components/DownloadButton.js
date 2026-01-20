import React, { useState } from 'react';
import { Button, CircularProgress, Box, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
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

      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.post(
        `${backendUrl}/download`,
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
      
      // Use the filename from the backend response headers, fallback to default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `clip.${downloadFormat.toLowerCase()}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
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
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
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
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button fullWidth variant="contained" color="secondary" onClick={handleDownload} disabled={!youtubeUrl}>
            Process & Download Clip
          </Button>
        </Grid>
      </Grid>
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
