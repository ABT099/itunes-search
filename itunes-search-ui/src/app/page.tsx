"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Podcast = {
  id: string;
  trackId: number;
  artistName: string;
  trackName: string;
  trackViewUrl: string;
  artworkUrl30: string;
  artworkUrl60: string;
  artworkUrl100: string;
  artworkUrl600: string;
  primaryGenre?: string;
  trackCount?: number;
  explicitness?: string;
};

const Badge = ({ text, className }: { text: string; className?: string }) => {
  if (!text) return null;
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-block bg-gray-700/80 backdrop-blur-sm text-gray-300 text-[10px] font-semibold mr-2 px-2.5 py-0.5 rounded-full ${className}`}
    >
      {text}
    </motion.span>
  );
};

const PodcastCardSkeleton = () => (
  <div className="flex flex-col h-full p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg animate-pulse border border-gray-700/50">
    <div className="aspect-square mb-3 rounded-md bg-gray-700/50"></div>
    <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
  </div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.05,
      delayChildren: 0.1
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

export default function Home() {
  const [searchResult, setSearchResult] = useState<Podcast[]>([]);
  const [trendingResult, setTrendingResult] = useState<Podcast[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const getBestImageUrl = (podcast: Podcast): string => {
    return podcast.artworkUrl600 || podcast.artworkUrl100 || "";
  };

  const handleItemClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderPodcastGrid = (podcastsToRender: Podcast[], title: string) => (
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
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {podcastsToRender.map((podcast) => (
            <motion.div
              key={podcast.trackId}
              variants={cardVariants}
              whileHover="hover"
              className="cursor-pointer group"
              onClick={() => handleItemClick(podcast.trackViewUrl)}
              layout
            >
              <div className="flex flex-col h-full bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden p-3 transition-all duration-300 ease-in-out hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="aspect-square mb-3 overflow-hidden rounded-md bg-gray-700/50 relative group-hover:ring-2 group-hover:ring-blue-500/50 transition-all duration-300">
                  <Image
                    src={getBestImageUrl(podcast)}
                    alt={podcast.trackName}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="mb-1.5 flex items-center flex-wrap">
                    {podcast.primaryGenre && <Badge text={podcast.primaryGenre} />}
                    {podcast.explicitness === 'explicit' && (
                      <Badge text="Explicit" className="bg-red-900/80 text-red-300"/>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors duration-300">
                    {podcast.trackName}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-1 mt-auto group-hover:text-gray-300 transition-colors duration-300">
                    {podcast.artistName}
                    {podcast.trackCount && (
                      <span className="text-gray-500 group-hover:text-gray-400">
                        {` • ${podcast.trackCount} Ep.`}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );

  const currentResult = searchTerm.trim() ? searchResult : trendingResult;
  const hasResults = currentResult.length > 0;

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
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-5 lg:p-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6"
            >
              {Array(12).fill(0).map((_, index) => <PodcastCardSkeleton key={index} />)}
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center text-red-400 mt-12"
            >
              <p className="text-lg font-semibold">Oops! Something went wrong.</p>
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
                currentResult,
                searchTerm.trim() ? `Podcasts for "${searchTerm.trim()}"` : "Trending Podcasts"
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