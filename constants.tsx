
import { User, Rule, FinancialRecord, Transaction } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    nome: 'Alex Rivera',
    dataNascimento: '1990-05-15',
    dataContratacao: '2020-01-10',
    cargo: 'Senior Developer',
    email: 'alex@company.com',
    password: 'admin',
    fotoUrl: 'https://picsum.photos/seed/alex/200',
    saldoAtual: 1500,
    role: 'admin'
  },
  {
    id: 'u2',
    nome: 'Sarah Jenkins',
    dataNascimento: '1992-10-22',
    dataContratacao: '2022-06-15',
    cargo: 'Product Designer',
    email: 'sarah@company.com',
    password: 'user',
    fotoUrl: 'https://picsum.photos/seed/sarah/200',
    saldoAtual: 2200,
    role: 'user'
  }
];

export const INITIAL_RULES: Rule[] = [
  { id: 'r1', categoria: 'Aniversário', valor: 500, descricao: 'Prêmio anual de aniversário', recorrencia: 'Anual' },
  { id: 'r2', categoria: 'Meta Batida', valor: 1000, descricao: 'Bônus por atingimento de meta', recorrencia: 'Mensal' },
  { id: 'r3', categoria: 'Indicação', valor: 300, descricao: 'Indicação de novos talentos', recorrencia: 'Única' }
];

export const INITIAL_FINANCIAL: FinancialRecord[] = [
  { id: 'f1', mes: 1, ano: 2024, geracaoCaixa: 50000, valorCotacao: 0.15 },
  { id: 'f2', mes: 2, ano: 2024, geracaoCaixa: 65000, valorCotacao: 0.18 },
  { id: 'f3', mes: 3, ano: 2024, geracaoCaixa: 45000, valorCotacao: 0.14 },
  { id: 'f4', mes: 4, ano: 2024, geracaoCaixa: 75000, valorCotacao: 0.22 }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', userId: 'u1', data: '2024-03-01', motivo: 'Meta Batida Março', valor: 1000, tipo: 'credito' },
  { id: 't2', userId: 'u2', data: '2024-03-15', motivo: 'Compra Gift Card', valor: 500, tipo: 'debito' }
];
