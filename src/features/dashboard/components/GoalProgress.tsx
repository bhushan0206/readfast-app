import React from 'react';
import { CheckCircle as CircleCheck, Target, Award } from 'lucide-react';

interface GoalProgressProps {
  stats: any;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ stats }) => {
  // Define some goals
  const goals = [
    { 
      name: 'Read 10,000 words',
      target: 10000,
      current: stats?.total_words_read || 0,
      icon: <Target className="h-5 w-5 text-primary-500" />
    },
    { 
      name: 'Complete 10 sessions',
      target: 10,
      current: stats?.sessions_completed || 0,
      icon: <Award className="h-5 w-5 text-secondary-500" />
    },
    { 
      name: 'Reach 300 WPM',
      target: 300,
      current: stats?.max_wpm || 0,
      icon: <Target className="h-5 w-5 text-accent-500" />
    }
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Reading Goals</h3>
      
      <div className="space-y-4">
        {goals.map((goal, index) => {
          const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const isComplete = progress >= 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {goal.icon}
                  <span className="ml-2 text-sm font-medium text-neutral-700">{goal.name}</span>
                </div>
                {isComplete && (
                  <CircleCheck className="h-5 w-5 text-success-500" />
                )}
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-neutral-500">
                <span>{goal.current} / {goal.target}</span>
                <span>{progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalProgress;