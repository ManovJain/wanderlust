"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { destinations, categories, type Destination } from "../data/destinations";
import type { FeatureCollection, Feature, Geometry } from "geojson";

interface CountryProperties {
  name: string;
  iso_a2: string;
}

interface CountryNameData {
  name: string;
  "alpha-2": string;
  "country-code": string;
}

// Country colors
const countryColors: Record<string, string> = {
  US: "#3b82f6", CN: "#ef4444", IN: "#f97316", BR: "#22c55e", RU: "#60a5fa",
  JP: "#ef4444", DE: "#fbbf24", GB: "#60a5fa", FR: "#3b82f6", IT: "#22c55e",
  CA: "#dc2626", AU: "#60a5fa", ES: "#dc2626", MX: "#22c55e", KR: "#60a5fa",
  ID: "#dc2626", TR: "#dc2626", SA: "#22c55e", AR: "#60a5fa", ZA: "#22c55e",
  PL: "#ef4444", TH: "#22c55e", EG: "#fbbf24", PK: "#22c55e", NG: "#22c55e",
  BD: "#22c55e", VN: "#dc2626", PH: "#3b82f6", ET: "#22c55e", CD: "#60a5fa",
  IR: "#22c55e", CO: "#fbbf24", UA: "#fbbf24", TZ: "#22c55e", KE: "#dc2626",
  SE: "#3b82f6", NO: "#dc2626", FI: "#60a5fa", NL: "#f97316", CH: "#dc2626",
  AT: "#dc2626", PT: "#22c55e", GR: "#60a5fa", CZ: "#dc2626", NZ: "#60a5fa",
  SG: "#f59e0b", MY: "#3b82f6", CL: "#dc2626", PE: "#dc2626", IS: "#3b82f6",
  IE: "#22c55e", MA: "#dc2626", AE: "#22c55e", IL: "#3b82f6", GL: "#dc2626",
};

interface GlobeMapProps {
  className?: string;
  highlightedDestination?: Destination | null;
  travelState?: Record<string, "visited" | "wishlist" | null>;
  showPins?: boolean;
  onTogglePins?: () => void;
}

interface HoveredItem {
  type: "country" | "destination";
  name: string;
  code?: string;
  destination?: Destination;
  x: number;
  y: number;
}

