'use client';

import { formatTanggalPanjang } from '@/lib/calculations';

export default function Header() {
  const today = formatTanggalPanjang(new Date());
  // Split "Senin, 28 April 2026" into day name and rest
  const idx = today.indexOf(',');
  const dayName = idx > -1 ? today.slice(0, idx) : today;
  const dateRest = idx > -1 ? today.slice(idx + 1).trim() : '';

  return (
    <header className="bg-primary-d px-[18px] py-[14px] pb-3 flex items-center justify-between sticky top-0 z-[100]">
      <div className="flex items-center gap-2.5">
        <div className="w-[38px] h-[38px] bg-white/12 border border-white/20 rounded-[11px] flex items-center justify-center text-xl">
          🐐
        </div>
        <div>
          <div className="font-[family-name:var(--font-serif)] text-base text-white leading-tight tracking-wide">
            Pak Ji Farm
          </div>
          <div className="text-[10px] text-white/55 font-normal mt-0.5">
            Sistem Monitoring Kambing
          </div>
        </div>
      </div>
      <div className="text-[10px] text-white/60 text-right leading-relaxed">
        <strong className="text-white/90 text-[11px] block">{dayName}</strong>
        {dateRest}
      </div>
    </header>
  );
}
