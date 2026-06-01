import { useState } from 'react';
import Layout from './components/Layout.jsx';
import Loading from './components/Loading.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AiPage from './pages/AiPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SubjectsPage from './pages/SubjectsPage.jsx';
import TasksPage from './pages/TasksPage.jsx';

const views = {
  dashboard: DashboardPage,
  tasks: TasksPage,
  subjects: SubjectsPage,
  ai: AiPage,
};

export default function App() {
  const { authenticated, booting } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (booting) {
    return <Loading />;
  }

  if (!authenticated) {
    return <AuthPage />;
  }

  const Page = views[activeView] || DashboardPage;

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      <Page />
    </Layout>
  );
}
