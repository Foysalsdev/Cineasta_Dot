import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';
import ClientsList from './pages/clients/ClientsList';
import ClientDetail from './pages/clients/ClientDetail';
import ProjectsList from './pages/projects/ProjectsList';
import ProjectDetail from './pages/projects/ProjectDetail';
import QuotationsList from './pages/quotations/QuotationsList';
import QuotationBuilder from './pages/quotations/QuotationBuilder';
import QuotationPrint from './pages/quotations/QuotationPrint';
import FinancePage from './pages/finance/FinancePage';
import ReportsPage from './pages/reports/ReportsPage';
import CrewPage from './pages/crew/CrewPage';
import SettingsPage from './pages/settings/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/quotations/:id/print"
        element={
          <ProtectedRoute>
            <QuotationPrint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<ClientsList />} />
                <Route path="/clients/:id" element={<ClientDetail />} />
                <Route path="/projects" element={<ProjectsList />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/quotations" element={<QuotationsList />} />
                <Route path="/quotations/:id" element={<QuotationBuilder />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/crew" element={<CrewPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/pre-production" element={<Placeholder title="Pre-Production" />} />
                <Route path="/shoot" element={<Placeholder title="Shoot" />} />
                <Route path="/assets" element={<Placeholder title="Assets" />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
