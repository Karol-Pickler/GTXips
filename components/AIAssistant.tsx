
import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, ImageIcon, Camera, Wand2, Loader2, Maximize2, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';
// Removed editProfileImage as it is not exported from geminiService
import { analyzeFinancialData, generateRuleIcon } from '../services/geminiService';

// Declaration for aistudio window methods
declare global {
  // Define AIStudio interface to match environmental declarations
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Standardize aistudio property on window with proper naming and optionality
    aistudio?: AIStudio;
  }
}

const AIAssistant: React.FC = () => {
  const { financial, users } = useApp();
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Check for API key on mount
  useEffect(() => {
    const checkKey = async () => {
      // Use optional chaining for safety when checking environmental bridge
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeFinancialData(financial);
      setInsight(result || 'Ocorreu um erro na análise.');
    } catch (error) {
      console.error(error);
      setInsight('Erro ao conectar com a IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIcon = async () => {
    if (!window.aistudio) return;

    // Mandatory key selection for gemini-3-pro-image-preview
    const selected = await window.aistudio.hasSelectedApiKey();
    if (!selected) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Proceed assuming selection success per guidelines
    }

    if (!imagePrompt) return;
    setLoading(true);
    try {
      const img = await generateRuleIcon(imagePrompt, imageSize);
      setGeneratedImage(img);
    } catch (error: any) {
      console.error(error);
      // Reset key if selection was invalid/missing billing
      if (error.message?.includes("Requested entity was not found.") && window.aistudio) {
        setHasApiKey(false);
        await window.aistudio.openSelectKey();
      } else {
        alert("Erro ao gerar imagem. Verifique se você configurou sua API Key de faturamento e tem acesso ao modelo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="text-[#39ff14] w-8 h-8" />
          GTX Assistant
        </h1>
        <p className="text-gray-400 mt-2">Poderosa integração com Gemini para análise de dados e geração de ativos visuais.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Analysis Card */}
        <div className="glass-card p-6 rounded-3xl border border-[#39ff14]/10 relative flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#39ff14]/10 rounded-lg">
              <MessageSquare className="text-[#39ff14] w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Análise Preditiva</h3>
          </div>

          <div className="flex-1 bg-black/40 rounded-2xl p-6 min-h-[300px] border border-white/5 overflow-y-auto prose prose-invert prose-sm max-w-none">
            {loading && !insight ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-[#39ff14]" />
                <p className="animate-pulse">Gemini está processando seus dados...</p>
              </div>
            ) : insight ? (
              <div dangerouslySetInnerHTML={{ __html: insight.replace(/\n/g, '<br/>') }} />
            ) : (
              <p className="text-gray-500 text-center mt-20">Clique no botão abaixo para gerar insights estratégicos baseados no seu histórico financeiro.</p>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-6 w-full bg-[#39ff14] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#39ff14]/10 hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 className="w-5 h-5" />}
            GERAR INSIGHTS COM GEMINI 3 FLASH
          </button>
        </div>

        {/* Image Generation Card */}
        <div className="glass-card p-6 rounded-3xl border border-[#39ff14]/10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#39ff14]/10 rounded-lg">
              <ImageIcon className="text-[#39ff14] w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Gerador de Ícones (Gemini 3 Pro Image)</h3>
          </div>

          <div className="space-y-4 flex-1">
            {!hasApiKey && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold uppercase">
                  <Key className="w-4 h-4" />
                  Chave Pro Necessária
                </div>
                <button 
                  onClick={() => window.aistudio?.openSelectKey().then(() => setHasApiKey(true))}
                  className="text-[10px] bg-yellow-500 text-black px-3 py-1 rounded-full font-bold uppercase"
                >
                  Configurar
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Prompt Criativo</label>
              <textarea 
                placeholder="Ex: Ícone de uma medalha futurista neon para prêmio de Meta Batida..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#39ff14] h-24 text-sm"
                value={imagePrompt}
                onChange={e => setImagePrompt(e.target.value)}
              />
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-xs text-gray-500 font-bold uppercase">Resolução:</span>
              {(['1K', '2K', '4K'] as const).map(size => (
                <button 
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${imageSize === size ? 'bg-[#39ff14] text-black border-[#39ff14]' : 'border-white/10 text-gray-500'}`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
              {loading && imagePrompt ? (
                <div className="flex flex-col items-center gap-4 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin text-[#39ff14]" />
                  <p className="text-[10px] uppercase">Renderizando...</p>
                </div>
              ) : generatedImage ? (
                <img src={generatedImage} alt="Gerado pela IA" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-700 flex flex-col items-center gap-2">
                   <Maximize2 className="w-10 h-10 opacity-20" />
                   <p className="text-[10px] uppercase">Pré-visualização</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleGenerateIcon}
            disabled={loading || !imagePrompt}
            className="mt-6 w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#39ff14] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {hasApiKey ? 'GERAR IMAGEM PRO' : 'ATIVAR & GERAR'}
          </button>
          <p className="text-[9px] text-center text-gray-600 mt-2 uppercase tracking-tighter">
            Requer API Key vinculada a faturamento. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#39ff14]">Ver docs</a>
          </p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Camera className="w-10 h-10 text-[#39ff14]" />
          <div>
            <h4 className="font-bold">Edição de Fotos de Perfil</h4>
            <p className="text-sm text-gray-400">Em breve: Use o modelo Gemini 2.5 Flash Image para editar fotos de colaboradores com comandos de voz/texto.</p>
          </div>
        </div>
        <button className="bg-white/5 px-6 py-3 rounded-xl border border-white/10 text-gray-500 font-bold text-sm cursor-not-allowed uppercase">Disponível em breve</button>
      </div>
    </div>
  );
};

export default AIAssistant;
