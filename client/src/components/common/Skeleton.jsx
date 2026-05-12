export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden h-full animate-pulse">
      <div className="h-2/5 bg-gray-200 dark:bg-gray-700" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 space-y-3">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />;
}
