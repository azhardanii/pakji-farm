'use server';

import { prisma } from '@/lib/prisma';

// ── Catat Sakit ─────────────────────────────────────────
export async function catatSakit(data: {
  kambing_id: string;
  tanggal: string;
  gejala: string;
  penanganan: string;
}) {
  return prisma.rekamMedis.create({
    data: {
      kambing_id: data.kambing_id,
      tanggal: new Date(data.tanggal),
      gejala: data.gejala,
      penanganan: data.penanganan,
    },
  });
}

// ── Get All Rekam Medis ─────────────────────────────────
export async function getRiwayatMedis() {
  return prisma.rekamMedis.findMany({
    include: {
      kambing: {
        select: { nama: true, id_sistem: true, jenis_kelamin: true },
      },
    },
    orderBy: { tanggal: 'desc' },
  });
}

// ── Get Rekam Medis per Kambing ─────────────────────────
export async function getRekamMedisKambing(kambingId: string) {
  return prisma.rekamMedis.findMany({
    where: { kambing_id: kambingId },
    orderBy: { tanggal: 'desc' },
  });
}
