'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateKambing, getIndukanAktif } from '@/actions/kambing';
import { Kelamin } from '@prisma/client';
import { formatTanggal } from '@/lib/calculations';
import toast from 'react-hot-toast';

export default function EditKambingForm({ goat, onSuccess }: { goat: any, onSuccess: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [jantanList, setJantanList] = useState<Array<{ id: string; id_sistem: string; nama: string | null }>>([]);
  const [betinaList, setBetinaList] = useState<Array<{ id: string; id_sistem: string; nama: string | null }>>([]);

  useEffect(() => {
    getIndukanAktif('JANTAN' as Kelamin).then(setJantanList);
    getIndukanAktif('BETINA' as Kelamin).then(setBetinaList);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateKambing(goat.id, {
          nama: form.get('nama') as string,
          jenis_kelamin: form.get('jenis_kelamin') as Kelamin,
          tanggal_lahir: form.get('tanggal_lahir') as string,
          induk_jantan_id: (form.get('induk_jantan_id') as string) || undefined,
          induk_betina_id: (form.get('induk_betina_id') as string) || undefined,
        });
        toast.success('Data kambing berhasil diperbarui!');
        router.refresh();
        onSuccess();
      } catch (error) {
        toast.error('Gagal memperbarui data kambing');
      }
    });
  };
  
  // Format tanggal_lahir untuk input type="date" (YYYY-MM-DD)
  const defaultDate = new Date(goat.tanggal_lahir).toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3.5">
        <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Nama / Tag Telinga</label>
        <input name="nama" defaultValue={goat.nama || ''} className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none transition-all" type="text" placeholder="cth: Melati, Jago-03..." required />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Jenis Kelamin</label>
          <select name="jenis_kelamin" defaultValue={goat.jenis_kelamin} className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none" required>
            <option value="JANTAN">Jantan</option>
            <option value="BETINA">Betina</option>
          </select>
        </div>
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Tanggal Lahir/Masuk</label>
          <input name="tanggal_lahir" defaultValue={defaultDate} className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none" type="date" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Induk Jantan</label>
          <select name="induk_jantan_id" defaultValue={goat.induk_jantan_id || ''} className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none">
            <option value="">— Tidak ada —</option>
            {/* Sertakan parent saat ini kalau-kalau tidak masuk list filter usia */}
            {goat.induk_jantan && !jantanList.find(j => j.id === goat.induk_jantan_id) && (
              <option value={goat.induk_jantan_id}>{goat.induk_jantan.nama || goat.induk_jantan.id_sistem}</option>
            )}
            {jantanList.map(k => (
              <option key={k.id} value={k.id}>{k.nama || k.id_sistem}</option>
            ))}
          </select>
        </div>
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Induk Betina</label>
          <select name="induk_betina_id" defaultValue={goat.induk_betina_id || ''} className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none">
            <option value="">— Tidak ada —</option>
            {/* Sertakan parent saat ini kalau-kalau tidak masuk list filter usia */}
            {goat.induk_betina && !betinaList.find(b => b.id === goat.induk_betina_id) && (
              <option value={goat.induk_betina_id}>{goat.induk_betina.nama || goat.induk_betina.id_sistem}</option>
            )}
            {betinaList.map(k => (
              <option key={k.id} value={k.id}>{k.nama || k.id_sistem}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" disabled={isPending} className="w-full p-3.5 bg-primary text-white border-none rounded-[11px] text-sm font-bold font-[family-name:var(--font-sans)] cursor-pointer mt-1 transition-colors active:bg-primary-d disabled:opacity-50">
        {isPending ? '⏳ Menyimpan...' : '💾 Update Data'}
      </button>
    </form>
  );
}
