import { Injectable } from '@nestjs/common';
import { Analyte, Subject } from 'prisma/generated/client';
import { Trend } from 'prisma/generated/enums';
import { PrismaService } from 'src/prisma.service';
import { convertObservationValueToDefaultUnit } from 'src/utils/conversions';

@Injectable()
export class SummaryService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSummary(subject: Subject, analytes: Analyte, window?: number) {
    const lastObservation = await this.prismaService.observation.findFirst({
      where: {
        subjectId: subject.id,
        analyteId: analytes.id,
        deletedAt: null,
      },
      include: {
        analyte: { include: { defaultTargetUnit: true } },
        analyteAllowedUnit: { include: { unit: true } },
      },
      orderBy: { measuredAt: 'desc' },
    });

    if (!lastObservation) {
      return {
        lastValue: null,
        lastUpdated: null,
        trend: null,
      };
    }

    const observationToCompareDate = window
      ? new Date(Date.now() - window * 24 * 60 * 60 * 1000)
      : null;

    const observationToCompare = await this.prismaService.observation.findFirst(
      {
        where: {
          id: { not: lastObservation.id },
          subjectId: subject.id,
          analyteId: analytes.id,
          deletedAt: null,
          measuredAt: observationToCompareDate
            ? { gte: observationToCompareDate }
            : undefined,
        },
        include: {
          analyte: { include: { defaultTargetUnit: true } },
          analyteAllowedUnit: { include: { unit: true } },
        },
        orderBy: { measuredAt: observationToCompareDate ? 'asc' : 'desc' },
      },
    );

    if (!observationToCompare) {
      return {
        lastValue: {
          value: convertObservationValueToDefaultUnit(lastObservation),
          unit: lastObservation.analyte.defaultTargetUnit.name,
        },
        lastUpdated: lastObservation.measuredAt.toISOString(),
        trend: null,
      };
    }

    const observationsNormalized = [lastObservation, observationToCompare].map(
      (obs) => ({
        ...obs,
        value: convertObservationValueToDefaultUnit(obs),
      }),
    );

    let trend: Trend = Trend.STABLE;
    if (observationsNormalized.length > 1) {
      if (observationsNormalized[0].value > observationsNormalized[1].value) {
        trend = Trend.RISING;
      } else if (
        observationsNormalized[0].value < observationsNormalized[1].value
      ) {
        trend = Trend.FALLING;
      }
    }

    return {
      lastValue: {
        value: observationsNormalized[0].value,
        unit: observationsNormalized[0].analyte.defaultTargetUnit.name,
      },
      lastUpdated: observationsNormalized[0].measuredAt.toISOString(),
      trend: trend.toLowerCase(),
    };
  }
}
