
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUpCircle, ArrowDownCircle, History, Filter, Send, User as UserIcon, Award, DollarSign, Calendar, Pencil, X, Trash2 } from 'lucide-react';
import { Transaction } from '../types';

const Transactions: React.FC = () => {
  const { users, rules, transactions, addTransaction, updateTransaction, deleteTransaction, currentUser, setPageTitle } = useApp();
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRule, setSelectedRule] = useState('');
  const [manualAmount, setManualAmount] = useState<number | ''>('');
  const [manualReason, setManualReason] = useState('');
  const [type, setType] = useState<'credito' | 'debito'>('credito');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterAgent, setFilterAgent] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credito' | 'debito'>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    setPageTitle('Histórico');
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    // Filter by agent
    if (filterAgent && t.userId !== filterAgent) return false;

    // Filter by type
    if (filterType !== 'all' && t.tipo !== filterType) return false;

    // Filter by date range
    if (filterDateFrom && t.data < filterDateFrom) return false;
    if (filterDateTo && t.data > filterDateTo) return false;

    return true;
  }).sort((a, b) => {
    // Sort by date descending (newest first)
    return b.data.localeCompare(a.data);
  });

  // Reset filters
  const resetFilters = () => {
    setFilterAgent('');
    setFilterType('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // Check if any filter is active
  const hasActiveFilters = filterAgent || filterType !== 'all' || filterDateFrom || filterDateTo;


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

    const success = await addTransaction(selectedUser, amount, reason, type, transactionDate);

    if (success) {
      // Reset form
      setSelectedUser('');
      setSelectedRule('');
      setManualAmount('');
      setManualReason('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
    }
    setIsSubmitting(false);
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    setIsSubmitting(true);
    const success = await updateTransaction(editingTransaction);
    if (success) {
      setEditingTransaction(null);
    }
    setIsSubmitting(false);
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;
    setIsSubmitting(true);
    const success = await deleteTransaction(deletingTransaction.id);
    if (success) {
      setDeletingTransaction(null);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Lançamentos</h1>
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
                <Calendar size={12} className="text-brand-primary" /> Data do Lançamento
              </label>
              <input
                type="date"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold appearance-none"
                value={transactionDate}
                onChange={e => setTransactionDate(e.target.value)}
              />
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
                <option value="" className="bg-[#1a1a1a] text-white">Selecionar Agente...</option>
                {users.map(u => <option key={u.id} value={u.id} className="bg-[#1a1a1a] text-white">{u.nome} ({u.cargo})</option>)}
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
                <option value="" className="bg-[#1a1a1a] text-white">Lançamento Manual Avulso</option>
                {rules.map(r => <option key={r.id} value={r.id} className="bg-[#1a1a1a] text-white">{r.categoria} (+{r.valor} GTX)</option>)}
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

        <div className="lg:col-span-2 space-y-8">
          {/* Filter Modal */}
          {showFilterModal && (
            <div className="glass-card p-8 rounded-[32px] border border-brand-primary/40 bg-black shadow-[0_0_50px_rgba(119,194,85,0.05)]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black flex items-center gap-3 uppercase text-xs tracking-[0.2em] text-brand-primary">
                  <Filter className="w-5 h-5" />
                  Filtrar Registros
                </h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-ui-muted hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] ml-1 mb-2 block flex items-center gap-2">
                    <UserIcon size={12} className="text-brand-primary" />
                    Filtrar por Agente
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary appearance-none text-white font-bold cursor-pointer"
                    value={filterAgent}
                    onChange={e => setFilterAgent(e.target.value)}
                  >
                    <option value="" className="bg-[#1a1a1a] text-white">Todos os Agentes</option>
                    {users.map(u => <option key={u.id} value={u.id} className="bg-[#1a1a1a] text-white">{u.nome} ({u.cargo})</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] ml-1 mb-2 block">
                    Tipo de Operação
                  </label>
                  <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setFilterType('all')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-white/10 text-white shadow-inner' : 'text-ui-muted hover:text-white'}`}
                    >Todas</button>
                    <button
                      type="button"
                      onClick={() => setFilterType('credito')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'credito' ? 'bg-brand-primary text-black shadow-[0_0_15px_rgba(119,194,85,0.3)]' : 'text-ui-muted hover:text-white'}`}
                    >Crédito</button>
                    <button
                      type="button"
                      onClick={() => setFilterType('debito')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'debito' ? 'bg-semantic-error text-white shadow-[0_0_15px_rgba(255,89,99,0.3)]' : 'text-ui-muted hover:text-white'}`}
                    >Débito</button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] ml-1 mb-2 block flex items-center gap-2">
                    <Calendar size={12} className="text-brand-primary" />
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold"
                    value={filterDateFrom}
                    onChange={e => setFilterDateFrom(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] ml-1 mb-2 block flex items-center gap-2">
                    <Calendar size={12} className="text-brand-primary" />
                    Data Final
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold"
                    value={filterDateTo}
                    onChange={e => setFilterDateTo(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetFilters();
                      setShowFilterModal(false);
                    }}
                    className="flex-1 bg-white/5 border border-white/10 text-ui-muted font-bold p-4 rounded-2xl hover:text-white hover:bg-white/10 transition-all uppercase tracking-tighter"
                  >
                    Limpar Filtros
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 bg-brand-primary text-black font-black p-4 rounded-2xl shadow-xl shadow-brand-primary/10 hover:scale-[1.02] transition-all uppercase tracking-tighter"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deletingTransaction && (
            <div className="glass-card p-8 rounded-[32px] border border-semantic-error/40 bg-black shadow-[0_0_50px_rgba(255,89,99,0.05)]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black flex items-center gap-3 uppercase text-xs tracking-[0.2em] text-semantic-error">
                  <Trash2 className="w-5 h-5" />
                  Confirmar Exclusão
                </h3>
                <button
                  onClick={() => setDeletingTransaction(null)}
                  className="text-ui-muted hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-semantic-error/10 border border-semantic-error/20 rounded-2xl">
                  <p className="text-white font-bold mb-4">
                    Você está prestes a excluir este lançamento. Esta ação não pode ser desfeita.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ui-muted">Data:</span>
                      <span className="text-white font-bold">{deletingTransaction.data}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ui-muted">Agente:</span>
                      <span className="text-white font-bold">{users.find(u => u.id === deletingTransaction.userId)?.nome || 'Ex-Colaborador'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ui-muted">Operação:</span>
                      <span className="text-white font-bold">{deletingTransaction.motivo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ui-muted">Valor:</span>
                      <span className={`font-black ${deletingTransaction.tipo === 'credito' ? 'text-brand-primary' : 'text-semantic-error'}`}>
                        {deletingTransaction.tipo === 'credito' ? '+' : '-'}{deletingTransaction.valor} GTX
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setDeletingTransaction(null)}
                    className="flex-1 bg-white/5 border border-white/10 text-ui-muted font-bold p-4 rounded-2xl hover:text-white hover:bg-white/10 transition-all uppercase tracking-tighter"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTransaction}
                    disabled={isSubmitting}
                    className="flex-1 bg-semantic-error disabled:opacity-50 text-white font-black p-4 rounded-2xl shadow-xl shadow-semantic-error/10 hover:scale-[1.02] transition-all uppercase tracking-tighter"
                  >
                    {isSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editingTransaction && (
            <div className="glass-card p-8 rounded-[32px] border border-brand-primary/40 bg-black shadow-[0_0_50px_rgba(119,194,85,0.05)]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black flex items-center gap-3 uppercase text-xs tracking-[0.2em] text-brand-primary">
                  <Pencil className="w-5 h-5" />
                  Editar Lançamento
                </h3>
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="text-ui-muted hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] ml-1 mb-2 block">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold"
                    value={editingTransaction.data}
                    onChange={e => setEditingTransaction(prev => prev ? { ...prev, data: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] ml-1 mb-2 block">
                    Valor (GTX)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold"
                    value={editingTransaction.valor}
                    onChange={e => setEditingTransaction(prev => prev ? { ...prev, valor: Number(e.target.value) } : null)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-[0.2em] ml-1 mb-2 block">
                    Motivo
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold"
                    value={editingTransaction.motivo}
                    onChange={e => setEditingTransaction(prev => prev ? { ...prev, motivo: e.target.value } : null)}
                  />
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-brand-primary disabled:opacity-50 text-black font-black p-4 rounded-2xl shadow-xl shadow-brand-primary/10 hover:scale-[1.02] transition-all uppercase tracking-tighter"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTransaction(null)}
                    className="px-8 bg-white/5 border border-white/10 text-ui-muted font-bold p-4 rounded-2xl hover:text-white hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-card rounded-[32px] border border-white/10 overflow-hidden bg-black shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-black flex items-center gap-3 uppercase text-sm tracking-widest text-white">
                <History className="w-5 h-5 text-brand-primary" />
                Histórico de Terminal
              </h3>
              <button
                onClick={() => setShowFilterModal(true)}
                className={`text-[10px] font-black flex items-center gap-2 transition-colors uppercase tracking-[0.2em] ${hasActiveFilters ? 'text-brand-primary' : 'text-ui-muted hover:text-brand-primary'}`}
              >
                <Filter className="w-3 h-3" />
                Filtrar Registros
                {hasActiveFilters && <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />}
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
                      {currentUser?.role === 'admin' && <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-ui-muted text-center">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTransactions.map(t => {
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
                          {currentUser?.role === 'admin' && (
                            <td className="p-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setEditingTransaction(t)}
                                  className="p-2 bg-white/5 text-ui-muted hover:text-brand-primary hover:bg-brand-primary/10 border border-white/5 rounded-xl transition-all"
                                  title="Editar lançamento"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingTransaction(t)}
                                  className="p-2 bg-white/5 text-ui-muted hover:text-semantic-error hover:bg-semantic-error/10 border border-white/5 rounded-xl transition-all"
                                  title="Excluir lançamento"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredTransactions.length === 0 && (
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
