import './App.css'
import { useRef, useState } from 'react'
import { useScreenRecorder, type RecordingMode } from './hooks/useScreenRecorder'
import { DrawingCanvas } from './components/DrawingCanvas'

function App() {
  const [mode, setMode] = useState<RecordingMode>('screen')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  const {
    isRecording,
    isPaused,
    videoUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadVideo,
    clearRecording
  } = useScreenRecorder()

  const handleStartRecording = () => {
    startRecording(mode, canvasRef)
  }

  return (
    <div className="app-container">
      <h1>画面録画アプリ</h1>
      
      <div className="mode-selector">
        <label className="mode-option">
          <input
            type="radio"
            name="mode"
            value="screen"
            checked={mode === 'screen'}
            onChange={() => setMode('screen')}
            disabled={isRecording}
          />
          <span>🖥️ 画面全体を録画</span>
        </label>
        <label className="mode-option">
          <input
            type="radio"
            name="mode"
            value="canvas"
            checked={mode === 'canvas'}
            onChange={() => setMode('canvas')}
            disabled={isRecording}
          />
          <span>🎨 Canvasを録画</span>
        </label>
      </div>

      {mode === 'canvas' && (
        <div className="canvas-section">
          <h2>{isRecording ? '録画中のCanvas' : '描画エリア'}</h2>
          <DrawingCanvas canvasRef={canvasRef} isRecording={isRecording} />
        </div>
      )}
      
      <div className="controls">
        {!isRecording ? (
          <button 
            onClick={handleStartRecording}
            className="btn btn-start"
          >
            🔴 録画開始 ({mode === 'screen' ? '画面全体' : 'Canvas'})
          </button>
        ) : (
          <>
            <button 
              onClick={stopRecording}
              className="btn btn-stop"
            >
              ⏹️ 録画停止
            </button>
            {!isPaused ? (
              <button 
                onClick={pauseRecording}
                className="btn btn-pause"
              >
                ⏸️ 一時停止
              </button>
            ) : (
              <button 
                onClick={resumeRecording}
                className="btn btn-resume"
              >
                ▶️ 再開
              </button>
            )}
          </>
        )}
      </div>

      {isRecording && (
        <div className="recording-status">
          <span className="recording-indicator">●</span>
          {isPaused ? '一時停止中...' : '録画中...'}
        </div>
      )}

      {videoUrl && (
        <div className="video-container">
          <h2>録画結果</h2>
          <video 
            src={videoUrl} 
            controls 
            className="recorded-video"
          />
          <div className="video-actions">
            <button 
              onClick={downloadVideo}
              className="btn btn-download"
            >
              💾 ダウンロード
            </button>
            <button 
              onClick={clearRecording}
              className="btn btn-clear"
            >
              🗑️ クリア
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
