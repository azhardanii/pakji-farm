'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { catatKelahiran, getReproData } from '@/actions/reproduksi';

interface BuntingItem {
  id: string;
  kambing_betina_id: string;
  kambing_betina: { id: string; nama: string | null; id_sistem: string };
}

export default function CatatKelahiranForm({ onSuccess, defaultBetinaId }: { onSuccess: () => void; defaultBetinaId?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [buntingList, setBuntingList] = useState<BuntingItem[]>([]);

  useEffect(() => {
    getReproData().then(data => setBuntingList(data as unknown as BuntingItem[]));
  }, []);

  const defaultBuntingItem = defaultBetinaId ? buntingList.find(b => b.kambing_betina_id === defaultBetinaId) : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const selectedId = defaultBuntingItem?.id || (form.get('riwayat_kawin_id') as string);
    const selected = buntingList.find(b => b.id === selectedId);
    if (!selected) return;

    startTransition(async () => {
      await catatKelahiran({
        kambing_betina_id: selected.kambing_betina_id,
        riwayat_kawin_id: selectedId,
        tanggal_lahir: form.get('tanggal_lahir') as string,
        jumlah_cempe: parseInt(form.get('jumlah_cempe') as string) || 1,
      });
      router.refresh();
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {!defaultBetinaId && (
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Induk Betina (Bunting)</label>
          <select name="riwayat_kawin_id" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" required={!defaultBetinaId}>
            <option value="">Pilih induk bunting...</option>
            {buntingList.map(b => (
              <option key={b.id} value={b.id}>
                {b.kambing_betina.nama || '—'} ({b.kambing_betina.id_sistem}) — Bunting
              </option>
            ))}
          </select>
        </div>
      )}
      {defaultBetinaId && !defaultBuntingItem && buntingList.length > 0 && (
        <div className="mb-3.5 text-danger text-xs font-bold bg-danger-light p-2 rounded">Kambing ini tidak tercatat bunting. Tidak bisa mencatat kelahiran.</div>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Tanggal Lahir</label>
          <input name="tanggal_lahir" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" type="date" required />
        </div>
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Jumlah Cempe</label>
          <input name="jumlah_cempe" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" type="number" placeholder="1" min="1" max="4" defaultValue={1} required />
        </div>
      </div>
      <div className="bg-accent-light rounded-[9px] p-[11px] text-xs text-accent font-semibold mb-3.5 border border-accent/15">
        ⏰ Setelah disimpan, sistem akan set <strong>timer birahi 60 hari</strong> ke depan.
      </div>
      <button type="submit" disabled={isPending} className="w-full p-3.5 bg-primary text-white border-none rounded-[11px] text-sm font-bold cursor-pointer mt-1 transition-colors active:bg-primary-d disabled:opacity-50">
        {isPending ? '⏳ Menyimpan...' : '💾 Simpan Kelahiran'}
      </button>
    </form>
  );
}
