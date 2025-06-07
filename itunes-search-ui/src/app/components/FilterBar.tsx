import { FilterState } from "../types";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableGenres: string[];
}

export const FilterBar = ({
  filters,
  onFilterChange,
  availableGenres,
}: FilterBarProps) => {
  const hasActiveFilters = filters.genre || filters.explicitness;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <select
        value={filters.genre || ""}
        onChange={(e) =>
          onFilterChange({ ...filters, genre: e.target.value || null })
        }
        className="bg-gray-800/50 border border-gray-600/50 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
      >
        <option value="">All Genres</option>
        {availableGenres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
      <select
        value={filters.explicitness || ""}
        onChange={(e) =>
          onFilterChange({ ...filters, explicitness: e.target.value || null })
        }
        className="bg-gray-800/50 border border-gray-600/50 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
      >
        <option value="">All Content</option>
        <option value="explicit">Explicit</option>
        <option value="cleaned">Cleaned</option>
      </select>
      {hasActiveFilters && (
        <button
          onClick={() => onFilterChange({ genre: null, explicitness: null })}
          className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Clear Filters
        </button>
      )}
    </div>
  );
}; 