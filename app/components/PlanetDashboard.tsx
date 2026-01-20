"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { allCelestialBodies, planets, planetCategories, getPlanetsByCategory, type Planet } from "../data/planets";

interface PlanetDashboardProps {
  selectedPlanet?: Planet | null;
  onPlanetSelect?: (planet: Planet) => void;
}

export default function PlanetDashboard({
  selectedPlanet,
  onPlanetSelect,
}: PlanetDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredPlanets = useMemo(() => {
    let filtered = activeFilter === "all" ? allCelestialBodies : getPlanetsByCategory(activeFilter);
    
    if (searchQuery) {
      filtered = filtered.filter(planet =>
        planet.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchQuery, activeFilter]);

  const totalMoons = planets.reduce((sum, planet) => sum + planet.moons, 0);

  return (
    <div className="h-full flex flex-col bg-[#0a0f1a]/50 rounded-2xl border border-[#1e3a5f]/30 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1e3a5f]/30">
        <h2 className="text-white text-lg font-semibold mb-1">Solar System</h2>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>9 Planets</span>
          <span>•</span>
          <span>{totalMoons}+ Moons</span>
          <span>•</span>
          <span>1 Star</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[#1e3a5f]/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search celestial bodies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050810] border border-[#1e3a5f]/30 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#3b82f6]/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-[#1e3a5f]/30">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(planetCategories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === key
                  ? "bg-[#3b82f6] text-white"
                  : "bg-[#050810] text-gray-400 hover:text-white border border-[#1e3a5f]/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Planet List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredPlanets.map((planet) => (
            <motion.div
              key={planet.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => onPlanetSelect?.(planet)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedPlanet?.id === planet.id
                    ? "bg-[#1e3a5f]/50 border-2 border-[#3b82f6]"
                    : "bg-[#050810]/50 border border-[#1e3a5f]/30 hover:border-[#1e3a5f] hover:bg-[#0a0f1a]"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Planet Icon */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${planet.colorLight}, ${planet.color}, ${planet.colorDark})`,
                    }}
                  >
                    {planet.emoji}
                  </div>

                  {/* Planet Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold text-sm">{planet.name}</h3>
                      {planet.moons > 0 && (
                        <span className="text-xs text-gray-400">{planet.moons} moons</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 space-y-0.5">
                      <div>{planet.diameter}</div>
                      {planet.id !== "sun" && (
                        <div className="text-gray-500">{planet.distanceFromSun}</div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredPlanets.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No celestial bodies found
          </div>
        )}
      </div>

      {/* Selected Planet Details */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[#1e3a5f]/30 overflow-hidden"
          >
            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${selectedPlanet.colorLight}, ${selectedPlanet.color}, ${selectedPlanet.colorDark})`,
                    }}
                  >
                    {selectedPlanet.emoji}
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">{selectedPlanet.name}</h3>
                    <p className="text-gray-400 text-sm">{selectedPlanet.composition}</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#050810]/50 rounded-lg p-3 border border-[#1e3a5f]/30">
                  <div className="text-gray-400 text-xs mb-1">Diameter</div>
                  <div className="text-white text-sm font-semibold">{selectedPlanet.diameter}</div>
                </div>
                {selectedPlanet.id !== "sun" && (
                  <div className="bg-[#050810]/50 rounded-lg p-3 border border-[#1e3a5f]/30">
                    <div className="text-gray-400 text-xs mb-1">Distance from Sun</div>
                    <div className="text-white text-sm font-semibold">{selectedPlanet.distanceFromSun}</div>
                  </div>
                )}
                {selectedPlanet.id !== "sun" && (
                  <div className="bg-[#050810]/50 rounded-lg p-3 border border-[#1e3a5f]/30">
                    <div className="text-gray-400 text-xs mb-1">Orbital Period</div>
                    <div className="text-white text-sm font-semibold">{selectedPlanet.orbitalPeriod}</div>
                  </div>
                )}
                <div className="bg-[#050810]/50 rounded-lg p-3 border border-[#1e3a5f]/30">
                  <div className="text-gray-400 text-xs mb-1">Day Length</div>
                  <div className="text-white text-sm font-semibold">{selectedPlanet.dayLength}</div>
                </div>
                <div className="bg-[#050810]/50 rounded-lg p-3 border border-[#1e3a5f]/30">
                  <div className="text-gray-400 text-xs mb-1">Temperature</div>
                  <div className="text-white text-sm font-semibold">{selectedPlanet.temperature}</div>
                </div>
                <div className="bg-[#050810]/50 rounded-lg p-3 border border-[#1e3a5f]/30">
                  <div className="text-gray-400 text-xs mb-1">Moons</div>
                  <div className="text-white text-sm font-semibold">{selectedPlanet.moons}</div>
                </div>
              </div>

              {/* Fun Facts */}
              <div className="mb-4">
                <h4 className="text-white font-semibold text-sm mb-2">Fun Facts</h4>
                <ul className="space-y-2">
                  {selectedPlanet.funFacts.map((fact, index) => (
                    <li key={index} className="text-gray-400 text-xs flex gap-2">
                      <span className="text-[#3b82f6] flex-shrink-0">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Discovery */}
              <div className="bg-[#050810]/50 rounded-lg p-3 border border-[#1e3a5f]/30">
                <div className="text-gray-400 text-xs mb-1">Discovery</div>
                <div className="text-white text-sm">{selectedPlanet.discovered}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
