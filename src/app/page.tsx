import { getDashboardData } from '@/actions/dashboard';
import { formatRupiah } from '@/lib/calculations';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import FAB from '@/components/layout/FAB';
import Link from 'next/link';

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <>
      <Header />
      
      <main className="p-3.5 pb-[90px] animate-fade-in">
        {/* STAT GRID */}
        <div className="grid grid-cols-4 gap-[9px] mb-3.5">
          <div className="bg-surface rounded-[10px] py-[13px] px-2 text-center border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-t-[9px]" />
            <div className="font-[family-name:var(--font-serif)] text-[26px] text-primary leading-none mb-1 animate-count-up">{data.populasi.total}</div>
            <div className="text-[9px] font-bold text-text-sm uppercase tracking-wider">Total</div>
          </div>
          <div className="bg-surface rounded-[10px] py-[13px] px-2 text-center border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-info rounded-t-[9px]" />
            <div className="font-[family-name:var(--font-serif)] text-[26px] text-info leading-none mb-1 animate-count-up">{data.populasi.jantan}</div>
            <div className="text-[9px] font-bold text-text-sm uppercase tracking-wider">Jantan</div>
          </div>
          <div className="bg-surface rounded-[10px] py-[13px] px-2 text-center border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent rounded-t-[9px]" />
            <div className="font-[family-name:var(--font-serif)] text-[26px] text-accent leading-none mb-1 animate-count-up">{data.populasi.betina}</div>
            <div className="text-[9px] font-bold text-text-sm uppercase tracking-wider">Betina</div>
          </div>
          <div className="bg-surface rounded-[10px] py-[13px] px-2 text-center border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-danger rounded-t-[9px]" />
            <div className="font-[family-name:var(--font-serif)] text-[26px] text-danger leading-none mb-1 animate-count-up">{data.populasi.cempe}</div>
            <div className="text-[9px] font-bold text-text-sm uppercase tracking-wider">Cempe</div>
          </div>
        </div>

        {/* ALERTS */}
        {data.alerts.map((alert, i) => (
          <div key={i} className={`rounded-[16px] p-3 mb-3.5 flex gap-2.5 items-start border ${
            alert.type === 'danger' ? 'bg-danger-light border-[#E8AEAE]' :
            alert.type === 'warning' ? 'bg-warning-light border-[#E8C080]' :
            'bg-info-light border-[#AED0F0]'
          }`}>
            <div className="text-lg flex-shrink-0 mt-px">{alert.icon}</div>
            <div>
              <div className={`text-[12.5px] font-bold ${
                alert.type === 'danger' ? 'text-danger' :
                alert.type === 'warning' ? 'text-warning' : 'text-info'
              }`}>{alert.title}</div>
              <div className="text-[11.5px] text-text-md mt-0.5 leading-[1.4]">{alert.text}</div>
            </div>
          </div>
        ))}

        {/* AGENDA */}
        <div className="bg-surface rounded-[16px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] border border-border mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-sm mb-3.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            Agenda Hari Ini
          </div>
          
          {data.agenda.length === 0 ? (
            <div className="text-xs text-text-sm italic">Tidak ada agenda kritis hari ini.</div>
          ) : (
            data.agenda.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-border last:border-0 last:pb-0">
                <div className={`w-[7px] h-[7px] rounded-full mt-1.5 flex-shrink-0 ${
                  item.type === 'urgent' ? 'bg-danger' :
                  item.type === 'warn' ? 'bg-warning' : 'bg-primary'
                }`} />
                <div className="text-[12.5px] font-medium flex-1 leading-[1.45] text-text-md">
                  {item.text}
                </div>
                <div className={`text-[9.5px] font-bold px-[7px] py-[2px] rounded-full whitespace-nowrap flex-shrink-0 ${
                  item.type === 'urgent' ? 'bg-danger-light text-danger' :
                  item.type === 'warn' ? 'bg-warning-light text-warning' : 'bg-primary-light text-primary'
                }`}>
                  {item.tag}
                </div>
              </div>
            ))
          )}
        </div>

        {/* TARGET PAKAN */}
        <div className="bg-surface rounded-[16px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] border border-border mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-sm mb-3.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            Target Pakan Hari Ini
          </div>
          <div className="flex justify-between items-baseline mb-3">
            <div className="text-[11.5px] text-text-sm">
              {data.pakan.jumlahEkor} ekor · ttl bobot <strong>{data.pakan.totalBobot} kg</strong>
            </div>
            <div className="text-lg font-[family-name:var(--font-serif)] text-text">
              {data.pakan.totalPakan} <span className="text-[11px] font-[family-name:var(--font-sans)] text-text-sm font-semibold">kg / hari</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 py-2 border-b border-border">
            <div className="flex-1">
              <div className="text-[11.5px] font-semibold mb-1 flex justify-between">
                <span className="text-primary font-bold">🪣 Silase</span>
                <span className="text-primary font-bold">60%</span>
              </div>
              <div className="h-[7px] bg-surface2 rounded-full overflow-hidden">
                <div className="h-full rounded-full feed-bar-silase transition-all duration-1000 w-[60%]" />
              </div>
            </div>
            <div className="text-[17px] font-bold min-w-[50px] text-right text-primary">
              {data.pakan.silase}<small className="text-[10px] font-medium text-text-sm ml-0.5">kg</small>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2 pt-3">
            <div className="flex-1">
              <div className="text-[11.5px] font-semibold mb-1 flex justify-between">
                <span className="text-accent font-bold">🌾 Segar</span>
                <span className="text-accent font-bold">40%</span>
              </div>
              <div className="h-[7px] bg-surface2 rounded-full overflow-hidden">
                <div className="h-full rounded-full feed-bar-segar transition-all duration-1000 w-[40%]" />
              </div>
            </div>
            <div className="text-[17px] font-bold min-w-[50px] text-right text-accent">
              {data.pakan.segar}<small className="text-[10px] font-medium text-text-sm ml-0.5">kg</small>
            </div>
          </div>
        </div>

        {/* POTENSI PANEN */}
        <div className="bg-surface rounded-[16px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] border border-border">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-sm mb-3.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            Potensi Panen / Siap Jual
          </div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-[13px] font-semibold text-text-md">{data.siapJual.length} ekor siap jual</div>
              <div className="text-[11px] text-text-sm mt-0.5">Total Potensi Pendapatan:</div>
            </div>
            <div className="text-right">
              <div className="font-[family-name:var(--font-serif)] text-[26px] text-primary">{formatRupiah(data.totalValuasi).replace('Rp ', 'Rp')}</div>
            </div>
          </div>
          
          {data.siapJual.length > 0 && (
            <div className="bg-gradient-to-br from-accent-light to-surface rounded-[10px] p-3 border border-border">
              <div className="text-[11px] font-bold text-accent mb-1.5">DAFTAR SIAP JUAL</div>
              <div className="text-xs font-semibold text-text-md leading-relaxed">
                {data.siapJual.map(k => `${k.nama} (${k.umurLabel})`).join(' · ')}
              </div>
            </div>
          )}
          
          <Link href="/penjualan" className="block w-full mt-3 bg-surface2 border border-border text-center py-2.5 rounded-[10px] text-[11.5px] font-bold text-text hover:bg-border/50 transition-colors">
            Lihat Histori Penjualan ➔
          </Link>
        </div>
      </main>

      <FAB />
      <BottomNav />
    </>
  );
}
