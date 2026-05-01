'use client';

import { useState } from 'react';
import { formatTanggal } from '@/lib/calculations';
import Modal from '@/components/ui/Modal';
import CatatSakitForm from '@/components/forms/CatatSakitForm';

interface RiwayatItem {
  id: string;
  tanggal: Date;
  gejala: string;
  penanganan: string;
  kambing: {
    id: string;
    nama: string | null;
    id_sistem: string;
    jenis_kelamin: string;
  };
}

export default function KesehatanClient({ riwayatMedis }: { riwayatMedis: RiwayatItem[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <main className="p-3.5 pb-[90px] animate-fade-in">
      <div className="flex items-center justify-between mb-[13px]">
        <h1 className="font-[family-name:var(--font-serif)] text-xl text-text">P3K & Rekam Medis</h1>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold flex items-center gap-1">📋 Riwayat Pengobatan</div>
        <button
          onClick={() => setShowModal(true)}
          className="text-[11px] font-bold text-white bg-primary px-3 py-1.5 rounded-[8px] active:bg-primary-d transition-colors"
        >
          + Tambah Rekam Medis
        </button>
      </div>

      {/* RIWAYAT MEDIS LIST */}
      {riwayatMedis.length === 0 ? (
        <div className="text-center py-10 bg-surface rounded-[16px] border border-border">
          <div className="text-[40px] mb-2 opacity-40">🩺</div>
          <div className="text-sm text-text-sm">Belum ada rekam medis yang dicatat.</div>
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

      {/* Modal Tambah Rekam Medis */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="🩺 Catat Pengobatan">
        <CatatSakitForm onSuccess={() => setShowModal(false)} />
      </Modal>
    </main>
  );
}