export default function GlobeMap({ 
  className = "", 
  highlightedDestination,
  travelState = {},
  showPins = true,
  onTogglePins
}: GlobeMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<HoveredItem | null>(null);
  const [internalShowPins, setInternalShowPins] = useState(showPins);
  
  const stateRef = useRef({
    projection: null as d3.GeoProjection | null,
    countries: null as FeatureCollection<Geometry, CountryProperties> | null,
    rotation: [0, -15] as [number, number],
    autoRotate: true,
    dots: [] as { lng: number; lat: number; color: string; countryCode: string }[],
    isInitialized: false,
    width: 0,
    height: 0,
    radius: 0,
  });

  const hoveredRef = useRef<HoveredItem | null>(null);
  const highlightedRef = useRef<Destination | null>(null);
  const travelStateRef = useRef(travelState);
  const showPinsRef = useRef(internalShowPins);

  useEffect(() => {
    highlightedRef.current = highlightedDestination || null;
  }, [highlightedDestination]);

  useEffect(() => {
    travelStateRef.current = travelState;
  }, [travelState]);

  useEffect(() => {
    showPinsRef.current = internalShowPins;
  }, [internalShowPins]);

  const handleTogglePins = useCallback(() => {
    setInternalShowPins(prev => !prev);
    onTogglePins?.();
  }, [onTogglePins]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (!state.projection || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scaleX = canvas.width / dpr / rect.width;
    const scaleY = canvas.height / dpr / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const { width, height } = state;
    const centerX = width / 2;
    const centerY = height / 2;
    const currentScale = state.projection.scale();

    // First check if we're even on the globe
    const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    if (distFromCenter > currentScale) {
      // Outside the globe - clear hover
      if (hoveredRef.current) {
        hoveredRef.current = null;
        setHoveredItem(null);
      }
      canvas.style.cursor = "default";
      return;
    }

    // Check destinations first if pins are shown
    if (showPinsRef.current) {
      for (const dest of destinations) {
        const projected = state.projection([dest.lng, dest.lat]);
        if (projected) {
          const [px, py] = projected;
          // Check if pin is visible (not behind globe)
          const pinDistFromCenter = Math.sqrt((px - centerX) ** 2 + (py - centerY) ** 2);
          if (pinDistFromCenter > currentScale * 0.98) continue;
          
          const dx = x - px;
          const dy = y - py;
          if (dx * dx + dy * dy < 144) { // 12px radius
            const newHovered = {
              type: "destination" as const,
              name: dest.name,
              destination: dest,
              x: event.clientX,
              y: event.clientY,
            };
            hoveredRef.current = newHovered;
            setHoveredItem(newHovered);
            canvas.style.cursor = "pointer";
            return;
          }
        }
      }
    }

    // Check if point is on land by inverting projection
    const coords = state.projection.invert?.([x, y]);
    if (!coords) {
      if (hoveredRef.current) {
        hoveredRef.current = null;
        setHoveredItem(null);
      }
      canvas.style.cursor = "grab";
      return;
    }

    // Check countries - but only if we're on land
    if (state.countries) {
      for (const feature of state.countries.features) {
        if (d3.geoContains(feature, coords)) {
          const code = feature.properties?.iso_a2;
          const name = feature.properties?.name || "Unknown";
          
          // Only update if different country
          if (hoveredRef.current?.code !== code || hoveredRef.current?.type !== "country") {
            const newHovered = {
              type: "country" as const,
              name,
              code,
              x: event.clientX,
              y: event.clientY,
            };
            hoveredRef.current = newHovered;
            setHoveredItem(newHovered);
          } else {
            // Update position only
            setHoveredItem(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
          }
          canvas.style.cursor = "pointer";
          return;
        }
      }
    }

    // On the globe but not on land (ocean)
    if (hoveredRef.current) {
      hoveredRef.current = null;
      setHoveredItem(null);
    }
    canvas.style.cursor = "grab";
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoveredRef.current = null;
    setHoveredItem(null);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const state = stateRef.current;

    // Setup dimensions
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height || 500;
    const radius = Math.min(width, height) / 2.3;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    state.width = width;
    state.height = height;
    state.radius = radius;

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .rotate(state.rotation);

    state.projection = projection;

    const path = d3.geoPath().projection(projection).context(context);
    const graticule = d3.geoGraticule()();

    // Calculate adaptive dot spacing based on globe size
    // Larger globe = more dots needed = smaller spacing
    const baseDotSpacing = Math.max(1.0, Math.min(2.0, 400 / radius));

    // Optimized render function
    const render = () => {
      const { width, height, radius } = state;
      const currentScale = projection.scale();
      const scaleFactor = currentScale / radius;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear with background color
      context.fillStyle = "#050810";
      context.fillRect(0, 0, width, height);

      // Ocean circle with subtle gradient effect
      const oceanGradient = context.createRadialGradient(
        centerX - currentScale * 0.3, centerY - currentScale * 0.3, 0,
        centerX, centerY, currentScale
      );
      oceanGradient.addColorStop(0, "#0f1729");
      oceanGradient.addColorStop(1, "#080c14");
      
      context.beginPath();
      context.arc(centerX, centerY, currentScale, 0, Math.PI * 2);
      context.fillStyle = oceanGradient;
      context.fill();
      context.strokeStyle = "rgba(59, 130, 246, 0.25)";
      context.lineWidth = 1.5;
      context.stroke();

      // Graticule
      context.beginPath();
      path(graticule);
      context.strokeStyle = "rgba(59, 130, 246, 0.07)";
      context.lineWidth = 0.5;
      context.stroke();

      // Country dots - batch by color for performance
      const hoveredCode = hoveredRef.current?.type === "country" ? hoveredRef.current.code : null;
      const dotsByColor = new Map<string, { x: number; y: number }[]>();
      const currentScaleSq = currentScale * currentScale;

      // Adaptive dot size based on scale
      const dotRadius = Math.max(1.0, 1.4 * scaleFactor);

      state.dots.forEach((dot) => {
        const projected = projection([dot.lng, dot.lat]);
        if (!projected) return;

        const [px, py] = projected;
        
        // Quick bounds check
        if (px < -10 || px > width + 10 || py < -10 || py > height + 10) return;

        // Check if behind globe
        const dx = px - centerX;
        const dy = py - centerY;
        if (dx * dx + dy * dy > currentScaleSq * 0.98) return;

        let color: string;
        if (hoveredCode) {
          color = hoveredCode === dot.countryCode ? dot.color : "#1a2233";
        } else {
          color = dot.color;
        }

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

      // Destination pins (only if enabled)
      if (showPinsRef.current) {
        const highlighted = highlightedRef.current;
        const currentTravelState = travelStateRef.current;

        destinations.forEach((dest) => {
          const projected = projection([dest.lng, dest.lat]);
          if (!projected) return;

          const [px, py] = projected;
          if (px < 0 || px > width || py < 0 || py > height) return;

          // Check if behind globe
          const dx = px - centerX;
          const dy = py - centerY;
          if (dx * dx + dy * dy > currentScaleSq * 0.95) return;

          const status = currentTravelState[dest.id];
          const isHighlighted = highlighted?.id === dest.id;
          const isHovered = hoveredRef.current?.destination?.id === dest.id;

          let pinSize = 7 * scaleFactor;
          if (isHighlighted || isHovered) {
            pinSize *= 1.4;
          }

          let fillColor = categories[dest.category].color;
          if (status === "visited") fillColor = "#22c55e";
          else if (status === "wishlist") fillColor = "#f59e0b";

          // Simple pin
          const pinHeight = pinSize * 1.8;
          const pinY = py - pinHeight / 2;

          context.beginPath();
          context.moveTo(px, py);
          context.lineTo(px - pinSize * 0.6, pinY - pinSize * 0.3);
          context.arc(px, pinY - pinSize * 0.3, pinSize * 0.6, Math.PI, 0, false);
          context.closePath();
          context.fillStyle = fillColor;
          context.fill();
          
          if (isHighlighted || isHovered) {
            context.strokeStyle = "#ffffff";
            context.lineWidth = 2;
            context.stroke();
          }

          // Inner dot
          context.beginPath();
          context.arc(px, pinY - pinSize * 0.3, pinSize * 0.22, 0, Math.PI * 2);
          context.fillStyle = "#ffffff";
          context.fill();
        });
      }
    };

    // Load data
    const loadData = async () => {
      if (state.isInitialized) {
        render();
        return;
      }

      try {
        setIsLoading(true);

        const [worldRes, namesRes] = await Promise.all([
          fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
          fetch("https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-2/slim-2.json")
        ]);

        if (!worldRes.ok) throw new Error("Failed to load map data");

        const [world, names] = await Promise.all([worldRes.json(), namesRes.json()]);
        const topojson = await import("topojson-client");
        
        const countries = topojson.feature(world, world.objects.countries) as FeatureCollection<Geometry, CountryProperties>;

        const nameMap = new Map(names.map((c: CountryNameData) => [
          String(c["country-code"]).padStart(3, "0"),
          { name: c.name, alpha2: c["alpha-2"] }
        ]));

        countries.features = countries.features.map((f: Feature<Geometry, CountryProperties>) => {
          const info = nameMap.get(String(f.id).padStart(3, "0")) || { name: "Unknown", alpha2: "" };
          return {
            ...f,
            properties: { ...f.properties, name: info.name, iso_a2: info.alpha2 },
          };
        });

        state.countries = countries;

        // Generate dots with adaptive spacing
        const allDots: typeof state.dots = [];
        const spacing = baseDotSpacing;

        countries.features.forEach((feature: Feature<Geometry, CountryProperties>) => {
          const code = feature.properties?.iso_a2 || "";
          const color = countryColors[code] || "#4a5568";
          const bounds = d3.geoBounds(feature);
          const [[minLng, minLat], [maxLng, maxLat]] = bounds;

          for (let lng = minLng; lng <= maxLng; lng += spacing) {
            for (let lat = minLat; lat <= maxLat; lat += spacing) {
              if (d3.geoContains(feature, [lng, lat])) {
                allDots.push({ lng, lat, color, countryCode: code });
              }
            }
          }
        });

        state.dots = allDots;
        state.isInitialized = true;

        setIsLoading(false);
        render();
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load map data");
        setIsLoading(false);
      }
    };

    // Animation loop
    let animationId: number;
    let lastTime = 0;
    const frameInterval = 1000 / 60;

    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);

      const delta = currentTime - lastTime;
      if (delta < frameInterval) return;
      lastTime = currentTime - (delta % frameInterval);

      if (state.autoRotate && !highlightedRef.current) {
        state.rotation[0] += 0.05;
        projection.rotate(state.rotation);
      }
      render(currentTime);
    };

    // Mouse interactions
    let isDragging = false;

    const handleMouseDown = (event: MouseEvent) => {
      // Check if click is on the globe
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const x = (event.clientX - rect.left) * (canvas.width / dpr / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / dpr / rect.height);
      
      const centerX = width / 2;
      const centerY = height / 2;
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      // Only start dragging if clicking on the globe
      if (distFromCenter > projection.scale()) {
        return;
      }

      isDragging = true;
      state.autoRotate = false;
      const startX = event.clientX;
      const startY = event.clientY;
      const startRotation: [number, number] = [...state.rotation];
      canvas.style.cursor = "grabbing";

      const onMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        state.rotation[0] = startRotation[0] + dx * 0.25;
        state.rotation[1] = Math.max(-60, Math.min(60, startRotation[1] - dy * 0.25));
        projection.rotate(state.rotation);
      };

      const onUp = () => {
        isDragging = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        canvas.style.cursor = "grab";
        setTimeout(() => { state.autoRotate = true; }, 2000);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    };

    const handleWheel = (event: WheelEvent) => {
      // Check if mouse is over the globe
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const x = (event.clientX - rect.left) * (canvas.width / dpr / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / dpr / rect.height);
      
      const centerX = width / 2;
      const centerY = height / 2;
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (distFromCenter > projection.scale() * 1.1) {
        return;
      }

      event.preventDefault();
      const scale = projection.scale();
      const factor = event.deltaY > 0 ? 0.94 : 1.06;
      projection.scale(Math.max(radius * 0.5, Math.min(radius * 2.5, scale * factor)));
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    loadData();
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-[#0a0f1a] rounded-2xl p-8 h-full ${className}`}>
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">Error</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050810] z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-[#3b82f6] rounded-full animate-spin" />
            <div className="text-gray-500 text-sm font-mono">Loading globe...</div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      <AnimatePresence>
        {hoveredItem && (
          <HoverPopup item={hoveredItem} travelState={travelState} />
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleTogglePins}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-mono transition-all border
            ${internalShowPins 
              ? "bg-[#3b82f6] text-white border-[#3b82f6]" 
              : "bg-[#0a0f1a]/80 text-gray-400 border-[#1e3a5f] hover:border-[#3b82f6]"
            }
          `}
        >
          📍 Pins {internalShowPins ? "ON" : "OFF"}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-[#0a0f1a]/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#1e3a5f]/50">
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
            <span className="text-gray-400">Visited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="text-gray-400">Wishlist</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
            <span className="text-gray-400">Explore</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-[#0a0f1a]/80 backdrop-blur-sm px-2 py-1 rounded-md border border-[#1e3a5f]/50 font-mono">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}

function HoverPopup({ item, travelState }: { item: HoveredItem; travelState: Record<string, "visited" | "wishlist" | null> }) {
  const status = item.destination ? travelState[item.destination.id] : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.1 }}
      className="fixed z-50 pointer-events-none"
      style={{
        left: item.x,
        top: item.y,
        transform: "translate(-50%, -120%)",
      }}
    >
      <div className="bg-[#0a0f1a]/95 backdrop-blur-md border border-[#1e3a5f] rounded-lg px-4 py-2.5 shadow-2xl min-w-[160px]">
        {item.type === "destination" && item.destination ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-base">{categories[item.destination.category].icon}</span>
              <span className="text-white font-semibold text-sm">{item.name}</span>
              {status === "visited" && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#22c55e]/20 text-[#22c55e] font-mono ml-auto">✓</span>
              )}
              {status === "wishlist" && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] font-mono ml-auto">★</span>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-0.5">{item.destination.country}</p>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: countryColors[item.code || ""] || "#6b7280" }}
            />
            <span className="text-white font-semibold text-sm">{item.name}</span>
            {item.code && (
              <span className="text-gray-500 text-xs font-mono ml-auto">{item.code}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
