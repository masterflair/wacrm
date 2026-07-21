"use client";

import React, { useRef, useState, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PenTool, Ruler, Eraser, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveImageViewerProps {
  src: string;
  alt: string;
  triggerChildren: React.ReactNode;
}

export function InteractiveImageViewer({ src, alt, triggerChildren }: InteractiveImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [mode, setMode] = useState<"pan" | "pen" | "ruler">("pan");
  const [strokeColor, setStrokeColor] = useState<string>("#ef4444"); // Default red
  const [strokeWidth, setStrokeWidth] = useState<number>(3); // Default medium
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [rulerEnd, setRulerEnd] = useState<{ x: number, y: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const COLORS = [
    { label: "Red", value: "#ef4444" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Green", value: "#22c55e" },
    { label: "Yellow", value: "#eab308" },
    { label: "White", value: "#ffffff" },
    { label: "Black", value: "#000000" },
  ];

  // Dimensions are set via the img onLoad handler below

  // Handle drawing and ruler on canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Calculate scale between displayed size and actual canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode === "pan") return;
    const pos = getMousePos(e);
    setStartPos(pos);
    setIsDrawing(true);

    if (mode === "pen") {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
      }
    } else if (mode === "ruler") {
      setRulerEnd(pos);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode === "pan") return;
    const pos = getMousePos(e);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (mode === "pen") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (mode === "ruler" && startPos) {
      setRulerEnd(pos);
    }
  };

  const handlePointerUp = () => {
    if (mode === "pan" || !isDrawing) return;
    setIsDrawing(false);

    if (mode === "ruler" && startPos && rulerEnd) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;
      
      // Draw final ruler line
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(rulerEnd.x, rulerEnd.y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw distance text
      const dx = rulerEnd.x - startPos.x;
      const dy = rulerEnd.y - startPos.y;
      const distance = Math.round(Math.sqrt(dx * dx + dy * dy));
      const midX = (startPos.x + rulerEnd.x) / 2;
      const midY = (startPos.y + rulerEnd.y) / 2;
      
      ctx.font = "24px sans-serif";
      ctx.fillStyle = strokeColor;
      // Use contrasting stroke color for text readability
      ctx.strokeStyle = strokeColor === "#000000" ? "white" : "black";
      ctx.lineWidth = 4;
      const text = `${distance}px`;
      ctx.strokeText(text, midX + 10, midY - 10);
      ctx.fillText(text, midX + 10, midY - 10);
      
      setStartPos(null);
      setRulerEnd(null);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="block cursor-zoom-in overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {triggerChildren}
      </DialogTrigger>
      <DialogContent className="flex flex-col h-[95vh] w-[95vw] max-w-7xl overflow-hidden bg-black/95 p-0 border-none rounded-xl">
        <DialogTitle className="sr-only">Interactive Image Viewer</DialogTitle>
        
        {/* Viewer Area & Toolbar */}
        <div className="flex-1 relative overflow-hidden bg-black/40">
          <TransformWrapper
            panning={{ disabled: mode !== "pan" }}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: mode !== "pan" }}
            initialScale={1}
            minScale={0.1}
            maxScale={8}
            centerOnInit
          >
            {({ zoomIn, zoomOut }) => (
              <React.Fragment>
                {/* Toolbar */}
                <div className="flex items-center justify-between p-4 z-50 absolute top-0 left-0 right-0 pointer-events-none">
                  <div className="flex gap-2 pointer-events-auto bg-black/50 p-1.5 rounded-lg border border-white/10 backdrop-blur-md mx-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-white hover:bg-white/20"
                      onClick={() => zoomIn()}
                      title="Zoom In"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-white hover:bg-white/20"
                      onClick={() => zoomOut()}
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </Button>
                    <div className="w-px h-8 bg-white/20 mx-1 self-center" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("text-white/70 hover:text-white hover:bg-white/20", mode === "pan" && "bg-white/20 text-white")}
                      onClick={() => setMode("pan")}
                      title="Pan & Zoom"
                    >
                      <Maximize className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("text-white/70 hover:text-white hover:bg-white/20", mode === "pen" && "bg-white/20 text-white")}
                      onClick={() => setMode("pen")}
                      title="Pen (Draw)"
                    >
                      <PenTool className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("text-white/70 hover:text-white hover:bg-white/20", mode === "ruler" && "bg-white/20 text-white")}
                      onClick={() => setMode("ruler")}
                      title="Ruler (Measure)"
                    >
                      <Ruler className="w-5 h-5" />
                    </Button>
                    <div className="w-px h-8 bg-white/20 mx-1 self-center" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-red-400 hover:bg-white/20"
                      onClick={clearCanvas}
                      title="Clear all marks"
                    >
                      <Eraser className="w-5 h-5" />
                    </Button>
                    
                    {(mode === "pen" || mode === "ruler") && (
                      <>
                        <div className="w-px h-8 bg-white/20 mx-1 self-center" />
                        <div className="flex items-center gap-1">
                          {COLORS.map((c) => (
                            <button
                              key={c.value}
                              onClick={() => setStrokeColor(c.value)}
                              className={cn(
                                "w-5 h-5 rounded-full border-2 transition-transform",
                                strokeColor === c.value ? "scale-110 border-white" : "border-transparent opacity-80 hover:opacity-100 hover:scale-110"
                              )}
                              style={{ backgroundColor: c.value }}
                              title={c.label}
                            />
                          ))}
                        </div>
                        <div className="w-px h-8 bg-white/20 mx-1 self-center" />
                        <div className="flex items-center gap-3 px-2">
                          <span className="text-white/70 text-xs font-medium">Size</span>
                          <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            value={strokeWidth}
                            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                            className="w-20 accent-white"
                            title="Stroke Width"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
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
                  className="max-h-[95vh] w-auto max-w-[95vw] object-contain select-none"
                  draggable={false}
                />
                <canvas
                  ref={canvasRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  className={cn(
                    "absolute top-0 left-0 w-full h-full touch-none",
                    mode === "pan" ? "pointer-events-none" : "cursor-crosshair pointer-events-auto"
                  )}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                  onTouchCancel={handlePointerUp}
                />
                
                {/* Temporary Ruler Line */}
                {mode === "ruler" && startPos && rulerEnd && isDrawing && (
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
                    <line
                      x1={startPos.x}
                      y1={startPos.y}
                      x2={rulerEnd.x}
                      y2={rulerEnd.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray="10, 10"
                    />
                  </svg>
                )}
              </div>
            </TransformComponent>
          </React.Fragment>
          )}
        </TransformWrapper>
        </div>
      </DialogContent>
    </Dialog>
  );
}
