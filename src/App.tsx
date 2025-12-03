import './App.css'
import { useScreenRecorder } from './hooks/useScreenRecorder'

function App() {
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

  return (
    <div className="app-container">
      <h1>画面録画アプリ</h1>
      
      <div className="controls">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="btn btn-start"
          >
            🔴 録画開始
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
