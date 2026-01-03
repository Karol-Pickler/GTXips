
import React from 'react';
import { 
  Shield, 
  Gift, 
  BookOpen, 
  Presentation, 
  Dumbbell, 
  Calculator, 
  TrendingUp, 
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  Coins
} from 'lucide-react';

const Regulamento: React.FC = () => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-in fade-in duration-700 pb-20">
      <header className="text-center space-y-4">
        <div className="inline-block p-3 bg-brand-primary/10 rounded-full mb-2">
          <Shield className="w-12 h-12 text-brand-primary" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Regulamento Oficial</h1>
        <p className="text-ui-muted text-lg font-medium">Sistema de Premiação GTX Tecnologia</p>
        <div className="h-1 w-24 bg-brand-primary mx-auto rounded-full shadow-[0_0_10px_#77c255]"></div>
      </header>

      {/* 1. Definição e Objetivos */}
      <section className="glass-card p-8 rounded-[32px] border border-brand-primary/20 bg-black space-y-6">
        <h2 className="text-2xl font-black flex items-center gap-3 text-brand-primary uppercase italic">
          <AlertCircle className="w-6 h-6" />
          1. Definição e Objetivos
        </h2>
        <div className="text-ui-text/80 leading-relaxed space-y-4 font-medium">
          <p>
            Buscando uma forma inovadora e criativa de premiar os seus colaboradores pela participação em atividades de integração, 
            a <span className="text-white font-bold">GTX Tecnologia</span> desenvolveu o sistema baseado em <span className="text-brand-primary font-bold neon-text text-lg">GTXips</span> (pontuação simbólica).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group hover:border-brand-primary/30 transition-all">
              <p className="font-black text-white mb-2 uppercase tracking-widest text-xs">Engajamento</p>
              <p className="text-sm text-ui-muted italic">Aumentar a integração e reconhecer esforço e dedicação.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group hover:border-brand-primary/30 transition-all">
              <p className="font-black text-white mb-2 uppercase tracking-widest text-xs">Transparência</p>
              <p className="text-sm text-ui-muted italic">Dar visibilidade sobre a saúde financeira da empresa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Regras Gerais */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase italic tracking-tighter">
          <Calculator className="w-6 h-6 text-brand-primary" />
          2. Regras Gerais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-brand-primary bg-black">
            <p className="font-black text-white uppercase text-xs mb-2 tracking-widest">Elegibilidade</p>
            <p className="text-sm text-ui-muted italic font-medium">Todos participam: Estagiários, colaboradores e sócios. Sem distinção de cargo.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-brand-primary bg-black">
            <p className="font-black text-white uppercase text-xs mb-2 tracking-widest">Valorização</p>
            <p className="text-sm text-ui-muted italic font-medium">A GTX pode alterar regras, mas nunca prejudicando saldos já conquistados.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-brand-primary bg-black">
            <p className="font-black text-white uppercase text-xs mb-2 tracking-widest">Conversão</p>
            <p className="text-sm text-semantic-error italic font-black uppercase">Proibida a conversão em dinheiro. O resgate deve ser em produtos ou serviços.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-brand-primary bg-black">
            <p className="font-black text-white uppercase text-xs mb-2 tracking-widest">Desligamento</p>
            <p className="text-sm text-ui-muted italic font-medium">30 dias para resgate após saída. Saldo remanescente vai para caridade.</p>
          </div>
        </div>
      </section>

      {/* 3. Premiações */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-black uppercase italic text-white underline decoration-brand-primary decoration-4 underline-offset-8">3. Premiações</h2>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 3.1 Presentes */}
          <div className="glass-card p-8 rounded-3xl space-y-4 border border-white/5 bg-black hover:border-brand-primary/40 transition-all group">
            <Gift className="w-8 h-8 text-brand-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Presentes</h3>
            <ul className="text-sm space-y-3 text-ui-muted font-bold">
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Start:</span> <span className="text-brand-primary">100 GTX</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Aniversário:</span> <span className="text-brand-primary">75 GTX</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Natal:</span> <span className="text-brand-primary">75 GTX</span></li>
              <li className="flex justify-between"><span>Páscoa:</span> <span className="text-brand-primary">30 GTX</span></li>
            </ul>
          </div>

          {/* 3.2 Desafios */}
          <div className="glass-card p-8 rounded-3xl space-y-4 border border-white/5 bg-black hover:border-brand-primary/40 transition-all group">
            <TrendingUp className="w-8 h-8 text-brand-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Desafios GTX</h3>
            <p className="text-[10px] text-ui-muted uppercase font-black tracking-widest">Incentivo à criatividade.</p>
            <ul className="text-sm space-y-3 text-ui-muted font-bold">
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Participação:</span> <span className="text-brand-primary">10 GTX</span></li>
              <li className="flex justify-between"><span>Vencedor:</span> <span className="text-brand-primary">+20 GTX</span></li>
            </ul>
          </div>

          {/* 3.3 Biblioteca */}
          <div className="glass-card p-8 rounded-3xl space-y-4 border border-white/5 bg-black hover:border-brand-primary/40 transition-all group">
            <BookOpen className="w-8 h-8 text-brand-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Biblioteca</h3>
            <ul className="text-sm space-y-3 text-ui-muted font-bold">
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Solicitar livro:</span> <span className="text-brand-primary">5 GTX</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Formulário:</span> <span className="text-brand-primary">10 GTX</span></li>
              <li className="flex justify-between"><span>Sugestão:</span> <span className="text-brand-primary">20 GTX</span></li>
            </ul>
          </div>

          {/* 3.4 Apresentações */}
          <div className="glass-card p-8 rounded-3xl space-y-4 border border-white/5 bg-black hover:border-brand-primary/40 transition-all group">
            <Presentation className="w-8 h-8 text-brand-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Apresentações</h3>
            <ul className="text-sm space-y-3 text-ui-muted font-bold">
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Participação:</span> <span className="text-brand-primary">5 GTX</span></li>
              <li className="flex justify-between"><span>Soluções:</span> <span className="text-brand-primary">20 GTX</span></li>
            </ul>
          </div>

          {/* 3.5 Atletas */}
          <div className="glass-card p-8 rounded-3xl space-y-4 border border-white/5 bg-black hover:border-brand-primary/40 transition-all group">
            <Dumbbell className="w-8 h-8 text-brand-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Atletas GTX</h3>
            <ul className="text-sm space-y-3 text-ui-muted font-bold">
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Atividade:</span> <span className="text-brand-primary">1 GTX</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Corrida:</span> <span className="text-brand-primary">2 GTX/km</span></li>
              <li className="flex justify-between"><span>Campeão:</span> <span className="text-brand-primary">10 GTX</span></li>
            </ul>
          </div>

          {/* 3.6 Bônus Empresa */}
          <div className="glass-card p-8 rounded-3xl border-2 border-brand-primary/30 bg-brand-primary/5 space-y-4 flex flex-col justify-center">
            <Coins className="w-10 h-10 text-brand-primary mx-auto shadow-inner" />
            <h3 className="text-xl font-black text-brand-primary uppercase text-center tracking-tighter">Bônus Coletivo</h3>
            <div className="p-4 bg-black/60 rounded-2xl text-center border border-brand-primary/20">
              <p className="text-3xl font-black text-white neon-text">20%</p>
              <p className="text-[9px] text-ui-muted uppercase font-bold tracking-widest mt-1">Soma das Premiações</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Valorização da Moeda */}
      <section className="glass-card p-10 rounded-[40px] space-y-8 overflow-hidden relative border border-brand-primary/20 bg-black shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 blur-[120px] -z-10"></div>
        <h2 className="text-3xl font-black flex items-center gap-4 text-white uppercase italic">
          <TrendingUp className="text-brand-primary w-8 h-8" />
          4. Valorização da Moeda
        </h2>
        <p className="text-ui-muted leading-relaxed font-medium italic text-lg border-l-2 border-brand-primary pl-6">
          O saldo dos colaboradores tem impacto direto sobre a geração de caixa mensal. 
          Se a empresa gera mais caixa, o saldo de todos valoriza exponencialmente.
        </p>
        
        <div className="bg-black/80 p-8 rounded-3xl border border-brand-primary/30 font-mono text-center shadow-inner">
          <p className="text-[10px] text-brand-primary mb-6 uppercase font-black tracking-[0.3em]">Cálculo Sistêmico da GTXips</p>
          <div className="text-xl md:text-3xl text-white font-black break-all leading-tight">
            ((GC<sub>(m)</sub> - (SG<sub>(m)</sub> * CM<sub>(m-1)</sub>)) / 10.000) / 100 = <span className="text-brand-primary underline decoration-brand-primary/40 underline-offset-8">VM<sub>(m)</sub></span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 text-[9px] text-ui-muted uppercase font-black tracking-widest">
            <div className="flex flex-col gap-1"><span className="text-white text-xs">GC</span> Geração de Caixa</div>
            <div className="flex flex-col gap-1"><span className="text-white text-xs">SG</span> Saldo GTXips</div>
            <div className="flex flex-col gap-1"><span className="text-white text-xs">CM</span> Cotação Anterior</div>
            <div className="flex flex-col gap-1"><span className="text-brand-primary text-xs">VM</span> Variação Mensal</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="glass-card p-8 rounded-3xl space-y-4 bg-black border border-white/10 group hover:border-brand-primary/20 transition-all">
          <h2 className="text-xl font-black flex items-center gap-3 text-white uppercase italic">
            <Coins className="w-5 h-5 text-brand-primary" />
            5. Apostas Internas
          </h2>
          <p className="text-sm text-ui-muted font-medium">Permitido para eventos internos (futebol, poker, etc).</p>
          <div className="p-4 bg-semantic-error/5 border border-semantic-error/20 rounded-2xl">
            <p className="text-[10px] text-semantic-error font-black uppercase tracking-widest flex items-center gap-2 mb-1">
              <AlertCircle size={12} /> Limite de Risco
            </p>
            <p className="text-sm text-white font-bold italic">Máximo de 10 GTXips de perda por evento.</p>
          </div>
        </section>

        <section className="glass-card p-8 rounded-3xl space-y-4 bg-black border border-white/10 group hover:border-brand-primary/20 transition-all">
          <h2 className="text-xl font-black flex items-center gap-3 text-white uppercase italic">
            <ShoppingBag className="w-5 h-5 text-brand-primary" />
            6. Fluxo de Resgates
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-brand-primary text-black flex items-center justify-center text-xs font-black shadow-[0_0_10px_#77c255]">1</div>
              <p className="text-xs text-ui-muted font-bold leading-relaxed uppercase">Enviar e-mail para o responsável com o produto e valor.</p>
            </div>
            <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl">
              <p className="text-[10px] text-brand-primary font-black uppercase italic tracking-widest mb-1">Restrição Anual</p>
              <p className="text-sm text-white font-bold">Máximo de 02 resgates por ano fiscal.</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="text-center pt-16 border-t border-white/5 space-y-4">
        <HelpCircle className="w-8 h-8 mx-auto text-ui-muted opacity-30" />
        <p className="text-ui-muted text-xs font-black uppercase tracking-widest">Dúvidas? Entre em contato com o administrador GTXips.</p>
        <p className="text-[9px] text-ui-muted/40 uppercase font-black tracking-[0.4em]">Sincronizado: 14 de maio de 2021</p>
      </footer>
    </div>
  );
};

export default Regulamento;
