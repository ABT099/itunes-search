"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

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
};

export default function Home() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized search function
  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setPodcasts([]);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://towait.net/search?q=${encodeURIComponent(term)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (!controller.signal.aborted) {
          // Only update if not aborted
          setPodcasts(data);
        }
      } else {
        if (!controller.signal.aborted) {
          console.error("Search failed:", response.statusText);
          setPodcasts([]);
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted for term:", term);
      } else {
        if (!controller.signal.aborted) {
          console.error("Search error:", error);
          setPodcasts([]);
        }
      }
    } finally {
      // Only set isLoading to false if this controller is still the current one
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  // Effect to trigger search when debounced searchTerm changes
  useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      performSearch(trimmedSearchTerm);
    } else {
      // If searchTerm is empty, clear podcasts, set loading to false, and abort any ongoing search.
      setPodcasts([]);
      setIsLoading(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [searchTerm, performSearch]);

  // Handle input change: update inputValue and debounce setSearchTerm
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

  // Cleanup timeouts and abort controllers on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getBestImageUrl = (podcast: Podcast): string => {
    return (
      podcast.artworkUrl600 ||
      podcast.artworkUrl100 ||
      podcast.artworkUrl60 ||
      podcast.artworkUrl30 ||
      ""
    );
  };

  const handlePodcastClick = (trackViewUrl: string) => {
    window.open(trackViewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-900 p-2 md:p-3 lg:p-4 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search for podcasts, music, apps..."
              value={inputValue}
              className="border border-gray-600 bg-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-lg px-3 py-2 w-full text-white placeholder-gray-400 text-sm"
              onChange={handleSearchInput}
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              </div>
            )}
          </div>
        </div>

        {podcasts.length > 0 && searchTerm.trim() && (
          <div className="mt-8 pb-2">
            <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-white">
              Top podcasts for {searchTerm.trim()}
            </h1>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 md:p-3 lg:p-4">
        {isLoading ? (
          <div className="text-center text-gray-400 mt-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto mb-3"></div>
            <p className="text-base">Searching...</p>
          </div>
        ) : podcasts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3">
            {podcasts.map((podcast: Podcast) => (
              <div
                key={podcast.trackId} // Using trackId as key
                className="cursor-pointer group"
                onClick={() => handlePodcastClick(podcast.trackViewUrl)}
              >
                <div className="flex flex-col h-full">
                  <div className="aspect-square mb-2 overflow-hidden rounded-md bg-gray-700 relative">
                    <Image
                      src={getBestImageUrl(podcast)}
                      alt={podcast.trackName}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      priority={false}
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-white font-medium text-xs md:text-sm line-clamp-2 mb-0.5 group-hover:underline">
                      {podcast.trackName}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-1">
                      {podcast.artistName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-base">
              {inputValue.trim()
                ? `No results found for "${inputValue.trim()}"`
                : "Start typing to search for podcasts, music, and apps"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
