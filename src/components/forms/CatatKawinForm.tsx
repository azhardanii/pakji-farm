'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { catatKawin } from '@/actions/reproduksi';
import { getIndukanAktif } from '@/actions/kambing';
import { formatTanggal, hitungPrediksiLahir } from '@/lib/calculations';
import { Kelamin } from '@prisma/client';

export default function CatatKawinForm({ onSuccess, defaultBetinaId, defaultPejantanId }: { onSuccess: () => void; defaultBetinaId?: string; defaultPejantanId?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [betinaList, setBetinaList] = useState<Array<{ id: string; id_sistem: string; nama: string | null }>>([]);
  const [jantanList, setJantanList] = useState<Array<{ id: string; id_sistem: string; nama: string | null }>>([]);
  const [tanggalKawin, setTanggalKawin] = useState('');
  const [prediksiLahir, setPrediksiLahir] = useState('');
  const [prediksiH30, setPrediksiH30] = useState('');

  useEffect(() => {
    if (!defaultBetinaId) getIndukanAktif('BETINA' as Kelamin).then(setBetinaList);
    if (!defaultPejantanId) getIndukanAktif('JANTAN' as Kelamin).then(setJantanList);
  }, [defaultBetinaId, defaultPejantanId]);

  useEffect(() => {
    if (tanggalKawin) {
      const lahir = hitungPrediksiLahir(tanggalKawin);
      setPrediksiLahir(formatTanggal(lahir));
      const warn = new Date(tanggalKawin);
      warn.setDate(warn.getDate() + 120);
      setPrediksiH30(formatTanggal(warn));
    }
  }, [tanggalKawin]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      await catatKawin({
        kambing_betina_id: defaultBetinaId || (form.get('betina_id') as string),
        pejantan_id: defaultPejantanId || (form.get('pejantan_id') as string),
        tanggal_kawin: form.get('tanggal_kawin') as string,
      });
      router.refresh();
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {!defaultBetinaId && (
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Pilih Betina</label>
          <select name="betina_id" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" required={!defaultBetinaId}>
            <option value="">Pilih betina...</option>
            {betinaList.map(k => (
              <option key={k.id} value={k.id}>{k.nama || '—'} ({k.id_sistem})</option>
            ))}
          </select>
        </div>
      )}
      {!defaultPejantanId && (
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Pilih Pejantan</label>
          <select name="pejantan_id" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" required={!defaultPejantanId}>
            <option value="">Pilih pejantan...</option>
            {jantanList.map(k => (
              <option key={k.id} value={k.id}>{k.nama || '—'} ({k.id_sistem})</option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-3.5">
        <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Tanggal Kawin</label>
        <input name="tanggal_kawin" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm bg-surface2 text-text outline-none" type="date" value={tanggalKawin} onChange={(e) => setTanggalKawin(e.target.value)} required />
      </div>
      {tanggalKawin && (
        <div className="bg-primary-light rounded-[9px] p-[11px] text-xs text-primary font-semibold mb-3.5 border border-primary/12">
          📅 Prediksi Lahir: <strong>{prediksiLahir}</strong><br />
          ⚠️ H-30 Notifikasi: <strong>{prediksiH30}</strong>
        </div>
      )}
      <button type="submit" disabled={isPending} className="w-full p-3.5 bg-primary text-white border-none rounded-[11px] text-sm font-bold cursor-pointer mt-1 transition-colors active:bg-primary-d disabled:opacity-50">
        {isPending ? '⏳ Menyimpan...' : '💾 Simpan Perkawinan'}
      </button>
    </form>
  );
}
