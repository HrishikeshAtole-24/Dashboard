import { useMemo } from 'react';

// Simple Line Chart Component
export const SimpleLineChart = ({ data = [], width = 400, height = 200, className = '' }) => {
  const { points, maxValue, minValue } = useMemo(() => {
    if (!data.length) return { points: '', maxValue: 0, minValue: 0 };
    
    const values = data.map(d => d.value || d.y || 0);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    
    const stepX = width / (data.length - 1);
    const range = maxVal - minVal || 1;
    
    const pointsStr = data.map((d, i) => {
      const x = i * stepX;
      const y = height - ((d.value || d.y || 0) - minVal) / range * height;
      return `${x},${y}`;
    }).join(' ');
    
    return { points: pointsStr, maxValue: maxVal, minValue: minVal };
  }, [data, width, height]);

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-gray-400">No data available</span>
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height }}>
      <svg width={width} height={height} className="w-full h-full">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        
        {/* Line */}
        <polyline
          fill="none"
          stroke="var(--primary-500)"
          strokeWidth="2"
          points={points}
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = i * (width / (data.length - 1));
          const y = height - ((d.value || d.y || 0) - minValue) / (maxValue - minValue || 1) * height;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="var(--primary-600)"
              className="hover:r-4 transition-all"
            >
              <title>{`${d.name || d.x}: ${d.value || d.y}`}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
};

// Simple Bar Chart Component
export const SimpleBarChart = ({ data = [], width = 400, height = 200, className = '' }) => {
  const { bars, maxValue } = useMemo(() => {
    if (!data.length) return { bars: [], maxValue: 0 };
    
    const values = data.map(d => d.value || d.y || 0);
    const maxVal = Math.max(...values);
    const barWidth = width / data.length * 0.8;
    const barSpacing = width / data.length * 0.2;
    
    const barsData = data.map((d, i) => {
      const barHeight = ((d.value || d.y || 0) / maxVal) * height * 0.8;
      const x = i * (width / data.length) + barSpacing / 2;
      const y = height - barHeight;
      
      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        value: d.value || d.y || 0,
        label: d.name || d.x
      };
    });
    
    return { bars: barsData, maxValue: maxVal };
  }, [data, width, height]);

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-gray-400">No data available</span>
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height }}>
      <svg width={width} height={height} className="w-full h-full">
        {bars.map((bar, i) => (
          <g key={i}>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill="var(--primary-500)"
              className="hover:fill-primary-600 transition-colors"
            >
              <title>{`${bar.label}: ${bar.value}`}</title>
            </rect>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Simple Area Chart Component
export const SimpleAreaChart = ({ data = [], width = 400, height = 200, className = '' }) => {
  const { path, points, maxValue, minValue } = useMemo(() => {
    if (!data.length) return { path: '', points: '', maxValue: 0, minValue: 0 };
    
    const values = data.map(d => d.value || d.y || 0);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    
    const stepX = width / (data.length - 1);
    const range = maxVal - minVal || 1;
    
    const pointsStr = data.map((d, i) => {
      const x = i * stepX;
      const y = height - ((d.value || d.y || 0) - minVal) / range * height;
      return `${x},${y}`;
    }).join(' ');
    
    // Create area path
    const areaPoints = data.map((d, i) => {
      const x = i * stepX;
      const y = height - ((d.value || d.y || 0) - minVal) / range * height;
      return { x, y };
    });
    
    let pathStr = `M 0 ${height}`;
    areaPoints.forEach(point => {
      pathStr += ` L ${point.x} ${point.y}`;
    });
    pathStr += ` L ${width} ${height} Z`;
    
    return { path: pathStr, points: pointsStr, maxValue: maxVal, minValue: minVal };
  }, [data, width, height]);

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-gray-400">No data available</span>
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height }}>
      <svg width={width} height={height} className="w-full h-full">
        {/* Grid */}
        <defs>
          <pattern id="areaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#areaGrid)" />
        
        {/* Area */}
        <path
          d={path}
          fill="var(--primary-200)"
          opacity="0.6"
        />
        
        {/* Line */}
        <polyline
          fill="none"
          stroke="var(--primary-500)"
          strokeWidth="2"
          points={points}
        />
      </svg>
    </div>
  );
};

// Simple Pie Chart Component
export const SimplePieChart = ({ data = [], width = 200, height = 200, className = '' }) => {
  const { slices, total } = useMemo(() => {
    if (!data.length) return { slices: [], total: 0 };
    
    const totalValue = data.reduce((sum, d) => sum + (d.value || 0), 0);
    let currentAngle = 0;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    
    const slicesData = data.map((d, i) => {
      const sliceAngle = (d.value / totalValue) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      
      const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
      
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      
      const path = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        'Z'
      ].join(' ');
      
      currentAngle += sliceAngle;
      
      return {
        path,
        color: `hsl(${(i * 360) / data.length}, 70%, 50%)`,
        value: d.value,
        label: d.name || `Item ${i + 1}`
      };
    });
    
    return { slices: slicesData, total: totalValue };
  }, [data, width, height]);

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-gray-400">No data available</span>
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height }}>
      <svg width={width} height={height} className="w-full h-full">
        {slices.map((slice, i) => (
          <path
            key={i}
            d={slice.path}
            fill={slice.color}
            className="hover:opacity-80 transition-opacity"
          >
            <title>{`${slice.label}: ${slice.value}`}</title>
          </path>
        ))}
      </svg>
    </div>
  );
};

// Responsive Container Component
export const ResponsiveContainer = ({ children, width = '100%', height = 300 }) => {
  return (
    <div className="chart-container" style={{ width, height }}>
      {children}
    </div>
  );
};

// Export aliases for easier migration
export const LineChart = SimpleLineChart;
export const BarChart = SimpleBarChart;
export const AreaChart = SimpleAreaChart;
export const PieChart = SimplePieChart;