'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/55 z-[500] flex items-end justify-center backdrop-blur-[3px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-surface rounded-t-[22px] w-full max-w-[430px] px-5 pt-[22px] pb-[38px] max-h-[82vh] overflow-y-auto animate-slide-up-modal"
      >
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-[18px]" />
        <h2 className="font-[family-name:var(--font-serif)] text-xl mb-[18px]">{title}</h2>
        {children}
      </div>
    </div>
  );
}
