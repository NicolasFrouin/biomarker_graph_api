import { Module } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';
import { PrismaService } from 'src/prisma.service';

/**
 * Series Endpoint
 *
 * Purpose: Return time-series data points for graphing
 *
 * REST example : `GET /series?subjectId=&loinc=&targetUnit=`
 *
 * Requirements:
 * - ✅ Sorted by measuredAt (chronological)
 * - ✅ Include both raw and normalized values
 * - ✅ Convert to targetUnit if provided, otherwise use defaultTargetUnit
 */
@Module({
  controllers: [SeriesController],
  providers: [SeriesService, PrismaService],
})
export class SeriesModule {}
