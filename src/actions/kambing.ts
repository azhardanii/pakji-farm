'use server';

import { prisma } from '@/lib/prisma';
import { Kelamin, StatusKambing, MarketType } from '@prisma/client';
import { generateIdSistem, cekCempe } from '@/lib/calculations';

// ── Get All Kambing ─────────────────────────────────────
export async function getSemuaKambing(filter?: {
  gender?: Kelamin;
  status?: StatusKambing | 'ALL';
  search?: string;
  isCempe?: boolean;
  isBunting?: boolean;
}) {
  const where: Record<string, unknown> = {};
  
  if (!filter?.status) {
    where.status = StatusKambing.AKTIF;
  } else if (filter.status !== 'ALL') {
    where.status = filter.status;
  }
  
  if (filter?.gender) where.jenis_kelamin = filter.gender;
  
  if (filter?.search) {
    where.OR = [
      { nama: { contains: filter.search, mode: 'insensitive' } },
      { id_sistem: { contains: filter.search, mode: 'insensitive' } },
    ];
  }
  
  const kambing = await prisma.kambing.findMany({
    where,
    include: {
      foto: { orderBy: { created_at: 'desc' }, take: 1 },
      rekam_medis: { orderBy: { tanggal: 'desc' }, take: 3 },
      riwayat_kawin_betina: {
        orderBy: { created_at: 'desc' },
        take: 1,
        include: { pejantan: { select: { nama: true, id_sistem: true } } },
      },
    },
    orderBy: { created_at: 'desc' },
  });
  
  return kambing;
}

// ── Get Single Kambing ──────────────────────────────────
export async function getKambingById(id: string) {
  return prisma.kambing.findUnique({
    where: { id },
    include: {
      foto: { orderBy: { created_at: 'desc' } },
      rekam_medis: { orderBy: { tanggal: 'desc' } },
      riwayat_kawin_betina: {
        orderBy: { created_at: 'desc' },
        include: { pejantan: { select: { nama: true, id_sistem: true } } },
      },
      riwayat_kawin_jantan: {
        orderBy: { created_at: 'desc' },
        include: { kambing_betina: { select: { nama: true, id_sistem: true } } },
      },
      induk_jantan: { select: { id: true, nama: true, id_sistem: true } },
      induk_betina: { select: { id: true, nama: true, id_sistem: true } },
    },
  });
}

// ── Tambah Kambing ──────────────────────────────────────
export async function tambahKambing(data: {
  nama: string;
  jenis_kelamin: Kelamin;
  tanggal_lahir: string;
  induk_jantan_id?: string;
  induk_betina_id?: string;
}) {
  // Generate next ID
  const lastKambing = await prisma.kambing.findFirst({
    where: { jenis_kelamin: data.jenis_kelamin },
    orderBy: { created_at: 'desc' },
  });
  
  let lastNum = 0;
  if (lastKambing) {
    const parts = lastKambing.id_sistem.split('-');
    lastNum = parseInt(parts[parts.length - 1]) || 0;
  }
  
  const id_sistem = generateIdSistem(data.jenis_kelamin, lastNum);
  
  return prisma.kambing.create({
    data: {
      id_sistem,
      nama: data.nama,
      jenis_kelamin: data.jenis_kelamin,
      tanggal_lahir: new Date(data.tanggal_lahir),
      induk_jantan_id: data.induk_jantan_id || undefined,
      induk_betina_id: data.induk_betina_id || undefined,
    },
  });
}

// ── Update Status Kambing ───────────────────────────────
export async function updateStatusKambing(id: string, status: StatusKambing) {
  return prisma.kambing.update({
    where: { id },
    data: { status },
  });
}

// ── Update Market Segment ───────────────────────────────
export async function updateMarketKambing(id: string, market: MarketType) {
  return prisma.kambing.update({
    where: { id },
    data: { target_market: market },
  });
}

// ── Update Kambing ──────────────────────────────────────
export async function updateKambing(id: string, data: {
  nama: string;
  jenis_kelamin: Kelamin;
  tanggal_lahir: string;
  induk_jantan_id?: string;
  induk_betina_id?: string;
}) {
  return prisma.kambing.update({
    where: { id },
    data: {
      nama: data.nama,
      jenis_kelamin: data.jenis_kelamin,
      tanggal_lahir: new Date(data.tanggal_lahir),
      induk_jantan_id: data.induk_jantan_id || null,
      induk_betina_id: data.induk_betina_id || null,
    },
  });
}

// ── Get Kambing Aktif untuk dropdown ────────────────────
export async function getKambingAktif(gender?: Kelamin) {
  const where: Record<string, unknown> = { status: StatusKambing.AKTIF };
  if (gender) where.jenis_kelamin = gender;
  
  return prisma.kambing.findMany({
    where,
    select: { id: true, id_sistem: true, nama: true, jenis_kelamin: true },
    orderBy: { nama: 'asc' },
  });
}

// ── Get Indukan Aktif untuk dropdown ────────────────────
export async function getIndukanAktif(gender: Kelamin) {
  const kambing = await prisma.kambing.findMany({
    where: { status: StatusKambing.AKTIF, jenis_kelamin: gender },
    select: { id: true, id_sistem: true, nama: true, tanggal_lahir: true },
    orderBy: { nama: 'asc' },
  });
  
  // Filter usia indukan (Jantan > 1 thn, Betina > 8 bln)
  return kambing.filter(k => !cekCempe(gender, k.tanggal_lahir));
}

// ── Hitung populasi ─────────────────────────────────────
export async function getPopulasi() {
  const all = await prisma.kambing.findMany({
    where: { status: StatusKambing.AKTIF },
    select: { jenis_kelamin: true, tanggal_lahir: true },
  });
  
  let jantan = 0;
  let betina = 0;
  let cempe = 0;
  
  for (const k of all) {
    if (cekCempe(k.jenis_kelamin, k.tanggal_lahir)) {
      cempe++;
    } else if (k.jenis_kelamin === 'JANTAN') {
      jantan++;
    } else {
      betina++;
    }
  }
  
  return { total: all.length, jantan, betina, cempe };
}
