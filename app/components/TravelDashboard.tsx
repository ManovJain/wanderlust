"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { destinations, categories, type Destination } from "../data/destinations";

type TravelStatus = "visited" | "wishlist" | null;

interface TravelState {
  [destinationId: string]: TravelStatus;
}

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
    } catch (error) {
      console.error(error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

function DestinationCard({ 
  destination, 
  status, 
  onStatusChange 
}: { 
  destination: Destination; 
  status: TravelStatus;
  onStatusChange: (status: TravelStatus) => void;
}) {
  const category = categories[destination.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        relative p-3 rounded-lg border transition-all duration-200
        ${status === "visited" 
          ? "bg-[#22c55e]/10 border-[#22c55e]/50" 
          : status === "wishlist" 
            ? "bg-[#f59e0b]/10 border-[#f59e0b]/50" 
            : "bg-[#0a0f1a]/60 border-[#1e3a5f]/50 hover:border-[#1e3a5f]"
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div 
          className="text-2xl flex-shrink-0"
          style={{ filter: status ? "none" : "grayscale(0.5)" }}
        >
          {category.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-sm truncate">{destination.name}</h3>
            {status === "visited" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22c55e]/20 text-[#22c55e] font-mono">
                VISITED
              </span>
            )}
            {status === "wishlist" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] font-mono">
                WISHLIST
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-0.5">{destination.country}</p>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{destination.description}</p>
        </div>
      </div>

      <div className="flex gap-1.5 mt-3">
        <button
          onClick={() => onStatusChange(status === "visited" ? null : "visited")}
          className={`
            flex-1 py-1.5 px-2 rounded text-xs font-mono transition-all
            ${status === "visited"
              ? "bg-[#22c55e] text-white"
              : "bg-[#1e3a5f]/30 text-gray-400 hover:bg-[#22c55e]/20 hover:text-[#22c55e]"
            }
          `}
        >
          ✓ Visited
        </button>
        <button
          onClick={() => onStatusChange(status === "wishlist" ? null : "wishlist")}
          className={`
            flex-1 py-1.5 px-2 rounded text-xs font-mono transition-all
            ${status === "wishlist"
              ? "bg-[#f59e0b] text-white"
              : "bg-[#1e3a5f]/30 text-gray-400 hover:bg-[#f59e0b]/20 hover:text-[#f59e0b]"
            }
          `}
        >
          ★ Want to Visit
        </button>
      </div>
    </motion.div>
  );
}

function StatsCard({ travelState }: { travelState: TravelState }) {
  const visited = Object.values(travelState).filter(s => s === "visited").length;
  const wishlist = Object.values(travelState).filter(s => s === "wishlist").length;
  const total = destinations.length;
  const percentage = Math.round((visited / total) * 100);

  return (
    <div className="bg-[#0a0f1a]/80 backdrop-blur-sm border border-[#1e3a5f] rounded-lg p-4">
      <h2 className="font-mono font-medium text-xs tracking-tight uppercase text-gray-400 mb-3">
        Your Travel Stats
      </h2>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-2xl font-mono text-[#22c55e]">{visited}</div>
          <div className="text-[10px] text-gray-500 uppercase">Visited</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-mono text-[#f59e0b]">{wishlist}</div>
          <div className="text-[10px] text-gray-500 uppercase">Wishlist</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-mono text-gray-400">{total - visited - wishlist}</div>
          <div className="text-[10px] text-gray-500 uppercase">Unexplored</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">World Explored</span>
          <span className="text-white font-mono">{percentage}%</span>
        </div>
        <div className="w-full bg-[#1e3a5f]/50 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-[#22c55e] to-[#3b82f6]"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

function CategoryFilter({ 
  selected, 
  onChange 
}: { 
  selected: string | null; 
  onChange: (category: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`
          px-3 py-1.5 rounded-full text-xs font-mono transition-all
          ${!selected 
            ? "bg-white text-black" 
            : "bg-[#1e3a5f]/30 text-gray-400 hover:bg-[#1e3a5f]/50"
          }
        `}
      >
        All
      </button>
      {Object.entries(categories).map(([key, cat]) => (
        <button
          key={key}
          onClick={() => onChange(selected === key ? null : key)}
          className={`
            px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1
            ${selected === key 
              ? "text-white" 
              : "bg-[#1e3a5f]/30 text-gray-400 hover:bg-[#1e3a5f]/50"
            }
          `}
          style={selected === key ? { backgroundColor: cat.color } : {}}
        >
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}

function FilterTabs({ 
  filter, 
  onChange,
  counts
}: { 
  filter: "all" | "visited" | "wishlist" | "unexplored";
  onChange: (filter: "all" | "visited" | "wishlist" | "unexplored") => void;
  counts: { visited: number; wishlist: number; unexplored: number };
}) {
  const tabs = [
    { key: "all" as const, label: "All", count: destinations.length },
    { key: "visited" as const, label: "Visited", count: counts.visited, color: "#22c55e" },
    { key: "wishlist" as const, label: "Wishlist", count: counts.wishlist, color: "#f59e0b" },
    { key: "unexplored" as const, label: "Unexplored", count: counts.unexplored },
  ];

  return (
    <div className="flex gap-1 bg-[#0a0f1a]/60 p-1 rounded-lg">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            flex-1 py-2 px-3 rounded-md text-xs font-mono transition-all flex items-center justify-center gap-1.5
            ${filter === tab.key 
              ? "bg-[#1e3a5f] text-white" 
              : "text-gray-500 hover:text-gray-300"
            }
          `}
        >
          <span>{tab.label}</span>
          <span 
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ 
              backgroundColor: tab.color ? `${tab.color}20` : "#1e3a5f50",
              color: tab.color || "#9ca3af"
            }}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function TravelDashboard({ 
  onDestinationHover 
}: { 
  onDestinationHover?: (dest: Destination | null) => void;
}) {
  const [travelState, setTravelState] = useLocalStorage<TravelState>("travel-state", {});
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "visited" | "wishlist" | "unexplored">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleStatusChange = (destinationId: string, status: TravelStatus) => {
    setTravelState({
      ...travelState,
      [destinationId]: status,
    });
  };

  const counts = {
    visited: Object.values(travelState).filter(s => s === "visited").length,
    wishlist: Object.values(travelState).filter(s => s === "wishlist").length,
    unexplored: destinations.length - Object.values(travelState).filter(s => s !== null).length,
  };

  const filteredDestinations = destinations.filter(dest => {
    // Category filter
    if (categoryFilter && dest.category !== categoryFilter) return false;
    
    // Status filter
    const status = travelState[dest.id];
    if (statusFilter === "visited" && status !== "visited") return false;
    if (statusFilter === "wishlist" && status !== "wishlist") return false;
    if (statusFilter === "unexplored" && status !== null && status !== undefined) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        dest.name.toLowerCase().includes(query) ||
        dest.country.toLowerCase().includes(query) ||
        dest.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="space-y-4 h-full flex flex-col">
      <StatsCard travelState={travelState} />
      
      <div className="bg-[#0a0f1a]/80 backdrop-blur-sm border border-[#1e3a5f] rounded-lg p-4 flex-1 flex flex-col min-h-0">
        <div className="space-y-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations..."
            className="w-full bg-[#050810] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors"
          />
          
          <FilterTabs filter={statusFilter} onChange={setStatusFilter} counts={counts} />
          
          <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
          <AnimatePresence mode="popLayout">
            {filteredDestinations.map(dest => (
              <div
                key={dest.id}
                onMouseEnter={() => onDestinationHover?.(dest)}
                onMouseLeave={() => onDestinationHover?.(null)}
              >
                <DestinationCard
                  destination={dest}
                  status={travelState[dest.id] || null}
                  onStatusChange={(status) => handleStatusChange(dest.id, status)}
                />
              </div>
            ))}
          </AnimatePresence>
          
          {filteredDestinations.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No destinations found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { destinations, type Destination, type TravelStatus };
