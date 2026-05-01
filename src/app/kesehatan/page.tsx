import { getRiwayatMedis } from '@/actions/kesehatan';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import FAB from '@/components/layout/FAB';
import KesehatanClient from './KesehatanClient';

export default async function KesehatanPage() {
  const riwayatMedis = await getRiwayatMedis();

  return (
    <>
      <Header />
      <KesehatanClient riwayatMedis={riwayatMedis} />
      <FAB />
      <BottomNav />
    </>
  );
}
