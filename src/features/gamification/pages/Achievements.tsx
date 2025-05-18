import React, { useEffect, useState } from 'react';
import { useAchievementStore } from '../../../store/achievementStore';
import { Award, BookOpen, TrendingUp, Clock } from 'lucide-react';

const Achievements: React.FC = () => {
  const { achievements, userAchievements, loadAchievements, loading, initialized } = useAchievementStore();
  const [achievementsMap, setAchievementsMap] = useState<{ [key: string]: any }>({});
  
  useEffect(() => {
    if (!initialized) {
      loadAchievements();
    }
  }, [initialized, loadAchievements]);
  
  useEffect(() => {
    // Create a map of user achievements for easy lookup
    const map: { [key: string]: any } = {};
    userAchievements.forEach(ua => {
      map[ua.achievement_id] = ua;
    });
    setAchievementsMap(map);
  }, [userAchievements]);
  
  if (loading && !initialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Group achievements by category
  const achievementCategories = {
    reading: achievements.filter(a => a.criteria?.total_words_read),
    speed: achievements.filter(a => a.criteria?.max_wpm),
    sessions: achievements.filter(a => a.criteria?.sessions_completed),
    other: achievements.filter(a => !a.criteria?.total_words_read && !a.criteria?.max_wpm && !a.criteria?.sessions_completed)
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Achievements</h1>
        <p className="text-neutral-600 mt-1">Track your progress and earn badges</p>
      </div>
      
      {/* Progress Summary */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-3 rounded-full text-primary-700">
              <Award size={24} />
            </div>
            <div>
              <p className="text-neutral-600 text-sm">Achievements Unlocked</p>
              <p className="text-2xl font-bold text-neutral-900">
                {userAchievements.filter(ua => ua.unlocked_at).length} / {achievements.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-secondary-100 p-3 rounded-full text-secondary-700">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-neutral-600 text-sm">Progress</p>
              <p className="text-2xl font-bold text-neutral-900">
                {achievements.length > 0 
                  ? Math.round((userAchievements.filter(ua => ua.unlocked_at).length / achievements.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-accent-100 p-3 rounded-full text-accent-700">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-neutral-600 text-sm">Last Unlocked</p>
              <p className="text-lg font-bold text-neutral-900">
                {userAchievements.length > 0 
                  ? new Date(
                      Math.max(
                        ...userAchievements
                          .filter(ua => ua.unlocked_at)
                          .map(ua => new Date(ua.unlocked_at).getTime())
                      )
                    ).toLocaleDateString()
                  : 'None yet'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reading Achievements */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <BookOpen className="text-primary-500 mr-2" size={20} />
          <h2 className="text-xl font-semibold text-neutral-900">Reading Volume</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievementCategories.reading.map(achievement => {
            const userAchievement = achievementsMap[achievement.id];
            const isUnlocked = !!userAchievement?.unlocked_at;
            const progress = userAchievement?.progress || 0;
            
            return (
              <div 
                key={achievement.id} 
                className={`card ${isUnlocked ? 'border-success-200 bg-success-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full text-lg ${
                      isUnlocked ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{achievement.name}</h3>
                      <p className="text-sm text-neutral-600">{achievement.description}</p>
                    </div>
                  </div>
                  
                  {isUnlocked && (
                    <span className="badge badge-success">Unlocked</span>
                  )}
                </div>
                
                {!isUnlocked && (
                  <div className="mt-4">
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 mt-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                )}
                
                {isUnlocked && (
                  <p className="text-xs text-success-600 mt-2">
                    Unlocked on {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Speed Achievements */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <TrendingUp className="text-secondary-500 mr-2" size={20} />
          <h2 className="text-xl font-semibold text-neutral-900">Reading Speed</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievementCategories.speed.map(achievement => {
            const userAchievement = achievementsMap[achievement.id];
            const isUnlocked = !!userAchievement?.unlocked_at;
            const progress = userAchievement?.progress || 0;
            
            return (
              <div 
                key={achievement.id} 
                className={`card ${isUnlocked ? 'border-success-200 bg-success-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full text-lg ${
                      isUnlocked ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{achievement.name}</h3>
                      <p className="text-sm text-neutral-600">{achievement.description}</p>
                    </div>
                  </div>
                  
                  {isUnlocked && (
                    <span className="badge badge-success">Unlocked</span>
                  )}
                </div>
                
                {!isUnlocked && (
                  <div className="mt-4">
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 mt-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                )}
                
                {isUnlocked && (
                  <p className="text-xs text-success-600 mt-2">
                    Unlocked on {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Sessions Achievements */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Award className="text-accent-500 mr-2" size={20} />
          <h2 className="text-xl font-semibold text-neutral-900">Reading Sessions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievementCategories.sessions.map(achievement => {
            const userAchievement = achievementsMap[achievement.id];
            const isUnlocked = !!userAchievement?.unlocked_at;
            const progress = userAchievement?.progress || 0;
            
            return (
              <div 
                key={achievement.id} 
                className={`card ${isUnlocked ? 'border-success-200 bg-success-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full text-lg ${
                      isUnlocked ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{achievement.name}</h3>
                      <p className="text-sm text-neutral-600">{achievement.description}</p>
                    </div>
                  </div>
                  
                  {isUnlocked && (
                    <span className="badge badge-success">Unlocked</span>
                  )}
                </div>
                
                {!isUnlocked && (
                  <div className="mt-4">
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 mt-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                )}
                
                {isUnlocked && (
                  <p className="text-xs text-success-600 mt-2">
                    Unlocked on {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Achievements;