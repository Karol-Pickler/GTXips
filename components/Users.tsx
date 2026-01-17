
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { UserPlus, Pencil, Trash2, Calendar, Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../services/supabase';

interface NewCollaborator {
  email: string;
  password: string;
  nome: string;
  cargo: string;
  role: UserRole;
  dataNascimento: string;
  dataContratacao: string;
  fotoUrl: string;
}

const Users: React.FC = () => {
  const { users, upsertProfile, deleteProfile, notify, currentUser, refreshData, uploadAvatar } = useApp();
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNewFormOpen, setIsNewFormOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState<NewCollaborator>({
    email: '',
    password: '',
    nome: '',
    cargo: '',
    role: 'user',
    dataNascimento: '',
    dataContratacao: '',
    fotoUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.id) return;

    setIsSubmitting(true);
    const success = await upsertProfile(editingUser);
    if (success) {
      setIsFormOpen(false);
      setEditingUser(null);
    }
    setIsSubmitting(false);
  };

  const handleCreateCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollaborator.email || !newCollaborator.password || !newCollaborator.nome) {
      notify('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (newCollaborator.password.length < 6) {
      notify('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('https://fuyhqfoteehnexvndbvj.supabase.co/functions/v1/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(newCollaborator)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar colaborador');
      }

      notify('Colaborador cadastrado com sucesso!', 'success');
      setIsNewFormOpen(false);
      setNewCollaborator({
        email: '',
        password: '',
        nome: '',
        cargo: '',
        role: 'user',
        dataNascimento: '',
        dataContratacao: '',
        fotoUrl: ''
      });
      // Refresh the users list without leaving the page
      await refreshData();
    } catch (error: any) {
      notify(error.message || 'Erro ao criar colaborador.', 'error');
    }
    setIsSubmitting(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Deseja realmente remover este agente do sistema?')) {
      await deleteProfile(id);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Preview logic (optional, for now just notify)
      notify('Fazendo upload da imagem...', 'info');

      try {
        const publicUrl = await uploadAvatar(file);
        if (publicUrl) {
          if (isNew) {
            setNewCollaborator(prev => ({ ...prev, fotoUrl: publicUrl }));
          } else {
            setEditingUser(prev => ({ ...prev, fotoUrl: publicUrl }));
          }
          notify('Imagem carregada com sucesso!', 'success');
        }
      } catch (err) {
        notify('Erro ao carregar imagem.', 'error');
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Cadastro Colaboradores</h1>
          <p className="text-ui-muted mt-1 font-medium">Controle de acessos e permissões de nível sistêmico.</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => {
              setNewCollaborator({
                email: '',
                password: '',
                nome: '',
                cargo: '',
                role: 'user',
                dataNascimento: '',
                dataContratacao: '',
                fotoUrl: ''
              });
              setIsNewFormOpen(true);
            }}
            className="flex items-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-black px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl shadow-brand-primary/20"
          >
            <UserPlus className="w-5 h-5" />
            Cadastrar Novo Colaborador
          </button>
        )}
      </header>

      {/* New Collaborator Registration Form */}
      {isNewFormOpen && (
        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/40 bg-black shadow-[0_0_50px_rgba(119,194,85,0.05)]">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary mb-8 underline decoration-brand-primary/20 underline-offset-8">Cadastro de Novo Colaborador</h3>
          <form onSubmit={handleCreateCollaborator} autoComplete="off" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do colaborador"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold placeholder:text-ui-muted/30"
                  value={newCollaborator.nome}
                  onChange={e => setNewCollaborator(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  autoComplete="new-email"
                  placeholder="email@empresa.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold placeholder:text-ui-muted/30"
                  value={newCollaborator.email}
                  onChange={e => setNewCollaborator(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Senha de Acesso *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 outline-none focus:border-brand-primary text-white font-bold placeholder:text-ui-muted/30"
                    value={newCollaborator.password}
                    onChange={e => setNewCollaborator(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ui-muted hover:text-brand-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Cargo / Squad</label>
                <input
                  type="text"
                  placeholder="Ex: Desenvolvedor Frontend"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold placeholder:text-ui-muted/30"
                  value={newCollaborator.cargo}
                  onChange={e => setNewCollaborator(prev => ({ ...prev, cargo: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Data Nascimento</label>
                <input
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold invert-[0.9] md:invert-0"
                  value={newCollaborator.dataNascimento}
                  onChange={e => setNewCollaborator(prev => ({ ...prev, dataNascimento: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Data de Admissão</label>
                <input
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold"
                  value={newCollaborator.dataContratacao}
                  onChange={e => setNewCollaborator(prev => ({ ...prev, dataContratacao: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Nível de Acesso</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary appearance-none text-white font-bold cursor-pointer"
                  value={newCollaborator.role}
                  onChange={e => setNewCollaborator(prev => ({ ...prev, role: e.target.value as UserRole }))}
                >
                  <option value="user" className="bg-[#1a1a1a] text-white">USER / COLABORADOR</option>
                  <option value="admin" className="bg-[#1a1a1a] text-white">ROOT / ADMINISTRADOR</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Avatar (Upload)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAvatarChange(e, true)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-ui-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-brand-primary file:text-black hover:file:bg-brand-primary/80 transition-all cursor-pointer"
                  />
                  {newCollaborator.fotoUrl && (
                    <img src={newCollaborator.fotoUrl} alt="Preview" className="w-10 h-10 rounded-full border border-brand-primary object-cover" />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-primary disabled:opacity-50 text-black font-black p-4 rounded-2xl shadow-xl shadow-brand-primary/10 hover:scale-[1.02] transition-all"
                >
                  {isSubmitting ? 'CADASTRANDO...' : 'CADASTRAR COLABORADOR'}
                </button>
                <button type="button" onClick={() => setIsNewFormOpen(false)} className="w-full bg-white/5 border border-white/10 text-ui-muted font-bold p-4 rounded-2xl hover:text-white hover:bg-white/10 transition-all">CANCELAR</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {isFormOpen && (
        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/40 bg-black shadow-[0_0_50px_rgba(119,194,85,0.05)]">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary mb-8 underline decoration-brand-primary/20 underline-offset-8">Editor de Perfil</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold placeholder:text-ui-muted/20"
                  value={editingUser?.nome || ''}
                  onChange={e => setEditingUser(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">E-mail Corporativo</label>
                <input
                  type="email"
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none opacity-50 text-white font-bold cursor-not-allowed"
                  value={editingUser?.email || ''}
                />
                <p className="text-[10px] text-ui-muted mt-2 ml-1 italic">* O e-mail é vinculado à conta e não pode ser alterado.</p>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Nível de Acesso</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary appearance-none text-white font-bold cursor-pointer"
                  value={editingUser?.role || 'user'}
                  onChange={e => setEditingUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                >
                  <option value="user" className="bg-[#1a1a1a] text-white">USER / COLABORADOR</option>
                  <option value="admin" className="bg-[#1a1a1a] text-white">ROOT / ADMINISTRADOR</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Cargo / Squad</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold"
                  value={editingUser?.cargo || ''}
                  onChange={e => setEditingUser(prev => ({ ...prev, cargo: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Data Nascimento</label>
                <input
                  type="date"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold invert-[0.9] md:invert-0"
                  value={editingUser?.dataNascimento || ''}
                  onChange={e => setEditingUser(prev => ({ ...prev, dataNascimento: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Data de Admissão</label>
                <input
                  type="date"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-primary text-white font-bold"
                  value={editingUser?.dataContratacao || ''}
                  onChange={e => setEditingUser(prev => ({ ...prev, dataContratacao: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-ui-muted tracking-widest mb-2 ml-1">Avatar (Upload)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAvatarChange(e, false)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-ui-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-brand-primary file:text-black hover:file:bg-brand-primary/80 transition-all cursor-pointer"
                  />
                  {editingUser?.fotoUrl && (
                    <img src={editingUser.fotoUrl} alt="Preview" className="w-10 h-10 rounded-full border border-brand-primary object-cover" />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-primary disabled:opacity-50 text-black font-black p-4 rounded-2xl shadow-xl shadow-brand-primary/10 hover:scale-[1.02] transition-all"
                >
                  {isSubmitting ? 'SALVANDO...' : 'SALVAR REGISTRO'}
                </button>
                <button type="button" onClick={() => setIsFormOpen(false)} className="w-full bg-white/5 border border-white/10 text-ui-muted font-bold p-4 rounded-2xl hover:text-white hover:bg-white/10 transition-all">ABORTAR</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card rounded-[32px] overflow-hidden border border-white/10 bg-black shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-6 text-[10px] uppercase font-black tracking-widest text-ui-muted">Colaborador / Info</th>
                <th className="p-6 text-[10px] uppercase font-black tracking-widest text-ui-muted">Nível</th>
                <th className="p-6 text-[10px] uppercase font-black tracking-widest text-ui-muted">Admissão</th>
                <th className="p-6 text-[10px] uppercase font-black tracking-widest text-ui-muted">Balanço</th>
                <th className="p-6 text-[10px] uppercase font-black tracking-widest text-ui-muted text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(user => (
                <tr key={user.id} className="bg-black hover:bg-brand-primary/5 transition-all group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={user.fotoUrl} alt={user.nome} className="w-12 h-12 rounded-full border border-brand-primary/20 object-cover group-hover:border-brand-primary transition-all" />
                      <div>
                        <p className="font-black text-white group-hover:text-brand-primary transition-colors">{user.nome}</p>
                        <p className="text-[9px] text-ui-muted uppercase tracking-widest font-black mt-1">{user.cargo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'bg-semantic-info/10 text-semantic-info border border-semantic-info/20'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-ui-muted font-bold text-xs group-hover:text-white">
                      <Calendar className="w-3 h-3 text-brand-primary" />
                      {user.dataContratacao || '---'}
                    </div>
                  </td>
                  <td className="p-6 font-black text-brand-primary neon-text">{user.saldoAtual} GTX</td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => { setEditingUser(user); setIsFormOpen(true); }}
                        className="p-3 bg-white/5 text-ui-muted hover:text-brand-primary hover:bg-brand-primary/10 border border-white/5 rounded-xl transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-3 bg-white/5 text-ui-muted hover:text-semantic-error hover:bg-semantic-error/10 border border-white/5 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

export default Users;
