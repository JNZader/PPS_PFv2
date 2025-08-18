import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { Loading } from '../components/atoms/Loading';
import { ProtectedRoute } from '../components/organisms/ProtectedRoute';
import { DashboardLayout } from '../components/templates/DashboardLayout/DashboardLayout';

// Lazy load page components
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Products = lazy(() => import('../pages/Products/Products'));
const Categories = lazy(() => import('../pages/Categories/Categories'));
const Inventory = lazy(() => import('../pages/Inventory/Inventory'));
const Reports = lazy(() => import('../pages/Reports/Reports'));
const Users = lazy(() => import('../pages/Users/Users'));
const Login = lazy(() => import('../pages/Auth/Login/Login'));
const Register = lazy(() => import('../pages/Auth/Register/Register'));
const TempPage = lazy(() => import('../components/atoms/TempPage/TempPage'));

// Helper for Suspense fallback
const withSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<Loading fullscreen />}>{Component}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/auth/login',
    element: withSuspense(<Login />),
  },
  {
    path: '/auth/register',
    element: withSuspense(<Register />),
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
        element: withSuspense(<Dashboard />),
      },
      {
        path: 'products',
        element: withSuspense(<Products />),
      },
      {
        path: 'products/new',
        element: withSuspense(<TempPage title="Nuevo Producto" />),
      },
      {
        path: 'categories',
        element: (
          <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
            {withSuspense(<Categories />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'inventory',
        element: withSuspense(<Inventory />),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
            {withSuspense(<Reports />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['superadmin']}>{withSuspense(<Users />)}</ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<TempPage title="404 - Página no encontrada" />),
  },
]);
