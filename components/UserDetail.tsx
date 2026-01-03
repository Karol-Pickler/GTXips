import React from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';

interface UserDetailProps {
    user: User;
    onClose: () => void;
}

const UserDetail: React.FC<UserDetailProps> = ({ user, onClose }) => {
    const { transactions } = useApp();
    const userTransactions = transactions.filter(t => t.userId === user.id);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-ui-surface border border-brand-primary/30 w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(119,194,85,0.1)] animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-brand-primary/10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src={user.fotoUrl} alt={user.nome} className="w-16 h-16 rounded-full border-2 border-brand-primary shadow-[0_0_15px_rgba(119,194,85,0.3)]" />
                        <div>
                            <h2 className="text-xl font-bold text-white">{user.nome}</h2>
                            <p className="text-sm text-ui-muted font-medium">{user.cargo}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-ui-muted hover:text-brand-primary p-2 transition-colors">✕</button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto bg-black/20">
                    <h3 className="text-brand-primary font-black mb-4 uppercase text-[10px] tracking-[0.2em]">Histórico de Atividades</h3>
                    <div className="space-y-3">
                        {userTransactions.length === 0 ? (
                            <p className="text-ui-muted text-center py-10 italic text-sm">Nenhuma transação registrada no terminal.</p>
                        ) : (
                            userTransactions.map(t => (
                                <div key={t.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-primary/20 transition-all group">
                                    <div>
                                        <p className="font-bold text-white group-hover:text-brand-primary transition-colors">{t.motivo}</p>
                                        <p className="text-[10px] text-ui-muted uppercase font-bold mt-1 tracking-tighter">{t.data}</p>
                                    </div>
                                    <div className={`font-black text-sm ${t.tipo === 'credito' ? 'text-brand-primary' : 'text-semantic-error'}`}>
                                        {t.tipo === 'credito' ? '+' : '-'}{t.valor}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="p-6 bg-brand-primary/5 border-t border-brand-primary/10 flex justify-between items-center">
                    <span className="text-ui-muted font-bold text-xs uppercase tracking-widest">Saldo em Carteira</span>
                    <span className="text-3xl font-black text-brand-primary neon-text">{user.saldoAtual} GTX</span>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
