import { useRef, useEffect, useState } from 'react';

interface DrawingCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isRecording?: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ canvasRef, isRecording = false }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas初期化
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  const getMousePos = (canvas: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const getTouchPos = (canvas: HTMLCanvasElement, e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (pos: { x: number; y: number }) => {
    setIsDrawing(true);
    lastPosRef.current = pos;
  };

  const draw = (pos: { x: number; y: number }) => {
    if (!isDrawing || !lastPosRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    lastPosRef.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    startDrawing(getMousePos(canvas, e));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw(getMousePos(canvas, e));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    startDrawing(getTouchPos(canvas, e));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw(getTouchPos(canvas, e));
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="canvas-container">
      <div className="canvas-controls">
        <div className="control-group">
          <label htmlFor="color-picker">色:</label>
          <input
            id="color-picker"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-picker"
          />
        </div>
        <div className="control-group">
          <label htmlFor="line-width">太さ: {lineWidth}px</label>
          <input
            id="line-width"
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="line-width-slider"
          />
        </div>
        <button onClick={clearCanvas} className="btn btn-clear-canvas">
          🗑️ クリア
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className={`drawing-canvas ${isRecording ? 'recording' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};
