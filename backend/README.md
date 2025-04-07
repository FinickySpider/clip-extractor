
# Backend for Clip Extractor

This is the FastAPI backend for the Clip Extraction Interface.
It provides an endpoint to download a clipped segment of a YouTube video using yt-dlp and ffmpeg.

## Setup

1. Install dependencies:
```

pip install -r requirements.txt

```
2. Run the server:
```

uvicorn app:app --reload

```

## Endpoint

- `POST /download`
- **Payload:**
 ```json
 {
    "url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "startTime": "00:01:10",
    "endTime": "00:01:30"
 }
 ```
- **Response:** Returns the video clip as a file download.

