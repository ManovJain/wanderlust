"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { allCelestialBodies, type Planet } from "../data/planets";

interface SolarSystemCanvasProps {
  className?: string;
  selectedPlanet?: Planet | null;
  onPlanetSelect?: (planet: Planet | null) => void;
}

interface HoveredItem {
  planet: Planet;
  x: number;
  y: number;
}

export default function SolarSystemCanvas({
  className = "",
  selectedPlanet,
  onPlanetSelect,
}: SolarSystemCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<HoveredItem | null>(null);
  
  // Camera state
  const stateRef = useRef({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    animationFrame: 0,
    planetAngles: allCelestialBodies.map(() => Math.random() * 360), // Starting angles
    stars: [] as { x: number; y: number; size: number; opacity: number }[],
  });

  // Initialize stars
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
    stateRef.current.stars = stars;
    setIsLoading(false);
  }, []);

  // Draw star field
  const drawStars = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const { offsetX, offsetY, scale, stars } = stateRef.current;
    const centerX = width / 2 + offsetX;
    const centerY = height / 2 + offsetY;

    stars.forEach(star => {
      const x = centerX + star.x * scale;
      const y = centerY + star.y * scale;
      
      // Only draw stars that are visible
      if (x >= -10 && x <= width + 10 && y >= -10 && y <= height + 10) {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, star.size * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, []);

  // Draw orbit path
  const drawOrbit = useCallback((
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    scale: number
  ) => {
    ctx.strokeStyle = "rgba(30, 58, 95, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * scale, 0, Math.PI * 2);
    ctx.stroke();
  }, []);

  // Draw planet with 3D gradient effect
  const drawPlanet = useCallback((
    ctx: CanvasRenderingContext2D,
    planet: Planet,
    x: number,
    y: number,
    scale: number,
    isHovered: boolean,
    isSelected: boolean
  ) => {
    const radius = planet.radius * scale;
    
    // Selection/hover glow
    if (isSelected || isHovered) {
      ctx.shadowBlur = 20 * scale;
      ctx.shadowColor = planet.colorLight;
      ctx.beginPath();
      ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = planet.colorLight;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Planet gradient for 3D effect
    const gradient = ctx.createRadialGradient(
      x - radius / 3,
      y - radius / 3,
      0,
      x,
      y,
      radius
    );
    gradient.addColorStop(0, planet.colorLight);
    gradient.addColorStop(0.7, planet.color);
    gradient.addColorStop(1, planet.colorDark);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Special rendering for Sun (glow)
    if (planet.id === "sun") {
      ctx.shadowBlur = 40 * scale;
      ctx.shadowColor = planet.color;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Special rendering for Saturn (rings)
    if (planet.id === "saturn") {
      const ringInner = radius * 1.5;
      const ringOuter = radius * 2.2;
      
      ctx.strokeStyle = "rgba(218, 185, 140, 0.6)";
      ctx.lineWidth = (radius * 0.7);
      ctx.beginPath();
      ctx.ellipse(x, y, (ringInner + ringOuter) / 2, ((ringInner + ringOuter) / 2) * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Label for small planets or when zoomed out
    if (scale < 0.5 || radius < 8) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = `${Math.max(10, 12 * scale)}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(planet.name, x, y + radius + 15 * scale);
    }
  }, []);

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const { width, height } = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear with space background
    ctx.fillStyle = "#050810";
    ctx.fillRect(0, 0, width, height);

    const { offsetX, offsetY, scale, planetAngles } = stateRef.current;
    const centerX = width / 2 + offsetX;
    const centerY = height / 2 + offsetY;

    // Draw stars
    drawStars(ctx, width, height);

    // Draw orbits
    allCelestialBodies.forEach((body, index) => {
      if (body.orbitRadius > 0) {
        drawOrbit(ctx, centerX, centerY, body.orbitRadius, scale);
      }
    });

    // Draw planets
    allCelestialBodies.forEach((body, index) => {
      const angle = (planetAngles[index] * Math.PI) / 180;
      const orbitX = centerX + Math.cos(angle) * body.orbitRadius * scale;
      const orbitY = centerY + Math.sin(angle) * body.orbitRadius * scale;

      const isHovered = hoveredItem?.planet.id === body.id;
      const isSelected = selectedPlanet?.id === body.id;

      drawPlanet(ctx, body, orbitX, orbitY, scale, isHovered, isSelected);

      // Update rotation
      planetAngles[index] += body.orbitSpeed;
      if (planetAngles[index] >= 360) planetAngles[index] -= 360;
    });
  }, [drawStars, drawOrbit, drawPlanet, hoveredItem, selectedPlanet]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      stateRef.current.animationFrame = requestAnimationFrame(animate);
    };

    stateRef.current.animationFrame = requestAnimationFrame(animate);

    return () => {
      if (stateRef.current.animationFrame) {
        cancelAnimationFrame(stateRef.current.animationFrame);
      }
    };
  }, [render]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    stateRef.current.isDragging = true;
    stateRef.current.lastMouseX = e.clientX;
    stateRef.current.lastMouseY = e.clientY;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Handle dragging
    if (stateRef.current.isDragging) {
      const dx = e.clientX - stateRef.current.lastMouseX;
      const dy = e.clientY - stateRef.current.lastMouseY;
      
      stateRef.current.offsetX += dx;
      stateRef.current.offsetY += dy;
      stateRef.current.lastMouseX = e.clientX;
      stateRef.current.lastMouseY = e.clientY;
      return;
    }

    // Check for hover
    const { offsetX, offsetY, scale, planetAngles } = stateRef.current;
    const centerX = rect.width / 2 + offsetX;
    const centerY = rect.height / 2 + offsetY;

    let found = false;
    for (let i = 0; i < allCelestialBodies.length; i++) {
      const body = allCelestialBodies[i];
      const angle = (planetAngles[i] * Math.PI) / 180;
      const orbitX = centerX + Math.cos(angle) * body.orbitRadius * scale;
      const orbitY = centerY + Math.sin(angle) * body.orbitRadius * scale;
      const radius = body.radius * scale;

      const distance = Math.sqrt(
        Math.pow(mouseX - orbitX, 2) + Math.pow(mouseY - orbitY, 2)
      );

      if (distance <= radius) {
        setHoveredItem({
          planet: body,
          x: e.clientX,
          y: e.clientY,
        });
        canvas.style.cursor = "pointer";
        found = true;
        break;
      }
    }

    if (!found && hoveredItem) {
      setHoveredItem(null);
      canvas.style.cursor = stateRef.current.isDragging ? "grabbing" : "grab";
    }
  }, [hoveredItem]);

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "grab";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    stateRef.current.isDragging = false;
    setHoveredItem(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "grab";
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredItem && onPlanetSelect) {
      onPlanetSelect(hoveredItem.planet);
    }
  }, [hoveredItem, onPlanetSelect]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.2, Math.min(3, stateRef.current.scale * delta));
    stateRef.current.scale = newScale;
  }, []);

  // Zoom to planet on double click
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredItem) {
      const { planetAngles, scale } = stateRef.current;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const index = allCelestialBodies.findIndex(b => b.id === hoveredItem.planet.id);
      const angle = (planetAngles[index] * Math.PI) / 180;
      const body = hoveredItem.planet;

      // Calculate where to move the camera
      const targetX = -Math.cos(angle) * body.orbitRadius * scale;
      const targetY = -Math.sin(angle) * body.orbitRadius * scale;

      // Animate to target (simplified - just set it)
      stateRef.current.offsetX = targetX;
      stateRef.current.offsetY = targetY;
      stateRef.current.scale = Math.min(2, 1.5);
    }
  }, [hoveredItem]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-[#3b82f6] rounded-full animate-spin" />
            <div className="text-gray-500 text-sm font-mono">Initializing solar system...</div>
          </div>
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onWheel={handleWheel}
          />

          {/* Hover tooltip */}
          <AnimatePresence>
            {hoveredItem && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="fixed pointer-events-none z-50"
                style={{
                  left: hoveredItem.x + 15,
                  top: hoveredItem.y + 15,
                }}
              >
                <div className="bg-[#0a0f1a]/95 backdrop-blur-sm border border-[#1e3a5f]/50 rounded-lg px-3 py-2 shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{hoveredItem.planet.emoji}</span>
                    <div>
                      <div className="text-white font-semibold text-sm">
                        {hoveredItem.planet.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {hoveredItem.planet.diameter}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls hint */}
          <div className="absolute bottom-4 left-4 bg-[#0a0f1a]/80 backdrop-blur-sm border border-[#1e3a5f]/30 rounded-lg px-3 py-2 text-xs text-gray-400 font-mono">
            <div>Drag to pan • Scroll to zoom</div>
            <div>Click planet for info • Double-click to focus</div>
          </div>

          {/* Scale indicator */}
          <div className="absolute top-4 right-4 bg-[#0a0f1a]/80 backdrop-blur-sm border border-[#1e3a5f]/30 rounded-lg px-3 py-2 text-xs text-gray-400 font-mono">
            Scale: {stateRef.current.scale.toFixed(2)}x
          </div>
        </>
      )}
    </div>
  );
}
