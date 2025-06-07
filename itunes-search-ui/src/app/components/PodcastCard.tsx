import Image from "next/image";
import { motion } from "framer-motion";
import { Podcast } from "../types";
import { Badge } from "./Badge";
import { cardVariants } from "../constants";

interface PodcastCardProps {
  podcast: Podcast;
  onClick: (url: string) => void;
}

export const PodcastCard = ({ podcast, onClick }: PodcastCardProps) => {
  const getBestImageUrl = (podcast: Podcast): string => {
    return podcast.artworkUrl600 || podcast.artworkUrl100 || "";
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="cursor-pointer group"
      onClick={() => onClick(podcast.trackViewUrl)}
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
          <div className="mb-1.5 flex items-center space-x-1 min-h-[20px]">
            {podcast.primaryGenre && (
              <Badge text={podcast.primaryGenre} />
            )}
            {podcast.explicitness === "explicit" && (
              <Badge
                text="Explicit"
                className="bg-red-900/80 text-red-300"
              />
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
  );
}; 