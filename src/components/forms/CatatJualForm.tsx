'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStatusKambing, getKambingAktif } from '@/actions/kambing';
import { StatusKambing } from '@prisma/client';
import toast from 'react-hot-toast';

export default function CatatJualForm({ onSuccess, defaultKambingId }: { onSuccess: () => void; defaultKambingId?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [kambingList, setKambingList] = useState<Array<{ id: string; id_sistem: string; nama: string | null }>>([]);

  useEffect(() => {
    getKambingAktif().then(setKambingList);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateStatusKambing(defaultKambingId || (form.get('kambing_id') as string), StatusKambing.TERJUAL);
        toast.success('Kambing berhasil dicatat sebagai Terjual!');
        router.refresh();
        onSuccess();
      } catch (error) {
        toast.error('Gagal mencatat data jual');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {!defaultKambingId && (
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Pilih Kambing</label>
          <select name="kambing_id" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" required={!defaultKambingId}>
            <option value="">Pilih kambing...</option>
            {kambingList.map(k => (
              <option key={k.id} value={k.id}>{k.nama || '—'} ({k.id_sistem})</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Tanggal Jual</label>
          <input name="tanggal" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" type="date" required />
        </div>
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Harga Jual (Rp)</label>
          <input name="harga" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" type="number" placeholder="1500000" required />
        </div>
      </div>
      <div className="mb-3.5">
        <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Pembeli</label>
        <input name="pembeli" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" type="text" placeholder="Nama pembeli / keterangan" required />
      </div>
      <button type="submit" disabled={isPending} className="w-full p-3.5 bg-accent text-white border-none rounded-[11px] text-sm font-bold cursor-pointer mt-1 transition-colors active:bg-[#9a5b1a] disabled:opacity-50">
        {isPending ? '⏳ Menyimpan...' : '💾 Simpan Penjualan'}
      </button>
    </form>
  );
}
