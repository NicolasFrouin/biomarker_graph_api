import { Module } from '@nestjs/common';
import { ObservationsService } from './observations.service';
import { ObservationsController } from './observations.controller';
import { PrismaService } from 'src/prisma.service';

/**
 * Observations Endpoints
 *
 * REST Example:
 * - `POST /observations` - Create new observation
 * - `GET /observations/:id` - Read single observation
 * - `GET /observations` - List with filters/sort/pagination
 *
 * GraphQL Alternative:
 * - Equivalent mutations/queries with same functionality
 *
 * Optional (Stretch Goals)
 * - `PUT /observations/:id` - Update observation
 * - `DELETE /observations/:id` - Soft-delete (via deletedAt)
 *
 * Validation Rules
 *
 * All creates must validate:
 * - ✅ `value` is numeric
 * - ✅ `measuredAt` is ISO 8601 and not in the future
 * - ✅ `analyte` is supported
 * - ✅ `unit` is permitted for that analyte
 * - ✅ `subjectId` is present
 *
 * Return typed, informative errors for validation failures
 */
@Module({
  controllers: [ObservationsController],
  providers: [ObservationsService, PrismaService],
})
export class ObservationsModule {}
