import subprocess
import tempfile
import os
import re
import json

def sanitize_filename(name: str) -> str:
    """
    Remove invalid characters and limit length for safe filenames.
    """
    name = re.sub(r'[^\w\s\-\(\)\[\]]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name[:60]

def get_video_title(url: str) -> str:
    """
    Use yt-dlp to retrieve video metadata (JSON) and extract the title.
    Fallback to "clip" if any error occurs.
    """
    try:
        cmd = ["yt-dlp", "--dump-single-json", url]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            return data.get("title", "clip")
    except Exception:
        pass
    return "clip"

def download_clip(url: str, start_time: str, end_time: str, download_format: str):
    """
    Synchronously downloads a clip from the given YouTube URL using yt-dlp.
    The clip is defined from start_time to end_time in HH:MM:SS format.
    download_format can be one of:
      - Video: "Mp4", "Webm"
      - Audio: "Mp3", "M4a", "Vorbis"
    Returns (clip_path, final_filename).
    """
    try:
        title = get_video_title(url)
        safe_title = sanitize_filename(title)
        temp_dir = tempfile.mkdtemp()
        
        if download_format in ["Mp4", "Webm"]:
            if download_format == "Mp4":
                recode = "mp4"
                postprocessor_args = "ffmpeg:-c:v libx264 -preset veryfast -crf 23 -c:a aac -strict -2"
                output_ext = "mp4"
                format_string = "bestvideo[codec!=av01]+bestaudio/best"
            else:  # "Webm"
                recode = "webm"
                postprocessor_args = "ffmpeg:-c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus"
                output_ext = "webm"
                format_string = "bestvideo[ext=webm][codec!=av01]+bestaudio/best"
            
            output_template = os.path.join(temp_dir, f"{safe_title}.{output_ext}")
            command = [
                "yt-dlp",
                "--format", format_string,
                "--download-sections", f"*{start_time}-{end_time}",
                "--merge-output-format", recode,
                "--recode-video", recode,
                "--postprocessor-args", postprocessor_args,
                "-o", output_template,
                url
            ]
        elif download_format in ["Mp3", "M4a", "Vorbis"]:
            audio_format = download_format.lower()  # "mp3", "m4a", "vorbis"
            output_template = os.path.join(temp_dir, f"{safe_title}.{audio_format}")
            command = [
                "yt-dlp",
                "--format", "bestaudio/best",
                "--download-sections", f"*{start_time}-{end_time}",
                "--extract-audio",
                "--audio-format", audio_format,
                "-o", output_template,
                url
            ]
            output_ext = audio_format
        else:
            raise Exception("Unsupported download format")
        
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode != 0:
            raise Exception(f"Error downloading clip: {result.stderr}")
        
        for file in os.listdir(temp_dir):
            if file.endswith(f".{output_ext}"):
                clip_path = os.path.join(temp_dir, file)
                final_filename = file
                return clip_path, final_filename
        
        raise Exception("Clip file not found.")
    
    except Exception as e:
        print(f"Error in download_clip: {e}")
        raise
