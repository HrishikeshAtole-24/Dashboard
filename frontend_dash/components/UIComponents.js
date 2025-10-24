// Shared UI Components for consistent styling across all pages

// Card Component
export function Card({ children, className = '', padding = 'p-6' }) {
  return (
    <div className={`dashboard-card ${padding} ${className}`}>
      {children}
    </div>
  );
}

// Metric Card Component
export function MetricCard({ title, value, change, icon, trend = 'neutral' }) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
  
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className="metric-icon">
          {icon && <div className="text-white">{icon}</div>}
        </div>
        {change && (
          <div className={`text-sm font-medium ${trendColor}`}>
            {change}
          </div>
        )}
      </div>
      <div>
        <div className="metric-value-large">{value?.toLocaleString?.() || value}</div>
        <div className="text-sm text-gray-600 font-medium">{title}</div>
      </div>
    </div>
  );
}

// Section Header Component
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="header-title">{title}</h2>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Button Component
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const baseClasses = variant === 'primary' || variant === 'secondary' ? '' : 'inline-flex items-center justify-center font-medium transition-all duration-200';
  
  return (
    <button 
      className={`${variants[variant]} ${variant !== 'primary' && variant !== 'secondary' ? baseClasses : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Loading Skeleton Component
export function LoadingSkeleton({ className = '', height = 'h-4' }) {
  return (
    <div className={`loading-skeleton ${height} ${className}`}></div>
  );
}

// Loading Card Component
export function LoadingCard() {
  return (
    <Card>
      <div className="space-y-4">
        <LoadingSkeleton height="h-6" className="w-3/4" />
        <LoadingSkeleton height="h-8" className="w-1/2" />
        <LoadingSkeleton height="h-4" className="w-full" />
      </div>
    </Card>
  );
}

// Tab Component
export function TabNavigation({ tabs, activeTab, onTabChange, className = '' }) {
  return (
    <div className={`border-b border-gray-200 mb-6 ${className}`}>
      <nav className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === tab.key
                ? 'btn-primary text-white'
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// Empty State Component
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="max-w-md mx-auto">
        {icon && (
          <div className="empty-state-icon">
            <div className="w-10 h-10">{icon}</div>
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        {description && <p className="text-gray-600 mb-6">{description}</p>}
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

// Stats Grid Component
export function StatsGrid({ children, columns = 4 }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  return (
    <div className={`grid ${gridCols[columns]} gap-6 mb-8`}>
      {children}
    </div>
  );
}

// Chart Container Component
export function ChartContainer({ title, children, height = 'h-80', className = '' }) {
  return (
    <div className={`chart-container ${className}`}>
      {title && (
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className={height}>
        {children}
      </div>
    </div>
  );
}

// Badge Component
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'badge bg-gray-100 text-gray-800',
    success: 'badge badge-success',
    warning: 'badge badge-warning', 
    danger: 'badge badge-error',
    blue: 'badge bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}