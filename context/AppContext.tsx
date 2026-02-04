
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Rule, Transaction, FinancialRecord, RescueRequest, UserActivity, Notification, NotificationType, AppNotification } from '../types';
import { INITIAL_USERS, INITIAL_RULES, INITIAL_TRANSACTIONS, INITIAL_FINANCIAL } from '../constants';
import { supabase } from '../services/supabase';

interface AppContextType {
  users: User[];
  rules: Rule[];
  transactions: Transaction[];
  financial: FinancialRecord[];
  currentUser: User | null;
  isAuthenticated: boolean;
  rescues: RescueRequest[];
  activities: UserActivity[];
  notifications: Notification[];
  appNotifications: AppNotification[];
  pageTitle: string;
  setPageTitle: React.Dispatch<React.SetStateAction<string>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setFinancial: React.Dispatch<React.SetStateAction<FinancialRecord[]>>;
  setRescues: React.Dispatch<React.SetStateAction<RescueRequest[]>>;
  setActivities: React.Dispatch<React.SetStateAction<UserActivity[]>>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, nome: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateProfile: (profile: Partial<User>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
  addTransaction: (userId: string, valor: number, motivo: string, tipo: 'credito' | 'debito', date?: string) => Promise<boolean>;
  updateTransaction: (transaction: Transaction) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  fixDatabaseDates: () => Promise<void>;
  recalculateAllUserBalances: () => Promise<void>;
  notify: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => Promise<void>;
  addActivity: (activity: Omit<UserActivity, 'id' | 'status'>) => Promise<boolean>;
  addRescue: (rescue: Omit<RescueRequest, 'id' | 'status'>) => Promise<boolean>;
  approveActivity: (id: string) => Promise<void>;
  rejectActivity: (id: string) => Promise<void>;
  approveRescue: (id: string) => Promise<void>;
  rejectRescue: (id: string) => Promise<void>;
  addRule: (rule: Omit<Rule, 'id'>) => Promise<boolean>;
  updateRule: (rule: Rule) => Promise<boolean>;
  removeRule: (id: string) => Promise<boolean>;
  addFinancialRecord: (record: Omit<FinancialRecord, 'id'>) => Promise<boolean>;
  updateFinancialRecord: (record: FinancialRecord) => Promise<boolean>;
  removeFinancialRecord: (id: string) => Promise<boolean>;
  upsertProfile: (profile: Partial<User>) => Promise<boolean>;
  deleteProfile: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  recalculateBalance: (userId: string) => Promise<boolean>;
  recalculateFinancialRecords: (fromDate: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState<string>('');

  const [rules, setRules] = useState<Rule[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('gtx_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [financial, setFinancial] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('gtx_financial');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL;
  });

  const [rescues, setRescues] = useState<RescueRequest[]>(() => {
    const saved = localStorage.getItem('gtx_rescues');
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState<UserActivity[]>(() => {
    const saved = localStorage.getItem('gtx_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchData();

      // Realtime subscription for notifications
      const channel = supabase
        .channel(`notifications_${currentUser.id}`)
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${currentUser.id}`
          },
          (payload) => {
            const n = payload.new as any;
            setAppNotifications(prev => [{
              id: n.id,
              userId: n.user_id,
              title: n.title,
              message: n.message,
              type: n.type,
              isRead: Boolean(n.is_read),
              createdAt: n.created_at
            }, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;

    try {
      const results = await Promise.all([
        supabase.from('rules').select('*'),
        supabase.from('financial').select('*').order('ano', { ascending: false }).order('mes', { ascending: false }),
        currentUser.role === 'admin'
          ? supabase.from('activities').select('*').order('data', { ascending: false })
          : supabase.from('activities').select('*').eq('user_id', currentUser.id).order('data', { ascending: false }),
        currentUser.role === 'admin'
          ? supabase.from('rescues').select('*').order('data', { ascending: false })
          : supabase.from('rescues').select('*').eq('user_id', currentUser.id).order('data', { ascending: false }),
        currentUser.role === 'admin'
          ? supabase.from('transactions').select('*').order('data', { ascending: false })
          : supabase.from('transactions').select('*').eq('user_id', currentUser.id).order('data', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        currentUser.role === 'admin'
          ? supabase.from('profiles').select('*').order('nome')
          : Promise.resolve({ data: null, error: null }) as any
      ]);

      const [rulesRes, finRes, actRes, resRes, trxRes, notRes, profRes] = results;

      if (rulesRes.data) {
        setRules(rulesRes.data.map(r => ({
          id: r.id,
          categoria: r.categoria,
          valor: Number(r.valor),
          descricao: r.descricao,
          recorrencia: r.recorrencia as any,
          isSelfService: r.is_self_service
        })));
      }

      if (finRes.data) {
        setFinancial(finRes.data.map(f => ({
          id: f.id,
          mes: f.mes.toString().padStart(2, '0'), // Normalize to "01", "02" etc
          ano: f.ano,
          geracaoCaixa: Number(f.geracao_caixa),
          valorCotacao: Number(f.valor_cotacao)
        })));
      }

      if (actRes.data) {
        setActivities(actRes.data.map(a => ({
          id: a.id,
          userId: a.user_id,
          ruleId: a.rule_id,
          data: a.data,
          status: a.status as any,
          categoria: a.categoria,
          valor: Number(a.valor)
        })));
      }

      if (resRes.data) {
        setRescues(resRes.data.map(r => ({
          id: r.id,
          userId: r.user_id,
          produto: r.produto,
          valorGtx: Number(r.valor_gtx),
          linkSugerido: r.link_sugerido,
          data: r.data,
          status: r.status as any,
          aiFeedback: r.ai_feedback
        })));
      }

      if (trxRes.data) {
        setTransactions(trxRes.data.map(t => ({
          id: t.id,
          userId: t.user_id,
          data: t.data,
          motivo: t.motivo,
          valor: Number(t.valor),
          tipo: t.tipo as any
        })));
      }

      if (profRes.data) {
        setUsers(profRes.data.map(p => ({
          id: p.id,
          nome: p.nome,
          email: p.email || '', // auth.users email is usually preferred but profiles might not have it
          cargo: p.cargo || '',
          fotoUrl: p.foto_url || '',
          saldoAtual: Number(p.saldo_atual || 0),
          role: p.role as any,
          dataNascimento: p.data_nascimento,
          dataContratacao: p.data_contratacao
        })));
      }

      if (notRes.data) {
        setAppNotifications(notRes.data.map(n => ({
          id: n.id,
          userId: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: Boolean(n.is_read),
          createdAt: n.created_at
        })));
      } else if (notRes.error) {
        console.error('Error fetching notifications:', notRes.error);
      }
    } catch (err) {
      console.error('Critical error in fetchData:', err);
    }
  };

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleAuthStateChange(session);
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      handleAuthStateChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthStateChange = async (session: any) => {
    if (session?.user) {
      await fetchProfile(session.user);
      setIsAuthenticated(true);
    } else {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const fetchProfile = async (authUser: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      const mappedUser: User = {
        id: data.id,
        nome: data.nome || 'Usuário',
        email: authUser.email || '',
        cargo: data.cargo || 'Membro',
        fotoUrl: data.foto_url || `https://picsum.photos/seed/${data.id}/200`,
        saldoAtual: Number(data.saldo_atual) || 0,
        role: data.role as 'admin' | 'user',
        dataNascimento: data.data_nascimento || '',
        dataContratacao: data.data_contratacao || ''
      };
      setCurrentUser(mappedUser);
    }
  };

  const notify = (message: string, type: NotificationType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markNotificationAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setAppNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      notify(error.message, 'error');
      return false;
    }
    notify('Login realizado com sucesso!', 'success');
    return true;
  };

  const signup = async (email: string, password: string, nome: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome }
      }
    });

