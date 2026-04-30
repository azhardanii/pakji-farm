'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatTanggal, hitungSisaSilase } from '@/lib/calculations';
import { tambahTong, hapusTong } from '@/actions/silase';
import Modal from '@/components/ui/Modal';

interface PakanClientProps {
  initialJumlahEkor: number;
  initialRataBobot: number;
  initialTotalBobot: number;
  pakanData: { totalPakan: number; silase: number; segar: number };
  tongList: any[];
}

export default function PakanClient({ initialJumlahEkor, initialRataBobot, initialTotalBobot, pakanData, tongList }: PakanClientProps) {
  const router = useRouter();
  const [ekor, setEkor] = useState(initialJumlahEkor);
  const [bobot, setBobot] = useState(initialRataBobot);
  
  // State for Add Tong Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomor, setNomor] = useState('');
  const [kapasitas, setKapasitas] = useState('100');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleTambahTong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomor || !kapasitas || !tanggal) return;
    
    setLoading(true);
    await tambahTong({
      nomor: parseInt(nomor),
      kapasitas_kg: parseFloat(kapasitas),
      tanggal_pembuatan: tanggal,
    });
    setLoading(false);
    setIsModalOpen(false);
    setNomor('');
    router.refresh();
  };

  const handleDeleteTong = async (id: string) => {
    if (confirm('Yakin ingin menghapus tong silase ini?')) {
      await hapusTong(id);
      router.refresh();
    }
  };

  // Manual calculation overrides auto if user types
  const computedTotalPakan = (ekor * bobot) * 0.10;
  const computedSilase = computedTotalPakan * 0.6;
  const computedSegar = computedTotalPakan * 0.4;

  const totalStr = Math.round(computedTotalPakan * 10) / 10;
  const silaseStr = Math.round(computedSilase * 10) / 10;
  const segarStr = Math.round(computedSegar * 10) / 10;

  return (
    <>
      <div className="flex items-center justify-between mb-[13px]">
        <h1 className="font-[family-name:var(--font-serif)] text-xl text-text">Manajemen Pakan</h1>
      </div>

      {/* KALKULATOR PAKAN */}
      <div className="bg-surface rounded-[16px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] border border-border mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-text-sm mb-3.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
          Kalkulator Pakan Harian
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Jumlah Ekor</label>
            <input 
              className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" 
              type="number" 
              value={ekor} 
              onChange={e => setEkor(parseFloat(e.target.value) || 0)} 
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Rata-rata Bobot (kg)</label>
            <input 
              className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" 
              type="number" 
              value={bobot} 
              onChange={e => setBobot(parseFloat(e.target.value) || 0)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center bg-surface2 rounded-[11px] p-[13px_10px] border border-border">
          <div>
            <div className="text-[9px] text-text-sm font-bold uppercase tracking-wider mb-1">Total</div>
            <div className="font-[family-name:var(--font-serif)] text-[22px] text-text">{totalStr} kg</div>
          </div>
          <div>
            <div className="text-[9px] text-primary font-bold uppercase tracking-wider mb-1">Silase 60%</div>
            <div className="font-[family-name:var(--font-serif)] text-[22px] text-primary">{silaseStr} kg</div>
          </div>
          <div>
            <div className="text-[9px] text-accent font-bold uppercase tracking-wider mb-1">Segar 40%</div>
            <div className="font-[family-name:var(--font-serif)] text-[22px] text-accent">{segarStr} kg</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-[13px] mt-4">
        <div className="text-sm font-bold flex items-center gap-1">🪣 Log Stok Tong Silase</div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-[11px] font-bold bg-primary text-white py-1.5 px-3 rounded-full active:scale-95 transition-transform"
        >
          + Tambah Tong
        </button>
      </div>

      {/* TONG SILASE LIST */}
      <div>
        {tongList.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-sm text-text-sm italic">Belum ada tong silase yang dicatat.</div>
          </div>
        ) : (
          tongList.map(t => {
            const { sisaHari, siap } = hitungSisaSilase(t.tanggal_pembuatan);

            return (
              <div key={t.id} className="bg-surface rounded-[16px] border border-border p-[13px_14px] mb-[9px] shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] flex items-center gap-3">
                <div className={`w-[42px] h-[42px] rounded-[11px] text-white flex items-center justify-center font-bold text-sm font-[family-name:var(--font-serif)] flex-shrink-0 ${siap ? 'bg-accent' : 'bg-primary'}`}>
                  #{t.nomor}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold">Tong Silase #{t.nomor} · {t.kapasitas_kg} kg</div>
                  <div className="text-[11px] text-text-sm mt-0.5">Dibuat: {formatTanggal(t.tanggal_pembuatan)}</div>
                  <div className="mt-1.5">
                    <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide ${siap ? 'bg-accent-light text-accent' : 'bg-primary-light text-primary'}`}>
                      {siap ? '✅ Siap Dibuka' : '⏳ Fermentasi'}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div>
                    <div className={`font-[family-name:var(--font-serif)] text-[24px] ${siap ? 'text-accent' : 'text-primary'}`}>
                      {siap ? '✓' : sisaHari}
                    </div>
                    <div className="text-[9px] text-text-sm font-bold uppercase tracking-wider">
                      {siap ? 'siap' : 'hari lagi'}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteTong(t.id)}
                    className="w-7 h-7 flex items-center justify-center bg-danger-light text-danger rounded-[9px] active:scale-95 mt-1"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="🪣 Tambah Tong Silase">
        <form onSubmit={handleTambahTong} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Nomor Tong</label>
            <input 
              required
              type="number" 
              className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface text-text outline-none focus:border-primary"
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              placeholder="Contoh: 1"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Kapasitas (kg)</label>
            <input 
              required
              type="number" 
              className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface text-text outline-none focus:border-primary"
              value={kapasitas}
              onChange={(e) => setKapasitas(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Tanggal Pembuatan</label>
            <input 
              required
              type="date" 
              className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface text-text outline-none focus:border-primary"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-primary text-white font-bold py-3.5 rounded-[12px] active:scale-[0.98] transition-transform disabled:opacity-70"
          >
            {loading ? 'Menyimpan...' : 'Simpan Tong'}
          </button>
        </form>
      </Modal>
    </>
  );
}
