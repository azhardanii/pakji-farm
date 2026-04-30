'use server';

import { prisma } from '@/lib/prisma';

// ── Tambah Tong Silase ──────────────────────────────────
export async function tambahTong(data: {
  nomor: number;
  tanggal_pembuatan: string;
  kapasitas_kg: number;
}) {
  return prisma.tongSilase.create({
    data: {
      nomor: data.nomor,
      tanggal_pembuatan: new Date(data.tanggal_pembuatan),
      kapasitas_kg: data.kapasitas_kg,
    },
  });
}

// ── Get All Tong Silase ─────────────────────────────────
export async function getSemuaTong() {
  return prisma.tongSilase.findMany({
    orderBy: { tanggal_pembuatan: 'desc' },
  });
}

// ── Hapus Tong ──────────────────────────────────────────
export async function hapusTong(id: string) {
  return prisma.tongSilase.delete({ where: { id } });
}
