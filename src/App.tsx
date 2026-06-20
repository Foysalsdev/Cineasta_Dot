import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Placeholder title="Clients" />} />
                <Route path="/projects" element={<Placeholder title="Projects" />} />
                <Route path="/quotations" element={<Placeholder title="Quotations" />} />
                <Route path="/pre-production" element={<Placeholder title="Pre-Production" />} />
                <Route path="/shoot" element={<Placeholder title="Shoot" />} />
                <Route path="/crew" element={<Placeholder title="Crew" />} />
                <Route path="/finance" element={<Placeholder title="Finance" />} />
                <Route path="/assets" element={<Placeholder title="Assets" />} />
                <Route path="/reports" element={<Placeholder title="Reports" />} />
                <Route path="/settings" element={<Placeholder title="Settings" />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
