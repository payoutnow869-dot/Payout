export function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, trend, trendUp, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 font-mono">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
        )}
      </div>
    </div>
  );
}
