import { useState } from 'react';
import {
  MdAssessment,
  MdCategory,
  MdDarkMode,
  MdDashboard,
  MdInventory,
  MdLightMode,
  MdLogout,
  MdMenu,
  MdPeople,
} from 'react-icons/md';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { Button } from '../../atoms/Button';
import styles from './DashboardLayout.module.css';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: Array<'superadmin' | 'admin' | 'empleado'>;
}

const navigation: NavItem[] = [
  {
    to: '/dashboard',
    icon: <MdDashboard size={20} />,
    label: 'Dashboard',
  },
  {
    to: '/products',
    icon: <MdInventory size={20} />,
    label: 'Productos',
  },
  {
    to: '/categories',
    icon: <MdCategory size={20} />,
    label: 'Categorías',
    roles: ['superadmin', 'admin'],
  },
  {
    to: '/inventory',
    icon: <MdInventory size={20} />,
    label: 'Kardex',
  },
  {
    to: '/reports',
    icon: <MdAssessment size={20} />,
    label: 'Reportes',
    roles: ['superadmin', 'admin'],
  },
  {
    to: '/users',
    icon: <MdPeople size={20} />,
    label: 'Personal',
    roles: ['superadmin'],
  },
];

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || (user && item.roles.includes(user.tipouser))
  );

  const getUserInitials = (nombres: string) => {
    return nombres
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.layout}>
      {sidebarOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú lateral"
        />
      )}

      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.header}>
          <Link to="/dashboard" className={styles.logo}>
            FiveStock
          </Link>
        </div>

        <nav className={styles.nav}>
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
              onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{user ? getUserInitials(user.nombres) : 'U'}</div>
            <div>
              <div className={styles.userName}>{user?.nombres || 'Usuario'}</div>
              <div className={styles.userRole}>{user?.tipouser || 'empleado'}</div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <MdLogout size={16} />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MdMenu size={24} />
          </button>

          <div className={styles.userMenu}>
            <button
              type="button"
              className={styles.themeToggle}
              onClick={toggleTheme}
              title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
            >
              {theme === 'light' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
            </button>

            <div className={styles.userInfo}>
              <div className={styles.avatar}>{user ? getUserInitials(user.nombres) : 'U'}</div>
              <div>
                <div className={styles.userName}>{user?.nombres}</div>
                <div className={styles.userRole}>{user?.tipouser}</div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
