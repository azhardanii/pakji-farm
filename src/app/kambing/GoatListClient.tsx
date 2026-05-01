'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hitungUmur, hitungEstimasi, cekCempe } from '@/lib/calculations';
import { Kelamin } from '@prisma/client';

export default function GoatListClient({ initialGoats }: { initialGoats: any[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState('Semua Aktif');
  const [search, setSearch] = useState('');

  const stats = {
    'Semua Aktif': initialGoats.filter(g => g.status === 'AKTIF').length,
    Jantan: initialGoats.filter(g => g.status === 'AKTIF' && g.jenis_kelamin === 'JANTAN' && !cekCempe(g.jenis_kelamin, g.tanggal_lahir)).length,
    Betina: initialGoats.filter(g => g.status === 'AKTIF' && g.jenis_kelamin === 'BETINA' && !cekCempe(g.jenis_kelamin, g.tanggal_lahir)).length,
    Cempe: initialGoats.filter(g => g.status === 'AKTIF' && cekCempe(g.jenis_kelamin, g.tanggal_lahir)).length,
    Bunting: initialGoats.filter(g => g.status === 'AKTIF' && g.riwayat_kawin_betina?.length > 0).length,
    Mati: initialGoats.filter(g => g.status === 'MATI').length,
    Terjual: initialGoats.filter(g => g.status === 'TERJUAL').length,
  };

  const filteredGoats = initialGoats.filter(g => {
    // Search
    if (search && !g.nama?.toLowerCase().includes(search.toLowerCase()) && !g.id_sistem.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Filter chips
    const isCempe = cekCempe(g.jenis_kelamin, g.tanggal_lahir);
    if (filter === 'Semua Aktif') return g.status === 'AKTIF';
    if (filter === 'Jantan') return g.status === 'AKTIF' && g.jenis_kelamin === 'JANTAN' && !isCempe;
    if (filter === 'Betina') return g.status === 'AKTIF' && g.jenis_kelamin === 'BETINA' && !isCempe;
    if (filter === 'Cempe') return g.status === 'AKTIF' && isCempe;
    if (filter === 'Bunting') return g.status === 'AKTIF' && g.riwayat_kawin_betina?.length > 0;
    if (filter === 'Mati') return g.status === 'MATI';
    if (filter === 'Terjual') return g.status === 'TERJUAL';
    
    return true;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-3.5">
        <h1 className="font-[family-name:var(--font-serif)] text-xl text-text">Daftar Kambing</h1>
      </div>

      <div className="flex items-center gap-2 bg-surface border-[1.5px] border-border rounded-[11px] p-[9px_13px] mb-3 focus-within:border-primary transition-colors">
        <span className="text-text-sm">🔍</span>
        <input 
          type="text" 
          placeholder="Cari nama / ID kambing..." 
          className="flex-1 border-none outline-none text-[13px] bg-transparent text-text placeholder:text-text-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto mb-[13px] pb-1 chip-scroll">
        {['Semua Aktif', 'Jantan', 'Betina', 'Cempe', 'Bunting', 'Mati', 'Terjual'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11.5px] font-semibold py-1.5 px-3.5 rounded-full border-[1.5px] whitespace-nowrap flex-shrink-0 transition-all ${
              filter === f 
                ? 'bg-primary text-white border-primary' 
                : 'bg-surface border-border text-text-md'
            }`}
          >
            {f === 'Jantan' ? '🐐 ' : f === 'Betina' ? '🐑 ' : f === 'Cempe' ? '🐣 ' : f === 'Bunting' ? '🤰 ' : f === 'Mati' ? '⚰️ ' : f === 'Terjual' ? '💰 ' : ''}
            {f} ({stats[f as keyof typeof stats]})
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filteredGoats.length === 0 ? (
          <div className="text-center py-10 px-5">
            <div className="text-[46px] mb-3 opacity-40">🐐</div>
            <div className="text-sm text-text-sm">Tidak ada kambing ditemukan.</div>
          </div>
        ) : (
          filteredGoats.map(g => {
            const umur = hitungUmur(g.tanggal_lahir);
            const est = hitungEstimasi(g.jenis_kelamin, umur.totalHari);
            const isCempe = cekCempe(g.jenis_kelamin, g.tanggal_lahir);
            const isBunting = g.riwayat_kawin_betina?.length > 0;

            return (
              <div 
                key={g.id} 
                onClick={() => router.push(`/kambing/${g.id}`)}
                className="bg-surface rounded-2xl p-3 px-3.5 border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] flex gap-3 items-center cursor-pointer transition-transform active:scale-[0.99] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08)]"
              >
                {/* Thumb */}
                <div className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center text-[26px] flex-shrink-0 border-[1.5px] overflow-hidden ${
                  g.jenis_kelamin === 'JANTAN' ? 'bg-[#EBF3FF] border-[#C0D8F5]' : 'bg-[#FFF0F6] border-[#F5C0D8]'
                }`}>
                  {g.foto?.[0]?.url ? (
                    <img src={g.foto[0].url} alt={g.nama || 'Goat'} className="w-full h-full object-cover" />
                  ) : (
                    g.jenis_kelamin === 'JANTAN' ? '🐐' : '🐑'
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{g.nama || 'Tanpa Nama'}</div>
                  <div className="text-[10px] text-text-sm font-medium font-mono tracking-wide">{g.id_sistem}</div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {isCempe ? (
                      <span className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-accent-light text-accent">Cempe</span>
                    ) : g.jenis_kelamin === 'JANTAN' ? (
                      <span className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-[#E6EFF9] text-[#1A5C9E]">Jantan</span>
                    ) : (
                      <span className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-[#FFF0F6] text-[#B83570]">Betina</span>
                    )}
                    
                    {isBunting && (
                      <span className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-accent-light text-accent">Bunting</span>
                    )}
                  </div>
                  <div className="text-[11px] text-text-sm mt-1">⏱ {umur.label} · ⚖️ {est.bobot} kg</div>
                </div>

                {/* Status Dot */}
                <div className="text-right flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                    isBunting ? 'bg-[#E07830]' : 'bg-primary'
                  }`} />
                  <div className="text-[9px] text-text-sm font-semibold">{g.status}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
