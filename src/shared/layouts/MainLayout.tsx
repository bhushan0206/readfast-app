import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
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
      <header className="bg-white border-b border-neutral-200 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary-500" />
                <span className="ml-2 text-xl font-bold text-neutral-900">ReadFast</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center py-2 px-3 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                <LogOut size={20} className="mr-2" />
                Logout
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-2 px-3 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
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
              className="flex w-full items-center py-2 px-3 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-primary-500" />
              <span className="ml-2 text-sm font-medium text-neutral-700">ReadFast</span>
            </div>
            <div className="mt-2 md:mt-0 text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} ReadFast. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;