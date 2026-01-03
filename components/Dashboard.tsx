
import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { ShoppingCart, PiggyBank, CircleDollarSign, ArrowUpRight, Search, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import UserDetail from './UserDetail';

const Dashboard: React.FC = () => {
  const { users, financial, transactions } = useApp();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Garante que o gráfico sempre mostre os 12 meses
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const fullChartData = months.map((month, index) => {
    const monthStr = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
    const record = financial.find(f => f.mes === monthStr);
    return {
      name: month,
      valor: record ? record.geracaoCaixa : 0,
      cotacao: record ? record.valorCotacao * 1000 : 0
    };
  });

  const getUserStats = (userId: string) => {
    const userT = transactions.filter(t => t.userId === userId);
    const totalGasto = userT.filter(t => t.tipo === 'debito').reduce((acc, curr) => acc + curr.valor, 0);
    const totalGanho = userT.filter(t => t.tipo === 'credito').reduce((acc, curr) => acc + curr.valor, 0);
    return { totalGasto, totalGanho };
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Performance Hub</h1>
          <p className="text-ui-muted mt-1 font-medium">Métricas de tração e engajamento do ecossistema.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-ui-muted">Geração de Caixa Anual (R$)</h3>
            <div className="p-2 bg-brand-primary/10 rounded-lg"><TrendingUp className="text-brand-primary w-4 h-4" /></div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fullChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#95a1ac" fontSize={10} tickLine={false} axisLine={false} fontClassName="font-bold uppercase" />
                <YAxis stroke="#95a1ac" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#77c25508' }}
                  contentStyle={{ backgroundColor: '#121612', borderColor: '#77c25544', borderRadius: '16px', color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#77c255' }}
                />
                <Bar dataKey="valor" fill="#77c255" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-ui-muted">Valorização da Moeda (GTX)</h3>
            <div className="p-2 bg-brand-primary/10 rounded-lg"><ArrowUpRight className="text-brand-primary w-4 h-4" /></div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fullChartData}>
                <defs>
                  <linearGradient id="colorCotDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#77c255" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#77c255" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#95a1ac" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#95a1ac" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121612', borderColor: '#77c25544', borderRadius: '16px', borderWeight: '2px' }}
                />
                <Area type="monotone" dataKey="cotacao" stroke="#77c255" fillOpacity={1} fill="url(#colorCotDash)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white uppercase italic flex items-center gap-3">
          Colaboradores
          <div className="h-1 flex-1 bg-white/5 rounded-full"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map(user => {
            const { totalGanho, totalGasto } = getUserStats(user.id);
            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="glass-card p-8 rounded-[32px] group hover:border-brand-primary/60 hover:shadow-[0_0_30px_rgba(119,194,85,0.1)] transition-all cursor-pointer relative overflow-hidden active:scale-95"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/5 blur-3xl rounded-full group-hover:bg-brand-primary/10 transition-all"></div>

                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <img src={user.fotoUrl} alt={user.nome} className="w-16 h-16 rounded-full border-2 border-brand-primary/30 object-cover shadow-xl group-hover:border-brand-primary transition-all" />
                    <div className="absolute -bottom-1 -right-1 bg-brand-primary w-5 h-5 rounded-full border-4 border-ui-bg"></div>
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-white group-hover:text-brand-primary transition-colors leading-none">{user.nome}</h4>
                    <p className="text-[10px] text-ui-muted uppercase tracking-[0.15em] font-black mt-2">{user.cargo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-center group-hover:border-semantic-error/20 transition-all">
                    <ShoppingCart className="w-4 h-4 mx-auto mb-2 text-semantic-error opacity-60" />
                    <p className="text-[9px] text-ui-muted uppercase font-black tracking-tighter">Gasto</p>
                    <p className="font-black text-sm text-white">{totalGasto}</p>
                  </div>
                  <div className="bg-brand-primary/5 p-3 rounded-2xl border border-brand-primary/20 text-center group-hover:bg-brand-primary/10 transition-all shadow-inner">
                    <PiggyBank className="w-4 h-4 mx-auto mb-2 text-brand-primary" />
                    <p className="text-[9px] text-brand-primary uppercase font-black tracking-tighter">Saldo</p>
                    <p className="font-black text-sm text-brand-primary">{user.saldoAtual}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-center group-hover:border-semantic-info/20 transition-all">
                    <CircleDollarSign className="w-4 h-4 mx-auto mb-2 text-brand-secondary opacity-60" />
                    <p className="text-[9px] text-ui-muted uppercase font-black tracking-tighter">Ganho</p>
                    <p className="font-black text-sm text-white">{totalGanho}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedUser && <UserDetail user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
};

export default Dashboard;
