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
      icon: <Target className="h-5 w-5 text-primary-500 dark:text-primary-400" />
    },
    { 
      name: 'Complete 10 sessions',
      target: 10,
      current: stats?.sessions_completed || 0,
      icon: <Award className="h-5 w-5 text-secondary-500 dark:text-secondary-400" />
    },
    { 
      name: 'Reach 300 WPM',
      target: 300,
      current: stats?.max_wpm || 0,
      icon: <Target className="h-5 w-5 text-accent-500 dark:text-accent-400" />
    }
  ];

  return (
    <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Reading Goals</h3>
      
      <div className="space-y-4">
        {goals.map((goal, index) => {
          const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const isComplete = progress >= 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {goal.icon}
                  <span className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">{goal.name}</span>
                </div>
                {isComplete && (
                  <CircleCheck className="h-5 w-5 text-success-500 dark:text-success-400" />
                )}
              </div>
              
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                <div 
                  className="bg-primary-500 dark:bg-primary-400 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>{goal.current.toLocaleString()} / {goal.target.toLocaleString()}</span>
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