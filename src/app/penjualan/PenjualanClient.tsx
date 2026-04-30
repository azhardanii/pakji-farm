'use client';

import { useRouter } from 'next/navigation';
import { formatTanggal, formatRupiah, hitungUmur, hitungEstimasi } from '@/lib/calculations';

export default function PenjualanClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();

  // Sort by updated_at descending (as an approximation of sell date)
  const sortedData = [...initialData].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  let totalEstimasiTerjual = 0;
  sortedData.forEach(g => {
    const umur = hitungUmur(g.tanggal_lahir);
    const est = hitungEstimasi(g.jenis_kelamin, umur.totalHari);
    totalEstimasiTerjual += est.harga;
  });

  return (
    <>
      <div className="flex items-center gap-3 mb-[13px]">
        <button onClick={() => router.back()} className="w-[34px] h-[34px] rounded-[9px] bg-surface border border-border flex items-center justify-center text-lg cursor-pointer text-text shadow-sm active:scale-95">
          ←
        </button>
        <h1 className="font-[family-name:var(--font-serif)] text-xl text-text">Histori Penjualan</h1>
      </div>

      <div className="bg-gradient-to-br from-primary to-primary-d rounded-[16px] p-[16px_18px] mb-[15px] shadow-[0_4px_16px_rgba(26,92,158,0.3)] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-white/5 rounded-full blur-[20px] -translate-y-1/2 translate-x-1/3" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5 relative z-10">Total Valuasi Terjual</div>
        <div className="font-[family-name:var(--font-serif)] text-[28px] font-bold leading-none mb-1.5 relative z-10">
          {formatRupiah(totalEstimasiTerjual)}
        </div>
        <div className="text-[12px] text-white/80 relative z-10">Dari {sortedData.length} ekor kambing</div>
      </div>

      <div className="space-y-[9px]">
        {sortedData.length === 0 ? (
          <div className="text-center py-10 px-5 bg-surface border border-border rounded-[16px]">
            <div className="text-[46px] mb-3 opacity-40">📝</div>
            <div className="text-sm font-semibold text-text-md mb-1">Belum ada penjualan</div>
            <div className="text-[11px] text-text-sm">Kambing yang ditandai sebagai 'Terjual' akan muncul di sini.</div>
          </div>
        ) : (
          sortedData.map(g => {
            const umur = hitungUmur(g.tanggal_lahir);
            const est = hitungEstimasi(g.jenis_kelamin, umur.totalHari);

            return (
              <div 
                key={g.id} 
                onClick={() => router.push(`/kambing/${g.id}`)}
                className="bg-surface rounded-[16px] p-3 px-[14px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] flex gap-3.5 items-center cursor-pointer active:scale-[0.99] transition-transform"
              >
                {/* Thumb */}
                <div className={`w-[48px] h-[48px] rounded-[12px] flex items-center justify-center text-[22px] flex-shrink-0 border-[1.5px] ${
                  g.jenis_kelamin === 'JANTAN' ? 'bg-[#EBF3FF] border-[#C0D8F5]' : 'bg-[#FFF0F6] border-[#F5C0D8]'
                }`}>
                  {g.jenis_kelamin === 'JANTAN' ? '🐐' : '🐑'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="text-[14px] font-bold truncate">{g.nama || 'Tanpa Nama'}</div>
                    <span className="text-[9px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-warning-light text-warning shrink-0">
                      Terjual
                    </span>
                  </div>
                  <div className="text-[10px] text-text-sm font-medium font-mono tracking-wide">{g.id_sistem}</div>
                  <div className="text-[11px] text-text-md mt-1.5 flex items-center gap-1.5">
                    <span className="opacity-70">⏱ {umur.label}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="opacity-70">⚖️ {est.bobot} kg</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] text-text-sm font-semibold uppercase mb-1">Estimasi</div>
                  <div className="font-[family-name:var(--font-serif)] text-[15px] font-bold text-accent">
                    {formatRupiah(est.harga).replace('Rp ', '')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
