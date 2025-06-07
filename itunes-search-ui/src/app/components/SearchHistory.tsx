import { motion } from "framer-motion";

interface SearchHistoryProps {
  searches: string[];
  onSelect: (term: string) => void;
  onClear: () => void;
}

export const SearchHistory = ({
  searches,
  onSelect,
  onClear,
}: SearchHistoryProps) => {
  if (searches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ 
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
        scale: { duration: 0.15 }
      }}
      className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-xl z-20"
    >
      <div className="p-2">
        <div className="flex items-center justify-between mb-2 px-2">
          <h3 className="text-sm font-medium text-gray-400">
            Recent Searches
          </h3>
          <button
            onClick={onClear}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Clear History
          </button>
        </div>
        <div className="space-y-1">
          {searches.map((term, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ 
                duration: 0.2, 
                delay: index * 0.05,
                ease: [0.4, 0, 0.2, 1]
              }}
              onClick={() => onSelect(term)}
              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {term}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}; 