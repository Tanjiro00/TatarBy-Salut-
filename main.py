import io
import os

import subprocess
import wave

import audioread
import numpy as np
import scipy.io.wavfile
import io
import requests
import scipy
import pyogg
import soundfile as sf
from fastapi import FastAPI, Request, Response, BackgroundTasks, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pyaudio
from pydub import AudioSegment

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Set up audio recording
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
RECORD_SECONDS = 10
transcriptions = {}
transcription_count = -1
waiting = False

p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK)

# stop_event = Event()


def get_trans(file):
    url = 'https://tat-asr.api.translate.tatar/listening/'
    files = {'file': ('audio.wav', open(file, 'rb'), 'audio/wav')}
    response = requests.post(url, files=files)
    return response.json()['text']


@app.get("/")
async def index(request: Request):
    return FileResponse('index.html')
    # return {"message": "Live subtitle generation"}


@app.post("/postAudio")
async def postAudio(audio_file: UploadFile = File(...)):
    print(audio_file)
    file_bytes = await audio_file.read()
    print(file_bytes)
    with wave.open('audio.wav', 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # Sample width in bytes
        wav_file.setframerate(42100)  # Sample rate
        wav_file.writeframes(file_bytes)
    # print(file_bytes)
    trans = get_trans("audio.wav")
    print(trans)
    return trans

# @app.post("/postAudio")
# async def postaudio(file: UploadFile = File(...)):
#     try:
#         # Ensure the temp directory exists
#         os.makedirs("temp", exist_ok=True)
#
#         # Save the uploaded OGG file
#         ogg_file_path = f"temp/{file.filename}"
#         print(f"Saving file to: {ogg_file_path}")
#         with open(ogg_file_path, "wb") as ogg_file:
#             file_content = await file.read()
#             if not file_content:
#                 print("Uploaded file is empty")
#                 return JSONResponse(content={"error": "Uploaded file is empty"}, status_code=400)
#             ogg_file.write(file_content)
#
#         # Check if the file has the correct extension
#         if not ogg_file_path.endswith(".ogg"):
#             print("Uploaded file is not an OGG file")
#             return JSONResponse(content={"error": "Uploaded file is not an OGG file"}, status_code=400)
#
#         # Check if the file is not empty
#         if os.path.getsize(ogg_file_path) == 0:
#             print("Uploaded file is empty after saving")
#             return JSONResponse(content={"error": "Uploaded file is empty after saving"}, status_code=400)
#
#         # Convert OGG to WAV using ffmpeg
#         wav_file_path = ogg_file_path.replace(".ogg", ".wav")
#         print(f"Converting file: {ogg_file_path} to {wav_file_path}")
#         result = subprocess.run(
#             ["ffmpeg", "-y", "-f", "ogg", "-i", ogg_file_path, wav_file_path],
#             stdout=subprocess.PIPE,
#             stderr=subprocess.PIPE
#         )
#
#         if result.returncode != 0:
#             print(f"ffmpeg error: {result.stderr.decode()}")
#             return JSONResponse(content={"error": "Failed to convert file", "ffmpeg_error": result.stderr.decode()},
#                                 status_code=500)
#
#         print(f"File converted to: {wav_file_path}")
#
#         # Clean up the temporary OGG file
#         os.remove(ogg_file_path)
#
#         return JSONResponse(content={"message": "File converted successfully", "wav_file_path": wav_file_path})
#     except Exception as e:
#         print(f"Error: {str(e)}")
#         return JSONResponse(content={"error": str(e)}, status_code=500)500


# @app.post("/postAudio")
# async def postAudio(audio_file: UploadFile = File(...)):
#     file_bytes = await audio_file.read()
#
#     # Конвертируем OGG байты в WAV с помощью pydub
#     try:
#         ogg_audio = AudioSegment.from_file(io.BytesIO(file_bytes), format="ogg")
#         wav_io = io.BytesIO()
#         ogg_audio.export(wav_io, format="wav")
#         wav_io.seek(0)
#     except Exception as e:
#         return {"error": f"Failed to convert OGG to WAV: {str(e)}"}
#
#     # Записываем результат в файл (если необходимо)
#     with open('audio.wav', 'wb') as f:
#         f.write(wav_io.read())
#
#     # Используем временный файл для транскрипции
#     trans = get_trans('audio.wav')  # Если get_trans принимает путь к файлу
#     return {"transcription": trans}
