import { createBrowserRouter, Navigate } from 'react-router-dom';

import { TempPage } from '../components/atoms/TempPage';
import { ProtectedRoute } from '../components/organisms/ProtectedRoute';
import { DashboardLayout } from '../components/templates/DashboardLayout/DashboardLayout';
import { Login } from '../pages/Auth/Login/Login';
import { Register } from '../pages/Auth/Register/Register';
import { Categories } from '../pages/Categories/Categories';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Inventory } from '../pages/Inventory/Inventory'; // ← Nueva importación
import { Products } from '../pages/Products/Products';

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
        element: <Products />,
      },
      {
        path: 'products/new',
        element: <TempPage title="Nuevo Producto" />,
      },
      {
        path: 'categories',
        element: (
          <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
            <Categories />
          </ProtectedRoute>
        ),
      },
      {
        path: 'inventory', // ← Nueva ruta
        element: <Inventory />,
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
            <TempPage title="Reportes" />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['superadmin']}>
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
