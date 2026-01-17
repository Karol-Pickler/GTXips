
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users as UsersIcon,
  Award,
  ArrowRightLeft,
  TrendingUp,
  FileText,
  Menu,
  X,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  Zap,
  LogOut,
  UserCircle,
  Bell,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Page } from '../types';
import { useApp } from '../context/AppContext';
import Toast from './Toast';
import { Logo } from './ui';
import NotificationDropdown from './NotificationDropdown';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  const { currentUser, logout, rescues, activities, appNotifications, pageTitle } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const pendingRescues = rescues.filter(r => r.status === 'pendente').length;
  const pendingActivities = activities.filter(a => a.status === 'pendente').length;
  const totalPending = pendingRescues + pendingActivities;
  const unreadNotifications = appNotifications.filter(n => !n.isRead).length;

  const menuItems = [
    { id: Page.Dashboard, label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: Page.AutoAtendimento, label: 'Meu Portal', icon: Zap, adminOnly: false },
    { id: Page.Perfil, label: 'Meu Perfil', icon: UserCircle, adminOnly: false },
    { id: Page.Regulamento, label: 'Regulamento', icon: FileText, adminOnly: false },
    { id: Page.Aprovacoes, label: 'Aprovações', icon: CheckCircle2, adminOnly: true, badge: totalPending },
    { id: Page.Colaboradores, label: 'Colaboradores', icon: UsersIcon, adminOnly: true },
    { id: Page.Pontuacao, label: 'Pontuação', icon: Award, adminOnly: true },
    { id: Page.Lancamentos, label: 'Lançamentos', icon: ArrowRightLeft, adminOnly: true },
    { id: Page.Financeiro, label: 'Financeiro', icon: TrendingUp, adminOnly: true },
  ];

  const bottomNavIds = [
    Page.Dashboard,
    Page.AutoAtendimento,
    Page.Perfil,
    ...(isAdmin ? [Page.Aprovacoes] : [Page.Regulamento])
  ];

  const sidebarVisibleItems = menuItems.filter(item => (!item.adminOnly || isAdmin) && item.id !== Page.Perfil);
  const bottomBarVisibleItems = menuItems.filter(item => bottomNavIds.includes(item.id));

  return (
    <div className="flex min-h-screen bg-ui-bg text-ui-text font-inter">
      <Toast />
      <aside className={`fixed inset-y-0 left-0 z-50 bg-ui-surface border-r border-brand-primary/10 transform transition-all duration-300 flex flex-col 
        lg:translate-x-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className={`p-6 text-center flex flex-col items-center flex-shrink-0 transition-all ${isCollapsed ? 'py-4' : ''}`}>
          <div className="flex items-center justify-center gap-3">
            <Logo className="w-8 h-8 drop-shadow-[0_0_8px_rgba(119,194,85,0.4)]" />
            {!isCollapsed && <h1 className="text-2xl font-black tracking-tighter text-brand-primary animate-in fade-in duration-300">GTXIPS</h1>}
          </div>
          {!isCollapsed && <p className="text-[10px] text-ui-muted uppercase mt-1 tracking-widest font-bold animate-in fade-in duration-300">Gamification System</p>}
        </div>

        <nav className="mt-2 px-2 space-y-2 flex-1 overflow-y-auto overflow-x-hidden">
          {sidebarVisibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setIsSidebarOpen(false);
              }}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} py-3 rounded-lg transition-all ${currentPage === item.id
                ? 'bg-brand-primary/10 text-brand-primary neon-border border border-brand-primary/30'
                : 'text-ui-muted hover:text-ui-text hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium whitespace-nowrap animate-in fade-in duration-200">{item.label}</span>}
              </div>
              {!isCollapsed && item.badge ? (
                <span className="bg-semantic-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
              ) : null}
              {isCollapsed && item.badge ? (
                <div className="absolute top-1 right-2 w-2 h-2 bg-semantic-error rounded-full"></div>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex p-4 justify-end border-t border-white/5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-ui-muted hover:text-brand-primary hover:bg-white/5 rounded-lg transition-all mx-auto"
          >
            {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Desktop Top Header */}
        <header className="hidden lg:flex items-center justify-between px-10 h-20 border-b border-white/5 bg-ui-bg/70 backdrop-blur-md sticky top-0 z-40">
          <h2 className="text-xl font-black tracking-tight text-white uppercase italic animate-in fade-in slide-in-from-left-4 duration-500">{pageTitle}</h2>

          <div className="flex items-center gap-6">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-full transition-all ${isNotificationsOpen ? 'bg-brand-primary/10 text-brand-primary' : 'text-ui-muted hover:bg-white/5 hover:text-ui-text'}`}
              >
                <Bell size={20} className={unreadNotifications > 0 ? 'animate-bounce' : ''} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-semantic-error text-white text-[8px] font-black min-w-[17px] h-[17px] flex items-center justify-center rounded-full border-2 border-ui-bg">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <NotificationDropdown onClose={() => setIsNotificationsOpen(false)} />
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-ui-muted hover:text-semantic-error hover:bg-semantic-error/10 rounded-full transition-all"
              title="Sair do sistema"
            >
              <LogOut size={20} />
            </button>

            {/* User Info & Avatar */}
            <button
              onClick={() => setCurrentPage(Page.Perfil)}
              className="flex items-center gap-3 pl-6 border-l border-white/10 group hover:opacity-80 transition-opacity"
              title="Acessar Meu Perfil"
            >
              <div className="text-right">
                <p className="text-xs font-black text-ui-text uppercase tracking-tight leading-none group-hover:text-brand-primary transition-colors">{currentUser.email.split('@')[0]}</p>
                <p className="text-[10px] text-ui-muted font-bold capitalize mt-1 leading-none">{currentUser.role === 'admin' ? 'Administrator' : 'Membro'}</p>
              </div>
              <div className={`w-10 h-10 rounded-full border-2 p-0.5 shadow-lg overflow-hidden transition-all ${currentPage === Page.Perfil ? 'border-brand-primary' : 'border-brand-primary/30 group-hover:border-brand-primary'}`}>
                <img src={currentUser.fotoUrl} alt={currentUser.nome} className="w-full h-full rounded-full object-cover" />
              </div>
            </button>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 w-full bg-ui-surface/90 backdrop-blur-md border-b border-brand-primary/10 z-40 p-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Logo className="w-7 h-7" />
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-brand-primary tracking-tighter leading-none">GTXIPS</h1>
              {pageTitle && <span className="text-[10px] font-bold text-white uppercase tracking-wider leading-none">{pageTitle}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-brand-primary bg-brand-primary/10 rounded-lg relative"
              >
                <Bell size={20} className={unreadNotifications > 0 ? 'animate-bounce' : ''} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-semantic-error text-white text-[8px] font-black min-w-[17px] h-[17px] flex items-center justify-center rounded-full border-2 border-ui-surface">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm pt-20 px-4">
                  <NotificationDropdown onClose={() => setIsNotificationsOpen(false)} />
                </div>
              )}
            </div>

            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-brand-primary bg-brand-primary/10 rounded-lg">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 pb-28 lg:pb-10 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-ui-surface/95 backdrop-blur-xl border-t border-brand-primary/20 flex justify-around items-center px-2 py-3 z-50 h-20 shadow-[0_-5px_20px_rgba(119,194,85,0.05)]">
        {bottomBarVisibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentPage(item.id);
              setIsSidebarOpen(false);
            }}
            className={`relative flex flex-col items-center justify-center flex-1 gap-1.5 transition-all duration-300 ${currentPage === item.id
              ? 'text-brand-primary'
              : 'text-ui-muted hover:text-ui-text'
              }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${currentPage === item.id ? 'bg-brand-primary/10 scale-110' : ''}`}>
              <item.icon size={22} strokeWidth={currentPage === item.id ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-tight ${currentPage === item.id ? 'opacity-100' : 'opacity-60'}`}>
              {item.label.split(' ')[0]}
            </span>
            {item.badge ? (
              <span className="absolute top-1 right-1/2 translate-x-4 bg-semantic-error text-white text-[8px] font-black min-w-[16px] h-[16px] flex items-center justify-center rounded-full border border-ui-surface">
                {item.badge}
              </span>
            ) : null}
            {currentPage === item.id && (
              <div className="absolute -bottom-1 w-1 h-1 bg-brand-primary rounded-full shadow-[0_0_5px_#77c255]"></div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
