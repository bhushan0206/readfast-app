import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={18} />;
      case 'dark':
        return <Moon size={18} />;
      default:
        return <Monitor size={18} />;
    }
  };

  const getTitle = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system mode';
      default:
        return 'Switch to light mode';
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      title={getTitle()}
      aria-label={getTitle()}
      className="p-2"
    >
      {getIcon()}
    </Button>
  );
};

export default ThemeToggle;