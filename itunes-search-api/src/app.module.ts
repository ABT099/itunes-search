import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [DatabaseModule, SearchModule],
})
export class AppModule {}
