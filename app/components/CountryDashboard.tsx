"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Country data
const countries = [
  { code: "US", name: "United States", population: 331000000, gdp: 25.5, color: "#3b82f6", continent: "North America" },
  { code: "CN", name: "China", population: 1400000000, gdp: 17.7, color: "#ef4444", continent: "Asia" },
  { code: "JP", name: "Japan", population: 126000000, gdp: 4.2, color: "#ef4444", continent: "Asia" },
  { code: "DE", name: "Germany", population: 83000000, gdp: 4.1, color: "#fbbf24", continent: "Europe" },
  { code: "GB", name: "United Kingdom", population: 67000000, gdp: 3.1, color: "#60a5fa", continent: "Europe" },
  { code: "IN", name: "India", population: 1380000000, gdp: 3.4, color: "#f97316", continent: "Asia" },
  { code: "FR", name: "France", population: 67000000, gdp: 2.8, color: "#3b82f6", continent: "Europe" },
  { code: "IT", name: "Italy", population: 60000000, gdp: 2.1, color: "#22c55e", continent: "Europe" },
  { code: "CA", name: "Canada", population: 38000000, gdp: 2.0, color: "#dc2626", continent: "North America" },
  { code: "BR", name: "Brazil", population: 212000000, gdp: 1.9, color: "#22c55e", continent: "South America" },
  { code: "RU", name: "Russia", population: 146000000, gdp: 1.8, color: "#60a5fa", continent: "Europe" },
  { code: "KR", name: "South Korea", population: 52000000, gdp: 1.8, color: "#60a5fa", continent: "Asia" },
  { code: "AU", name: "Australia", population: 26000000, gdp: 1.7, color: "#60a5fa", continent: "Oceania" },
  { code: "ES", name: "Spain", population: 47000000, gdp: 1.4, color: "#dc2626", continent: "Europe" },
  { code: "MX", name: "Mexico", population: 128000000, gdp: 1.3, color: "#22c55e", continent: "North America" },
];

const continentStats = {
  "Asia": { countries: 48, population: 4.7 },
  "Europe": { countries: 44, population: 0.75 },
  "Africa": { countries: 54, population: 1.4 },
  "North America": { countries: 23, population: 0.58 },
  "South America": { countries: 12, population: 0.43 },
  "Oceania": { countries: 14, population: 0.045 },
};

function formatPopulation(pop: number): string {
  if (pop >= 1000000000) return `${(pop / 1000000000).toFixed(2)}B`;
  if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
  return pop.toLocaleString();
}

function CountryRow({ country, rank }: { country: typeof countries[0]; rank: number }) {
  return (
    <motion.li 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.03 }}
      className="flex items-center gap-3 py-1.5 border-b border-[#1e3a5f]/30 last:border-0"
    >
      <span className="text-gray-500 text-xs font-mono w-5">{rank}</span>
      <div className="flex items-center gap-2 min-w-[100px]">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: country.color }}
        />
        <span
          className="font-mono font-medium text-sm"
          style={{ color: country.color }}
        >
          {country.code}
        </span>
      </div>
      <div className="flex-1 text-white text-sm truncate">
        {country.name}
      </div>
      <div className="text-right text-gray-400 text-xs font-mono w-[70px]">
        {formatPopulation(country.population)}
      </div>
      <div className="text-right text-white text-xs font-mono w-[60px]">
        ${country.gdp}T
      </div>
    </motion.li>
  );
}

export function TopCountriesList() {
  return (
    <div className="bg-[#0a0f1a]/80 backdrop-blur-sm border border-[#1e3a5f] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono font-medium text-xs tracking-tight uppercase text-gray-400">
          Top Countries by GDP
        </h2>
        <span className="text-xs text-gray-500 font-mono">Pop. / GDP</span>
      </div>
      <ul className="list-none pl-0 space-y-0">
        {countries.map((country, index) => (
          <CountryRow key={country.code} country={country} rank={index + 1} />
        ))}
      </ul>
    </div>
  );
}

export function ContinentStats() {
  return (
    <div className="bg-[#0a0f1a]/80 backdrop-blur-sm border border-[#1e3a5f] rounded-lg p-4">
      <h2 className="font-mono font-medium text-xs tracking-tight uppercase text-gray-400 mb-3">
        Continents
      </h2>
      <div className="space-y-2">
        {Object.entries(continentStats).map(([name, data], i) => (
          <motion.div 
            key={name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between"
          >
            <span className="text-white text-sm">{name}</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-xs font-mono">{data.countries} countries</span>
              <span className="text-white text-xs font-mono w-[50px] text-right">{data.population}B</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function GlobalStats() {
  const stats = {
    totalCountries: 195,
    totalPopulation: "8.1B",
    totalGDP: "$100.2T",
    largestCountry: "Russia",
  };

  return (
    <div className="bg-[#0a0f1a]/80 backdrop-blur-sm border border-[#1e3a5f] rounded-lg p-4">
      <h2 className="font-mono font-medium text-xs tracking-tight uppercase text-gray-400 mb-3">
        Global Statistics
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-mono text-white">{stats.totalCountries}</div>
          <div className="text-xs text-gray-500">Countries</div>
        </div>
        <div>
          <div className="text-2xl font-mono text-white">{stats.totalPopulation}</div>
          <div className="text-xs text-gray-500">Population</div>
        </div>
        <div>
          <div className="text-2xl font-mono text-white">{stats.totalGDP}</div>
          <div className="text-xs text-gray-500">World GDP</div>
        </div>
        <div>
          <div className="text-2xl font-mono text-white truncate">{stats.largestCountry}</div>
          <div className="text-xs text-gray-500">Largest by Area</div>
        </div>
      </div>
    </div>
  );
}

export function CountrySearch({ onSelect }: { onSelect?: (code: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#0a0f1a]/80 backdrop-blur-sm border border-[#1e3a5f] rounded-lg p-4">
      <h2 className="font-mono font-medium text-xs tracking-tight uppercase text-gray-400 mb-3">
        Search Countries
      </h2>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Type country name..."
        className="w-full bg-[#050810] border border-[#1e3a5f] rounded px-3 py-2 text-white text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors"
      />
      {search && (
        <ul className="mt-2 max-h-[150px] overflow-auto space-y-1">
          {filtered.length > 0 ? filtered.map(c => (
            <li 
              key={c.code}
              onClick={() => onSelect?.(c.code)}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#1e3a5f]/30 cursor-pointer transition-colors"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-white text-sm">{c.name}</span>
              <span className="text-gray-500 text-xs ml-auto">{c.code}</span>
            </li>
          )) : (
            <li className="text-gray-500 text-sm px-2 py-1">No countries found</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function CountryDashboard() {
  return (
    <div className="space-y-4">
      <GlobalStats />
      <TopCountriesList />
      <ContinentStats />
    </div>
  );
}
