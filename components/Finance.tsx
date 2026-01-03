
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FinancialRecord } from '../types';
import { DollarSign, BarChart3, TrendingUp, Info, Calendar } from 'lucide-react';

const Finance: React.FC = () => {
  const { financial, addFinancialRecord, users } = useApp();
  const [newCash, setNewCash] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentMonthNum = new Date().getMonth() + 1;
  const currentMonth = currentMonthNum < 10 ? `0${currentMonthNum}` : `${currentMonthNum}`;
  const currentYear = new Date().getFullYear();

  // Logic to find previous month
  const prevMonthNum = currentMonthNum === 1 ? 12 : currentMonthNum - 1;
  const prevMonthStr = prevMonthNum < 10 ? `0${prevMonthNum}` : `${prevMonthNum}`;
  const prevYear = currentMonthNum === 1 ? currentYear - 1 : currentYear;

  const prevRecord = financial.find(f => f.mes === prevMonthStr && f.ano === prevYear);
  const cmPrev = prevRecord ? prevRecord.valorCotacao : 1.0; // Default to 1.0 if no history

  const sg = users.reduce((acc, u) => acc + (u.saldoAtual || 0), 0);

  const calculateQuotation = (gc: number) => {
    // Formula: VM = ((GC - (SG * CM_prev)) / 10000) / 100
    // New CM = CM_prev + VM
    const liability = sg * cmPrev;
    const surplus = gc - liability;
    const vm = (surplus / 10000) / 100;
    const newCm = cmPrev + vm;
    return { newCm, vm };
  };

  const { newCm, vm } = newCash ? calculateQuotation(Number(newCash)) : { newCm: cmPrev, vm: 0 };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCash) return;

    setIsSubmitting(true);

    // Using the calculated quotation from the new formula
    const success = await addFinancialRecord({
      mes: currentMonth,
      ano: currentYear,
      geracaoCaixa: Number(newCash),
      valorCotacao: parseFloat(newCm.toFixed(4))
    });

    if (success) {
      setNewCash('');
    }
    setIsSubmitting(false);
  };

  const latestRecord = financial[0];
  const monthsNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Gera lista de 12 meses sempre fixa para a tabela
  const displayRecords = monthsNames.map((name, index) => {
    const monthNum = index + 1;
    const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    const record = financial.find(f => f.mes === monthStr && f.ano === currentYear);
    return {
      monthName: name,
      record: record || null,
      monthIndex: index + 1
    };
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Financial Ops</h1>
        <p className="text-ui-muted mt-1 font-medium">Gestão de lastro e cotação algorítmica da moeda.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/20 bg-black shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <TrendingUp size={64} className="text-brand-primary" />
          </div>
          <p className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] mb-2">Cotação Atual (Lastro)</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-brand-primary neon-text">R$ {latestRecord?.valorCotacao || '1.00'}</span>
            <span className="text-xs text-brand-primary mb-2 flex items-center font-bold">
              <TrendingUp className="w-3 h-3 mr-1" />
              {latestRecord ? `+${((latestRecord.valorCotacao - (prevRecord?.valorCotacao || 1)) / (prevRecord?.valorCotacao || 1) * 100).toFixed(2)}%` : '0%'}
            </span>
          </div>
          <p className="text-[9px] text-ui-muted mt-6 uppercase font-bold tracking-widest border-t border-white/5 pt-4">Sincronizado com os lucros do mês</p>
        </div>

        <div className="glass-card p-8 rounded-[32px] border border-white/10 bg-black shadow-2xl">
          <p className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] mb-2">Caixa Acumulado ({currentYear})</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-white">R$ {financial.reduce((acc, curr) => acc + curr.geracaoCaixa, 0).toLocaleString()}</span>
          </div>
          <p className="text-[9px] text-ui-muted mt-6 uppercase font-bold tracking-widest border-t border-white/5 pt-4">Consolidação anual de ativos</p>
        </div>

        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/30 bg-brand-primary/5 shadow-[0_0_30px_rgba(119,194,85,0.05)]">
          <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 mb-6 text-brand-primary">
            <DollarSign className="w-5 h-5" />
            Lançar Resultados
          </h3>
          <form onSubmit={handleAddRecord} className="space-y-4">
            <div className="relative">
              <input
                type="number"
                placeholder="Caixa gerado (R$)"
                className="w-full bg-black border border-brand-primary/20 rounded-2xl p-4 outline-none focus:border-brand-primary text-sm font-bold text-white placeholder:text-ui-muted/30"
                value={newCash}
                onChange={e => setNewCash(e.target.value === '' ? '' : Number(e.target.value))}
              />
              {newCash !== '' && (
                <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-ui-muted space-y-1">
                  <div className="flex justify-between">
                    <span>Cotação Anterior:</span>
                    <span className="font-bold text-white">R$ {cmPrev.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variação do Mês (VM):</span>
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

      <div className="glass-card rounded-[32px] border border-white/10 overflow-hidden bg-black shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-brand-primary" />
            <h3 className="font-black uppercase tracking-widest text-sm">Histórico Mensal ({currentYear})</h3>
          </div>
          <Calendar className="text-ui-muted w-5 h-5" />
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
                <tr key={item.monthIndex} className="bg-black hover:bg-brand-primary/5 transition-all group">
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;
