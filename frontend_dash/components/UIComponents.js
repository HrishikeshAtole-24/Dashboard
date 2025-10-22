// Shared UI Components for consistent styling across all pages

// Card Component
export function Card({ children, className = '', padding = 'p-6' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${padding} ${className}`}>
      {children}
    </div>
  );
}

// Metric Card Component
export function MetricCard({ title, value, change, icon, trend = 'neutral' }) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
  
  return (
    <Card className="hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
          {icon && <div className="text-white">{icon}</div>}
        </div>
        {change && (
          <div className={`text-sm font-medium ${trendColor}`}>
            {change}
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value?.toLocaleString?.() || value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </Card>
  );
}

// Section Header Component
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
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
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
    outline: 'border border-blue-500 text-blue-600 hover:bg-blue-50',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button 
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Loading Skeleton Component
export function LoadingSkeleton({ className = '', height = 'h-4' }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${height} ${className}`}></div>
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
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
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
    <Card className="text-center py-12">
      <div className="max-w-md mx-auto">
        {icon && (
          <div className="mx-auto w-20 h-20 mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <div className="text-gray-400 w-10 h-10">{icon}</div>
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        {description && <p className="text-gray-600 mb-6">{description}</p>}
        {action && <div>{action}</div>}
      </div>
    </Card>
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
    <Card className={className}>
      {title && (
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className={height}>
        {children}
      </div>
    </Card>
  );
}

// Badge Component
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}