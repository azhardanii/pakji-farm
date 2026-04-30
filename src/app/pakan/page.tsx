import { getSemuaTong } from '@/actions/silase';
import { getPopulasi } from '@/actions/kambing';
import { prisma } from '@/lib/prisma';
import { hitungEstimasi, hitungUmur, hitungPakan } from '@/lib/calculations';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import FAB from '@/components/layout/FAB';
import PakanClient from './PakanClient';

export default async function PakanPage() {
  // Hitung total bobot
  const allKambing = await prisma.kambing.findMany({
    where: { status: 'AKTIF' }
  });
  
  let totalBobot = 0;
  for (const k of allKambing) {
    const umur = hitungUmur(k.tanggal_lahir);
    const est = hitungEstimasi(k.jenis_kelamin, umur.totalHari);
    totalBobot += est.bobot;
  }
  
  const pakanData = hitungPakan(totalBobot);
  const tongList = await getSemuaTong();

  return (
    <>
      <Header />
      
      <main className="p-3.5 pb-[90px] animate-fade-in">
        <PakanClient 
          initialJumlahEkor={allKambing.length}
          initialRataBobot={allKambing.length > 0 ? Math.round(totalBobot / allKambing.length) : 0}
          initialTotalBobot={totalBobot}
          pakanData={pakanData}
          tongList={tongList}
        />
      </main>

      <FAB />
      <BottomNav />
    </>
  );
}
