"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Podcast, FilterState } from "./types";
import { MAX_SEARCH_HISTORY, containerVariants } from "./constants";
import { PodcastCard } from "./components/PodcastCard";
import { PodcastCardSkeleton } from "./components/PodcastCardSkeleton";
import { FilterBar } from "./components/FilterBar";
import { SearchHistory } from "./components/SearchHistory";


export default function Home() {
  const [searchResult, setSearchResult] = useState<Podcast[]>([]);
  const [trendingResult, setTrendingResult] = useState<Podcast[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    genre: null,
    explicitness: null,
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const addToSearchHistory = (term: string) => {
    if (!term.trim()) return;

    setSearchHistory((prev) => {
      const filtered = prev.filter(
        (t) => t.toLowerCase() !== term.toLowerCase(),
      );
      return [term, ...filtered].slice(0, MAX_SEARCH_HISTORY);
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResult([]);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://towait.net/search?q=${encodeURIComponent(term)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        },
      );
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      const data: Podcast[] = await response.json();
      if (!controller.signal.aborted) {
        setSearchResult(data);
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
      } else if (!controller.signal.aborted) {
        console.error("Search error:", error);
        setSearchResult([]);
        setError("Could not fetch results. Please try again later.");
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      performSearch(searchTerm.trim());
    } else {
      setSearchResult([]);
    }
  }, [searchTerm, performSearch]);

  useEffect(() => {
    const fetchTrending = async () => {
      if (!inputValue && searchResult.length === 0) {
        setIsLoading(true);
      }
      try {
        const response = await fetch(`https://towait.net/search?q=trending`);
        if (response.ok) {
          const data: Podcast[] = await response.json();
          setTrendingResult(data);
        } else {
          console.error("Trending fetch failed:", response.statusText);
        }
      } catch (e) {
        console.error("Could not fetch trending podcasts", e);
        if (!searchTerm) {
          setError("Could not load trending content.");
        }
      }
      if (!inputValue && searchResult.length === 0) {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowHistory(true);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  };

  const handleSearchComplete = (term: string) => {
    const trimmedTerm = term.trim();
    if (trimmedTerm) {
      setInputValue(trimmedTerm);
      setSearchTerm(trimmedTerm);
      addToSearchHistory(trimmedTerm);
    }
    setShowHistory(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchComplete(inputValue);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleItemClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getAvailableGenres = (podcasts: Podcast[]): string[] => {
    const genres = new Set(
      podcasts
        .map((p) => p.primaryGenre)
        .filter((genre): genre is string => genre !== undefined),
    );
    return Array.from(genres).sort();
  };

  const filterPodcasts = (podcasts: Podcast[]): Podcast[] => {
    if (!podcasts.length) return [];
    return podcasts.filter((podcast) => {
      if (!filters.genre && !filters.explicitness) return true;
      if (
        filters.genre &&
        podcast.primaryGenre?.toLowerCase() !== filters.genre.toLowerCase()
      ) {
        return false;
      }
      if (
        filters.explicitness &&
        podcast.explicitness?.toLowerCase() !==
          filters.explicitness.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilters({ genre: null, explicitness: null });
    }
  }, [searchTerm]);

  const currentResult = searchTerm.trim() ? searchResult : trendingResult;
  const filteredResults = filterPodcasts(currentResult);
  const hasResults = filteredResults.length > 0;

  const renderPodcastGrid = (
    podcastsToRender: Podcast[],
    title: string,
  ) => (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h1
        className="text-lg md:text-xl lg:text-2xl font-semibold text-white mb-4 flex items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm mr-3">
          {podcastsToRender.length}
        </span>
        {title}
      </motion.h1>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {podcastsToRender.map((podcast) => (
            <PodcastCard
              key={podcast.trackId}
              podcast={podcast}
              onClick={handleItemClick}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md p-4 border-b border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search for any podcast..."
              value={inputValue}
              className="border border-gray-600/50 bg-gray-800/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl px-4 py-3 w-full text-white placeholder-gray-400 transition-all duration-300"
              onChange={handleSearchInput}
              onFocus={() => setShowHistory(true)}
              onBlur={() => {
                setTimeout(() => {
                  addToSearchHistory(inputValue);
                  setShowHistory(false);
                }, 150);
              }}
              onKeyDown={handleKeyDown}
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
              </div>
            )}
            {showHistory && (
              <SearchHistory
                searches={searchHistory}
                onSelect={handleSearchComplete}
                onClear={clearSearchHistory}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-0 py-4 md:py-5 lg:py-6">
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          availableGenres={getAvailableGenres(currentResult)}
        />
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              {Array(12)
                .fill(0)
                .map((_, index) => (
                  <PodcastCardSkeleton key={index} />
                ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center text-red-400 mt-12"
            >
              <p className="text-lg font-semibold">
                Oops! Something went wrong.
              </p>
              <p className="text-base">{error}</p>
            </motion.div>
          ) : hasResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderPodcastGrid(
                filteredResults,
                searchTerm.trim()
                  ? `Podcasts for "${searchTerm.trim()}"`
                  : "Trending Podcasts",
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center text-gray-400 mt-12"
            >
              <p className="text-base">
                {inputValue.trim()
                  ? `No results found for "${inputValue.trim()}"`
                  : "Start typing to find your next favorite podcast."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}