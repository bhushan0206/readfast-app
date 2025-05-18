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
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        min: 0,
        title: {
          display: true,
          text: 'Words Per Minute'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
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
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Reading Progress</h3>
      
      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-500">Complete reading sessions to see your progress chart</p>
        </div>
      ) : (
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      )}
      
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
        <div className="text-center">
          <p className="text-sm text-neutral-500">Average Speed</p>
          <p className="text-lg font-semibold text-neutral-800">{stats?.avg_wpm || 0} WPM</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-500">Sessions</p>
          <p className="text-lg font-semibold text-neutral-800">{stats?.sessions_completed || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-500">Reading Level</p>
          <p className="text-lg font-semibold text-neutral-800 capitalize">
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