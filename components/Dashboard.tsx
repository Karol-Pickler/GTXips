
import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { ShoppingCart, PiggyBank, CircleDollarSign, ArrowUpRight, Search, TrendingUp, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import UserDetail from './UserDetail';

const Dashboard: React.FC = () => {
  const { users, financial, transactions, setPageTitle } = useApp();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    setPageTitle('Desempenho GTXips');
  }, []);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // Helper to calculate total user balance (SG) at the end of a specific month/year
  const getSimulatedSG = (targetMonth: string, targetYear: number) => {
    // End of the target month
    // Month in Date constructor is 0-indexed (0 = Jan, 1 = Feb)
    // new Date(year, month + 1, 0) gives the last day of month
    const monthIndex = parseInt(targetMonth) - 1;
    const targetDate = new Date(targetYear, monthIndex + 1, 0);

    // Set time to end of day to be inclusive
    targetDate.setHours(23, 59, 59, 999);

    const relevantTransactions = transactions.filter(t => {
      // Assuming t.data is YYYY-MM-DD
      // Create date object and reset time to compare clearly, or just use string comparison if ISO
      // Safer to use Date objects
      const tDate = new Date(t.data);
      // tDate is usually midnight UTC or local. 
      // If t.data is '2025-01-15', new Date puts it at 00:00.
      return tDate <= targetDate;
    });

    const totalBalance = relevantTransactions.reduce((acc, t) => {
      const val = Number(t.valor);
      return t.tipo === 'credito' ? acc + val : acc - val;
    }, 0);

    return totalBalance;
  };

  // Process data for charts (Last 12 records)
  const sortedFinancial = [...financial].sort((a, b) => {
    if (a.ano !== b.ano) return a.ano - b.ano;
    return parseInt(a.mes) - parseInt(b.mes);
  });

  const last12 = sortedFinancial.slice(-13); // Need 13 to calc variation for 12

  const chartData = useMemo(() => {
    if (last12.length < 2) return [];

    return last12.slice(1).map((record, index) => {
      // index aligns with last12 because we sliced. 
      // element at index+1 in original last12 is 'record'
      // element at index in original last12 is 'prev'
      const prev = last12[index];

      const gc = record.geracaoCaixa;
      const cmPrev = prev.valorCotacao;
      const sg = getSimulatedSG(record.mes, record.ano);

      // Formula: ((GC - (SG * CM_prev)) / 10.000) / 100 = VM
      // Note: Regulation says "10.000", assuming 10,000.
      const vm = ((gc - (sg * cmPrev)) / 10000) / 100;

      const variationPercent = cmPrev > 0 ? (vm / cmPrev) : 0;

      // For accumulated, we compare stored values to show actual historical trend of value
      // Or we could reconstruct the chain. Let's stick to stored values for Accumulated
      // as that represents the "Official" value history. 
      // Unless users want hypothetical accumulated. Usually stored is better for "History".
      const currentQuoteStored = record.valorCotacao;
      const startQuote = last12[0].valorCotacao;
      const accumulated = startQuote > 0 ? ((currentQuoteStored - startQuote) / startQuote) : 0;

      return {
        name: `${months[parseInt(record.mes) - 1]}`, // Month name
        fullDate: `${months[parseInt(record.mes) - 1]} ${record.ano}`,
        variation: variationPercent * 100, // Convert to %
        accumulated: accumulated * 100,
        valor: gc,
        vm,
        sg,
        cmPrev,
        gc
      };
    });
  }, [last12, transactions]);

  const getUserStats = (userId: string) => {
    const userT = transactions.filter(t => t.userId === userId);
    const totalGasto = userT.filter(t => t.tipo === 'debito').reduce((acc, curr) => acc + curr.valor, 0);
    const totalGanho = userT.filter(t => t.tipo === 'credito').reduce((acc, curr) => acc + curr.valor, 0);
    return { totalGasto, totalGanho };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#121612] border border-[#77c25544] rounded-2xl p-4 shadow-2xl backdrop-blur-md">
          <p className="font-black text-white text-sm mb-2 uppercase tracking-tight">{label}</p>
          <div className="space-y-1 text-xs text-ui-muted font-mono">
            <p className="flex justify-between gap-4"><span className="text-brand-primary">GC (Caixa):</span> <span className="text-white">R$ {data.gc?.toLocaleString()}</span></p>
            <p className="flex justify-between gap-4"><span className="text-brand-primary">SG (Saldo):</span> <span className="text-white">{data.sg?.toLocaleString()} GTX</span></p>
            <p className="flex justify-between gap-4"><span className="text-brand-primary">CM (Ant.):</span> <span className="text-white">R$ {data.cmPrev?.toFixed(4)}</span></p>
            <div className="h-px bg-white/10 my-2"></div>
            <p className="flex justify-between gap-4 font-black"><span className="text-brand-primary">VM (Var.):</span> <span className="text-white">{data.vm?.toFixed(4)} ({data.variation.toFixed(2)}%)</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-ui-muted">Variação Mensal GTXIPS (Cálculo Sistêmico)</h3>
            <div className="p-2 bg-brand-primary/10 rounded-lg"><TrendingUp className="text-brand-primary w-4 h-4" /></div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="fullDate" stroke="#95a1ac" fontSize={10} tickLine={false} axisLine={false} fontClassName="font-bold uppercase" />
                <YAxis stroke="#95a1ac" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val.toFixed(1)}%`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#77c25508' }} />
                <Bar dataKey="variation" fill="#77c255" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[32px] border border-brand-primary/10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-ui-muted">Variação Acumulada GTXIPS (12 Meses)</h3>
            <div className="p-2 bg-brand-primary/10 rounded-lg"><ArrowUpRight className="text-brand-primary w-4 h-4" /></div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCotDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#77c255" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#77c255" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="fullDate" stroke="#95a1ac" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#95a1ac" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val.toFixed(1)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121612', borderColor: '#77c25544', borderRadius: '16px', borderWeight: '2px', color: '#fff' }}
                  itemStyle={{ color: '#77c255' }}
                  formatter={(val: number) => [`${val.toFixed(2)}%`, 'Acumulado']}
                />
                <Area type="monotone" dataKey="accumulated" stroke="#77c255" fillOpacity={1} fill="url(#colorCotDash)" strokeWidth={4} />
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

                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative">
                    <img src={user.fotoUrl} alt={user.nome} className="w-28 h-28 rounded-full border-4 border-brand-primary/20 object-cover shadow-2xl group-hover:border-brand-primary group-hover:scale-105 transition-all" />

                  </div>
                  <div className="text-center">
                    <h4 className="font-black text-xl text-white group-hover:text-brand-primary transition-colors leading-tight">{user.nome}</h4>
                    <p className="text-[10px] text-ui-muted uppercase tracking-[0.2em] font-black mt-2 bg-white/5 py-1 px-3 rounded-full inline-block">{user.cargo}</p>
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
