
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUpCircle, ArrowDownCircle, History, Filter, Send, User as UserIcon, Award, DollarSign } from 'lucide-react';

const Transactions: React.FC = () => {
  const { users, rules, transactions, addTransaction } = useApp();
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRule, setSelectedRule] = useState('');
  const [manualAmount, setManualAmount] = useState<number | ''>('');
  const [manualReason, setManualReason] = useState('');
  const [type, setType] = useState<'credito' | 'debito'>('credito');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManualLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    let amount = 0;
    let reason = '';

    if (selectedRule) {
      const rule = rules.find(r => r.id === selectedRule);
      amount = rule?.valor || 0;
      reason = rule?.categoria || '';
    } else {
      amount = Number(manualAmount);
      reason = manualReason;
    }

    const success = await addTransaction(selectedUser, amount, reason, type);

    if (success) {
      // Reset form
      setSelectedUser('');
      setSelectedRule('');
      setManualAmount('');
      setManualReason('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Ledger & Ops</h1>
        <p className="text-ui-muted mt-1 font-medium">Gestão manual de movimentações e auditoria de histórico.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/30 bg-black shadow-2xl h-fit">
          <h3 className="font-black mb-8 flex items-center gap-3 uppercase text-xs tracking-[0.2em] text-brand-primary">
            <Send className="w-5 h-5" />
            Novo Lançamento
          </h3>
          <form onSubmit={handleManualLaunch} className="space-y-6">
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setType('credito')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'credito' ? 'bg-brand-primary text-black shadow-[0_0_15px_rgba(119,194,85,0.3)]' : 'text-ui-muted hover:text-white'}`}
              >Crédito</button>
              <button
                type="button"
                onClick={() => setType('debito')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'debito' ? 'bg-semantic-error text-white shadow-[0_0_15px_rgba(255,89,99,0.3)]' : 'text-ui-muted hover:text-white'}`}
              >Débito</button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                <UserIcon size={12} className="text-brand-primary" /> Colaborador Destino
              </label>
              <select
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary appearance-none text-white font-bold cursor-pointer"
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
              >
                <option value="">Selecionar Agente...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.nome} ({u.cargo})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                <Award size={12} className="text-brand-primary" /> Modelo de Regra
              </label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary appearance-none text-white font-bold cursor-pointer"
                value={selectedRule}
                onChange={e => {
                  setSelectedRule(e.target.value);
                  if (e.target.value) {
                    const r = rules.find(rule => rule.id === e.target.value);
                    setManualAmount(r?.valor || 0);
                    setManualReason(r?.categoria || '');
                  }
                }}
              >
                <option value="">Lançamento Manual Avulso</option>
                {rules.map(r => <option key={r.id} value={r.id}>{r.categoria} (+{r.valor} GTX)</option>)}
              </select>
            </div>

            {!selectedRule && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                    <DollarSign size={12} className="text-brand-primary" /> Valor GTXips
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-brand-primary font-black"
                    value={manualAmount}
                    onChange={e => setManualAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1">Descrição do Motivo</label>
                  <input
                    type="text"
                    placeholder="Ex: Superou expectativas no projeto X"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold placeholder:text-ui-muted/20"
                    value={manualReason}
                    onChange={e => setManualReason(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-primary disabled:opacity-50 disabled:cursor-not-allowed text-black font-black p-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/10 uppercase tracking-tighter mt-4"
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar Registro'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card rounded-[32px] border border-white/10 overflow-hidden bg-black shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-black flex items-center gap-3 uppercase text-sm tracking-widest text-white">
                <History className="w-5 h-5 text-brand-primary" />
                Histórico de Terminal
              </h3>
              <button className="text-[10px] font-black text-ui-muted flex items-center gap-2 hover:text-brand-primary transition-colors uppercase tracking-[0.2em]">
                <Filter className="w-3 h-3" />
                Filtrar Registros
              </button>
            </div>
            <div className="max-h-[700px] overflow-y-auto overflow-x-auto">
              <div className="min-w-[800px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-black sticky top-0 border-b border-white/10 z-10">
                    <tr>
                      <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-ui-muted">Timestamp</th>
                      <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-ui-muted">Agente</th>
                      <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-ui-muted">Operação</th>
                      <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-ui-muted text-right">Montante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map(t => {
                      const user = users.find(u => u.id === t.userId);
                      return (
                        <tr key={t.id} className="bg-black hover:bg-brand-primary/5 transition-all group">
                          <td className="p-6 text-xs text-ui-muted font-bold group-hover:text-white transition-colors">{t.data}</td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <img src={user?.fotoUrl} className="w-8 h-8 rounded-full border border-white/10 group-hover:border-brand-primary/40 transition-all" />
                              <span className="text-sm font-black text-white group-hover:text-brand-primary transition-colors">{user?.nome || 'Ex-Colaborador'}</span>
                            </div>
                          </td>
                          <td className="p-6 text-sm font-medium text-ui-muted group-hover:text-white transition-colors">{t.motivo}</td>
                          <td className={`p-6 text-right font-black text-sm ${t.tipo === 'credito' ? 'text-brand-primary neon-text' : 'text-semantic-error'}`}>
                            <span className="flex items-center justify-end gap-2">
                              {t.tipo === 'credito' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                              {t.valor} GTX
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <div className="p-20 text-center space-y-4">
                    <History className="w-12 h-12 text-ui-muted/20 mx-auto" />
                    <p className="text-ui-muted font-black uppercase text-xs tracking-widest">Nenhum registro encontrado no ledger.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
