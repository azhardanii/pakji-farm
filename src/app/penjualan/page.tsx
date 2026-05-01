import { getSemuaKambing } from '@/actions/kambing';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import PenjualanClient from './PenjualanClient';

export default async function PenjualanPage() {
  // Ambil hanya kambing yang terjual
  const kambingTerjual = await getSemuaKambing({ status: 'TERJUAL' });

  return (
    <>
      <Header />
      
      <main className="p-3.5 pb-[120px] animate-fade-in">
        <PenjualanClient initialData={kambingTerjual as any} />
      </main>

      <BottomNav />
    </>
  );
}
