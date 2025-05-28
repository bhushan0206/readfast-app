import React from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

interface ReadingStatsProps {
  stats: any;
  sessions: any[];
}

const ReadingStats: React.FC<ReadingStatsProps> = ({ stats, sessions }) => {
  // Format session data for the chart
  const chartData = React.useMemo(() => {
    // Sort sessions by date ascending
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Get the last 10 sessions
    const recentSessions = sortedSessions.slice(-10);
    
    const labels = recentSessions.map(session => {
      const date = new Date(session.created_at);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const wpmData = recentSessions.map(session => session.wpm);
    
    return {
      labels,
      datasets: [
        {
          label: 'Reading Speed (WPM)',
          data: wpmData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  }, [sessions]);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(107, 114, 128)', // neutral-500 for both themes
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
      },
    },
    scales: {
      y: {
        min: 0,
        title: {
          display: true,
          text: 'Words Per Minute',
          color: 'rgb(107, 114, 128)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          color: 'rgb(107, 114, 128)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)',
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Reading Progress</h3>
      
      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-500 dark:text-neutral-400">Complete reading sessions to see your progress chart</p>
        </div>
      ) : (
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      )}
      
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Average Speed</p>
          <p className="text-lg font-semibold text-neutral-800 dark:text-white">{stats?.avg_wpm || 0} WPM</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Sessions</p>
          <p className="text-lg font-semibold text-neutral-800 dark:text-white">{stats?.sessions_completed || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Reading Level</p>
          <p className="text-lg font-semibold text-neutral-800 dark:text-white capitalize">
            {determineReadingLevel(stats?.max_wpm || 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to determine reading level based on WPM
function determineReadingLevel(wpm: number): string {
  if (wpm === 0) return 'beginner';
  if (wpm < 150) return 'beginner';
  if (wpm < 250) return 'average';
  if (wpm < 400) return 'above average';
  if (wpm < 600) return 'advanced';
  return 'expert';
}

export default ReadingStats;