    if (error) {
      notify(error.message, 'error');
      return false;
    }

    notify('Conta criada! Verifique seu e-mail se necessário.', 'success');
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    notify('Sessão encerrada.', 'info');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      notify(error.message, 'error');
      return false;
    }
    notify('E-mail de recuperação enviado!', 'success');
    return true;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      notify(error.message, 'error');
      return false;
    }
    notify('Senha atualizada com sucesso!', 'success');
    return true;
  };

  const updateProfile = async (profileUpdate: Partial<User>) => {
    if (!currentUser) return false;

    const dbUpdate: any = {};
    if (profileUpdate.nome !== undefined) dbUpdate.nome = profileUpdate.nome;
    if (profileUpdate.cargo !== undefined) dbUpdate.cargo = profileUpdate.cargo;
    if (profileUpdate.fotoUrl !== undefined) dbUpdate.foto_url = profileUpdate.fotoUrl;
    if (profileUpdate.dataNascimento !== undefined) dbUpdate.data_nascimento = profileUpdate.dataNascimento;
    if (profileUpdate.dataContratacao !== undefined) dbUpdate.data_contratacao = profileUpdate.dataContratacao;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdate)
      .eq('id', currentUser.id);

    if (error) {
      notify(error.message, 'error');
      return false;
    }

    setCurrentUser(prev => prev ? { ...prev, ...profileUpdate } : null);
    notify('Perfil atualizado!', 'success');
    return true;
  };

  const uploadAvatar = async (file: File) => {
    if (!currentUser) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      notify(`Erro ao fazer upload da imagem: ${uploadError.message}`, 'error');
      return null;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const recalculateBalance = async (userId: string) => {
    try {
      // 1. Fetch all transactions for this user
      const { data: userTransactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (txError) throw txError;

      // 2. Calculate balance
      const newBalance = userTransactions?.reduce((acc, tx) => {
        const val = Number(tx.valor);
        return tx.tipo === 'credito' ? acc + val : acc - val;
      }, 0) || 0;

      // 3. Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ saldo_atual: newBalance })
        .eq('id', userId);

      if (updateError) throw updateError;

      // 4. Update local state
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, saldoAtual: newBalance } : u
      ));

      notify(`Saldo recalculado: ${newBalance} GTX`, 'success');
      return true;
    } catch (err: any) {
      console.error('Error recalculating balance:', err);
      notify(`Erro ao recalcular saldo: ${err.message}`, 'error');
      return false;
    }
  };

  const recalculateFinancialRecords = async (fromDate: string) => {
    try {
      // Parse the starting date (format: YYYY-MM-DD)
      const [startYear, startMonth] = fromDate.split('-').map(Number);

      // Get current date to know when to stop
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Fetch all transactions and financial records
      const { data: allTransactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('data', { ascending: true });

      if (txError) throw txError;

      const { data: allFinancialRecords, error: finError } = await supabase
        .from('financial')
        .select('*')
        .order('ano', { ascending: true })
        .order('mes', { ascending: true });

      if (finError) throw finError;

      // Helper function to get balance up to a specific date
      const getBalanceUpToDate = (year: number, month: number) => {
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

        return allTransactions?.reduce((total, tx) => {
          if (tx.data <= endDate) {
            const val = Number(tx.valor);
            return tx.tipo === 'credito' ? total + val : total - val;
          }
          return total;
        }, 0) || 0;
      };

      // Helper to get previous record's cotacao
      const getPreviousCotacao = (year: number, month: number) => {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        const prevMonthStr = String(prevMonth).padStart(2, '0');

        const prevRecord = allFinancialRecords?.find(
          f => f.ano === prevYear && f.mes === prevMonthStr
        );

        return prevRecord ? Number(prevRecord.valor_cotacao) : 1.0;
      };

      // Iterate through all months from startMonth/startYear to current month
      let year = startYear;
      let month = startMonth;

      while (year < currentYear || (year === currentYear && month <= currentMonth)) {
        const monthStr = String(month).padStart(2, '0');

        // Find the financial record for this month
        const existingRecord = allFinancialRecords?.find(
          f => f.ano === year && f.mes === monthStr
        );

        if (existingRecord) {
          // Calculate balance up to this month
          const sg = getBalanceUpToDate(year, month);

          // Get previous month's cotacao
          const cmPrev = getPreviousCotacao(year, month);

          // Get generation of cash for this month
          const gc = Number(existingRecord.geracao_caixa);

          // Calculate new cotacao using the formula
          const liability = sg * cmPrev;
          const surplus = gc - liability;
          const vm = (surplus / 10000) / 100;
          const newCm = cmPrev + vm;

          // Update the record in Supabase
          const { error: updateError } = await supabase
            .from('financial')
            .update({ valor_cotacao: parseFloat(newCm.toFixed(4)) })
            .eq('id', existingRecord.id);

          if (updateError) {
            console.error(`Error updating financial record ${monthStr}/${year}:`, updateError);
          }

          // Update local cache for next iteration
          if (allFinancialRecords) {
            const idx = allFinancialRecords.findIndex(f => f.id === existingRecord.id);
            if (idx !== -1) {
              allFinancialRecords[idx].valor_cotacao = parseFloat(newCm.toFixed(4));
            }
          }
        }

        // Move to next month
        if (month === 12) {
          month = 1;
          year++;
        } else {
          month++;
        }
      }

      // Refresh data to update UI
      await fetchData();

      notify('Cotações recalculadas com sucesso!', 'success');
      return true;
    } catch (err: any) {
      console.error('Error recalculating financial records:', err);
      notify(`Erro ao recalcular cotações: ${err.message}`, 'error');
      return false;
    }
  };

  const addTransaction = async (userId: string, valor: number, motivo: string, tipo: 'credito' | 'debito', date?: string) => {
    const { data: newTx, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        valor,
        motivo,
        tipo,
        data: date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (txError) {
      console.error(txError);
      notify(`Erro ao registrar transação: ${txError.message}`, 'error');
      return false;
    }

    // Get current balance of target user (from state or DB?)
    // Better to fetch fresh or use state if reliable. Let's use state 'users' to get current balance.
    const targetUser = users.find(u => u.id === userId);
    const currentBalance = targetUser?.saldoAtual || 0;
    const newSaldo = tipo === 'credito' ? currentBalance + valor : currentBalance - valor;

    // Update Profile in DB
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ saldo_atual: newSaldo })
      .eq('id', userId);

    if (profileError) {
      console.error(profileError);
      notify(`Erro ao atualizar saldo: ${profileError.message}`, 'error');
      // Should we rollback transaction? Ideally yes, but Supabase doesn't support multi-table transactions easily via JS client without RPC.
      // For now, proceed.
    } else {
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, saldoAtual: newSaldo } : u));

      // Update currentUser if it's me
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, saldoAtual: newSaldo } : null);
      }
    }

    if (newTx) {
      setTransactions(prev => [{
        id: newTx.id,
        userId: newTx.user_id,
        data: newTx.data,
        motivo: newTx.motivo,
        valor: Number(newTx.valor),
        tipo: newTx.tipo as any
      }, ...prev]);
    }

    // Recalculate financial records from this date forward
    await recalculateFinancialRecords(date || new Date().toISOString().split('T')[0]);

    // Refresh data from database
    await fetchData();

    notify('Lançamento registrado com sucesso!', 'success');
    return true;
  };

  const updateTransaction = async (transaction: Transaction) => {
    // 1. Get original transaction to calculate diff
    const original = transactions.find(t => t.id === transaction.id);
    if (!original) {
      notify('Transação original não encontrada.', 'error');
      return false;
    }

    // 2. Update Transaction in DB
    const { data: updatedData, error: txError } = await supabase
      .from('transactions')
      .update({
        valor: transaction.valor,
        motivo: transaction.motivo,
        tipo: transaction.tipo,
        data: transaction.data
      })
      .eq('id', transaction.id)
      .select();

    if (txError) {
      console.error(txError);
      notify(`Erro ao atualizar transação: ${txError.message}`, 'error');
      return false;
    }

    if (!updatedData || updatedData.length === 0) {
      notify('Transação não encontrada no banco. Atualizando lista...', 'warning');
      await fetchData();
      return false;
    }

    // 3. Rectify Balance
    // Revert original effect
    const revertVal = original.tipo === 'credito' ? -original.valor : original.valor;
    // Apply new effect
    const newVal = transaction.tipo === 'credito' ? transaction.valor : -transaction.valor;

    const diff = revertVal + newVal;

    if (diff !== 0) {
      // Fetch current balance
      const targetUser = users.find(u => u.id === transaction.userId);
      const currentBalance = targetUser?.saldoAtual || 0;
      const newBalance = currentBalance + diff;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ saldo_atual: newBalance })
        .eq('id', transaction.userId);

      if (profileError) {
        console.error(profileError);
        notify(`Atenção: Transação salva mas erro ao atualizar saldo: ${profileError.message}`, 'warning');
      } else {
        // Update local state for user
        setUsers(prev => prev.map(u => u.id === transaction.userId ? { ...u, saldoAtual: newBalance } : u));
        // Update currentUser if it's me
        if (currentUser?.id === transaction.userId) {
          setCurrentUser(prev => prev ? { ...prev, saldoAtual: newBalance } : null);
        }
      }
    }

    // 4. Update local transaction state
    setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));

    // 5. Recalculate financial records
    // We need to recalculate from the earliest date affected (either original or new date)
    const originalDate = original.data;
    const newDate = transaction.data;
    const earliestDate = originalDate < newDate ? originalDate : newDate;

    await recalculateFinancialRecords(earliestDate);

    // 6. Refresh data from database to ensure consistency
    await recalculateFinancialRecords(earliestDate);

    // fetchData is called inside recalculateFinancialRecords, so we don't need to call it again

    notify('Transação atualizada com sucesso!', 'success');
    return true;

    notify('Transação atualizada com sucesso!', 'success');
    return true;
  };

  const deleteTransaction = async (id: string) => {
    // 1. Find the transaction to delete
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) {
      notify('Transação não encontrada.', 'error');
      return false;
    }

    // 2. Delete from Supabase
    const { error: deleteError, count } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error(deleteError);
      notify(`Erro ao excluir transação: ${deleteError.message}`, 'error');
      return false;
    }

    if (count === 0) {
      // Diagnostic check: Is it missing or permission denied?
      const { data: checkData } = await supabase
        .from('transactions')
        .select('id')
        .eq('id', id)
        .single();

      if (checkData) {
        notify('Erro: Permissão negada para excluir este registro.', 'error');
        return false;
      } else {
        notify('Transação não encontrada no banco. Atualizando lista...', 'warning');
        await fetchData();
        return false;
      }
    }

    // 3. Revert balance effect
    // If it was a credit, we subtract it; if debit, we add it back
    const revertVal = transaction.tipo === 'credito' ? -transaction.valor : transaction.valor;

    const targetUser = users.find(u => u.id === transaction.userId);
    const currentBalance = targetUser?.saldoAtual || 0;
    const newBalance = currentBalance + revertVal;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ saldo_atual: newBalance })
      .eq('id', transaction.userId);

    if (profileError) {
      console.error(profileError);
      notify(`Atenção: Transação excluída mas erro ao atualizar saldo: ${profileError.message}`, 'warning');
    } else {
      // Update local state for user
      setUsers(prev => prev.map(u => u.id === transaction.userId ? { ...u, saldoAtual: newBalance } : u));
      // Update currentUser if it's me
      if (currentUser?.id === transaction.userId) {
        setCurrentUser(prev => prev ? { ...prev, saldoAtual: newBalance } : null);
      }
    }

    // 4. Remove from local state
    setTransactions(prev => prev.filter(t => t.id !== id));

    // 5. Recalculate financial records from the deleted transaction's date
    await recalculateFinancialRecords(transaction.data);

    // 6. Refresh data from database
    await fetchData();

    notify('Transação excluída com sucesso!', 'success');
    return true;
  };

  const fixDatabaseDates = async () => {
    notify('Iniciando correção de datas...', 'info');
    let fixedCount = 0;

    // Fetch all without ordering to avoid sort errors
    const { data: allTransactions } = await supabase.from('transactions').select('*');

    if (!allTransactions) return;

    for (const t of allTransactions) {
      let newDate = t.data;
      let changed = false;

      // Check for DD/MM/YYYY format
      if (t.data.includes('/')) {
        const parts = t.data.split('/');
        if (parts.length === 3) {
          // Assuming DD/MM/YYYY
          newDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          changed = true;
        }
      }
      // Check for YYYY MM DD format (spaces)
      else if (t.data.includes(' ')) {
        newDate = t.data.replace(/ /g, '-');
        changed = true;
      }

      if (changed) {
        const { error } = await supabase
          .from('transactions')
          .update({ data: newDate })
          .eq('id', t.id);

        if (!error) {
          fixedCount++;
        }
      }
    }

    await fetchData();
    if (fixedCount > 0) {
      notify(`Correção concluída! ${fixedCount} datas ajustadas.`, 'success');
    } else {
      notify('Nenhuma data incorreta encontrada.', 'info');
    }
  };

  const recalculateAllUserBalances = async () => {
    notify('Sincronizando saldos dos usuários...', 'info');
    let updatedCount = 0;

    const { data: allUsers } = await supabase.from('profiles').select('id');
    const { data: allTransactions } = await supabase.from('transactions').select('*');

    if (!allUsers || !allTransactions) return;

    for (const user of allUsers) {
      const userTransactions = allTransactions.filter(t => t.userId === user.id);

      let newBalance = 0;
      userTransactions.forEach(t => {
        if (t.tipo === 'credito') newBalance += t.valor;
        else newBalance -= t.valor;
      });

      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ saldo_atual: newBalance })
        .eq('id', user.id);

      if (!error) updatedCount++;
    }

    await fetchData();
    notify(`Sincronização completa! ${updatedCount} perfis atualizados.`, 'success');
  };

  const addActivity = async (activity: Omit<UserActivity, 'id' | 'status'>) => {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: activity.userId,
        rule_id: activity.ruleId,
        data: activity.data,
        categoria: activity.categoria,
        valor: activity.valor,
        status: 'pendente'
      })
      .select()
      .single();

    if (error) {
      notify(error.message, 'error');
      return false;
    }

    if (data) {
      setActivities(prev => [{
        id: data.id,
        userId: data.user_id,
        ruleId: data.rule_id,
        data: data.data,
        status: data.status as any,
        categoria: data.categoria,
        valor: Number(data.valor)
      }, ...prev]);

      // Alert admins
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins && admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
          user_id: admin.id,
          title: 'Novo Lançamento',
          message: `${currentUser?.nome || 'Um colaborador'} lançou uma nova atividade.`,
          type: 'activity_update',
          is_read: false
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }
    }
    return true;
  };

  const addRescue = async (rescue: Omit<RescueRequest, 'id' | 'status'>) => {
    const { data, error } = await supabase
      .from('rescues')
      .insert({
        user_id: rescue.userId,
        produto: rescue.produto,
        valor_gtx: rescue.valorGtx,
        link_sugerido: rescue.linkSugerido,
        data: rescue.data,
        ai_feedback: rescue.aiFeedback,
        status: 'pendente'
      })
      .select()
      .single();

    if (error) {
      notify(error.message, 'error');
      return false;
    }

    if (data) {
      setRescues(prev => [{
        id: data.id,
        userId: data.user_id,
        produto: data.produto,
        valorGtx: Number(data.valor_gtx),
        linkSugerido: data.link_sugerido,
        data: data.data,
        status: data.status as any,
        aiFeedback: data.ai_feedback
      }, ...prev]);

      // Alert admins
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins && admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
          user_id: admin.id,
          title: 'Solicitação de Resgate',
          message: `${currentUser?.nome || 'Um colaborador'} solicitou o resgate de: ${rescue.produto}.`,
          type: 'rescue_update',
          is_read: false
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }
    }
    return true;
  };

  const addRule = async (rule: Omit<Rule, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('rules')
        .insert([{
          categoria: rule.categoria,
          valor: rule.valor,
          descricao: rule.descricao,
          recorrencia: rule.recorrencia,
          is_self_service: rule.isSelfService
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setRules(prev => [...prev, {
          id: data.id,
          categoria: data.categoria,
          valor: Number(data.valor),
          descricao: data.descricao,
          recorrencia: data.recorrencia as any,
          isSelfService: data.is_self_service
        }]);
        notify('Diretriz registrada com sucesso!', 'success');
        return true;
      }
    } catch (err) {
      console.error(err);
      notify('Erro ao registrar diretriz.', 'error');
    }
    return false;
  };

  const removeRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRules(prev => prev.filter(r => r.id !== id));
      notify('Diretriz removida!', 'success');
      return true;
    } catch (err) {
      console.error(err);
      notify('Erro ao remover diretriz.', 'error');
    }
    return false;
  };

  const updateRule = async (rule: Rule) => {
    try {
      const { error } = await supabase
        .from('rules')
        .update({
          categoria: rule.categoria,
          valor: rule.valor,
          descricao: rule.descricao,
          recorrencia: rule.recorrencia,
          is_self_service: rule.isSelfService
        })
        .eq('id', rule.id);

      if (error) throw error;
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      notify('Diretriz atualizada com sucesso!', 'success');
      return true;
    } catch (err) {
      console.error(err);
      notify('Erro ao atualizar diretriz.', 'error');
    }
    return false;
  };

  const updateFinancialRecord = async (record: FinancialRecord) => {
    try {
      const { error } = await supabase
        .from('financial')
        .update({
          geracao_caixa: record.geracaoCaixa,
          valor_cotacao: record.valorCotacao
        })
        .eq('id', record.id);

      if (error) throw error;

      setFinancial(prev => prev.map(f => f.id === record.id ? record : f));
      notify('Registro financeiro atualizado!', 'success');
      return true;
    } catch (err) {
      console.error(err);
      notify('Erro ao atualizar registro.', 'error');
    }
    return false;
  };

  const addFinancialRecord = async (record: Omit<FinancialRecord, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('financial')
        .upsert([{
          mes: record.mes,
          ano: record.ano,
          geracao_caixa: record.geracaoCaixa,
          valor_cotacao: record.valorCotacao
        }], { onConflict: 'mes,ano' })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setFinancial(prev => {
          // Remove existing if present (to avoid dupes in state during upsert)
          const filtered = prev.filter(f => !(f.mes === data.mes && f.ano === data.ano));
          return [{
            id: data.id,
            mes: data.mes.toString().padStart(2, '0'),
            ano: data.ano,
            geracaoCaixa: Number(data.geracao_caixa),
            valorCotacao: Number(data.valor_cotacao)
          }, ...filtered].sort((a, b) => b.ano !== a.ano ? b.ano - a.ano : b.mes.localeCompare(a.mes));
        });
        notify('Registro financeiro atualizado com sucesso!', 'success');
        return true;
      }
    } catch (err: any) {
      console.error(err);
      notify(`Erro ao salvar financeiro: ${err.message || 'Erro desconhecido'}`, 'error');
    }
    return false;
  };

  const removeFinancialRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFinancial(prev => prev.filter(f => f.id !== id));
      notify('Registro removido!', 'success');
      return true;
    } catch (err) {
      console.error(err);
      notify('Erro ao remover registro.', 'error');
    }
    return false;
  };

  const upsertProfile = async (profile: Partial<User>) => {
    if (!profile.id) return false;
    try {
      const updateData: any = {};
      if (profile.nome !== undefined) updateData.nome = profile.nome;
      if (profile.cargo !== undefined) updateData.cargo = profile.cargo;
      if (profile.fotoUrl !== undefined) updateData.foto_url = profile.fotoUrl;
      if (profile.role !== undefined) updateData.role = profile.role;
      if (profile.dataNascimento !== undefined) updateData.data_nascimento = profile.dataNascimento;
      if (profile.dataContratacao !== undefined) updateData.data_contratacao = profile.dataContratacao;
      if (profile.saldoAtual !== undefined) updateData.saldo_atual = profile.saldoAtual;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === profile.id ? { ...u, ...profile } as User : u));
      notify('Perfil atualizado!', 'success');
      return true;
    } catch (err) {
      console.error(err);
      notify('Erro ao atualizar perfil.', 'error');
    }
    return false;
  };

  const deleteProfile = async (id: string) => {
    try {
      // Note: This only deletes from profiles, not from auth.users.
      // Full deletion would need a service role or edge function.
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== id));
      notify('Colaborador removido do banco.', 'success');
      return true;
    } catch (err) {
      console.error(err);
      notify('Erro ao remover colaborador.', 'error');
    }
    return false;
  };

  const approveActivity = async (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    const { error } = await supabase.from('activities').update({ status: 'aprovado' }).eq('id', id);
    if (error) {
      notify('Erro ao aprovar atividade.', 'error');
      return;
    }

    addTransaction(activity.userId, activity.valor, `Atividade: ${activity.categoria}`, 'credito');
    setActivities(prev => prev.map(a => a.id === id ? { ...a, status: 'aprovado' } : a));

    // Notify User
    await supabase.from('notifications').insert({
      user_id: activity.userId,
      title: 'Lançamento Aprovado! 🚀',
      message: `Sua atividade foi aprovada e você recebeu ${activity.valor} GTX.`,
      type: 'activity_update'
    });
  };

  const rejectActivity = async (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    const { error } = await supabase.from('activities').update({ status: 'rejeitado' }).eq('id', id);
    if (error) {
      notify('Erro ao rejeitar atividade.', 'error');
      return;
    }

    setActivities(prev => prev.map(a => a.id === id ? { ...a, status: 'rejeitado' } : a));

    // Notify User
    await supabase.from('notifications').insert({
      user_id: activity.userId,
      title: 'Lançamento Rejeitado ⚠️',
      message: `Sua atividade de ${activity.categoria} não foi aprovada.`,
      type: 'activity_update'
    });
  };

  const approveRescue = async (id: string) => {
    const rescue = rescues.find(r => r.id === id);
    if (!rescue) return;

    const { error } = await supabase.from('rescues').update({ status: 'aprovado' }).eq('id', id);
    if (error) {
      notify('Erro ao aprovar resgate.', 'error');
      return;
    }

    addTransaction(rescue.userId, rescue.valorGtx, `Resgate: ${rescue.produto}`, 'debito');
    setRescues(prev => prev.map(r => r.id === id ? { ...r, status: 'aprovado' } : r));

    // Notify User
    await supabase.from('notifications').insert({
      user_id: rescue.userId,
      title: 'Resgate Aprovado! 🎁',
      message: `Seu resgate de ${rescue.produto} foi aprovado!`,
      type: 'rescue_update'
    });
  };

  const rejectRescue = async (id: string) => {
    const rescue = rescues.find(r => r.id === id);
    if (!rescue) return;

    const { error } = await supabase.from('rescues').update({ status: 'rejeitado' }).eq('id', id);
    if (error) {
      notify('Erro ao rejeitar resgate.', 'error');
      return;
    }

    setRescues(prev => prev.map(r => r.id === id ? { ...r, status: 'rejeitado' } : r));

    // Notify User
    await supabase.from('notifications').insert({
      user_id: rescue.userId,
      title: 'Resgate Rejeitado ⚠️',
      message: `Infelizmente seu resgate de ${rescue.produto} foi recusado.`,
      type: 'rescue_update'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ui-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-primary font-bold animate-pulse">Iniciando Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      users, rules, transactions, financial, currentUser, isAuthenticated, rescues, activities, notifications, appNotifications, pageTitle,
      setUsers, setRules, setTransactions, setFinancial, setRescues, setActivities, setPageTitle,
      login, signup, logout, resetPassword, updatePassword, updateProfile, uploadAvatar, addTransaction, updateTransaction, deleteTransaction, fixDatabaseDates, recalculateAllUserBalances, notify, removeNotification,
      markNotificationAsRead, addActivity, addRescue, approveActivity, rejectActivity, approveRescue, rejectRescue,
      addRule, updateRule, removeRule, addFinancialRecord, updateFinancialRecord, removeFinancialRecord,
      upsertProfile, deleteProfile, refreshData: fetchData, recalculateBalance
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
