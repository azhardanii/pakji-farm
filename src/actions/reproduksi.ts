'use server';

import { prisma } from '@/lib/prisma';
import { hitungPrediksiLahir } from '@/lib/calculations';

// ── Catat Perkawinan ────────────────────────────────────
export async function catatKawin(data: {
  kambing_betina_id: string;
  pejantan_id: string;
  tanggal_kawin: string;
}) {
  const tglKawin = new Date(data.tanggal_kawin);
  const prediksiLahir = hitungPrediksiLahir(tglKawin);

  return prisma.riwayatKawin.create({
    data: {
      kambing_betina_id: data.kambing_betina_id,
      pejantan_id: data.pejantan_id,
      tanggal_kawin: tglKawin,
      prediksi_lahir: prediksiLahir,
    },
  });
}

// ── Catat Kelahiran ─────────────────────────────────────
export async function catatKelahiran(data: {
  kambing_betina_id: string;
  riwayat_kawin_id: string;
  tanggal_lahir: string;
  jumlah_cempe: number;
  cempe_data?: Array<{ nama: string; jenis_kelamin: 'JANTAN' | 'BETINA' }>;
}) {
  // Update riwayat kawin
  await prisma.riwayatKawin.update({
    where: { id: data.riwayat_kawin_id },
    data: { status_berhasil: true },
  });

  // Update jumlah_melahirkan
  await prisma.kambing.update({
    where: { id: data.kambing_betina_id },
    data: { jumlah_melahirkan: { increment: 1 } },
  });

  // Create cempe entries if provided
  if (data.cempe_data && data.cempe_data.length > 0) {
    for (const cempe of data.cempe_data) {
      const lastKambing = await prisma.kambing.findFirst({
        where: { jenis_kelamin: cempe.jenis_kelamin },
        orderBy: { created_at: 'desc' },
      });

      let lastNum = 0;
      if (lastKambing) {
        const parts = lastKambing.id_sistem.split('-');
        lastNum = parseInt(parts[parts.length - 1]) || 0;
      }

      const prefix = cempe.jenis_kelamin === 'JANTAN' ? 'KBG-M' : 'KBG-F';
      const id_sistem = `${prefix}-${String(lastNum + 1).padStart(3, '0')}`;

      await prisma.kambing.create({
        data: {
          id_sistem,
          nama: cempe.nama,
          jenis_kelamin: cempe.jenis_kelamin,
          tanggal_lahir: new Date(data.tanggal_lahir),
          induk_betina_id: data.kambing_betina_id,
        },
      });
    }
  }

  return { success: true };
}

// ── Get Reproduksi Data ─────────────────────────────────
export async function getReproData() {
  // Betina yang sedang bunting (riwayat kawin terakhir belum lahir)
  const buntingData = await prisma.riwayatKawin.findMany({
    where: {
      status_berhasil: null, // Belum melahirkan
    },
    include: {
      kambing_betina: { select: { id: true, nama: true, id_sistem: true, foto: { take: 1, orderBy: { created_at: 'desc' } } } },
      pejantan: { select: { nama: true, id_sistem: true } },
    },
    orderBy: { prediksi_lahir: 'asc' },
  });

  return buntingData;
}

// ── Get Jadwal Birahi ───────────────────────────────────
export async function getJadwalBirahi() {
  // Betina yang sudah melahirkan — cek 60 hari setelah kelahiran
  const melahirkan = await prisma.riwayatKawin.findMany({
    where: {
      status_berhasil: true,
    },
    include: {
      kambing_betina: {
        select: { 
          id: true, nama: true, id_sistem: true, status: true,
          foto: { take: 1, orderBy: { created_at: 'desc' } },
          riwayat_kawin_betina: {
            where: { status_berhasil: null },
            take: 1,
          },
        },
      },
    },
    orderBy: { prediksi_lahir: 'desc' },
  });

  // Filter: hanya betina yang belum dikawinkan lagi
  return melahirkan.filter(
    r => r.kambing_betina.status === 'AKTIF' && 
         r.kambing_betina.riwayat_kawin_betina.length === 0
  );
}
