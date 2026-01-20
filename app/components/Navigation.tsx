"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Sparkles } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  
  const isEarthPage = pathname === "/";
  const isSolarPage = pathname === "/solar-system";

  return (
    <nav className="flex items-center gap-2 bg-[#0a0f1a]/50 rounded-lg border border-[#1e3a5f]/30 p-1">
      <Link
        href="/"
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          isEarthPage
            ? "bg-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/20"
            : "text-gray-400 hover:text-white hover:bg-[#1e3a5f]/30"
        }`}
      >
        <Globe className="w-4 h-4" />
        <span>Earth</span>
      </Link>
      
      <Link
        href="/solar-system"
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          isSolarPage
            ? "bg-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/20"
            : "text-gray-400 hover:text-white hover:bg-[#1e3a5f]/30"
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>Solar System</span>
      </Link>
    </nav>
  );
}
