'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { tambahTong } from '@/actions/silase';

export default function TambahSilaseForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      await tambahTong({
        nomor: parseInt(form.get('nomor') as string) || 0,
        tanggal_pembuatan: form.get('tanggal_pembuatan') as string,
        kapasitas_kg: parseFloat(form.get('kapasitas') as string) || 0,
      });
      router.refresh();
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Nomor Tong</label>
          <input name="nomor" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" type="number" placeholder="#6" required />
        </div>
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Tanggal Pembuatan</label>
          <input name="tanggal_pembuatan" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" type="date" required />
        </div>
      </div>
      <div className="mb-3.5">
        <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Kapasitas (kg)</label>
        <input name="kapasitas" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" type="number" placeholder="50" required />
      </div>
      <div className="bg-primary-light rounded-[9px] p-[11px] text-xs text-primary font-semibold mb-3.5 border border-primary/12">
        ⏰ Tong akan siap dibuka otomatis setelah <strong>21 hari</strong>.
      </div>
      <button type="submit" disabled={isPending} className="w-full p-3.5 bg-primary text-white border-none rounded-[11px] text-sm font-bold cursor-pointer mt-1 transition-colors active:bg-primary-d disabled:opacity-50">
        {isPending ? '⏳ Menyimpan...' : '💾 Simpan Tong'}
      </button>
    </form>
  );
}
