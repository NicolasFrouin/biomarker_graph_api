import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { PrismaService } from 'src/prisma.service';

/**
 * Summary Endpoint
 *
 * Purpose: Return latest value and trend analysis
 *
 * REST example: `GET /summary?subjectId=&loinc=&window=`
 *
 * Response:
 * ```json
 * {
 *   "lastValue": {
 *     "value": 5.0,
 *     "unit": "mmol/L"
 *   },
 *   "lastUpdated": "2024-10-01T08:00:00Z",
 *   "trend": "rising"
 * }
 * ```
 * Trend Logic:
 * - Compare last two normalized points
 * - Use small tolerance (document your rule)
 * - Return: "rising" , "falling" , or "stable"
 *
 * 💡 Simple approach is fine; optionally note alternatives (e.g., least-squares)
 */
@Module({
  controllers: [SummaryController],
  providers: [SummaryService, PrismaService],
})
export class SummaryModule {}
