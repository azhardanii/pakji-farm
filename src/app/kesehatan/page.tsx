import { getRiwayatMedis } from '@/actions/kesehatan';
import { getSemuaKambing } from '@/actions/kambing';
import { formatTanggal } from '@/lib/calculations';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import FAB from '@/components/layout/FAB';

export default async function KesehatanPage() {
  const riwayatMedis = await getRiwayatMedis();
  const semuaKambing = await getSemuaKambing();

  // Cari kambing yang waktunya obat cacing (3 bulan sekali)
  // Logic: 3 bulan dari hari ini (atau belum pernah)
  // Untuk mock logic ini, kita bisa hitung dari rekam medis terakhir yang penanganannya ada "obat cacing",
  // atau kalau belum pernah, hitung dari tanggal lahir.
  // Karena keterbatasan data di awal, kita asumsikan semua kambing yang umurnya > 3 bulan
  // butuh obat cacing kecuali ada record di 3 bulan terakhir.

  const now = new Date();
  const tigaBulanLalu = new Date();
  tigaBulanLalu.setMonth(tigaBulanLalu.getMonth() - 3);

  const butuhObatCacing = semuaKambing.filter(k => {
    // Umur harus > 3 bulan
    if (k.tanggal_lahir > tigaBulanLalu) return false;
    
    // Cek rekam medis
    const pernahCacingan = k.rekam_medis?.find(r => 
      r.gejala.toLowerCase().includes('cacing') || 
      r.penanganan.toLowerCase().includes('cacing')
    );

    if (pernahCacingan && pernahCacingan.tanggal > tigaBulanLalu) {
      return false; // Sudah diberi obat cacing dalam 3 bulan terakhir
    }

    return true;
  });

  return (
    <>
      <Header />
      
      <main className="p-3.5 pb-[90px] animate-fade-in">
        <div className="flex items-center justify-between mb-[13px]">
          <h1 className="font-[family-name:var(--font-serif)] text-xl text-text">P3K & Rekam Medis</h1>
        </div>

        {/* ALERTS */}
        {butuhObatCacing.length > 0 && (
          <div className="bg-warning-light border border-[#E8C080] rounded-[16px] p-3 mb-2 flex items-center gap-3">
            <div className="text-[26px]">🪱</div>
            <div>
              <div className="text-[13px] font-bold text-warning">Pengingat Obat Cacing</div>
              <div className="text-[11px] text-text-md mt-0.5 leading-[1.4]">
                <strong>{butuhObatCacing.slice(0, 3).map(k => k.nama || k.id_sistem).join(', ')}</strong> {butuhObatCacing.length > 3 ? `dan ${butuhObatCacing.length - 3} lainnya` : ''} — sudah waktunya (tiap 3 bulan).
              </div>
            </div>
          </div>
        )}

        <div className="bg-info-light border border-[#AED0F0] rounded-[16px] p-3 mb-4 flex items-center gap-3">
          <div className="text-[26px]">🧊</div>
          <div>
            <div className="text-[13px] font-bold text-info">Cek Stok Mineral Blok</div>
            <div className="text-[11px] text-text-md mt-0.5 leading-[1.4]">
              Pastikan mineral blok tersedia di setiap kandang kolon.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 mb-3">
          <div className="text-sm font-bold flex items-center gap-1">📋 Riwayat Pengobatan</div>
        </div>

        {/* RIWAYAT MEDIS LIST */}
        {riwayatMedis.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-sm text-text-sm italic">Belum ada rekam medis yang dicatat.</div>
          </div>
        ) : (
          riwayatMedis.map(r => (
            <div key={r.id} className="bg-surface rounded-[16px] border border-border p-[13px_14px] mb-[9px] shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] flex items-start gap-3">
              <div className="text-[22px] flex-shrink-0 mt-px">
                {r.kambing.jenis_kelamin === 'JANTAN' ? '🐐' : '🐑'}
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold">
                  {r.kambing.nama || 'Tanpa Nama'} <span className="text-[10px] text-text-sm font-medium font-mono ml-1">{r.kambing.id_sistem}</span>
                </div>
                <div className="text-[11.5px] text-warning font-semibold mt-1">⚠️ {r.gejala}</div>
                <div className="text-[11px] text-text-sm mt-0.5">💊 {r.penanganan}</div>
                <div className="text-[10px] text-text-sm mt-1">📅 {formatTanggal(r.tanggal)}</div>
              </div>
              <div className="flex-shrink-0">
                <span className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-primary-light text-primary">Tercatat</span>
              </div>
            </div>
          ))
        )}
      </main>

      <FAB />
      <BottomNav />
    </>
  );
}
