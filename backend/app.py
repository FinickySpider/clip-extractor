from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from utils import download_clip

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DownloadRequest(BaseModel):
    url: str
    startTime: str  # HH:MM or HH:MM:SS format
    endTime: str    # HH:MM or HH:MM:SS format
    downloadFormat: str  # e.g., "Mp4", "Webm", "Mp3", "M4a", "Vorbis"

@app.post("/download")
async def download_video(request: DownloadRequest):
    try:
        clip_path, final_filename = download_clip(
            url=request.url,
            start_time=request.startTime,
            end_time=request.endTime,
            download_format=request.downloadFormat
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return FileResponse(path=clip_path, filename=final_filename, media_type="application/octet-stream")
