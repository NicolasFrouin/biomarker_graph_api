import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ObservationsModule } from './observations/observations.module';
import { SummaryModule } from './summary/summary.module';
import { SeriesModule } from './series/series.module';

@Module({
  imports: [ObservationsModule, SummaryModule, SeriesModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
