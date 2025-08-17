import { createBrowserRouter, Navigate } from 'react-router-dom';
import { TempPage } from '../components/atoms/TempPage'; // ← Importar componente separado
import { ProtectedRoute } from '../components/organisms/ProtectedRoute';
import { DashboardLayout } from '../components/templates/DashboardLayout/DashboardLayout';
import { Login } from '../pages/Auth/Login/Login';
import { Register } from '../pages/Auth/Register/Register';
import { Dashboard } from '../pages/Dashboard/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/auth/login',
    element: <Login />,
  },
  {
    path: '/auth/register',
    element: <Register />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'products',
        element: <TempPage title="Productos" />,
      },
      {
        path: 'products/new',
        element: <TempPage title="Nuevo Producto" />,
      },
      {
        path: 'categories',
        element: (
          <ProtectedRoute requiredRoles={['admin', 'manager']}>
            <TempPage title="Categorías" />
          </ProtectedRoute>
        ),
      },
      {
        path: 'inventory',
        element: <TempPage title="Kardex de Inventario" />,
      },
      {
        path: 'inventory/new',
        element: <TempPage title="Nuevo Movimiento" />,
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute requiredRoles={['admin', 'manager']}>
            <TempPage title="Reportes" />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <TempPage title="Gestión de Personal" />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <TempPage title="404 - Página no encontrada" />,
  },
]);
