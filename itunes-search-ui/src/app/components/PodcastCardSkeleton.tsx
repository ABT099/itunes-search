export const PodcastCardSkeleton = () => (
  <div className="flex flex-col h-full p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg animate-pulse border border-gray-700/50">
    <div className="aspect-square mb-3 rounded-md bg-gray-700/50"></div>
    <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
  </div>
); 