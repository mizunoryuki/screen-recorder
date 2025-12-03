import { useState, useRef, useCallback } from 'react';

export type RecordingMode = 'screen' | 'canvas';

interface UseScreenRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordedChunks: Blob[];
  videoUrl: string | null;
  startRecording: (mode: RecordingMode, canvasRef?: React.RefObject<HTMLCanvasElement | null>) => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  downloadVideo: () => void;
  clearRecording: () => void;
}

export const useScreenRecorder = (): UseScreenRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(async (mode: RecordingMode, canvasRef?: React.RefObject<HTMLCanvasElement | null>) => {
    try {
      let stream: MediaStream;

      if (mode === 'canvas') {
        // Canvas録画
        if (!canvasRef?.current) {
          throw new Error('Canvasの参照が見つかりません');
        }
        
        const canvas = canvasRef.current;
        const canvasStream = canvas.captureStream(30); // 30 FPS
        stream = canvasStream;
      } else {
        // 画面キャプチャの取得
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;

      // MediaRecorderの設定
      const options = { mimeType: 'video/webm;codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setRecordedChunks(chunks);
        setIsRecording(false);
        setIsPaused(false);

        // ストリームの停止
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      // ユーザーが共有停止ボタンを押した時の処理（画面録画の場合のみ）
      if (mode === 'screen') {
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          stopRecording();
        });
      }

      mediaRecorder.start();
      setIsRecording(true);
      setRecordedChunks([]);
      setVideoUrl(null);
    } catch (error) {
      console.error('録画の開始に失敗しました:', error);
      alert('録画の開始に失敗しました。ブラウザが録画をサポートしているか確認してください。');
    }
  }, [stopRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, [isRecording, isPaused]);

  const downloadVideo = useCallback(() => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `screen-recording-${new Date().getTime()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [videoUrl]);

  const clearRecording = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setRecordedChunks([]);
  }, [videoUrl]);

  return {
    isRecording,
    isPaused,
    recordedChunks,
    videoUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadVideo,
    clearRecording
  };
};
