import React from 'react';

interface SimpleLineChartProps {
  data: Array<{ date: string; value: number }>;
  color?: string;
  height?: number;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ 
  data, 
  color = '#3b82f6', 
  height = 200 
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-neutral-400 dark:text-neutral-600">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 300;
    const y = height - ((item.value - minValue) / range) * (height - 40);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      <svg width="100%" height={height + 40} viewBox={`0 0 300 ${height + 40}`} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-neutral-200 dark:text-neutral-700" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="300" height={height} fill="url(#grid)" />
        
        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="drop-shadow-sm"
        />
        
        {/* Points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 300;
          const y = height - ((item.value - minValue) / range) * (height - 40);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              className="drop-shadow-sm"
            />
          );
        })}
        
        {/* Labels */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 300;
          return (
            <text
              key={index}
              x={x}
              y={height + 20}
              textAnchor="middle"
              className="text-xs fill-current text-neutral-600 dark:text-neutral-400"
            >
              {item.date}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

interface SimpleBarChartProps {
  data: Array<{ date: string; value: number }>;
  color?: string;
  height?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  color = '#10b981', 
  height = 200 
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-neutral-400 dark:text-neutral-600">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 300 / data.length - 5;

  return (
    <div className="w-full">
      <svg width="100%" height={height + 40} viewBox={`0 0 300 ${height + 40}`} className="overflow-visible">
        {data.map((item, index) => {
          const x = (index * 300) / data.length;
          const barHeight = (item.value / maxValue) * height;
          const y = height - barHeight;
          
          return (
            <g key={index}>
              <rect
                x={x + 2}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                className="drop-shadow-sm"
                rx="2"
              />
              <text
                x={x + barWidth / 2}
                y={height + 20}
                textAnchor="middle"
                className="text-xs fill-current text-neutral-600 dark:text-neutral-400"
              >
                {item.date}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface SimplePieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  size?: number;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({ 
  data, 
  size = 160 
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-neutral-400 dark:text-neutral-600">
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;
  
  let currentAngle = 0;
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const angle = (item.value / total) * 2 * Math.PI;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const x1 = centerX + radius * Math.cos(startAngle);
          const y1 = centerY + radius * Math.sin(startAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);
          
          const largeArcFlag = angle > Math.PI ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          currentAngle += angle;
          
          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              className="drop-shadow-sm"
            />
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="mt-2 space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div 
              className={`w-3 h-3 rounded-full ${
                item.color === '#10b981' ? 'bg-green-500' :
                item.color === '#3b82f6' ? 'bg-blue-500' :
                item.color === '#f59e0b' ? 'bg-yellow-500' :
                item.color === '#ef4444' ? 'bg-red-500' :
                'bg-neutral-500'
              }`}
            />
            <span className="text-neutral-600 dark:text-neutral-400">
              {item.name}: {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};