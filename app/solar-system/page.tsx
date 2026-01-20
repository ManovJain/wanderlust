"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navigation from "../components/Navigation";
import { sun, planets, type Planet } from "../data/planets";

const SolarSystemScene = dynamic(() => import("../components/SolarSystemScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#050810] rounded-2xl flex items-center justify-center border border-[#1e3a5f]/30">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-[#3b82f6] rounded-full animate-spin" />
        <div className="text-gray-500 text-sm font-mono">Loading solar system...</div>
      </div>
    </div>
  ),
});

const PlanetDashboard = dynamic(() => import("../components/PlanetDashboard"), {
  ssr: false,
});

export default function SolarSystemPage() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);

  return (
    <main className="min-h-screen bg-[#050810] font-mono">
      {/* Header */}
      <header className="px-4 md:px-6 py-4 border-b border-[#1e3a5f]/30">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-white text-xl font-semibold tracking-tight flex items-center gap-2">
                <span className="text-2xl">☀️</span>
                Wanderlust
              </h1>
              <p className="text-gray-500 text-sm">
                Explore our solar system
              </p>
            </div>
            <Navigation />
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FDB813]" />
              <span className="text-gray-400">
                <span className="text-white font-semibold">1</span> Star
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4A90E2]" />
              <span className="text-gray-400">
                <span className="text-white font-semibold">9</span> Planets
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#6B7280]" />
              <span className="text-gray-400">
                <span className="text-white font-semibold">200+</span> Moons
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-[1800px] mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
          {/* Solar System Scene */}
          <div className="order-2 lg:order-1 h-[500px] lg:h-[calc(100vh-160px)] bg-[#000000] rounded-2xl border border-[#1e3a5f]/30 overflow-hidden">
            <SolarSystemScene
              selectedPlanet={selectedPlanet}
              onPlanetSelect={setSelectedPlanet}
            />
          </div>

          {/* Sidebar */}
          <aside className="order-1 lg:order-2 lg:h-[calc(100vh-160px)] overflow-hidden">
            <PlanetDashboard
              selectedPlanet={selectedPlanet}
              onPlanetSelect={setSelectedPlanet}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
