
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Dumbbell, ShoppingBag, Send, Search, Loader2, Link as LinkIcon, Clock, Sparkles } from 'lucide-react';
import { UserActivity, RescueRequest } from '../types';
import { searchBestPrice } from '../services/geminiService';

const SelfService: React.FC = () => {
  const { currentUser, rules, rescues, activities, financial, notify, addActivity, addRescue } = useApp();

  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  const [productName, setProductName] = useState('');
  const [rescueValue, setRescueValue] = useState<number | ''>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [isSubmittingRescue, setIsSubmittingRescue] = useState(false);
  const [aiResult, setAiResult] = useState<{ text: string, sources: any[] } | null>(null);

  const currentQuote = financial[0]?.valorCotacao || 0.20;

  const currentMonth = new Date().getMonth();
  const physicalActivitiesThisMonth = activities.filter(a => {
    const d = new Date(a.data);
    return a.userId === currentUser?.id &&
      d.getMonth() === currentMonth &&
      a.categoria.toLowerCase().includes('atividade física');
  }).length;

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const rule = rules.find(r => r.id === selectedRuleId);
    if (!rule) return;

    if (rule.categoria.toLowerCase().includes('atividade física') && physicalActivitiesThisMonth >= 12) {
      notify('Limite de 12 atividades físicas/mês atingido.', 'warning');
      return;
    }

    setIsSubmittingActivity(true);
    const success = await addActivity({
      userId: currentUser.id,
      ruleId: rule.id,
      data: activityDate,
      categoria: rule.categoria,
      valor: rule.valor
    });

    if (success) {
      setSelectedRuleId('');
      notify('Atividade enviada para aprovação do Admin!', 'info');
    }
    setIsSubmittingActivity(false);
  };

  const handleRescueSearch = async () => {
    if (!productName || !rescueValue) return;
    setAiLoading(true);
    try {
      const result = await searchBestPrice(productName, Number(rescueValue), currentQuote);
      setAiResult(result);
      notify('Análise de preços concluída pelo Gemini!', 'success');
    } catch (error) {
      notify('Erro ao consultar IA.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRequestRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (Number(rescueValue) > (currentUser?.saldoAtual || 0)) {
      notify('Saldo insuficiente para este resgate.', 'error');
      return;
    }

    setIsSubmittingRescue(true);
    const success = await addRescue({
      userId: currentUser.id,
      produto: productName,
      valorGtx: Number(rescueValue),
      data: new Date().toISOString().split('T')[0],
      aiFeedback: aiResult?.text,
      linkSugerido: aiResult?.sources?.[0]?.web?.uri
    });

    if (success) {
      setProductName('');
      setRescueValue('');
      setAiResult(null);
      notify('Solicitação de resgate enviada!', 'info');
    }
    setIsSubmittingRescue(false);
  };

  const myActivities = activities.filter(a => a.userId === currentUser?.id);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ui-text">Meu Portal GTXips</h1>
          <p className="text-ui-muted">Lance suas conquistas e solicite seus prêmios.</p>
        </div>
        <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-2xl flex items-center gap-4 shadow-[0_0_15px_rgba(119,194,85,0.05)]">
          <div className="p-3 bg-brand-primary text-black rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-ui-muted">Saldo Disponível</p>
            <p className="text-2xl font-black text-brand-primary">{currentUser?.saldoAtual} GTX</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Dumbbell className="text-brand-primary" />
            Lançar Atividade
          </h2>

          <form onSubmit={handleAddActivity} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-ui-muted mb-1 block">Data</label>
                <input
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-primary outline-none"
                  value={activityDate}
                  onChange={e => setActivityDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-ui-muted mb-1 block">Categoria</label>
                <select
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-primary outline-none appearance-none"
                  value={selectedRuleId}
                  onChange={e => setSelectedRuleId(e.target.value)}
                >
                  <option value="">Selecionar...</option>
                  {rules.map(r => <option key={r.id} value={r.id}>{r.categoria} ({r.valor} GTX)</option>)}
                </select>
              </div>
            </div>

            <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-ui-muted" />
                <div>
                  <p className="text-xs font-bold">Atividades Físicas no Mês</p>
                  <p className="text-lg font-black text-brand-primary">{physicalActivitiesThisMonth} <span className="text-xs text-ui-muted/50">/ 12</span></p>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmittingActivity}
                className="bg-brand-primary text-black font-bold px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_15px_rgba(119,194,85,0.2)] disabled:opacity-50"
              >
                {isSubmittingActivity ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar'}
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-white/5">
            <h3 className="text-sm font-bold text-ui-muted mb-4 uppercase tracking-widest">Meus últimos lançamentos</h3>
            <div className="space-y-2">
              {myActivities.length === 0 ? <p className="text-xs text-ui-muted/50">Nenhuma atividade lançada.</p> :
                myActivities.slice(-3).reverse().map(a => (
                  <div key={a.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-sm border border-white/5">
                    <span>{a.categoria}</span>
                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${a.status === 'pendente' ? 'bg-semantic-warning/10 text-semantic-warning' : a.status === 'aprovado' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-semantic-error/10 text-semantic-error'}`}>
                      {a.status}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <ShoppingBag className="text-semantic-info" />
            Solicitar Resgate
          </h2>

          <form onSubmit={handleRequestRescue} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-ui-muted mb-1 block">O que você quer?</label>
                <input
                  type="text"
                  placeholder="Ex: Teclado Mecânico"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-primary outline-none"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-ui-muted mb-1 block">Valor em GTXips</label>
                <input
                  type="number"
                  placeholder="Ex: 500"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-primary outline-none"
                  value={rescueValue}
                  onChange={e => setRescueValue(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRescueSearch}
                disabled={aiLoading || !productName}
                className="flex-1 bg-white/5 border border-white/10 hover:border-brand-primary/30 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 text-brand-primary" />}
                Consultar Melhor Preço (IA)
              </button>
            </div>

            {aiResult && (
              <div className="bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl animate-in zoom-in duration-300">
                <p className="text-xs text-brand-primary font-bold mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Sugestão do Gemini:</p>
                <p className="text-sm text-ui-text/80 leading-relaxed">{aiResult.text}</p>
                {aiResult.sources?.[0]?.web?.uri && (
                  <a href={aiResult.sources[0].web.uri} target="_blank" className="inline-flex items-center gap-2 mt-3 text-[10px] font-bold text-semantic-info bg-semantic-info/10 px-3 py-1.5 rounded-full border border-semantic-info/20">
                    <LinkIcon className="w-3 h-3" /> VER PRODUTO NO SITE
                  </a>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingRescue || !productName || !rescueValue}
              className="w-full bg-ui-text text-ui-bg font-black p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {isSubmittingRescue ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isSubmittingRescue ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO AO ADMIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SelfService;
