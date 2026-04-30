import { getKambingById } from '@/actions/kambing';
import Header from '@/components/layout/Header';
import FAB from '@/components/layout/FAB';
import DetailKambingClient from './DetailKambingClient';
import { notFound } from 'next/navigation';

export default async function GoatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const goat = await getKambingById(resolvedParams.id);
  
  if (!goat) {
    notFound();
  }

  return (
    <>
      <Header />
      <DetailKambingClient goat={goat as any} />
      <FAB />
    </>
  );
}
