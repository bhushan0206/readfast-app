import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../components/ThemeToggle';
import { 
  BookOpen, 
  Library, 
  LineChart, 
  Award, 
  Settings, 
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, profile } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LineChart size={20} /> },
    { path: '/library', label: 'Library', icon: <Library size={20} /> },
    { path: '/achievements', label: 'Achievements', icon: <Award size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary-500" />
                <span className="ml-2 text-xl font-bold text-neutral-900 dark:text-white hidden sm:inline">ReadFast</span>
                <span className="ml-2 text-lg font-bold text-neutral-900 dark:text-white sm:hidden">RF</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2 xl:space-x-4 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center py-2 px-2 xl:px-3 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-500 dark:bg-primary-600 text-white dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  <span className="mr-1 xl:mr-2">{item.icon}</span>
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              ))}
              <div className="border-l border-neutral-200 dark:border-neutral-700 pl-2 xl:pl-4 ml-2 xl:ml-4">
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center py-2 px-2 xl:px-3 rounded-md text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                title="Logout"
              >
                <LogOut size={20} className="mr-0 xl:mr-2" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </nav>

            {/* Tablet Navigation - Icons only */}
            <nav className="hidden md:flex lg:hidden space-x-1 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center p-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-500 dark:bg-primary-600 text-white dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                  title={item.label}
                >
                  {item.icon}
                </Link>
              ))}
              <div className="border-l border-neutral-200 dark:border-neutral-700 pl-2 ml-2">
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center p-2 rounded-md text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </nav>

            {/* Mobile menu button and theme toggle */}
            <div className="flex items-center space-x-1 md:hidden">
              <div className="flex items-center">
                <ThemeToggle />
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="block h-5 w-5" />
                ) : (
                  <Menu className="block h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-2 px-3 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-primary-500 dark:bg-primary-600 text-white dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center py-2 px-3 rounded-md text-base font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-primary-500" />
              <span className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">ReadFast</span>
            </div>
            <div className="mt-2 md:mt-0 text-sm text-neutral-500 dark:text-neutral-400">
              &copy; {new Date().getFullYear()} ReadFast. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;