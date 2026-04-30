'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import TambahKambingForm from '@/components/forms/TambahKambingForm';
import CatatKawinForm from '@/components/forms/CatatKawinForm';
import CatatKelahiranForm from '@/components/forms/CatatKelahiranForm';
import CatatSakitForm from '@/components/forms/CatatSakitForm';
import CatatMatiForm from '@/components/forms/CatatMatiForm';
import CatatJualForm from '@/components/forms/CatatJualForm';

type ModalType = 'tambah' | 'kawin' | 'lahir' | 'sakit' | 'mati' | 'jual' | null;

const fabItems: { icon: string; label: string; modal: ModalType }[] = [
  { icon: '🐣', label: 'Catat Kelahiran', modal: 'lahir' },
  { icon: '💘', label: 'Catat Kawin', modal: 'kawin' },
  { icon: '➕', label: 'Tambah Kambing', modal: 'tambah' },
  { icon: '💀', label: 'Kambing Mati', modal: 'mati' },
  { icon: '🩺', label: 'Catat Sakit', modal: 'sakit' },
  { icon: '💰', label: 'Catat Terjual', modal: 'jual' },
];

export default function FAB() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (modal: ModalType) => {
    setMenuOpen(false);
    setTimeout(() => setActiveModal(modal), 150);
  };

  const closeModal = () => setActiveModal(null);

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed bottom-[74px] left-1/2 -translate-x-1/2 w-[54px] h-[54px] bg-accent rounded-full flex items-center justify-center text-[26px] text-white font-light shadow-[0_4px_20px_rgba(181,107,31,0.5)] cursor-pointer z-[201] transition-transform active:scale-[0.93] hover:shadow-[0_6px_28px_rgba(181,107,31,0.6)] border-[4px] border-bg"
        style={{ animation: 'pulse-glow 2s infinite' }}
      >
        ＋
      </button>

      {/* FAB Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/55 z-[300] flex items-end justify-center backdrop-blur-[3px]"
          onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false); }}
        >
          <div className="bg-surface w-full max-w-[430px] rounded-t-[22px] px-[18px] pt-5 pb-9 animate-slide-up-modal">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-[18px]" />
            <div className="text-[11px] text-text-sm font-bold mb-3.5 uppercase tracking-widest">
              Input Cepat
            </div>
            <div className="grid grid-cols-2 gap-[9px]">
              {fabItems.map((item) => (
                <button
                  key={item.modal}
                  onClick={() => openModal(item.modal)}
                  className="bg-surface2 rounded-[10px] px-[11px] py-[13px] flex items-center gap-[9px] cursor-pointer transition-colors border border-border active:bg-primary-light active:border-primary text-left"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-semibold text-text-md">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={activeModal === 'tambah'} onClose={closeModal} title="➕ Tambah Kambing Baru">
        <TambahKambingForm onSuccess={closeModal} />
      </Modal>

      <Modal isOpen={activeModal === 'kawin'} onClose={closeModal} title="💘 Catat Perkawinan">
        <CatatKawinForm onSuccess={closeModal} />
      </Modal>

      <Modal isOpen={activeModal === 'lahir'} onClose={closeModal} title="🐣 Catat Kelahiran">
        <CatatKelahiranForm onSuccess={closeModal} />
      </Modal>

      <Modal isOpen={activeModal === 'sakit'} onClose={closeModal} title="🩺 Catat Pengobatan">
        <CatatSakitForm onSuccess={closeModal} />
      </Modal>

      <Modal isOpen={activeModal === 'mati'} onClose={closeModal} title="💀 Catat Kambing Mati">
        <CatatMatiForm onSuccess={closeModal} />
      </Modal>

      <Modal isOpen={activeModal === 'jual'} onClose={closeModal} title="💰 Catat Penjualan">
        <CatatJualForm onSuccess={closeModal} />
      </Modal>
    </>
  );
}
