import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  imports: [HttpModule],
})
export class SearchModule {}
