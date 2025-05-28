import React from 'react';
import { useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  
  // Add debug logging for sidebar navigation
  console.log('📋 Sidebar - Current location:', location.pathname);

  // ...existing code...
  
  return (
    <div>
      {/* Add your sidebar content here */}
    </div>
  );
};

export default Sidebar;