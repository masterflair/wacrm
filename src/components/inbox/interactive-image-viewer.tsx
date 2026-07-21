"use client";

import React, { useRef, useState, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, ChevronLeft, Download, Crop, Smile, Type, PenTool, Reply, Share, Forward, Star, Trash2, Undo, Check, Send, Pencil, Square, ArrowRight, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveImageViewerProps {
  src: string;
  alt: string;
  triggerChildren: React.ReactNode;
  onSendEditedMedia?: (blob: Blob, caption?: string) => void;
  senderName?: string;
  timestamp?: string;
}

type EditorObject = {
  id: string;
  type: "rect" | "ellipse" | "arrow" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  text?: string;
};

export function InteractiveImageViewer({ 
  src, 
  alt, 
  triggerChildren, 
  onSendEditedMedia,
  senderName = "Contact",
  timestamp = "Today"
}: InteractiveImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // "viewer" (screenshot 2), "drawing" (screenshot 3 combined with screenshot 1)
  const [phase, setPhase] = useState<"viewer" | "drawing">("viewer");
  const [mode, setMode] = useState<"pan" | "pen" | "text" | "rect" | "ellipse" | "arrow" | "eraser">("pen");
  const [hue, setHue] = useState<number>(120); // Green default
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const strokeColor = `hsl(${hue}, 100%, 50%)`;
  const [caption, setCaption] = useState("");
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const [history, setHistory] = useState<ImageData[]>([]);
  const [objects, setObjects] = useState<EditorObject[]>([]);
  const [creatingObj, setCreatingObj] = useState<EditorObject | null>(null);
  const [draggingObjId, setDraggingObjId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setPhase("viewer");
      setHistory([]);
      setObjects([]);
      setCaption("");
    }
  }, [open]);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      setHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (phase !== "drawing" || mode === "pan") return;
    const pos = getMousePos(e);
    
    if ((e.target as HTMLElement).hasAttribute("data-object-id")) return;

    if (mode === "text") {
      const text = window.prompt("Enter text:");
      if (text) {
        const newObj: EditorObject = {
          id: Date.now().toString(),
          type: "text",
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          color: strokeColor,
          strokeWidth: strokeWidth * 2,
          text
        };
        setObjects(prev => [...prev, newObj]);
      }
      return;
    }

    if (["rect", "ellipse", "arrow"].includes(mode)) {
      setStartPos(pos);
      setCreatingObj({
        id: Date.now().toString(),
        type: mode as any,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: strokeColor,
        strokeWidth
      });
      setIsDrawing(true);
      return;
    }

    saveHistory();
    setStartPos(pos);
    setIsDrawing(true);

    if (mode === "pen" || mode === "eraser") {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.globalCompositeOperation = mode === "eraser" ? "destination-out" : "source-over";
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = mode === "eraser" ? "rgba(0,0,0,1)" : strokeColor;
        ctx.lineWidth = mode === "eraser" ? strokeWidth * 2 : strokeWidth;
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (phase !== "drawing" || mode === "pan") return;
    const pos = getMousePos(e);

    if (draggingObjId) {
      setObjects(prev => prev.map(obj => 
        obj.id === draggingObjId 
          ? { ...obj, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
          : obj
      ));
      return;
    }

    if (!isDrawing) return;

    if (creatingObj) {
      setCreatingObj({
        ...creatingObj,
        width: pos.x - startPos.x,
        height: pos.y - startPos.y
      });
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (mode === "pen" || mode === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    if (draggingObjId) {
      setDraggingObjId(null);
      return;
    }
    if (phase !== "drawing" || mode === "pan" || !isDrawing) return;
    setIsDrawing(false);

    if (creatingObj) {
      setObjects(prev => [...prev, creatingObj]);
      setCreatingObj(null);
    }
  };

  const handleObjectPointerDown = (e: React.MouseEvent | React.TouchEvent, objId: string) => {
    if (phase !== "drawing" || mode === "pan") return;
    e.stopPropagation();
    const pos = getMousePos(e);
    const obj = objects.find(o => o.id === objId);
    if (obj) {
      setDraggingObjId(objId);
      setDragOffset({ x: pos.x - obj.x, y: pos.y - obj.y });
    }
  };

  const generateMergedBlob = (callback: (blob: Blob) => void) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const mergedCanvas = document.createElement("canvas");
    mergedCanvas.width = canvas.width;
    mergedCanvas.height = canvas.height;
    const ctx = mergedCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(image, 0, 0, mergedCanvas.width, mergedCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    objects.forEach(obj => {
      ctx.strokeStyle = obj.color;
      ctx.fillStyle = obj.color;
      ctx.lineWidth = obj.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (obj.type === "rect") {
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
      } else if (obj.type === "ellipse") {
        ctx.beginPath();
        ctx.ellipse(
          obj.x + obj.width / 2, 
          obj.y + obj.height / 2, 
          Math.abs(obj.width) / 2, 
          Math.abs(obj.height) / 2, 
          0, 0, 2 * Math.PI
        );
        ctx.stroke();
      } else if (obj.type === "arrow") {
        ctx.beginPath();
        const headlen = obj.strokeWidth * 3; 
        const angle = Math.atan2(obj.height, obj.width);
        const endX = obj.x + obj.width;
        const endY = obj.y + obj.height;
        ctx.moveTo(obj.x, obj.y);
        ctx.lineTo(endX, endY);
        ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (obj.type === "text" && obj.text) {
        ctx.font = `${obj.strokeWidth * 6}px sans-serif`;
        ctx.textBaseline = "top";
        ctx.fillText(obj.text, obj.x, obj.y);
      }
    });

    mergedCanvas.toBlob((blob) => {
      if (blob) callback(blob);
    }, "image/png");
  };

  const downloadImage = () => {
    generateMergedBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited_image_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleSend = () => {
    if (onSendEditedMedia) {
      generateMergedBlob((blob) => {
        onSendEditedMedia(blob, caption);
        setOpen(false);
      });
    }
  };

  const renderObject = (obj: EditorObject, isCreating = false) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: obj.width < 0 && obj.type !== 'arrow' ? obj.x + obj.width : obj.x,
      top: obj.height < 0 && obj.type !== 'arrow' ? obj.y + obj.height : obj.y,
      width: obj.type === 'arrow' ? 'auto' : Math.abs(obj.width),
      height: obj.type === 'arrow' ? 'auto' : Math.abs(obj.height),
      border: obj.type === 'rect' ? `${obj.strokeWidth}px solid ${obj.color}` : 'none',
      borderRadius: obj.type === 'ellipse' ? '50%' : '0',
      borderWidth: obj.type === 'ellipse' ? `${obj.strokeWidth}px` : undefined,
      borderStyle: obj.type === 'ellipse' ? 'solid' : undefined,
      borderColor: obj.color,
      pointerEvents: phase === 'drawing' && mode !== 'pan' && !isCreating ? 'auto' : 'none',
      cursor: draggingObjId === obj.id ? 'grabbing' : 'grab',
    };

    if (obj.type === 'text') {
      return (
        <div 
          key={obj.id} 
          data-object-id={obj.id}
          style={{
            position: 'absolute',
            left: obj.x,
            top: obj.y,
            color: obj.color,
            fontSize: `${obj.strokeWidth * 6}px`,
            fontFamily: 'sans-serif',
            whiteSpace: 'pre',
            userSelect: 'none',
            pointerEvents: phase === 'drawing' && mode !== 'pan' ? 'auto' : 'none',
            cursor: draggingObjId === obj.id ? 'grabbing' : 'grab',
          }}
          onPointerDown={(e) => handleObjectPointerDown(e, obj.id)}
        >
          {obj.text}
        </div>
      );
    }

    if (obj.type === 'arrow') {
      const headlen = obj.strokeWidth * 3;
      const angle = Math.atan2(obj.height, obj.width);
      const endX = obj.x + obj.width;
      const endY = obj.y + obj.height;
      const p1x = endX - headlen * Math.cos(angle - Math.PI / 6);
      const p1y = endY - headlen * Math.sin(angle - Math.PI / 6);
      const p2x = endX - headlen * Math.cos(angle + Math.PI / 6);
      const p2y = endY - headlen * Math.sin(angle + Math.PI / 6);

      const minX = Math.min(obj.x, endX, p1x, p2x) - obj.strokeWidth;
      const minY = Math.min(obj.y, endY, p1y, p2y) - obj.strokeWidth;
      const maxX = Math.max(obj.x, endX, p1x, p2x) + obj.strokeWidth;
      const maxY = Math.max(obj.y, endY, p1y, p2y) + obj.strokeWidth;

      return (
        <svg 
          key={obj.id} 
          data-object-id={obj.id}
          style={{
            position: 'absolute', left: minX, top: minY, width: maxX - minX, height: maxY - minY,
            pointerEvents: phase === 'drawing' && mode !== 'pan' && !isCreating ? 'auto' : 'none',
            cursor: draggingObjId === obj.id ? 'grabbing' : 'grab',
            overflow: 'visible'
          }}
          onPointerDown={(e) => handleObjectPointerDown(e, obj.id)}
        >
          <path 
            d={`M ${obj.x - minX} ${obj.y - minY} L ${endX - minX} ${endY - minY} M ${p1x - minX} ${p1y - minY} L ${endX - minX} ${endY - minY} L ${p2x - minX} ${p2y - minY}`}
            stroke={obj.color} strokeWidth={obj.strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"
          />
        </svg>
      );
    }

    return (
      <div key={obj.id} data-object-id={obj.id} style={style} onPointerDown={(e) => handleObjectPointerDown(e, obj.id)} />
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="block cursor-zoom-in overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {triggerChildren}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="flex flex-col h-[100dvh] w-[100dvw] max-w-none sm:h-[90dvh] sm:w-[90dvw] sm:max-w-5xl m-0 overflow-hidden bg-[#0B141A] p-0 border-none rounded-none sm:rounded-2xl sm:border sm:border-white/10">
        <DialogTitle className="sr-only">Interactive Image Viewer</DialogTitle>
        
        {/* TOP BARS */}
        
        {/* Phase: Viewer (Screenshot 2) */}
        {phase === "viewer" && (
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-4 text-white">
              <button onClick={() => setOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                <ChevronLeft className="w-7 h-7" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-white">
              <button onClick={() => { setPhase("drawing"); setMode("pen"); }} className="hover:bg-white/20 bg-white/10 backdrop-blur-md p-2 rounded-full transition-colors border border-white/10 shadow-lg">
                <Pencil className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Phase: Drawing (Unified Editor Panel) */}
        {phase === "drawing" && (
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 via-black/40 to-transparent pointer-events-none">
            <button 
              onClick={() => { setPhase("viewer"); setMode("pan"); setDraggingObjId(null); }} 
              className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)] pointer-events-auto"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 text-white pointer-events-auto">
              <button onClick={downloadImage} className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-colors border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                <Download className="w-5 h-5" />
              </button>
            </div>
            <div 
              className="w-10 h-10 flex items-center justify-center rounded-full text-white shadow-[0_0_15px_rgba(255,255,255,0.3)] border-2 border-white/80 pointer-events-auto"
              style={{ backgroundColor: strokeColor }}
            >
              <Pencil className="w-5 h-5 drop-shadow-md" />
            </div>
          </div>
        )}

        {/* WORKSPACE */}
        <div className="flex-1 relative overflow-hidden bg-transparent">
          
          {/* Global Styles for Custom Sliders */}
          {phase === "drawing" && (
            <style dangerouslySetInnerHTML={{__html: `
              .custom-range-slider {
                -webkit-appearance: none !important;
                appearance: none !important;
                outline: none;
                background: transparent;
              }
              .custom-range-slider::-webkit-slider-thumb {
                -webkit-appearance: none !important;
                appearance: none !important;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: white;
                border: 2px solid #e5e7eb;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              }
              .custom-range-slider::-moz-range-thumb {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: white;
                border: 2px solid #e5e7eb;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              }
              .custom-range-slider::-moz-range-track {
                background: transparent;
                border: none;
              }
            `}} />
          )}

          {/* Right Gradient Color Slider (Drawing Phase) */}
          {phase === "drawing" && (
            <div className="absolute top-1/2 right-2 -translate-y-1/2 z-50 flex items-center justify-center pointer-events-auto w-12 h-64">
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  value={hue}
                  onChange={(e) => setHue(parseInt(e.target.value))}
                  className="custom-range-slider w-64 h-3 rounded-full border border-white/20 shadow-lg"
                  style={{ 
                    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center'
                  }}
                />
            </div>
          )}

          {/* Left Brush Size Slider (Drawing Phase) */}
          {phase === "drawing" && (
            <div className="absolute top-1/2 left-2 -translate-y-1/2 z-50 flex items-center justify-center pointer-events-auto w-12 h-64">
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                  className="custom-range-slider w-64 h-2 rounded-full border border-white/20 shadow-lg bg-white/70 backdrop-blur"
                  style={{ 
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center'
                  }}
                />
            </div>
          )}

          <TransformWrapper
            panning={{ disabled: phase === "drawing" && mode !== "pan" }}
            wheel={{ step: 0.05 }}
            doubleClick={{ disabled: phase === "drawing" && mode !== "pan" }}
            initialScale={1}
            minScale={0.1}
            maxScale={8}
            centerOnInit
            centerZoomedOut
          >
            {({ zoomIn, zoomOut }) => (
              <TransformComponent wrapperClass="!w-full !h-full">
                <div 
                  className="relative flex items-center justify-center w-full h-full" 
                  ref={containerRef}
                  onPointerDown={handlePointerDown as any}
                  onPointerMove={handlePointerMove as any}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  style={{ touchAction: phase === "drawing" && mode !== "pan" ? "none" : "auto" }}
                >
                  <div className="relative inline-block">
                    <img
                      ref={imageRef}
                      src={src}
                      alt={alt}
                      onLoad={(e) => {
                        setDimensions({
                          width: e.currentTarget.naturalWidth,
                          height: e.currentTarget.naturalHeight
                        });
                      }}
                      className="max-h-[85dvh] w-auto max-w-[95dvw] object-contain select-none pointer-events-none"
                      draggable={false}
                    />
                    <canvas
                      ref={canvasRef}
                      width={dimensions.width}
                      height={dimensions.height}
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    />
                    
                    {/* Render Objects */}
                    {objects.map(obj => renderObject(obj))}
                    {creatingObj && renderObject(creatingObj, true)}
                  </div>
                </div>
              </TransformComponent>
            )}
          </TransformWrapper>
        </div>

        {/* BOTTOM BARS */}
        
        {/* Phase: Drawing (Unified Editor Panel) */}
        {phase === "drawing" && (
          <>
            {/* Drawing Tools Bar */}
              <div className="absolute bottom-24 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto">
                  <button onClick={() => setMode("pen")} className={cn("p-3 rounded-full transition-all duration-300 text-white", mode === "pen" ? "bg-white/20 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)] ring-1 ring-white/50" : "hover:bg-white/10")}><PenTool className="w-6 h-6 drop-shadow" /></button>
                  <button onClick={() => setMode("eraser")} className={cn("p-3 rounded-full transition-all duration-300 text-white", mode === "eraser" ? "bg-white/20 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)] ring-1 ring-white/50" : "hover:bg-white/10")}><Eraser className="w-6 h-6 drop-shadow" /></button>
                  <button onClick={() => setMode("text")} className={cn("p-3 rounded-full transition-all duration-300 text-white font-bold text-lg", mode === "text" ? "bg-white/20 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)] ring-1 ring-white/50" : "hover:bg-white/10")}>Aa</button>
                </div>
              </div>

            {/* Caption & Send Bar */}
            <div className="absolute bottom-4 left-0 right-0 z-50 flex items-center px-4 gap-3 bg-transparent">
              <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-full px-6 py-4 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all hover:bg-black/70">
                <input 
                  type="text" 
                  placeholder="Add a caption..." 
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="w-full bg-transparent outline-none text-white placeholder:text-white/60 text-lg"
                />
              </div>
              <button 
                onClick={handleSend}
                className="w-14 h-14 bg-[#22c55e] hover:bg-[#16a34a] rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] hover:scale-105"
              >
                <Send className="w-6 h-6 text-white ml-1 drop-shadow-md" />
              </button>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
