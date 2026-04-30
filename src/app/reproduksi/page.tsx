import { getReproData, getJadwalBirahi } from '@/actions/reproduksi';
import { formatTanggal, hitungSisaHari } from '@/lib/calculations';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import FAB from '@/components/layout/FAB';

export default async function ReproduksiPage() {
  const buntingData = await getReproData();
  const birahiData = await getJadwalBirahi();

  return (
    <>
      <Header />
      
      <main className="p-3.5 pb-[90px] animate-fade-in">
        <div className="flex items-center justify-between mb-[13px]">
          <h1 className="font-[family-name:var(--font-serif)] text-xl text-text">Reproduksi</h1>
        </div>

        {/* ALERTS */}
        {buntingData.map(b => {
          const sisaHari = hitungSisaHari(b.prediksi_lahir);
          if (sisaHari <= 30 && sisaHari >= 0) {
            return (
              <div key={`alert-${b.id}`} className="bg-danger-light border border-[#E8AEAE] rounded-[16px] p-3 mb-[13px] flex items-start gap-2.5">
                <div className="text-lg mt-px flex-shrink-0">🚨</div>
                <div>
                  <div className="text-[12.5px] font-bold text-danger">Bunting Tua — Butuh Perhatian!</div>
                  <div className="text-[11.5px] text-text-md mt-0.5 leading-[1.4]">
                    <strong>{b.kambing_betina.nama || b.kambing_betina.id_sistem}</strong> masuk H-{sisaHari} menjelang prediksi lahir. Turunkan dari kandang!
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* BUNTING LIST */}
        {buntingData.length > 0 ? (
          buntingData.map(b => {
            const sisaHari = hitungSisaHari(b.prediksi_lahir);
            const isWarn = sisaHari <= 30 && sisaHari >= 0;

            return (
              <div key={b.id} className="bg-surface rounded-[16px] border border-border p-3.5 mb-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2.5 mb-[11px]">
                  <div className="text-[26px]">🐑</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{b.kambing_betina.nama || 'Tanpa Nama'}</div>
                    <div className="text-[10px] text-text-sm font-mono">{b.kambing_betina.id_sistem}</div>
                  </div>
                  <div className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-accent-light text-accent">Bunting</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-surface2 rounded-lg p-2 px-2.5">
                    <div className="text-[10px] font-bold text-text-sm uppercase tracking-wider mb-0.5">Tanggal Kawin</div>
                    <div className="text-[13px] font-bold">{formatTanggal(b.tanggal_kawin)}</div>
                  </div>
                  <div className="bg-surface2 rounded-lg p-2 px-2.5">
                    <div className="text-[10px] font-bold text-text-sm uppercase tracking-wider mb-0.5">Pejantan</div>
                    <div className="text-[11.5px] font-bold">{b.pejantan?.nama || b.pejantan?.id_sistem || '—'}</div>
                  </div>
                </div>

                <div className={`rounded-[9px] p-2 px-2.5 mt-[9px] flex items-center gap-[9px] border ${
                  isWarn ? 'bg-warning-light border-warning/15' : 'bg-primary-light border-primary/12'
                }`}>
                  <div className="text-[17px]">{isWarn ? '⚠️' : '📅'}</div>
                  <div>
                    <div className={`text-[11px] font-semibold ${isWarn ? 'text-warning' : 'text-primary'}`}>
                      Prediksi lahir: {formatTanggal(b.prediksi_lahir)}
                    </div>
                    <div>
                      <span className={`font-[family-name:var(--font-serif)] text-[22px] font-bold mr-[3px] ${isWarn ? 'text-warning' : 'text-primary'}`}>
                        {sisaHari < 0 ? 0 : sisaHari}
                      </span>
                      <span className={`text-[12px] font-bold ${isWarn ? 'text-warning' : 'text-primary'}`}>hari lagi</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6">
            <div className="text-sm text-text-sm italic">Tidak ada kambing yang sedang bunting.</div>
          </div>
        )}

        <div className="flex items-center justify-between mt-1.5 mb-3">
          <div className="text-sm font-bold">⏰ Jadwal Birahi Selanjutnya</div>
        </div>

        {/* BIRAHI LIST */}
        {birahiData.length > 0 ? (
          birahiData.map(b => {
            // Prediksi birahi adalah 60 hari setelah kelahiran terakhir
            const tglLahir = new Date(b.tanggal_kawin); // Actually we should use actual birth date, but since we don't store it in riwayat_kawin... wait.
            // In PRD, birahi = 60 days after "selesai melahirkan". We need the date they gave birth.
            // Actually, since RiwayatKawin doesn't store updated_at or actual birth date, we use prediksi_lahir.
            const tglBirahi = new Date(b.prediksi_lahir);
            tglBirahi.setDate(tglBirahi.getDate() + 60);
            
            const sisaHari = hitungSisaHari(tglBirahi);
            const isReady = sisaHari <= 0;

            return (
              <div key={`birahi-${b.id}`} className="bg-surface rounded-[16px] border border-border p-3.5 mb-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2.5 mb-[11px]">
                  <div className="text-[26px]">🐑</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{b.kambing_betina.nama || 'Tanpa Nama'}</div>
                    <div className="text-[10px] text-text-sm font-mono">{b.kambing_betina.id_sistem}</div>
                  </div>
                  {isReady ? (
                    <div className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-[#FFF0F6] text-[#B83570]">Siap Kawin</div>
                  ) : (
                    <div className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-[#E6EFF9] text-[#1A5C9E]">Menyusui</div>
                  )}
                </div>

                <div className={`rounded-[9px] p-2 px-2.5 mt-[9px] flex items-center gap-[9px] border ${
                  isReady 
                    ? 'bg-primary-light border-primary/12' 
                    : 'bg-warning-light border-warning/15'
                }`}>
                  <div className="text-[17px]">{isReady ? '✅' : '💘'}</div>
                  <div>
                    <div className={`text-[11px] font-semibold ${isReady ? 'text-primary' : 'text-warning'}`}>
                      {isReady ? 'Sudah masuk masa birahi' : 'Prediksi birahi'}
                    </div>
                    <div>
                      <span className={`font-[family-name:var(--font-serif)] text-[22px] font-bold mr-[3px] ${isReady ? 'text-primary' : 'text-warning'}`}>
                        {isReady ? 0 : sisaHari}
                      </span>
                      <span className={`text-[12px] font-bold ${isReady ? 'text-primary' : 'text-warning'}`}>
                        {isReady ? ' hari — jadwalkan sekarang!' : ' hari lagi'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6">
            <div className="text-sm text-text-sm italic">Tidak ada jadwal birahi dalam waktu dekat.</div>
          </div>
        )}

      </main>

      <FAB />
      <BottomNav />
    </>
  );
}
