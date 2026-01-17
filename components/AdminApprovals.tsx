
import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Check, X, Award, ShoppingBag, Link as LinkIcon } from 'lucide-react';

const AdminApprovals: React.FC = () => {
   const {
      rescues,
      activities,
      users,
      approveActivity,
      rejectActivity,
      approveRescue,
      rejectRescue
   } = useApp();

   const handleApproveActivity = async (id: string) => {
      await approveActivity(id);
   };

   const handleRejectActivity = async (id: string) => {
      await rejectActivity(id);
   };

   const handleApproveRescue = async (id: string) => {
      await approveRescue(id);
   };

   const handleRejectRescue = async (id: string) => {
      await rejectRescue(id);
   };

   const pendingActivities = activities.filter(a => a.status === 'pendente');
   const pendingRescues = rescues.filter(r => r.status === 'pendente');

   useEffect(() => {
      // Will implement pageTitle
   }, []);

   return (
      <div className="space-y-10 animate-in fade-in duration-500">

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <section className="space-y-6">
               <h2 className="text-xl font-bold flex items-center gap-3">
                  <Award className="text-brand-primary" />
                  Atividades Pendentes ({pendingActivities.length})
               </h2>

               <div className="space-y-4">
                  {pendingActivities.length === 0 ? <p className="text-ui-muted italic">Nada para aprovar no momento.</p> :
                     pendingActivities.map(a => {
                        const user = users.find(u => u.id === a.userId);
                        return (
                           <div key={a.id} className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-brand-primary/20 transition-all">
                              <div className="flex items-center gap-4">
                                 <img src={user?.fotoUrl} className="w-10 h-10 rounded-full border border-brand-primary/30" />
                                 <div>
                                    <p className="font-bold">{user?.nome}</p>
                                    <p className="text-xs text-ui-muted">{a.categoria} • <span className="text-brand-primary">{a.valor} GTX</span></p>
                                    <p className="text-[10px] text-ui-muted mt-1 uppercase font-bold">{a.data}</p>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => handleApproveActivity(a.id)} className="p-2 bg-brand-primary text-black rounded-lg hover:scale-105 transition-transform"><Check className="w-4 h-4" /></button>
                                 <button onClick={() => handleRejectActivity(a.id)} className="p-2 bg-semantic-error/10 text-semantic-error border border-semantic-error/20 rounded-lg hover:bg-semantic-error hover:text-white transition-all"><X className="w-4 h-4" /></button>
                              </div>
                           </div>
                        );
                     })
                  }
               </div>
            </section>

            <section className="space-y-6">
               <h2 className="text-xl font-bold flex items-center gap-3 text-semantic-info">
                  <ShoppingBag className="text-semantic-info" />
                  Solicitações de Resgate ({pendingRescues.length})
               </h2>

               <div className="space-y-4">
                  {pendingRescues.length === 0 ? <p className="text-ui-muted italic">Nenhum resgate aguardando.</p> :
                     pendingRescues.map(r => {
                        const user = users.find(u => u.id === r.userId);
                        return (
                           <div key={r.id} className="glass-card p-6 rounded-2xl border border-semantic-info/10 flex flex-col space-y-4 hover:border-semantic-info/30 transition-all">
                              <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-3">
                                    <img src={user?.fotoUrl} className="w-10 h-10 rounded-full" />
                                    <div>
                                       <p className="font-bold">{user?.nome}</p>
                                       <p className="text-xs text-ui-muted">Saldo: {user?.saldoAtual} GTX</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-lg font-black text-semantic-info">{r.valorGtx} GTX</p>
                                    <p className="text-[10px] text-ui-muted uppercase">{r.data}</p>
                                 </div>
                              </div>

                              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                 <p className="text-xs text-ui-muted mb-1 uppercase font-bold">Produto Solicitado</p>
                                 <p className="font-bold text-lg">{r.produto}</p>
                                 {r.linkSugerido && (
                                    <a href={r.linkSugerido} target="_blank" className="flex items-center gap-2 mt-2 text-[10px] text-semantic-info font-bold hover:underline">
                                       <LinkIcon className="w-3 h-3" /> VER LINK DE COMPRA
                                    </a>
                                 )}
                              </div>

                              <div className="flex gap-2 pt-2">
                                 <button onClick={() => handleApproveRescue(r.id)} className="flex-1 bg-semantic-info text-black font-bold py-3 rounded-xl hover:bg-semantic-info/80 transition-colors flex items-center justify-center gap-2">
                                    <Check className="w-4 h-4" /> APROVAR E COMPRAR
                                 </button>
                                 <button onClick={() => handleRejectRescue(r.id)} className="bg-semantic-error/10 text-semantic-error px-4 py-3 rounded-xl hover:bg-semantic-error hover:text-white transition-all">
                                    <X className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        );
                     })
                  }
               </div>
            </section>
         </div>
      </div>
   );
};

export default AdminApprovals;
