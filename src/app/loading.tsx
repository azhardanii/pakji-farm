export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-surface2 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-xl">🐐</div>
      </div>
      <div className="font-[family-name:var(--font-serif)] text-primary-d text-lg animate-pulse">
        Memuat data...
      </div>
    </div>
  );
}
