import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, BarChart3, TrendingUp, Info, Calendar, Filter } from 'lucide-react';

const Finance: React.FC = () => {
  const { financial, addFinancialRecord, users } = useApp();

  // Form State
  const currentYear = new Date().getFullYear();
  const [newCash, setNewCash] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString().padStart(2, '0')
  );
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter State
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<number | ''>('');

  const monthsNames = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  // Logic to find previous month relative to SELECTED date
  const selectedMonthNum = parseInt(selectedMonth);
  const prevMonthNum = selectedMonthNum === 1 ? 12 : selectedMonthNum - 1;
  const prevMonthStr = prevMonthNum < 10 ? `0${prevMonthNum}` : `${prevMonthNum}`;
  const prevYear = selectedMonthNum === 1 ? selectedYear - 1 : selectedYear;

  const prevRecord = financial.find(f => f.mes === prevMonthStr && f.ano === prevYear);
  const cmPrev = prevRecord ? prevRecord.valorCotacao : 1.0;

  const sg = users.reduce((acc, u) => acc + (u.saldoAtual || 0), 0);

  const calculateQuotation = (gc: number) => {
    const liability = sg * cmPrev;
    const surplus = gc - liability;
    const vm = (surplus / 10000) / 100;
    const newCm = cmPrev + vm;
    return { newCm, vm };
  };

  // Normalize string input (replace comma with dot)
  const normalizeValue = (val: string) => {
    if (!val) return NaN;
    return parseFloat(val.replace(',', '.'));
  };

  const numericCash = normalizeValue(newCash);
  const isValidCash = newCash !== '' && !isNaN(numericCash);
  const { newCm, vm } = isValidCash ? calculateQuotation(numericCash) : { newCm: cmPrev, vm: 0 };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalValue = normalizeValue(newCash);
    if (!newCash || isNaN(finalValue)) return;

    setIsSubmitting(true);

    const success = await addFinancialRecord({
      mes: selectedMonth,
      ano: selectedYear,
      geracaoCaixa: finalValue,
      valorCotacao: parseFloat(newCm.toFixed(4))
    });

    if (success) {
      setNewCash('');
      // Optional: success notification handled by context
    }
    setIsSubmitting(false);
  };

  const latestRecord = financial[0];

  // Filtered History
  const filteredRecords = useMemo(() => {
    let records = financial;
    if (filterMonth) {
      records = records.filter(f => f.mes === filterMonth);
    }
    if (filterYear) {
      records = records.filter(f => f.ano === Number(filterYear));
    }
    return records;
  }, [financial, filterMonth, filterYear]);

  // If no filters are active, show standard 12-month view for current year (or filtered year)
  // But user requested "Option search by month and year", which implies a list view might be better when filtering.
  // However, keeping the table structure consistent is good. 
  // Let's adapt: If filtered, show just the matches. If not, show the "Dashboard View" (all months of current year).

  const displayRecords = useMemo(() => {
    // If specific filters are active, just verify if we want to show a list or the calendar view.
    // The previous implementation showed a fixed 12-month calendar for the current year.
    // Let's keep the calendar view but controlled by the year filter (defaulting to current).

    const targetYear = (filterYear && typeof filterYear === 'number') ? filterYear : currentYear;

    if (filterMonth) {
      // If filtering by month, just show that single record if it exists, or the empty month slot
      const mObj = monthsNames.find(m => m.value === filterMonth);
      if (!mObj) return [];

      const record = financial.find(f => f.mes === filterMonth && f.ano === targetYear);
      return [{
        monthName: mObj.label,
        record: record || null,
        monthIndex: parseInt(filterMonth)
      }];
    }

    // Default: Show all 12 months for the target year
    return monthsNames.map((m) => {
      const record = financial.find(f => f.mes === m.value && f.ano === targetYear);
      return {
        monthName: m.label,
        record: record || null,
        monthIndex: parseInt(m.value)
      };
    });
  }, [financial, filterMonth, filterYear, currentYear]);


  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Financeiro</h1>
        <p className="text-ui-muted mt-1 font-medium">Lançamento de dados do fluxo de caixa.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Cotação Atual */}
        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/20 bg-black shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <TrendingUp size={64} className="text-brand-primary" />
          </div>
          <p className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] mb-2">Cotação Atual (Lastro)</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-brand-primary neon-text">R$ {latestRecord?.valorCotacao || '1.00'}</span>
            <span className="text-xs text-brand-primary mb-2 flex items-center font-bold">
              <TrendingUp className="w-3 h-3 mr-1" />
              {/* Comparing with previous record of the sorted list, or 1.0 */}
              {latestRecord && financial.length > 1
                ? `+${((latestRecord.valorCotacao - financial[1].valorCotacao) / financial[1].valorCotacao * 100).toFixed(2)}%`
                : '0%'}
            </span>
          </div>
          <p className="text-[9px] text-ui-muted mt-6 uppercase font-bold tracking-widest border-t border-white/5 pt-4">Sincronizado com os lucros do mês</p>
        </div>

        {/* Card 2: Caixa Acumulado */}
        <div className="glass-card p-8 rounded-[32px] border border-white/10 bg-black shadow-2xl">
          <p className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] mb-2">Caixa Acumulado ({currentYear})</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-white">R$ {financial.filter(f => f.ano === currentYear).reduce((acc, curr) => acc + curr.geracaoCaixa, 0).toLocaleString()}</span>
          </div>
          <p className="text-[9px] text-ui-muted mt-6 uppercase font-bold tracking-widest border-t border-white/5 pt-4">Consolidação anual de ativos</p>
        </div>

        {/* Card 3: Lançar Resultados */}
        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/30 bg-brand-primary/5 shadow-[0_0_30px_rgba(119,194,85,0.05)]">
          <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 mb-6 text-brand-primary">
            <DollarSign className="w-5 h-5" />
            Lançar Resultados
          </h3>
          <form onSubmit={handleAddRecord} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] ml-1">
                Período de Referência
              </label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="bg-black border border-brand-primary/20 rounded-2xl p-3 outline-none focus:border-brand-primary text-sm font-bold text-white text-center appearance-none"
                  style={{ textAlignLast: 'center' }}
                >
                  {monthsNames.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="bg-black border border-brand-primary/20 rounded-2xl p-3 outline-none focus:border-brand-primary text-sm font-bold text-white text-center"
                  placeholder="Ano"
                />
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Caixa gerado (R$)"
                className="w-full bg-black border border-brand-primary/20 rounded-2xl p-4 outline-none focus:border-brand-primary text-sm font-bold text-white placeholder:text-ui-muted/30"
                value={newCash}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow: empty, minus sign alone, numbers, comma or dot
                  // Regex: optional minus, digits, optional one dot/comma, optional digits
                  if (val === '' || /^-?\d*[.,]?\d*$/.test(val)) {
                    setNewCash(val);
                  }
                }}
              />
              {newCash !== '' && (
                <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-ui-muted space-y-1">
                  <div className="flex justify-between">
                    <span>Base (Referência {prevMonthStr}/{prevYear}):</span>
                    <span className="font-bold text-white">R$ {cmPrev.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variação (VM):</span>
                    <span className={`font-bold ${vm >= 0 ? 'text-brand-primary' : 'text-semantic-error'}`}>{vm >= 0 ? '+' : ''}{vm.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                    <span className="font-extrabold uppercase">Nova Cotação:</span>
                    <span className="font-black text-brand-primary neon-text">R$ {newCm.toFixed(4)}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-primary disabled:opacity-50 text-black px-4 py-4 rounded-2xl font-black text-sm uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/10"
            >
              {isSubmitting ? 'Atualizando...' : 'Atualizar Terminal'}
            </button>
          </form>
          <p className="text-[9px] text-ui-muted mt-4 flex items-center gap-2 font-medium">
            <Info className="w-3 h-3 text-brand-primary" />
            Este lançamento recalcula o valor de todos os GTXips ativos.
          </p>
        </div>
      </div>

      {/* Histórico Table */}
      <div className="glass-card rounded-[32px] border border-white/10 overflow-hidden bg-black shadow-2xl">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between bg-white/5 gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-brand-primary" />
            <h3 className="font-black uppercase tracking-widest text-sm">Histórico Mensal</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-black rounded-xl border border-white/10">
              <Filter className="w-4 h-4 text-ui-muted" />
              <select
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer border-none"
              >
                <option value="">Todos os Meses</option>
                {monthsNames.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-black rounded-xl border border-white/10">
              <Calendar className="w-4 h-4 text-ui-muted" />
              <input
                type="number"
                value={filterYear}
                onChange={e => setFilterYear(e.target.value ? Number(e.target.value) : '')}
                placeholder={currentYear.toString()}
                className="bg-transparent text-xs font-bold text-white outline-none w-16 border-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black border-b border-white/10">
                <th className="p-6 text-[10px] font-black text-ui-muted uppercase tracking-[0.2em]">Mês / Período</th>
                <th className="p-6 text-[10px] font-black text-ui-muted uppercase tracking-[0.2em]">Caixa Gerado</th>
                <th className="p-6 text-[10px] font-black text-ui-muted uppercase tracking-[0.2em]">Valor do GTXip</th>
                <th className="p-6 text-[10px] font-black text-ui-muted uppercase tracking-[0.2em] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayRecords.map(item => (
                <tr key={`${item.monthIndex}-${filterYear || currentYear}`} className="bg-black hover:bg-brand-primary/5 transition-all group">
                  <td className="p-6 font-bold text-sm text-white group-hover:text-brand-primary transition-colors">{item.monthName}</td>
                  <td className="p-6 text-sm font-medium text-ui-muted group-hover:text-white transition-colors">
                    {item.record ? `R$ ${item.record.geracaoCaixa.toLocaleString()}` : <span className="opacity-20">Aguardando dados...</span>}
                  </td>
                  <td className="p-6">
                    {item.record ? (
                      <span className="font-black text-brand-primary">R$ {item.record.valorCotacao}</span>
                    ) : (
                      <span className="text-ui-muted opacity-20 italic text-xs">Pendente</span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    {item.record ? (
                      <div className="inline-flex items-center gap-2 text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        <TrendingUp size={10} /> Consolidado
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-ui-muted/30 border border-white/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        Projetado
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {displayRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-ui-muted text-xs uppercase tracking-widest">Nenhum registro encontrado para este período.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;

