import { createBrowserRouter, Navigate } from 'react-router-dom';

import { TempPage } from '../components/atoms/TempPage';
import { ProtectedRoute } from '../components/organisms/ProtectedRoute';
import { DashboardLayout } from '../components/templates/DashboardLayout/DashboardLayout';
import { Login } from '../pages/Auth/Login/Login';
import { Register } from '../pages/Auth/Register/Register';
import { Categories } from '../pages/Categories/Categories';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Inventory } from '../pages/Inventory/Inventory';
import { Products } from '../pages/Products/Products';
import { Reports } from '../pages/Reports/Reports'; // ← Nueva importación
import { Users } from '../pages/Users/Users';

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
        path: 'inventory',
        element: <Inventory />,
      },
      {
        path: 'reports', // ← Actualizar esta ruta
        element: (
          <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['superadmin']}>
            <Users />
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