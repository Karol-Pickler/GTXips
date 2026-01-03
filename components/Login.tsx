
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, Mail, Lock, AlertCircle, Fingerprint, ArrowLeft, Key, CheckCircle, UserPlus, User as UserIcon } from 'lucide-react';
import { Logo } from './ui';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'reset-success'>('login');

  // States para recuperação
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, signup, resetPassword } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const success = await login(email, password);
    if (!success) {
      setError('Credenciais inválidas ou erro na conexão.');
      setLoading(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const success = await signup(email, password, nome);
    if (success) {
      setView('login');
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const success = await resetPassword(recoveryEmail);
    if (success) {
      setView('login');
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ui-bg flex items-center justify-center p-4 relative overflow-hidden font-inter text-ui-text">
      {/* Background Decorativo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md relative animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center p-8 bg-brand-primary/5 rounded-[40px] mb-2 border border-brand-primary/10 shadow-[0_0_30px_rgba(119,194,85,0.1)] relative group">
            <div className="absolute inset-0 bg-brand-primary/10 rounded-[40px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Logo className="w-16 h-16 relative z-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-ui-text uppercase leading-none">
              GTXIPS <span className="text-brand-primary">MANAGER</span>
            </h1>
            <p className="text-ui-muted text-[10px] tracking-[0.2em] uppercase font-bold mt-2">
              {view === 'login' && 'Acesso ao Terminal Gamificado'}
              {view === 'signup' && 'Nova Identidade no Sistema'}
              {view === 'forgot' && 'Recuperação de Identidade'}
            </p>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/20 shadow-[0_0_50px_rgba(119,194,85,0.05)]">

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-ui-muted tracking-widest ml-1">E-mail de Acesso</label>
                <div className={`flex items-center gap-3 bg-white/5 border ${error ? 'border-semantic-error animate-shake' : 'border-white/10 focus-within:border-brand-primary'} rounded-2xl p-4 transition-all`}>
                  <Mail className={`w-5 h-5 ${error ? 'text-semantic-error' : 'text-ui-muted'}`} />
                  <input
                    type="email"
                    placeholder="exemplo@company.com"
                    className="bg-transparent border-none outline-none flex-1 text-ui-text placeholder:text-ui-muted/30 font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] uppercase font-black text-ui-muted tracking-widest">Senha</label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[10px] text-brand-primary font-bold uppercase hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 focus-within:border-brand-primary rounded-2xl p-4 transition-all">
                  <Lock className="w-5 h-5 text-ui-muted" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="bg-transparent border-none outline-none flex-1 text-ui-text placeholder:text-ui-muted/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <p className="text-semantic-error text-[10px] font-bold uppercase flex items-center gap-1 mt-2 ml-1 animate-in fade-in">
                    <AlertCircle size={12} /> {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_25px_rgba(119,194,85,0.2)] disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <LogIn className="w-5 h-5" />}
                CONECTAR AO TERMINAL
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="text-[11px] text-ui-muted font-bold uppercase hover:text-brand-primary transition-colors tracking-widest"
                >
                  Não tem conta? <span className="text-brand-primary">Registrar agora</span>
                </button>
              </div>
            </form>
          )}

          {view === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-ui-muted hover:text-brand-primary transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-2"
              >
                <ArrowLeft size={14} /> Voltar para o Login
              </button>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-ui-muted tracking-widest ml-1">Nome Completo</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 focus-within:border-brand-primary rounded-2xl p-4 transition-all">
                  <UserIcon className="w-5 h-5 text-ui-muted" />
                  <input
                    type="text"
                    placeholder="Como quer ser chamado?"
                    className="bg-transparent border-none outline-none flex-1 text-ui-text placeholder:text-ui-muted/30 font-medium"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-ui-muted tracking-widest ml-1">E-mail Corporativo</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 focus-within:border-brand-primary rounded-2xl p-4 transition-all">
                  <Mail className="w-5 h-5 text-ui-muted" />
                  <input
                    type="email"
                    placeholder="seu-email@gtx.com"
                    className="bg-transparent border-none outline-none flex-1 text-ui-text placeholder:text-ui-muted/30 font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-ui-muted tracking-widest ml-1">Definir Senha</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 focus-within:border-brand-primary rounded-2xl p-4 transition-all">
                  <Lock className="w-5 h-5 text-ui-muted" />
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="bg-transparent border-none outline-none flex-1 text-ui-text placeholder:text-ui-muted/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <UserPlus className="w-5 h-5" />}
                CRIAR MINHA CONTA
              </button>
            </form>
          )}

          {view === 'forgot' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => { setView('login'); setError(null); }}
                className="text-ui-muted hover:text-brand-primary transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              >
                <ArrowLeft size={14} /> Voltar para o Login
              </button>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-ui-muted leading-relaxed">Insira o e-mail cadastrado para receber as instruções de recuperação.</p>
                  <div className={`flex items-center gap-3 bg-white/5 border ${error ? 'border-semantic-error' : 'border-white/10 focus-within:border-brand-primary'} rounded-2xl p-4 transition-all`}>
                    <Mail className={`w-5 h-5 ${error ? 'text-semantic-error' : 'text-ui-muted'}`} />
                    <input
                      type="email"
                      placeholder="seu-email@gtx.com"
                      className="bg-transparent border-none outline-none flex-1 text-ui-text placeholder:text-ui-muted/30 font-medium"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-ui-surface border border-brand-primary/30 text-brand-primary font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-primary/10 transition-all disabled:opacity-50">
                  {loading ? <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div> : <Key className="w-4 h-4" />}
                  ENVIAR E-MAIL DE RECUPERAÇÃO
                </button>
              </form>
            </div>
          )}

          {view === 'reset-success' && (
            <div className="text-center space-y-6 animate-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center p-4 bg-semantic-success/10 rounded-full mb-2">
                <CheckCircle className="w-12 h-12 text-semantic-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">E-mail Enviado!</h3>
                <p className="text-sm text-ui-muted">Verifique sua caixa de entrada para redefinir sua senha.</p>
              </div>
              <button
                onClick={() => setView('login')}
                className="w-full bg-brand-primary text-black font-black py-4 rounded-2xl hover:scale-[1.02] transition-all"
              >
                VOLTAR AO LOGIN
              </button>
            </div>
          )}

          {view === 'login' && (
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <button className="text-[10px] text-ui-muted font-bold uppercase hover:text-brand-primary transition-colors flex items-center justify-center gap-2 mx-auto tracking-widest">
                <Fingerprint size={14} /> Biometria Ativa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
