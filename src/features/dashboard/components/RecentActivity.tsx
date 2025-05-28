import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, BookOpen } from 'lucide-react';

interface RecentActivityProps {
  sessions: any[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ sessions }) => {
  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700">
      {recentSessions.map((session) => {
        const date = new Date(session.created_at);
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        
        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        
        // Calculate duration in minutes
        const startTime = new Date(session.start_time);
        const endTime = session.end_time ? new Date(session.end_time) : startTime;
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
        
        return (
          <div key={session.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="bg-primary-50 dark:bg-primary-900/50 p-2 rounded-lg text-primary-600 dark:text-primary-400">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">Reading Session</h4>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="badge badge-primary bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full text-xs">
                    {session.wpm} WPM
                  </div>
                  {session.comprehension_score !== null && (
                    <div className="badge badge-success bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-300 px-2 py-1 rounded-full text-xs">
                      {session.comprehension_score}% Comp.
                    </div>
                  )}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {session.words_read} words · {durationMinutes} min
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivity;