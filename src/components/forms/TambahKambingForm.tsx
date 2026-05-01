'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { tambahKambing, getIndukanAktif } from '@/actions/kambing';
import { uploadFoto } from '@/actions/foto';
import { Kelamin } from '@prisma/client';
import toast from 'react-hot-toast';

export default function TambahKambingForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [jantanList, setJantanList] = useState<Array<{ id: string; id_sistem: string; nama: string | null }>>([]);
  const [betinaList, setBetinaList] = useState<Array<{ id: string; id_sistem: string; nama: string | null }>>([]);

  useEffect(() => {
    getIndukanAktif('JANTAN' as Kelamin).then(setJantanList);
    getIndukanAktif('BETINA' as Kelamin).then(setBetinaList);
  }, []);

  // Convert image to WebP client-side
  const convertToWebP = (file: File, quality = 0.82): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
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
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const kambing = await tambahKambing({
          nama: form.get('nama') as string,
          jenis_kelamin: form.get('jenis_kelamin') as Kelamin,
          tanggal_lahir: form.get('tanggal_lahir') as string,
          induk_jantan_id: (form.get('induk_jantan_id') as string) || undefined,
          induk_betina_id: (form.get('induk_betina_id') as string) || undefined,
        });

        // If photo is provided, convert to WebP then upload
        const photoFile = form.get('foto') as File;
        if (photoFile && photoFile.size > 0) {
          const webpFile = await convertToWebP(photoFile);
          const photoData = new FormData();
          photoData.append('file', webpFile);
          await uploadFoto(kambing.id, photoData);
        }

        toast.success('Data kambing berhasil ditambahkan!');
        router.refresh();
        onSuccess();
      } catch (error) {
        toast.error('Terjadi kesalahan saat menyimpan data');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3.5">
        <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Nama / Tag Telinga</label>
        <input name="nama" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none transition-all" type="text" placeholder="cth: Melati, Jago-03..." required />
      </div>
      <div className="mb-3.5">
        <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Foto Kambing (Opsional)</label>
        <input name="foto" className="w-full p-[8px_10px] border-[1.5px] border-border rounded-[9px] text-xs font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none transition-all file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80" type="file" accept="image/*" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Jenis Kelamin</label>
          <select name="jenis_kelamin" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none" required>
            <option value="JANTAN">Jantan</option>
            <option value="BETINA">Betina</option>
          </select>
        </div>
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Tanggal Lahir/Masuk</label>
          <input name="tanggal_lahir" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none" type="date" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Induk Jantan</label>
          <select name="induk_jantan_id" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none">
            <option value="">— Tidak ada —</option>
            {jantanList.map(k => (
              <option key={k.id} value={k.id}>{k.nama || k.id_sistem}</option>
            ))}
          </select>
        </div>
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider">Induk Betina</label>
          <select name="induk_betina_id" className="form-input w-full p-[10px_13px] border-[1.5px] border-border rounded-[9px] text-sm font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none">
            <option value="">— Tidak ada —</option>
            {betinaList.map(k => (
              <option key={k.id} value={k.id}>{k.nama || k.id_sistem}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" disabled={isPending} className="w-full p-3.5 bg-primary text-white border-none rounded-[11px] text-sm font-bold font-[family-name:var(--font-sans)] cursor-pointer mt-1 transition-colors active:bg-primary-d disabled:opacity-50">
        {isPending ? '⏳ Menyimpan...' : '💾 Simpan Data'}
      </button>
    </form>
  );
}
