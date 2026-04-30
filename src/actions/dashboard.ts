'use server';

import { prisma } from '@/lib/prisma';
import { StatusKambing } from '@prisma/client';
import { hitungUmur, hitungEstimasi, hitungPakan, hitungSisaHari, hitungSisaSilase, cekSiapJual, cekCempe } from '@/lib/calculations';

export interface DashboardData {
  populasi: { total: number; jantan: number; betina: number; cempe: number };
  totalValuasi: number;
  pakan: { totalPakan: number; silase: number; segar: number; totalBobot: number; jumlahEkor: number };
  alerts: Array<{ type: 'danger' | 'warning' | 'info'; title: string; text: string; icon: string }>;
  agenda: Array<{ type: 'urgent' | 'warn' | 'ok'; text: string; tag: string }>;
  siapJual: Array<{ nama: string; id_sistem: string; gender: string; harga: number; umurLabel: string }>;
}

export async function getDashboardData(): Promise<DashboardData> {
  // Fetch all active kambing
  const allKambing = await prisma.kambing.findMany({
    where: { status: StatusKambing.AKTIF },
    include: {
      riwayat_kawin_betina: {
        where: { status_berhasil: null },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  // Populasi
  let jantan = 0;
  let betina = 0;
  let cempe = 0;

  for (const k of allKambing) {
    if (cekCempe(k.jenis_kelamin, k.tanggal_lahir)) {
      cempe++;
    } else if (k.jenis_kelamin === 'JANTAN') {
      jantan++;
    } else {
      betina++;
    }
  }

  // Hitung total bobot & valuasi
  let totalBobot = 0;
  let totalValuasi = 0;
  const siapJualArr: DashboardData['siapJual'] = [];

  for (const k of allKambing) {
    const umur = hitungUmur(k.tanggal_lahir);
    const est = hitungEstimasi(k.jenis_kelamin, umur.totalHari);
    totalBobot += est.bobot;

    if (cekSiapJual(k.jenis_kelamin, umur.totalHari, k.jumlah_melahirkan)) {
      totalValuasi += est.harga;
      siapJualArr.push({
        nama: k.nama || k.id_sistem,
        id_sistem: k.id_sistem,
        gender: k.jenis_kelamin,
        harga: est.harga,
        umurLabel: umur.label,
      });
    }
  }

  // Pakan
  const pakanData = hitungPakan(totalBobot);

  // Alerts & Agenda
  const alerts: DashboardData['alerts'] = [];
  const agenda: DashboardData['agenda'] = [];

  // Check bunting tua (H-30)
  for (const k of allKambing) {
    if (k.riwayat_kawin_betina.length > 0) {
      const rk = k.riwayat_kawin_betina[0];
      const sisaHari = hitungSisaHari(rk.prediksi_lahir);
      if (sisaHari <= 30 && sisaHari > 0) {
        alerts.push({
          type: 'danger',
          title: 'Bunting Tua — Perlu Perhatian Segera',
          text: `${k.nama || k.id_sistem} memasuki H-${sisaHari} menjelang prediksi lahir. Turunkan dari kandang & tingkatkan silase!`,
          icon: '🚨',
        });
        agenda.push({
          type: 'urgent',
          text: `🐐 ${k.nama || k.id_sistem} memasuki bunting tua — turunkan dari kandang & ubah rasio pakan!`,
          tag: 'Kritis',
        });
      }
    }
  }

  // Siap jual notification
  if (siapJualArr.length > 0) {
    agenda.push({
      type: 'ok',
      text: `💰 ${siapJualArr.length} ekor siap jual: ${siapJualArr.map(s => s.nama).join(', ')}`,
      tag: 'Siap Jual',
    });
  }

  // Tong silase
  const tongList = await prisma.tongSilase.findMany({ orderBy: { tanggal_pembuatan: 'desc' } });
  for (const t of tongList) {
    const { sisaHari, siap } = hitungSisaSilase(t.tanggal_pembuatan);
    if (siap) {
      agenda.push({
        type: 'ok',
        text: `🪣 Tong Silase #${t.nomor} siap dibuka hari ini (hari ke-21).`,
        tag: 'Siap Buka',
      });
    } else if (sisaHari <= 3) {
      agenda.push({
        type: 'warn',
        text: `🪣 Tong Silase #${t.nomor} akan siap dalam ${sisaHari} hari.`,
        tag: 'Segera',
      });
    }
  }

  return {
    populasi: { total: allKambing.length, jantan, betina, cempe },
    totalValuasi: Math.round(totalValuasi),
    pakan: { ...pakanData, totalBobot: Math.round(totalBobot), jumlahEkor: allKambing.length },
    alerts,
    agenda,
    siapJual: siapJualArr,
  };
}
