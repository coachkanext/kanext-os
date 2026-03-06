"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <nav className="bg-[#1a1a1a] text-white/80 text-sm border-b border-white/10">
      <div className="max-w-[900px] mx-auto px-4 h-10 flex items-center justify-between">
        <Link href="/" className="font-medium hover:text-white transition-colors">
          KaNeXT Player Pool
        </Link>
      </div>
    </nav>
  );
}
