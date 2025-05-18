import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, User } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { getUserReadingStats } from '../../../services/supabase';
import Button from '../../../shared/components/Button';
import ReadingStats from '../../dashboard/components/ReadingStats';
import RecentActivity from '../../dashboard/components/RecentActivity';

const Profile: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const statsData = await getUserReadingStats(user.id);
        setStats(statsData || {
          avg_wpm: 0,
          max_wpm: 0,
          total_words_read: 0,
          total_time_spent: 0,
          sessions_completed: 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
        <Link to="/settings">
          <Button variant="outline" leftIcon={<Edit size={18} />}>
            Edit Profile
          </Button>
        </Link>
      </div>
      
      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex-shrink-0">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name} 
                className="w-24 h-24 rounded-full object-cover border-2 border-primary-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                <User size={36} className="text-primary-600" />
              </div>
            )}
          </div>
          
          <div className="flex-grow space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{profile?.full_name}</h2>
              <p className="text-neutral-600">{user?.email}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card bg-primary-50 border-none">
                <p className="text-sm text-primary-700">Reading Speed</p>
                <p className="text-xl font-bold text-primary-900">{profile?.reading_speed || 0} WPM</p>
              </div>
              
              <div className="card bg-secondary-50 border-none">
                <p className="text-sm text-secondary-700">Reading Level</p>
                <p className="text-xl font-bold text-secondary-900 capitalize">
                  {profile?.reading_level || 'beginner'}
                </p>
              </div>
              
              <div className="card bg-accent-50 border-none">
                <p className="text-sm text-accent-700">Sessions Completed</p>
                <p className="text-xl font-bold text-accent-900">{stats?.sessions_completed || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reading Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Reading Statistics</h2>
        <ReadingStats stats={stats} sessions={[]} />
      </div>
      
      {/* Achievement Summary */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">Achievements</h2>
          <Link to="/achievements" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all
          </Link>
        </div>
        
        <div className="card">
          <div className="text-center py-6">
            <p className="text-neutral-600">Achievements summary coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;