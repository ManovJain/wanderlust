"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { allCelestialBodies, type Planet } from "../data/planets";
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

interface SolarSystemSceneProps {
  selectedPlanet?: Planet | null;
  onPlanetSelect?: (planet: Planet) => void;
  className?: string;
}

interface PlanetState {
  planet: Planet;
  angle: number;
  rotation: [number, number, number];
  projection: d3.GeoProjection;
  dots: Array<{ lng: number; lat: number; color: string; countryCode?: string }>;
  isInitialized: boolean;
}

export default function SolarSystemScene({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedPlanet: _selectedPlanet,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPlanetSelect: _onPlanetSelect,
  className = "",
}: SolarSystemSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const stateRef = useRef<{
    width: number;
    height: number;
    cameraX: number;
    cameraY: number;
    zoom: number;
    isDragging: boolean;
    lastMouseX: number;
    lastMouseY: number;
    planets: Map<string, PlanetState>;
    stars: Array<{ x: number; y: number; size: number; opacity: number }>;
    earthCountries: FeatureCollection<Geometry, CountryProperties> | null;
  }>({
    width: 0,
    height: 0,
    cameraX: 0,
    cameraY: 0,
    zoom: 1,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    planets: new Map(),
    stars: [],
    earthCountries: null,
  });

  // Initialize scene
  useEffect(() => {
    const initScene = async () => {
      setIsLoading(true);

      // Generate stars
      const stars = [];
      for (let i = 0; i < 500; i++) {
        stars.push({
          x: Math.random() * 4000 - 2000,
          y: Math.random() * 4000 - 2000,
          size: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.6 + 0.2,
        });
      }
      stateRef.current.stars = stars;

      // Load Earth data
      try {
        const [worldRes, namesRes] = await Promise.all([
          fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
          fetch("https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-2/slim-2.json")
        ]);

        if (worldRes.ok && namesRes.ok) {
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

          stateRef.current.earthCountries = countries;
        }
      } catch (err) {
        console.error("Error loading Earth data:", err);
      }

      // Initialize all planets
      const planetsMap = new Map<string, PlanetState>();
      
      allCelestialBodies.forEach((planet) => {
        const scale = planet.radius * 3; // Scale for rendering
        const projection = d3.geoOrthographic()
          .scale(scale)
          .rotate([0, 0, 0]);

        planetsMap.set(planet.id, {
          planet,
          angle: Math.random() * 360,
          rotation: [0, 0, 0],
          projection,
          dots: [],
          isInitialized: false,
        });
      });

      stateRef.current.planets = planetsMap;
      
      // Generate surfaces for all planets
      await generateAllPlanetSurfaces();
      
      setIsLoading(false);
    };

    initScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate planet surfaces
  const generateAllPlanetSurfaces = async () => {
    const { planets, earthCountries } = stateRef.current;

    planets.forEach((planetState) => {
      const { planet } = planetState;
      const dots: Array<{ lng: number; lat: number; color: string; countryCode?: string }> = [];
      
      if (planet.id === "earth" && earthCountries) {
        // Use real Earth data
        const spacing = 3;
        const countryColors: Record<string, string> = {
          US: "#3b82f6", CN: "#ef4444", IN: "#f97316", BR: "#22c55e", RU: "#60a5fa",
          JP: "#ef4444", DE: "#fbbf24", GB: "#60a5fa", FR: "#3b82f6", IT: "#22c55e",
          CA: "#dc2626", AU: "#60a5fa", ES: "#dc2626", MX: "#22c55e", others: "#4a5568"
        };

        earthCountries.features.forEach((feature: Feature<Geometry, CountryProperties>) => {
          const code = feature.properties?.iso_a2 || "";
          const color = countryColors[code] || countryColors.others;
          const bounds = d3.geoBounds(feature);
          const [[minLng, minLat], [maxLng, maxLat]] = bounds;

          for (let lng = minLng; lng <= maxLng; lng += spacing) {
            for (let lat = minLat; lat <= maxLat; lat += spacing) {
              if (d3.geoContains(feature, [lng, lat])) {
                dots.push({ lng, lat, color, countryCode: code });
              }
            }
          }
        });
      } else {
        // Procedural surfaces for other planets
        const spacing = 3.5;
        generateProceduralSurface(planet, spacing, dots);
      }

      planetState.dots = dots;
      planetState.isInitialized = true;
    });
  };

  // Procedural surface generation
  const generateProceduralSurface = useCallback((
    planet: Planet,
    spacing: number,
    dots: Array<{ lng: number; lat: number; color: string }>
  ) => {
    const noise = (lng: number, lat: number, seed: number = 0) => {
      const x = Math.sin(lng * 12.9898 + lat * 78.233 + seed) * 43758.5453;
      return x - Math.floor(x);
    };

    for (let lng = -180; lng <= 180; lng += spacing) {
      for (let lat = -90; lat <= 90; lat += spacing) {
        let color = planet.color;

        switch (planet.id) {
          case "sun":
            const flare = noise(lng * 0.1, lat * 0.1, 2);
            color = flare > 0.7 ? "#FFFFFF" : flare > 0.4 ? planet.colorLight : planet.color;
            break;

          case "mars":
            const distFromPole = Math.abs(lat);
            const terrain = noise(lng * 0.2, lat * 0.2, 1);
            if (distFromPole > 80) color = "#FFFFFF";
            else if (distFromPole > 75) color = "#FFD4B3";
            else color = terrain > 0.6 ? planet.colorLight : planet.color;
            break;

          case "jupiter":
            const band = Math.floor((lat + 90) / 15);
            const turb = noise(lng * 0.3, lat * 0.2, band);
            const spotDist = Math.sqrt(Math.pow(lng - 90, 2) * 4 + Math.pow(lat + 20, 2) * 9);
            if (spotDist < 15) color = "#DC4C3E";
            else color = (band % 2 === 0) ? (turb > 0.5 ? "#E5B870" : "#C88B3A") : (turb > 0.5 ? "#A67438" : "#8B5A2B");
            break;

          case "saturn":
            const satBand = Math.floor((lat + 90) / 12);
            const satTurb = noise(lng * 0.25, lat * 0.15, satBand);
            color = (satBand % 2 === 0) ? (satTurb > 0.5 ? "#FFEDC9" : "#FAD5A5") : (satTurb > 0.5 ? "#E8C794" : "#D4A574");
            break;

          case "venus":
            const cloud = noise(lng * 0.2, lat * 0.15, 1);
            color = cloud > 0.6 ? planet.colorLight : cloud < 0.3 ? planet.colorDark : planet.color;
            break;

          case "mercury":
            const crater = noise(lng * 0.3, lat * 0.3, 1);
            color = crater > 0.85 ? "#5C4833" : crater > 0.6 ? planet.color : planet.colorDark;
            break;

          case "neptune":
            const nepStorm = noise(lng * 0.2, lat * 0.2, 1);
            const spotD = Math.sqrt(Math.pow(lng + 30, 2) * 4 + Math.pow(lat - 20, 2) * 9);
            if (spotD < 12) color = "#1E3AA8";
            else color = nepStorm > 0.8 ? planet.colorLight : nepStorm > 0.6 ? planet.color : planet.colorDark;
            break;

          case "uranus":
            const uranVar = noise(lng * 0.1, lat * 0.15, 1);
            color = uranVar > 0.7 ? planet.colorLight : uranVar < 0.3 ? planet.colorDark : planet.color;
            break;

          case "pluto":
            const heartX = (lng + 180) % 360 - 180;
            const heartD = Math.sqrt(Math.pow(heartX / 1.2, 2) + Math.pow((lat - 20) / 0.8, 2));
            color = (heartD < 25 && lat < 35 && lat > 5) ? "#FFFFFF" : noise(lng * 0.2, lat * 0.2, 1) > 0.6 ? planet.colorLight : planet.color;
            break;

          default:
            const var1 = noise(lng, lat, 1);
            color = var1 > 0.6 ? planet.colorLight : var1 < 0.4 ? planet.colorDark : planet.color;
        }

        dots.push({ lng, lat, color });
      }
    }
  }, []);

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
    }

    const { cameraX, cameraY, zoom, planets, stars } = stateRef.current;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear with space background
    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);

    // Draw stars
    stars.forEach(star => {
      const x = centerX + (star.x - cameraX) * zoom;
      const y = centerY + (star.y - cameraY) * zoom;
      
      if (x >= -10 && x <= width + 10 && y >= -10 && y <= height + 10) {
        context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        context.beginPath();
        context.arc(x, y, star.size * zoom, 0, Math.PI * 2);
        context.fill();
      }
    });

    // Draw orbital paths
    context.strokeStyle = "rgba(59, 130, 246, 0.15)";
    context.lineWidth = 1;
    planets.forEach((planetState) => {
      if (planetState.planet.orbitRadius > 0) {
        const orbitScale = planetState.planet.orbitRadius * 2.5 * zoom;
        context.beginPath();
        context.arc(centerX - cameraX * zoom, centerY - cameraY * zoom, orbitScale, 0, Math.PI * 2);
        context.stroke();
      }
    });

    // Sort planets by distance for proper layering
    const sortedPlanets = Array.from(planets.values()).sort((a, b) => {
      const aY = Math.sin((a.angle * Math.PI) / 180) * a.planet.orbitRadius;
      const bY = Math.sin((b.angle * Math.PI) / 180) * b.planet.orbitRadius;
      return aY - bY;
    });

    // Draw each planet
    sortedPlanets.forEach((planetState) => {
      drawPlanet(context, planetState, centerX, centerY, cameraX, cameraY, zoom);
    });
  }, []);

  // Draw individual planet
  const drawPlanet = (
    ctx: CanvasRenderingContext2D,
    planetState: PlanetState,
    centerX: number,
    centerY: number,
    cameraX: number,
    cameraY: number,
    zoom: number
  ) => {
    const { planet, angle, rotation, projection, dots } = planetState;
    
    // Calculate position
    const orbitX = Math.cos((angle * Math.PI) / 180) * planet.orbitRadius * 2.5;
    const orbitY = Math.sin((angle * Math.PI) / 180) * planet.orbitRadius * 2.5;
    
    const screenX = centerX + (orbitX - cameraX) * zoom;
    const screenY = centerY + (orbitY - cameraY) * zoom;
    
    // Check if planet is visible
    const planetRadius = planet.radius * 3 * zoom;
    if (screenX < -planetRadius || screenX > stateRef.current.width + planetRadius ||
        screenY < -planetRadius || screenY > stateRef.current.height + planetRadius) {
      return;
    }

    // Update projection
    projection.scale(planetRadius).translate([screenX, screenY]).rotate(rotation);

    // Draw planet background
    ctx.beginPath();
    ctx.arc(screenX, screenY, planetRadius, 0, Math.PI * 2);
    ctx.fillStyle = planet.colorDark;
    ctx.fill();

    // Draw surface dots
    const dotRadius = Math.max(0.8, Math.min(2, planetRadius / 80));
    const dotsByColor = new Map<string, Array<{ x: number; y: number }>>();

    dots.forEach((dot) => {
      const projected = projection([dot.lng, dot.lat]);
      if (!projected) return;

      const [px, py] = projected;
      const dx = px - screenX;
      const dy = py - screenY;
      if (dx * dx + dy * dy > planetRadius * planetRadius) return;

      if (!dotsByColor.has(dot.color)) {
        dotsByColor.set(dot.color, []);
      }
      dotsByColor.get(dot.color)!.push({ x: px, y: py });
    });

    dotsByColor.forEach((positions, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      positions.forEach(({ x, y }) => {
        ctx.moveTo(x + dotRadius, y);
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      });
      ctx.fill();
    });

    // Special effects
    if (planet.id === "sun") {
      ctx.shadowBlur = 40 * zoom;
      ctx.shadowColor = planet.color;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(screenX, screenY, planetRadius + 10 * zoom, 0, Math.PI * 2);
      ctx.strokeStyle = planet.colorLight;
      ctx.lineWidth = 15 * zoom;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Saturn rings
    if (planet.id === "saturn") {
      const tilt = (rotation[1] * Math.PI) / 180;
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.scale(1, Math.cos(tilt) * 0.5 + 0.3);
      
      for (let i = 0; i < 5; i++) {
        const innerR = planetRadius * (1.5 + i * 0.1);
        const outerR = planetRadius * (1.6 + i * 0.1);
        ctx.beginPath();
        ctx.arc(0, 0, outerR, 0, Math.PI * 2);
        ctx.arc(0, 0, innerR, 0, Math.PI * 2, true);
        ctx.fillStyle = `rgba(218, 185, 140, ${0.3 + i * 0.1})`;
        ctx.fill();
      }
      
      ctx.restore();
    }

    // Atmosphere glow
    if (planet.id !== "sun") {
      const glowGrad = ctx.createRadialGradient(screenX, screenY, planetRadius * 0.95, screenX, screenY, planetRadius * 1.08);
      glowGrad.addColorStop(0, "transparent");
      glowGrad.addColorStop(1, `${planet.color}40`);
      ctx.beginPath();
      ctx.arc(screenX, screenY, planetRadius * 1.08, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();
    }

    // Draw planet label if zoomed in enough
    if (planetRadius > 20) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = `${Math.max(10, planetRadius / 5)}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(planet.name, screenX, screenY + planetRadius + 15 * zoom);
    }
  };

  // Mouse interaction
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    stateRef.current.isDragging = true;
    stateRef.current.lastMouseX = e.clientX;
    stateRef.current.lastMouseY = e.clientY;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!stateRef.current.isDragging) return;

    const dx = e.clientX - stateRef.current.lastMouseX;
    const dy = e.clientY - stateRef.current.lastMouseY;

    stateRef.current.cameraX -= dx / stateRef.current.zoom;
    stateRef.current.cameraY -= dy / stateRef.current.zoom;

    stateRef.current.lastMouseX = e.clientX;
    stateRef.current.lastMouseY = e.clientY;
  }, []);

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    stateRef.current.zoom = Math.max(0.3, Math.min(5, stateRef.current.zoom * delta));
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
        // Update planet rotations and orbits
        stateRef.current.planets.forEach((planetState) => {
          planetState.angle += planetState.planet.orbitSpeed;
          if (planetState.angle >= 360) planetState.angle -= 360;
          
          planetState.rotation[0] += planetState.planet.rotationSpeed * 10;
          if (planetState.rotation[0] >= 360) planetState.rotation[0] -= 360;
        });

        render();
        lastTime = currentTime - (elapsed % frameDelay);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [render]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-[#3b82f6] rounded-full animate-spin" />
            <div className="text-gray-500 text-sm font-mono">Loading solar system...</div>
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
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />

          <div className="absolute bottom-4 left-4 bg-[#0a0f1a]/90 backdrop-blur-sm border border-[#1e3a5f]/30 rounded-lg px-3 py-2 text-xs text-gray-400 font-mono">
            <div>Drag to pan • Scroll to zoom</div>
            <div>Zoom: {stateRef.current.zoom.toFixed(2)}x</div>
          </div>

          <div className="absolute top-4 right-4 bg-[#0a0f1a]/90 backdrop-blur-sm border border-[#1e3a5f]/30 rounded-lg px-3 py-2 text-xs text-white font-mono">
            <div className="font-semibold mb-1">Solar System Explorer</div>
            <div className="text-gray-400">All 10 celestial bodies visible</div>
          </div>
        </>
      )}
    </div>
  );
}
