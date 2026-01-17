
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Rule, Recurrence } from '../types';
import { Plus, Award, Trash2, Info, Pencil, X } from 'lucide-react';

const Rules: React.FC = () => {
  const { rules, addRule, updateRule, removeRule } = useApp();
  const [newRule, setNewRule] = useState<Partial<Rule>>({ categoria: '', valor: 0, descricao: '', recorrencia: 'Mensal', isSelfService: false });
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Will implement setPageTitle
  }, []);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await addRule({
      categoria: newRule.categoria || '',
      valor: newRule.valor || 0,
      descricao: newRule.descricao || '',
      recorrencia: newRule.recorrencia || 'Mensal' as any,
      isSelfService: newRule.isSelfService || false
    });
    if (success) {
      setNewRule({ categoria: '', valor: 0, descricao: '', recorrencia: 'Mensal', isSelfService: false });
    }
    setIsSubmitting(false);
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    setIsSubmitting(true);
    const success = await updateRule(editingRule);
    if (success) {
      setEditingRule(null);
    }
    setIsSubmitting(false);
  };

  const handleRemoveRule = async (id: string) => {
    if (confirm("Remover esta regra de pontuação?")) {
      await removeRule(id);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/30 bg-black shadow-2xl h-fit">
          <h3 className="font-black mb-8 flex items-center gap-3 uppercase text-xs tracking-[0.2em] text-brand-primary">
            <Plus className="w-5 h-5" />
            Nova Diretriz
          </h3>
          <form onSubmit={handleAddRule} className="space-y-6">
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
              <input
                type="checkbox"
                id="isSelfService"
                className="w-5 h-5 accent-brand-primary rounded cursor-pointer"
                checked={newRule.isSelfService}
                onChange={e => setNewRule(prev => ({ ...prev, isSelfService: e.target.checked }))}
              />
              <label htmlFor="isSelfService" className="text-[10px] uppercase font-black text-ui-text cursor-pointer">Disponível no Auto-Atendimento</label>
            </div>
            <div>
              <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 mb-2 block">Nome da Categoria</label>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold placeholder:text-ui-muted/20"
                value={newRule.categoria}
                onChange={e => setNewRule(prev => ({ ...prev, categoria: e.target.value }))}
                placeholder="Ex: Performance Review"
              />
            </div>
            <div>
              <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 mb-2 block">Valor Base (GTXips)</label>
              <input
                type="number"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-brand-primary font-black"
                value={newRule.valor}
                onChange={e => setNewRule(prev => ({ ...prev, valor: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 mb-2 block">Recorrência do Evento</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary appearance-none text-white font-bold cursor-pointer"
                value={newRule.recorrencia}
                onChange={e => setNewRule(prev => ({ ...prev, recorrencia: e.target.value as Recurrence }))}
              >
                <option value="Anual" className="bg-[#1a1a1a] text-white">ANUAL / CICLO ANUAL</option>
                <option value="Mensal" className="bg-[#1a1a1a] text-white">MENSAL / CICLO MENSAL</option>
                <option value="Única" className="bg-[#1a1a1a] text-white">ÚNICA / EVENTO ÚNICO</option>
                <option value="Ad-hoc" className="bg-[#1a1a1a] text-white">AD-HOC / ESPORÁDICO</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 mb-2 block">Critérios de Elegibilidade</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary h-28 text-sm font-medium text-white placeholder:text-ui-muted/20"
                value={newRule.descricao}
                onChange={e => setNewRule(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Quais ações o agente deve realizar para conquistar estes pontos?"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-primary disabled:opacity-50 disabled:cursor-not-allowed text-black font-black p-4 rounded-2xl shadow-xl shadow-brand-primary/10 hover:scale-[1.02] transition-all uppercase tracking-tighter"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Diretriz'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Edit Modal */}
          {editingRule && (
            <div className="glass-card p-8 rounded-[32px] border border-brand-primary/40 bg-black shadow-[0_0_50px_rgba(119,194,85,0.05)]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black flex items-center gap-3 uppercase text-xs tracking-[0.2em] text-brand-primary">
                  <Pencil className="w-5 h-5" />
                  Editar Diretriz
                </h3>
                <button
                  onClick={() => setEditingRule(null)}
                  className="text-ui-muted hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateRule} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 mb-2 block">Nome da Categoria</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold"
                    value={editingRule.categoria}
                    onChange={e => setEditingRule(prev => prev ? { ...prev, categoria: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 mb-2 block">Valor Base (GTXips)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-brand-primary font-black"
                    value={editingRule.valor}
                    onChange={e => setEditingRule(prev => prev ? { ...prev, valor: parseInt(e.target.value) } : null)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 mb-2 block">Recorrência</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary appearance-none text-white font-bold cursor-pointer"
                    value={editingRule.recorrencia}
                    onChange={e => setEditingRule(prev => prev ? { ...prev, recorrencia: e.target.value as Recurrence } : null)}
                  >
                    <option value="Anual" className="bg-[#1a1a1a] text-white">ANUAL</option>
                    <option value="Mensal" className="bg-[#1a1a1a] text-white">MENSAL</option>
                    <option value="Única" className="bg-[#1a1a1a] text-white">ÚNICA</option>
                    <option value="Ad-hoc" className="bg-[#1a1a1a] text-white">AD-HOC</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <input
                    type="checkbox"
                    id="editSelfService"
                    className="w-5 h-5 accent-brand-primary rounded cursor-pointer"
                    checked={editingRule.isSelfService}
                    onChange={e => setEditingRule(prev => prev ? { ...prev, isSelfService: e.target.checked } : null)}
                  />
                  <label htmlFor="editSelfService" className="text-[10px] uppercase font-black text-ui-text cursor-pointer">Auto-Atendimento</label>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 mb-2 block">Critérios</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary h-20 text-sm font-medium text-white"
                    value={editingRule.descricao}
                    onChange={e => setEditingRule(prev => prev ? { ...prev, descricao: e.target.value } : null)}
                  ></textarea>
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
                    onClick={() => setEditingRule(null)}
                    className="px-8 bg-white/5 border border-white/10 text-ui-muted font-bold p-4 rounded-2xl hover:text-white hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map(rule => (
              <div key={rule.id} className="glass-card p-8 rounded-[32px] border border-white/5 bg-black hover:border-brand-primary/40 transition-all relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 -mr-12 -mt-12 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-colors"></div>
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="p-2 bg-white/5 text-ui-muted hover:text-brand-primary hover:bg-brand-primary/10 border border-white/5 rounded-xl transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveRule(rule.id)}
                    className="p-2 bg-white/5 text-ui-muted hover:text-semantic-error hover:bg-semantic-error/10 border border-white/5 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 shadow-inner group-hover:bg-brand-primary group-hover:text-black transition-all">
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xl text-white group-hover:text-brand-primary transition-colors leading-none mb-2">{rule.categoria}</h4>
                    <p className="text-3xl font-black text-brand-primary neon-text">{rule.valor} <span className="text-xs uppercase font-black tracking-widest">GTXips</span></p>
                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-[9px] bg-white/10 px-3 py-1 rounded-full text-ui-muted uppercase tracking-widest font-black group-hover:bg-brand-primary/20 group-hover:text-white transition-all">{rule.recorrencia}</span>
                      {rule.isSelfService && (
                        <span className="text-[9px] bg-brand-primary/10 px-3 py-1 rounded-full text-brand-primary uppercase tracking-widest font-black">Self-Service</span>
                      )}
                    </div>
                    <p className="text-sm text-ui-muted mt-6 leading-relaxed font-medium group-hover:text-white/80 transition-colors">{rule.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl flex items-center gap-4">
            <Info className="text-brand-primary w-6 h-6 shrink-0" />
            <p className="text-xs text-ui-muted font-medium italic">
              A Engine de Regras é soberana. Alterações aqui impactam apenas novos lançamentos e não retroagem sobre saldos consolidados dos colaboradores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;
