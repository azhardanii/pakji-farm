// ══════════════════════════════════════════════════════════
// KAMBING PAKJI — Real-time Calculation Engine
// Semua komputasi dilakukan dari tanggal_lahir, bukan disimpan di DB
// ══════════════════════════════════════════════════════════

export interface UmurResult {
  totalHari: number;
  bulan: number;
  hari: number;
  label: string;        // "8 bln 12 hr"
  labelPanjang: string; // "8 bulan 12 hari"
}

// ── Cek Cempe ───────────────────────────────────────────
export function cekCempe(jenis_kelamin: 'JANTAN' | 'BETINA', tanggalLahir: Date | string): boolean {
  const { totalHari } = hitungUmur(tanggalLahir);
  if (jenis_kelamin === 'JANTAN') return totalHari < 365; // < 1 tahun
  if (jenis_kelamin === 'BETINA') return totalHari < 240; // < 8 bulan
  return false;
}

// ── Hitung Umur ─────────────────────────────────────────
export function hitungUmur(tanggalLahir: Date | string): UmurResult {
  const birth = new Date(tanggalLahir);
  const now = new Date();
  
  let bulan = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  let hari = now.getDate() - birth.getDate();
  
  if (hari < 0) {
    bulan--;
    const prev = new Date(now.getFullYear(), now.getMonth(), 0);
    hari += prev.getDate();
  }
  
  const totalHari = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    totalHari,
    bulan,
    hari,
    label: `${bulan} bln ${hari} hr`,
    labelPanjang: `${bulan} bulan ${hari} hari`,
  };
}

// ── Estimasi Bobot Pejantan ─────────────────────────────
// Target 1 Tahun: 50 kg → (50/365) × umurHari, cap 50kg
export function hitungBobotJantan(umurHari: number): number {
  const bobot = (50 / 365) * umurHari;
  return Math.min(Math.round(bobot * 10) / 10, 50);
}

// ── Estimasi Harga Pejantan ─────────────────────────────
// Target 1 Tahun: Rp 2.500.000 → (2500000/365) × umurHari
export function hitungHargaJantan(umurHari: number): number {
  const harga = (2500000 / 365) * umurHari;
  return Math.min(Math.round(harga), 2500000);
}

// ── Estimasi Bobot Betina ───────────────────────────────
// Target Afkir 3x Lahir (~800 hari): 50 kg → (50/800) × umurHari, cap 50kg
export function hitungBobotBetina(umurHari: number): number {
  const bobot = (50 / 800) * umurHari;
  return Math.min(Math.round(bobot * 10) / 10, 50);
}

// ── Estimasi Harga Betina ───────────────────────────────
// Target Afkir: Rp 1.500.000 → (1500000/800) × umurHari, cap 1.5jt
export function hitungHargaBetina(umurHari: number): number {
  const harga = (1500000 / 800) * umurHari;
  return Math.min(Math.round(harga), 1500000);
}

// ── Estimasi Bobot & Harga berdasarkan Gender ───────────
export function hitungEstimasi(gender: 'JANTAN' | 'BETINA', umurHari: number) {
  if (gender === 'JANTAN') {
    return {
      bobot: hitungBobotJantan(umurHari),
      harga: hitungHargaJantan(umurHari),
    };
  }
  return {
    bobot: hitungBobotBetina(umurHari),
    harga: hitungHargaBetina(umurHari),
  };
}

// ── Kalkulator Pakan ────────────────────────────────────
// Total Bobot × 10% = Total Pakan → 60% Silase, 40% Segar
export function hitungPakan(totalBobotKg: number) {
  const totalPakan = totalBobotKg * 0.10;
  const silase = totalPakan * 0.6;
  const segar = totalPakan * 0.4;
  
  return {
    totalPakan: Math.round(totalPakan * 10) / 10,
    silase: Math.round(silase * 10) / 10,
    segar: Math.round(segar * 10) / 10,
  };
}

// ── Prediksi Kelahiran ──────────────────────────────────
export function hitungPrediksiLahir(tanggalKawin: Date | string): Date {
  const d = new Date(tanggalKawin);
  d.setDate(d.getDate() + 150);
  return d;
}

// ── Prediksi Birahi Selanjutnya ─────────────────────────
// 60 hari setelah melahirkan
export function hitungPredBirahi(tanggalLahir: Date | string): Date {
  const d = new Date(tanggalLahir);
  d.setDate(d.getDate() + 60);
  return d;
}

// ── Cek Bunting Tua (H-30) ──────────────────────────────
export function isBuntingTua(prediksiLahir: Date | string): boolean {
  const pred = new Date(prediksiLahir);
  const now = new Date();
  const diff = Math.floor((pred.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff <= 30 && diff >= 0;
}

// ── Hitung Sisa Hari (generic countdown) ────────────────
export function hitungSisaHari(targetDate: Date | string): number {
  const target = new Date(targetDate);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Cek Siap Jual ──────────────────────────────────────
export function cekSiapJual(gender: 'JANTAN' | 'BETINA', umurHari: number, jumlahMelahirkan: number): boolean {
  if (gender === 'JANTAN') return umurHari >= 365;
  if (gender === 'BETINA') return jumlahMelahirkan >= 3;
  return false;
}

// ── Cek Silase Siap ────────────────────────────────────
export function hitungSisaSilase(tanggalPembuatan: Date | string): {
  sisaHari: number;
  siap: boolean;
} {
  const buat = new Date(tanggalPembuatan);
  buat.setDate(buat.getDate() + 21);
  const sisaHari = hitungSisaHari(buat);
  return { sisaHari: Math.max(sisaHari, 0), siap: sisaHari <= 0 };
}

// ── Format Rupiah ──────────────────────────────────────
export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

// ── Format Tanggal Indonesia ───────────────────────────
export function formatTanggal(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTanggalPanjang(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── Generate ID Sistem ─────────────────────────────────
export function generateIdSistem(gender: 'JANTAN' | 'BETINA', lastNumber: number): string {
  const prefix = gender === 'JANTAN' ? 'KBG-M' : 'KBG-F';
  const num = String(lastNumber + 1).padStart(3, '0');
  return `${prefix}-${num}`;
}
