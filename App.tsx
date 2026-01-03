
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Page } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Rules from './components/Rules';
import Transactions from './components/Transactions';
import Finance from './components/Finance';
import Regulamento from './components/Regulamento';
import SelfService from './components/SelfService';
import AdminApprovals from './components/AdminApprovals';
import Profile from './components/Profile';
import Login from './components/Login';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage(Page.Dashboard);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard: return <Dashboard />;
      case Page.Regulamento: return <Regulamento />;
      case Page.Colaboradores: return <Users />;
      case Page.Pontuacao: return <Rules />;
      case Page.Lancamentos: return <Transactions />;
      case Page.Financeiro: return <Finance />;
      case Page.AutoAtendimento: return <SelfService />;
      case Page.Aprovacoes: return <AdminApprovals />;
      case Page.Perfil: return <Profile />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
