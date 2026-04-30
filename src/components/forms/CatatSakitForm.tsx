'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { catatSakit } from '@/actions/kesehatan';
import { getKambingAktif } from '@/actions/kambing';

export default function CatatSakitForm({ onSuccess }: { onSuccess: () => void }) {
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
      await catatSakit({
        kambing_id: form.get('kambing_id') as string,
        tanggal: form.get('tanggal') as string,
        gejala: form.get('gejala') as string,
        penanganan: form.get('penanganan') as string,
      });
      router.refresh();
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3.5">
        <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Pilih Kambing</label>
        <select name="kambing_id" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" required>
          <option value="">Pilih kambing...</option>
          {kambingList.map(k => (
            <option key={k.id} value={k.id}>{k.nama || '—'} ({k.id_sistem})</option>
          ))}
        </select>
      </div>
      <div className="mb-3.5">
        <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Tanggal Sakit</label>
        <input name="tanggal" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" type="date" required />
      </div>
      <div className="mb-3.5">
        <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Gejala</label>
        <select name="gejala" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" required>
          <option value="Kembung">Kembung</option>
          <option value="Kuku Busuk">Kuku Busuk</option>
          <option value="Cacingan">Cacingan</option>
          <option value="Diare">Diare</option>
          <option value="Nafsu Makan Turun">Nafsu Makan Turun</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>
      <div className="mb-3.5">
        <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Obat / Racikan</label>
        <input name="penanganan" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" type="text" placeholder="cth: Bio-HOK, Minyak Goreng 50ml..." required />
      </div>
      <button type="submit" disabled={isPending} className="w-full p-3.5 bg-primary text-white border-none rounded-[11px] text-sm font-bold cursor-pointer mt-1 transition-colors active:bg-primary-d disabled:opacity-50">
        {isPending ? '⏳ Menyimpan...' : '💾 Simpan Rekam Medis'}
      </button>
    </form>
  );
}
