"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { Planet } from "../data/planets";
import { generatePlanetSurface, generateSaturnRings, type PlanetDot } from "../data/planet-surfaces";

interface PlanetGlobeProps {
  planet: Planet;
  className?: string;
}

export default function PlanetGlobe({ planet, className = "" }: PlanetGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  const stateRef = useRef<{
    width: number;
    height: number;
    projection: d3.GeoProjection;
    rotation: [number, number, number];
    isDragging: boolean;
    lastMouseX: number;
    lastMouseY: number;
    dots: PlanetDot[];
    isInitialized: boolean;
  }>({
    width: 0,
    height: 0,
    projection: d3.geoOrthographic(),
    rotation: [0, 0, 0],
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    dots: [],
    isInitialized: false,
  });

  // Initialize planet surface
  useEffect(() => {
    const loadPlanet = async () => {
      setIsLoading(true);
      stateRef.current.isInitialized = false;
      
      // Generate surface dots
      const spacing = planet.id === "sun" ? 3 : 2.5;
      const dots = generatePlanetSurface(planet, spacing);
      stateRef.current.dots = dots;
      stateRef.current.isInitialized = true;
      
      setIsLoading(false);
    };
    
    loadPlanet();
  }, [planet]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const { width, height } = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    if (stateRef.current.width !== width || stateRef.current.height !== height) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.scale(dpr, dpr);
      stateRef.current.width = width;
      stateRef.current.height = height;

      const scale = Math.min(width, height) * 0.4;
      stateRef.current.projection = d3.geoOrthographic()
        .scale(scale)
        .translate([width / 2, height / 2])
        .rotate(stateRef.current.rotation);
    }

    const { projection, dots, rotation } = stateRef.current;
    projection.rotate(rotation);

    // Clear with space background
    context.fillStyle = "#050810";
    context.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const globeRadius = projection.scale();

    // Draw background circle (planet silhouette)
    context.beginPath();
    context.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
    context.fillStyle = planet.colorDark;
    context.fill();

    // Add subtle radial gradient for depth
    const bgGradient = context.createRadialGradient(
      centerX - globeRadius * 0.3,
      centerY - globeRadius * 0.3,
      0,
      centerX,
      centerY,
      globeRadius
    );
    bgGradient.addColorStop(0, `${planet.colorLight}22`);
    bgGradient.addColorStop(1, "transparent");
    context.beginPath();
    context.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
    context.fillStyle = bgGradient;
    context.fill();

    // Adaptive dot size based on screen
    const baseDotRadius = Math.max(1.2, Math.min(2.5, globeRadius / 150));
    const dotRadius = baseDotRadius;

    // Draw planet surface dots
    const dotsByColor = new Map<string, Array<{ x: number; y: number }>>();

    dots.forEach((dot) => {
      const projected = projection([dot.lng, dot.lat]);
      if (!projected) return;

      const [px, py] = projected;
      if (px < 0 || px > width || py < 0 || py > height) return;

      // Check if on visible hemisphere
      const dx = px - centerX;
      const dy = py - centerY;
      const distSq = dx * dx + dy * dy;
      if (distSq > globeRadius * globeRadius) return;

      const color = dot.color;
      if (!dotsByColor.has(color)) {
        dotsByColor.set(color, []);
      }
      dotsByColor.get(color)!.push({ x: px, y: py });
    });

    // Draw dots batched by color
    dotsByColor.forEach((dots, color) => {
      context.fillStyle = color;
      context.beginPath();
      dots.forEach(({ x, y }) => {
        context.moveTo(x + dotRadius, y);
        context.arc(x, y, dotRadius, 0, Math.PI * 2);
      });
      context.fill();
    });

    // Special effects for Sun
    if (planet.id === "sun") {
      // Outer glow
      context.shadowBlur = 60;
      context.shadowColor = planet.color;
      context.globalAlpha = 0.3;
      context.beginPath();
      context.arc(centerX, centerY, globeRadius + 20, 0, Math.PI * 2);
      context.strokeStyle = planet.colorLight;
      context.lineWidth = 20;
      context.stroke();
      context.shadowBlur = 0;
      context.globalAlpha = 1;
    }

    // Draw Saturn's rings
    if (planet.id === "saturn") {
      const rings = generateSaturnRings();
      
      // Get rotation to calculate ring tilt
      const tilt = rotation[1]; // Vertical rotation
      const ringTilt = (tilt * Math.PI) / 180;
      
      rings.forEach((ring) => {
        const innerR = globeRadius * ring.innerRadius;
        const outerR = globeRadius * ring.outerRadius;
        
        // Draw ring as ellipse
        context.save();
        context.translate(centerX, centerY);
        
        // Tilt the ring
        context.scale(1, Math.cos(ringTilt) * 0.5 + 0.3);
        
        context.beginPath();
        context.arc(0, 0, outerR, 0, Math.PI * 2);
        context.arc(0, 0, innerR, 0, Math.PI * 2, true);
        context.fillStyle = `${ring.color}${Math.floor(ring.opacity * 255).toString(16).padStart(2, "0")}`;
        context.fill();
        
        context.restore();
      });
    }

    // Subtle atmosphere glow
    if (planet.id !== "sun") {
      const glowGradient = context.createRadialGradient(
        centerX,
        centerY,
        globeRadius * 0.95,
        centerX,
        centerY,
        globeRadius * 1.05
      );
      glowGradient.addColorStop(0, "transparent");
      glowGradient.addColorStop(1, `${planet.color}40`);
      
      context.beginPath();
      context.arc(centerX, centerY, globeRadius * 1.05, 0, Math.PI * 2);
      context.fillStyle = glowGradient;
      context.fill();
    }
  }, [planet]);

  // Mouse interaction
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    stateRef.current.isDragging = true;
    setAutoRotate(false);
    stateRef.current.lastMouseX = e.clientX;
    stateRef.current.lastMouseY = e.clientY;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!stateRef.current.isDragging) return;

    const dx = e.clientX - stateRef.current.lastMouseX;
    const dy = e.clientY - stateRef.current.lastMouseY;

    stateRef.current.rotation[0] += dx * 0.5;
    stateRef.current.rotation[1] -= dy * 0.5;
    stateRef.current.rotation[1] = Math.max(-90, Math.min(90, stateRef.current.rotation[1]));

    stateRef.current.lastMouseX = e.clientX;
    stateRef.current.lastMouseY = e.clientY;
  }, []);

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    stateRef.current.isDragging = false;
  }, []);

  const handleDoubleClick = useCallback(() => {
    setAutoRotate(prev => !prev);
  }, []);

  // Animation loop
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    const fps = 60;
    const frameDelay = 1000 / fps;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastTime;

      if (elapsed >= frameDelay) {
        if (autoRotate && !stateRef.current.isDragging) {
          stateRef.current.rotation[0] += planet.rotationSpeed * 10;
          if (stateRef.current.rotation[0] >= 360) {
            stateRef.current.rotation[0] -= 360;
          }
        }

        render();
        lastTime = currentTime - (elapsed % frameDelay);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [render, planet, autoRotate]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        stateRef.current.width = width;
        stateRef.current.height = height;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-[#3b82f6] rounded-full animate-spin" />
            <div className="text-gray-500 text-sm font-mono">Loading {planet.name}...</div>
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
            onDoubleClick={handleDoubleClick}
          />

          {/* Controls hint */}
          <div className="absolute bottom-4 left-4 bg-[#0a0f1a]/80 backdrop-blur-sm border border-[#1e3a5f]/30 rounded-lg px-3 py-2 text-xs text-gray-400 font-mono">
            <div>Drag to rotate • Double-click to {autoRotate ? "pause" : "resume"}</div>
          </div>

          {/* Planet info */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 bg-[#0a0f1a]/90 backdrop-blur-sm border border-[#1e3a5f]/30 rounded-lg px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${planet.colorLight}, ${planet.color}, ${planet.colorDark})`,
                }}
              >
                {planet.emoji}
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">{planet.name}</h3>
                <p className="text-gray-400 text-xs">{planet.diameter}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
