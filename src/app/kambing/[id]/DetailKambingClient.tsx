'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hitungUmur, hitungEstimasi, formatRupiah, formatTanggal, hitungPrediksiLahir, hitungSisaHari, cekSiapJual, cekCempe } from '@/lib/calculations';
import { uploadFoto, hapusFoto } from '@/actions/foto';
import Modal from '@/components/ui/Modal';
import EditKambingForm from '@/components/forms/EditKambingForm';
import { updateMarketKambing } from '@/actions/kambing';
import { MarketType } from '@prisma/client';

import CatatSakitForm from '@/components/forms/CatatSakitForm';
import CatatMatiForm from '@/components/forms/CatatMatiForm';
import CatatJualForm from '@/components/forms/CatatJualForm';
import CatatKawinForm from '@/components/forms/CatatKawinForm';
import CatatKelahiranForm from '@/components/forms/CatatKelahiranForm';

type ActionModalType = 'sakit' | 'mati' | 'jual' | 'kawin' | 'lahir' | null;

// ── Helper: convert any image to WebP via canvas ───────
async function convertToWebP(file: File, quality = 0.82): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Cap max dimension to 1200px to keep file size small
      const MAX = 1200;
      let w = img.width;
      let h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * (MAX / w)); w = MAX; }
        else       { w = Math.round(w * (MAX / h)); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Conversion failed'));
          resolve(new File([blob], 'photo.webp', { type: 'image/webp' }));
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function DetailKambingClient({ goat }: { goat: any }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ActionModalType>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const umur = hitungUmur(goat.tanggal_lahir);
  const est = hitungEstimasi(goat.jenis_kelamin, umur.totalHari);
  
  const thumbnail = goat.foto?.[0]?.url || null;
  const isCempe = cekCempe(goat.jenis_kelamin, goat.tanggal_lahir);
  const siapJual = cekSiapJual(goat.jenis_kelamin, umur.totalHari, goat.jumlah_melahirkan);

  const isBunting = goat.riwayat_kawin_betina?.length > 0 && goat.riwayat_kawin_betina[0].status_berhasil === null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    
    try {
      // Convert to WebP client-side before uploading
      const webpFile = await convertToWebP(e.target.files[0]);
      const formData = new FormData();
      formData.append('file', webpFile);
      
      await uploadFoto(goat.id, formData);
      router.refresh();
    } catch (error) {
      alert('Gagal upload foto');
    } finally {
      setUploading(false);
    }
  };

  const handleMarketChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MarketType;
    await updateMarketKambing(goat.id, val);
    router.refresh();
  };

  return (
    <div className="pb-[90px] bg-bg min-h-screen">
      {/* Sticky Top Bar for back navigation */}
      <div className="bg-primary-d p-[14px_16px] flex items-center gap-3 sticky top-[70px] z-[10] border-t border-white/10">
        <button onClick={() => router.back()} className="w-[34px] h-[34px] rounded-[9px] bg-white/12 border border-white/20 flex items-center justify-center text-lg cursor-pointer text-white">
          ←
        </button>
        <div className="text-[15px] font-semibold text-white flex-1">Detail Kambing</div>
        <button onClick={() => setEditModalOpen(true)} className="w-[34px] h-[34px] rounded-[9px] bg-primary-light/20 border border-white/20 flex items-center justify-center text-sm cursor-pointer text-white">
          ✏️
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-light to-surface p-[20px_16px] flex gap-[14px] items-start border-b border-border shadow-sm relative">
        <div
          className="w-[78px] h-[78px] rounded-2xl bg-white border-2 border-border flex items-center justify-center text-[38px] flex-shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] overflow-hidden cursor-pointer active:scale-95 transition-transform"
          onClick={() => thumbnail && setPhotoPreview(thumbnail)}
        >
          {thumbnail ? (
            <img src={thumbnail} alt={goat.nama || 'Goat'} className="w-full h-full object-cover" />
          ) : (
            goat.jenis_kelamin === 'JANTAN' ? '🐐' : '🐑'
          )}
        </div>
        
        {/* Upload Button overlay */}
        <label className="absolute top-[85px] left-[78px] w-8 h-8 bg-surface rounded-full shadow-md border border-border flex items-center justify-center text-sm cursor-pointer z-10 active:scale-95 transition-transform">
          {uploading ? (
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            '📸'
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>

        <div>
          <div className="font-[family-name:var(--font-serif)] text-2xl text-text">
            {goat.nama || 'Tanpa Nama'}
          </div>
          <div className="text-[11px] text-text-sm font-mono tracking-wide mt-0.5">
            {goat.id_sistem}
          </div>
          
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {isCempe ? (
              <span className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-accent-light text-accent">Cempe</span>
            ) : goat.jenis_kelamin === 'JANTAN' ? (
              <span className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-[#E6EFF9] text-[#1A5C9E]">Jantan</span>
            ) : (
              <span className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-[#FFF0F6] text-[#B83570]">Betina</span>
            )}
            
            {isBunting && (
              <span className="text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide bg-accent-light text-accent">Bunting</span>
            )}

            <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full tracking-wide ${
              goat.status === 'AKTIF' ? 'bg-primary-light text-primary' : 
              goat.status === 'MATI' ? 'bg-danger-light text-danger' : 'bg-warning-light text-warning'
            }`}>
              {goat.status}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3.5">
        
        {/* Notifikasi Siap Jual */}
        {siapJual && goat.status === 'AKTIF' && (
          <div className="bg-accent-light border border-[#E8C080] rounded-[16px] p-3 flex items-start gap-2.5">
            <div className="text-lg mt-px">💰</div>
            <div>
              <div className="text-[12.5px] font-bold text-accent">Siap Jual {goat.jenis_kelamin === 'BETINA' ? '(Afkir)' : ''}</div>
              <div className="text-[11.5px] text-text-md mt-0.5 leading-[1.4]">
                Kambing ini telah mencapai target usia/kelahiran. Estimasi harga: <strong>{formatRupiah(est.harga)}</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Market Segmentation Dropdown (Betina Afkir) */}
        {siapJual && goat.jenis_kelamin === 'BETINA' && goat.status === 'AKTIF' && (
          <div className="bg-surface rounded-[16px] p-3.5 border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider text-accent">Segmentasi Pasar (Afkir)</label>
            <select 
              className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none"
              value={goat.target_market || ''}
              onChange={handleMarketChange}
            >
              <option value="">— Pilih Segmentasi —</option>
              <option value="PETERNAK">Jual ke Peternak (Indukan Spesialis)</option>
              <option value="PEMOTONG">Jual ke Pemotong (Butuh Penggemukan)</option>
            </select>
            {goat.target_market === 'PEMOTONG' && (
              <div className="text-[11px] text-danger font-bold mt-2 flex items-center gap-1.5">
                <span>🚨</span> Pindahkan ke Kandang Penggemukan
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <div className="bg-surface rounded-[16px] p-4 border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-[11.5px] text-text-sm font-medium">Jenis Kelamin</span>
            <span className="text-[13px] font-bold">{goat.jenis_kelamin === 'JANTAN' ? 'Jantan' : 'Betina'}</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-[11.5px] text-text-sm font-medium">Tanggal Lahir</span>
            <span className="text-[13px] font-bold">{formatTanggal(goat.tanggal_lahir)}</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-[11.5px] text-text-sm font-medium">Usia (Real-time)</span>
            <span className="text-[13px] font-bold">{umur.labelPanjang}</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-[11.5px] text-text-sm font-medium">Estimasi Bobot</span>
            <span className="text-[13px] font-bold text-primary">{est.bobot} kg</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-[11.5px] text-text-sm font-medium">Estimasi Valuasi</span>
            <span className="text-[13px] font-bold text-accent">{formatRupiah(est.harga)}</span>
          </div>
          {goat.jenis_kelamin === 'BETINA' && (
            <div className="flex justify-between items-center py-2.5 border-b border-border">
              <span className="text-[11.5px] text-text-sm font-medium">Riwayat Melahirkan</span>
              <span className="text-[13px] font-bold">{goat.jumlah_melahirkan} kali</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-[11.5px] text-text-sm font-medium">Induk Jantan</span>
            {goat.induk_jantan ? (
              <span onClick={() => router.push(`/kambing/${goat.induk_jantan.id}`)} className="text-[13px] font-bold text-primary cursor-pointer hover:underline">{goat.induk_jantan.nama || goat.induk_jantan.id_sistem}</span>
            ) : (
              <span className="text-[13px] font-bold">—</span>
            )}
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-[11.5px] text-text-sm font-medium">Induk Betina</span>
            {goat.induk_betina ? (
              <span onClick={() => router.push(`/kambing/${goat.induk_betina.id}`)} className="text-[13px] font-bold text-[#B83570] cursor-pointer hover:underline">{goat.induk_betina.nama || goat.induk_betina.id_sistem}</span>
            ) : (
              <span className="text-[13px] font-bold">—</span>
            )}
          </div>
        </div>

        {/* Aksi Cepat */}
        <div className="bg-surface rounded-[16px] p-4 border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-sm mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            Aksi Cepat
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setActiveModal('sakit')} className="bg-surface2 rounded-[9px] py-2 px-3 flex items-center gap-2 border border-border text-xs font-semibold text-text-md active:bg-primary-light active:border-primary">
              <span className="text-base">🩺</span> Rekam Medis
            </button>
            {goat.status === 'AKTIF' && !isCempe && goat.jenis_kelamin === 'BETINA' && !isBunting && (
              <button onClick={() => setActiveModal('kawin')} className="bg-surface2 rounded-[9px] py-2 px-3 flex items-center gap-2 border border-border text-xs font-semibold text-text-md active:bg-primary-light active:border-primary">
                <span className="text-base">💘</span> Catat Kawin
              </button>
            )}
            {goat.status === 'AKTIF' && !isCempe && goat.jenis_kelamin === 'JANTAN' && (
              <button onClick={() => setActiveModal('kawin')} className="bg-surface2 rounded-[9px] py-2 px-3 flex items-center gap-2 border border-border text-xs font-semibold text-text-md active:bg-primary-light active:border-primary">
                <span className="text-base">💘</span> Catat Kawin
              </button>
            )}
            {goat.status === 'AKTIF' && isBunting && (
              <button onClick={() => setActiveModal('lahir')} className="bg-surface2 rounded-[9px] py-2 px-3 flex items-center gap-2 border border-border text-xs font-semibold text-text-md active:bg-primary-light active:border-primary">
                <span className="text-base">🐣</span> Melahirkan
              </button>
            )}
            {goat.status === 'AKTIF' && (
              <button onClick={() => setActiveModal('jual')} className="bg-surface2 rounded-[9px] py-2 px-3 flex items-center gap-2 border border-border text-xs font-semibold text-text-md active:bg-primary-light active:border-primary">
                <span className="text-base">💰</span> Terjual
              </button>
            )}
            {goat.status === 'AKTIF' && (
              <button onClick={() => setActiveModal('mati')} className="bg-surface2 rounded-[9px] py-2 px-3 flex items-center gap-2 border border-border text-xs font-semibold text-danger active:bg-danger-light active:border-danger">
                <span className="text-base">💀</span> Catat Mati
              </button>
            )}
          </div>
        </div>

        {/* Reproduksi Card (Jika Bunting) */}
        {isBunting && (
          <div className="bg-surface rounded-[16px] p-4 border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-accent mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              Status Bunting
            </div>
            
            <div className="flex justify-between items-center py-2.5 border-b border-border">
              <span className="text-[11.5px] text-text-sm font-medium">Tanggal Kawin</span>
              <span className="text-[13px] font-bold">{formatTanggal(goat.riwayat_kawin_betina[0].tanggal_kawin)}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-border">
              <span className="text-[11.5px] text-text-sm font-medium">Pejantan</span>
              <span className="text-[13px] font-bold">{goat.riwayat_kawin_betina[0].pejantan?.nama || '—'}</span>
            </div>
            
            <div className="bg-primary-light rounded-[9px] p-2.5 mt-3 flex items-center gap-2 border border-primary/12">
              <div className="text-lg">📅</div>
              <div>
                <div className="text-[11px] font-semibold text-primary">Prediksi Lahir:</div>
                <div className="font-[family-name:var(--font-serif)] text-lg font-bold text-primary leading-tight">
                  {formatTanggal(goat.riwayat_kawin_betina[0].prediksi_lahir)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rekam Medis Preview */}
        <div className="bg-surface rounded-[16px] p-4 border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-warning flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
              Riwayat Kesehatan
            </div>
            {goat.rekam_medis?.length > 0 && (
              <button onClick={() => setActiveModal('sakit')} className="text-[10px] font-bold text-primary bg-primary-light px-2 py-1 rounded-md">
                + Tambah
              </button>
            )}
          </div>
          
          {goat.rekam_medis?.length > 0 ? (
            <div className="space-y-3">
              {goat.rekam_medis.slice(0,3).map((r: any) => (
                <div key={r.id} className="border-b border-border last:border-0 pb-2 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="text-[12.5px] font-bold text-text-md">⚠️ {r.gejala}</div>
                    <div className="text-[10px] text-text-sm">{formatTanggal(r.tanggal)}</div>
                  </div>
                  <div className="text-[11px] text-text-sm mt-0.5">💊 {r.penanganan}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-surface2 rounded-[10px] border border-border/50">
              <div className="text-xl mb-1">🌿</div>
              <div className="text-[11.5px] font-semibold text-text-md">Belum pernah sakit</div>
              <div className="text-[10px] text-text-sm">Kambing dalam kondisi sehat!</div>
            </div>
          )}
        </div>
        
      </div>

      {/* ── Photo Preview Popup ── */}
      {photoPreview && (
        <div
          className="fixed inset-0 bg-black/80 z-[600] flex items-center justify-center backdrop-blur-sm animate-fade-in"
          onClick={() => setPhotoPreview(null)}
        >
          <div className="relative max-w-[400px] w-[92%] animate-slide-up-modal" onClick={e => e.stopPropagation()}>
            <img
              src={photoPreview}
              alt={goat.nama || 'Foto Kambing'}
              className="w-full rounded-2xl shadow-2xl border-2 border-white/20"
              style={{ maxHeight: '75vh', objectFit: 'contain' }}
            />
            <div className="text-center mt-3 text-white/80 text-xs font-semibold">
              {goat.nama || goat.id_sistem}
            </div>
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-lg text-text font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="✏️ Edit Data Kambing">
        <EditKambingForm goat={goat} onSuccess={() => setEditModalOpen(false)} />
      </Modal>

      {/* Quick Action Modals */}
      <Modal isOpen={activeModal === 'sakit'} onClose={() => setActiveModal(null)} title="🩺 Catat Pengobatan">
        <CatatSakitForm onSuccess={() => setActiveModal(null)} defaultKambingId={goat.id} />
      </Modal>

      <Modal isOpen={activeModal === 'mati'} onClose={() => setActiveModal(null)} title="💀 Catat Kambing Mati">
        <CatatMatiForm onSuccess={() => setActiveModal(null)} defaultKambingId={goat.id} />
      </Modal>

      <Modal isOpen={activeModal === 'jual'} onClose={() => setActiveModal(null)} title="💰 Catat Penjualan">
        <CatatJualForm onSuccess={() => setActiveModal(null)} defaultKambingId={goat.id} />
      </Modal>

      <Modal isOpen={activeModal === 'kawin'} onClose={() => setActiveModal(null)} title="💘 Catat Perkawinan">
        <CatatKawinForm 
          onSuccess={() => setActiveModal(null)} 
          defaultBetinaId={goat.jenis_kelamin === 'BETINA' ? goat.id : undefined}
          defaultPejantanId={goat.jenis_kelamin === 'JANTAN' ? goat.id : undefined}
        />
      </Modal>

      <Modal isOpen={activeModal === 'lahir'} onClose={() => setActiveModal(null)} title="🐣 Catat Kelahiran">
        <CatatKelahiranForm onSuccess={() => setActiveModal(null)} defaultBetinaId={goat.id} />
      </Modal>
    </div>
  );
}
