import React, { useState, useRef } from 'react';
import axios from 'axios';
import cls from './AudioRecorder.module.scss';
import mic from '../../../assets/icons/normal/mic.svg';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        await postRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const postRecording = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.ogg');

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Upload successful:', response.data);
    } catch (error) {
      console.error('Error uploading recording:', error);
    }
  };

  return (
    <div className={cls.recorder}>
      <button
        className={cls.btn}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
      >
        <img src={mic} alt="microphone" />
      </button>
    </div>
  );
};

export default AudioRecorder;