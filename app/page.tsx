"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import TravelDashboard, { type Destination } from "./components/TravelDashboard";
import Navigation from "./components/Navigation";

const GlobeMap = dynamic(() => import("./components/GlobeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#050810] rounded-2xl flex items-center justify-center border border-[#1e3a5f]/30">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-[#3b82f6] rounded-full animate-spin" />
        <div className="text-gray-500 text-sm font-mono">Loading globe...</div>
      </div>
    </div>
  ),
});

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export default function Home() {
  const [highlightedDestination, setHighlightedDestination] = useState<Destination | null>(null);
  const [travelState] = useLocalStorage<Record<string, "visited" | "wishlist" | null>>("travel-state", {});

  const visitedCount = Object.values(travelState).filter(s => s === "visited").length;
  const wishlistCount = Object.values(travelState).filter(s => s === "wishlist").length;

  return (
    <main className="min-h-screen bg-[#050810] font-mono">
      {/* Header */}
      <header className="px-4 md:px-6 py-4 border-b border-[#1e3a5f]/30">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-white text-xl font-semibold tracking-tight flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                Wanderlust
              </h1>
              <p className="text-gray-500 text-sm">
                Track your travel bucket list
              </p>
            </div>
            <Navigation />
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
              <span className="text-gray-400">
                <span className="text-white font-semibold">{visitedCount}</span> Visited
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span className="text-gray-400">
                <span className="text-white font-semibold">{wishlistCount}</span> Wishlist
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
              <span className="text-gray-400">
                <span className="text-white font-semibold">40</span> Destinations
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-[1800px] mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
          {/* Globe */}
          <div className="order-2 lg:order-1 h-[500px] lg:h-[calc(100vh-160px)] bg-[#0a0f1a]/50 rounded-2xl border border-[#1e3a5f]/30 overflow-hidden">
            <GlobeMap 
              highlightedDestination={highlightedDestination}
              travelState={travelState}
            />
          </div>

          {/* Sidebar */}
          <aside className="order-1 lg:order-2 lg:h-[calc(100vh-160px)] overflow-hidden">
            <TravelDashboard onDestinationHover={setHighlightedDestination} />
          </aside>
        </div>
      </div>
    </main>
  );
}
