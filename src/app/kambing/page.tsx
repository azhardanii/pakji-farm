import { getSemuaKambing } from '@/actions/kambing';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import FAB from '@/components/layout/FAB';
import GoatListClient from './GoatListClient';

export default async function KambingPage() {
  // Fetch initial data
  const initialGoats = await getSemuaKambing({ status: 'ALL' });

  return (
    <>
      <Header />
      
      <main className="p-3.5 pb-[90px] animate-fade-in">
        <GoatListClient initialGoats={initialGoats as any} />
      </main>

      <FAB />
      <BottomNav />
    </>
  );
}
