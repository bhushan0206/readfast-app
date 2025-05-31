import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../auth/providers/AuthProvider';
import { useReadingStore } from '../../../store/readingStore';
import { useThemeStore } from '../../../store/themeStore';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import SpeedControl from '../../reading/components/SpeedControl';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useThemeStore();
  
  // Debug auth state
  console.log('🔍 Settings component auth state:', { user, authenticated: !!user?.id });
  
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [readingLevel, setReadingLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      console.error('❌ Cannot update profile: User not authenticated');
      toast.error('Please sign in to update your profile');
      return;
    }
    
    try {
      setLoading(true);
      
      // For now, just save to local state until profile service is integrated
      console.log('✅ Profile settings saved:', {
        full_name: fullName,
        reading_level: readingLevel,
        theme_preference: theme,
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/profile')}
        >
          Back to Profile
        </Button>
      </div>
      
      {success && (
        <div className="bg-success-50 dark:bg-success-900/50 border border-success-200 dark:border-success-800 text-success-800 dark:text-success-200 px-4 py-3 rounded-lg mb-6">
          Settings saved successfully!
        </div>
      )}
      
      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Profile Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
              <div className="flex-shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt={user.user_metadata.full_name || user.email} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary-100 dark:border-primary-800"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <User size={36} className="text-primary-600 dark:text-primary-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-grow space-y-1 text-center md:text-left">
                <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Profile Picture</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Avatar upload feature coming soon
                </p>
              </div>
            </div>
            
            <Input
              label="Full Name"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Name"
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Reading Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                  <div
                    key={level}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-colors text-center
                      ${readingLevel === level 
                        ? 'bg-primary-500 dark:bg-primary-600 border-primary-500 dark:border-primary-600 text-white dark:text-white' 
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300'}
                    `}
                    onClick={() => setReadingLevel(level)}
                  >
                    <span className="capitalize">{level}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Theme Preference
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['light', 'dark'].map((themeOption) => (
                  <motion.div
                    key={themeOption}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-colors text-center
                      ${theme === themeOption 
                        ? 'bg-primary-500 dark:bg-primary-600 border-primary-500 dark:border-primary-600 text-white dark:text-white' 
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300'}
                    `}
                    onClick={() => setTheme(themeOption as 'light' | 'dark')}
                  >
                    <span className="capitalize">{themeOption}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                leftIcon={<Save size={18} />}
                isLoading={loading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
        
        {/* Reading Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Reading Settings</h2>
          <SpeedControl />
        </div>
        
        {/* Account Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Account Settings</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Email Address</h3>
              <p className="text-neutral-600 dark:text-neutral-400">{user?.email}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Email change feature coming soon
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Password</h3>
              <p className="text-neutral-600 dark:text-neutral-400">••••••••</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Password change feature coming soon
              </p>
            </div>
            
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                variant="danger"
              >
                Delete Account
              </Button>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;