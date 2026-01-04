
export type UserRole = 'admin' | 'user';
export type RequestStatus = 'pendente' | 'aprovado' | 'rejeitado';
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  nome: string;
  dataNascimento: string;
  dataContratacao: string;
  cargo: string;
  email: string;
  password?: string;
  fotoUrl: string;
  saldoAtual: number;
  role: UserRole;
}

export type Recurrence = 'Anual' | 'Mensal' | 'Única' | 'Ad-hoc';
export type TransactionType = 'credito' | 'debito';

export interface Rule {
  id: string;
  categoria: string;
  valor: number;
  descricao: string;
  recorrencia: Recurrence;
  isSelfService?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  data: string;
  motivo: string;
  valor: number;
  tipo: TransactionType;
}

export interface FinancialRecord {
  id: string;
  mes: string;
  ano: number;
  geracaoCaixa: number;
  valorCotacao: number;
}

export interface RescueRequest {
  id: string;
  userId: string;
  produto: string;
  valorGtx: number;
  linkSugerido?: string;
  data: string;
  status: RequestStatus;
  aiFeedback?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  ruleId: string;
  data: string;
  status: RequestStatus;
  categoria: string;
  valor: number;
}

export enum Page {
  Dashboard = 'dashboard',
  Colaboradores = 'colaboradores',
  Pontuacao = 'pontuacao',
  Lancamentos = 'lancamentos',
  Financeiro = 'financeiro',
  Regulamento = 'regulamento',
  AutoAtendimento = 'autoatendimento',
  Aprovacoes = 'aprovacoes',
  Perfil = 'perfil'
}
