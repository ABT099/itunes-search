import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Podcast, PrismaClient } from 'generated/prisma';
import { log } from 'node:console';
import { ItunesSearchResponse } from './interfaces/itunesSearchResults';

@Injectable()
export class SearchService extends PrismaClient implements OnModuleInit {
  constructor(private httpService: HttpService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async search(query: string): Promise<Podcast[]> {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast`;
    const response =
      await this.httpService.axiosRef.get<ItunesSearchResponse>(url);
    const data = response.data;

    const podcastData = data.results.map((result) => ({
      trackId: result.trackId,
      artistName: result.artistName,
      trackName: result.trackName,
      trackViewUrl: result.trackViewUrl,
      artworkUrl30: result.artworkUrl30,
      artworkUrl60: result.artworkUrl60,
      artworkUrl100: result.artworkUrl100,
      artworkUrl600: result.artworkUrl600,
      releaseDate: new Date(result.releaseDate),
    }));

    try {
      await this.podcast.createMany({
        data: podcastData,
        skipDuplicates: true,
      });

      const trackIds = podcastData.map((podcast) => podcast.trackId);
      const insertedPodcasts = await this.podcast.findMany({
        where: {
          trackId: {
            in: trackIds,
          },
        },
      });

      return insertedPodcasts;
    } catch (error) {
      log(error);
      throw error;
    }
  }
}
