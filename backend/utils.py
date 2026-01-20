import subprocess
import os
import re
import json
import time

# Determine the absolute path to yt-dlp.
# On Heroku, yt-dlp will be installed globally and available in PATH.
# For local development, it may be in the virtual environment.
def get_ytdlp_path():
    # First try system-wide installation (Heroku)
    from shutil import which
    system_ytdlp = which("yt-dlp")
    if system_ytdlp:
        return system_ytdlp
    # Fallback to venv location (local development)
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "venv", "bin", "yt-dlp")

YTDLP_PATH = get_ytdlp_path()

def sanitize_filename(name: str) -> str:
    """
    Remove invalid characters and limit length for safe filenames.
    Also replaces spaces with underscores.
    """
    name = re.sub(r'[^\w\s\-\(\)\[\]]', '', name)
    name = re.sub(r'\s+', '_', name).strip()
    return name[:60]

def get_video_title(url: str) -> str:
    """
    Use yt-dlp to retrieve video metadata (JSON) and extract the title.
    Fallback to "clip" if any error occurs.
    """
    try:
        cmd = [YTDLP_PATH, "--dump-single-json", url]
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

    Implements fallback: if the requested video format (filtering out av01) is not available,
    it will try again without that filter.

    Uses '--no-part' and '--restrict-filenames' to avoid temporary file issues.
    Uses a fixed temporary directory in the project folder to ensure files persist.
    """
    try:
        title = get_video_title(url)
        safe_title = sanitize_filename(title)
        
        # Use a fixed temporary directory inside the project directory.
        temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tmp")
        os.makedirs(temp_dir, exist_ok=True)
        
        if download_format in ["Mp4", "Webm"]:
            if download_format == "Mp4":
                recode = "mp4"
                postprocessor_args = "ffmpeg:-c:v libx264 -preset veryfast -crf 23 -c:a aac -strict -2"
                output_ext = "mp4"
                # Primary format string: exclude av01
                format_string = "bestvideo[codec!=av01]+bestaudio/best"
            else:  # "Webm"
                recode = "webm"
                postprocessor_args = "ffmpeg:-c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus"
                output_ext = "webm"
                format_string = "bestvideo[ext=webm][codec!=av01]+bestaudio/best"
            
            output_template = os.path.join(temp_dir, f"{safe_title}.{output_ext}")
            command = [
                YTDLP_PATH,
                "--no-part",
                "--restrict-filenames",
                "--format", format_string,
                "--download-sections", f"*{start_time}-{end_time}",
                "--merge-output-format", recode,
                "--recode-video", recode,
                "--postprocessor-args", postprocessor_args,
                "-o", output_template,
                url
            ]
            
            result = subprocess.run(command, capture_output=True, text=True)
            if result.returncode != 0 and "Requested format is not available" in result.stderr:
                # Fallback: try without filtering out av01 formats.
                fallback_format = "bestvideo+bestaudio/best"
                command[3] = fallback_format
                result = subprocess.run(command, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Error downloading clip: {result.stderr}")
        
        elif download_format in ["Mp3", "M4a", "Vorbis"]:
            audio_format = download_format.lower()  # "mp3", "m4a", "vorbis"
            output_template = os.path.join(temp_dir, f"{safe_title}.{audio_format}")
            command = [
                YTDLP_PATH,
                "--no-part",
                "--restrict-filenames",
                "--format", "bestaudio/best",
                "--download-sections", f"*{start_time}-{end_time}",
                "--extract-audio",
                "--audio-format", audio_format,
                "-o", output_template,
                url
            ]
            output_ext = audio_format
            result = subprocess.run(command, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"Error downloading clip: {result.stderr}")
        else:
            raise Exception("Unsupported download format")
        
        # Optional: wait a moment for file creation
        time.sleep(1)
        
        # Instead of picking the newest file by modification time,
        # we directly use the known output_template.
        if not os.path.exists(output_template):
            raise Exception(f"Clip file not created. Expected file: {output_template}. Command stderr: {result.stderr}")
        
        clip_path = output_template
        final_filename = os.path.basename(output_template)
        
        return clip_path, final_filename
    
    except Exception as e:
        print(f"Error in download_clip: {e}")
        raise
