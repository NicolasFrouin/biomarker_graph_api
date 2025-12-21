import { Injectable } from '@nestjs/common';
import { Analyte, Subject, Unit } from 'prisma/generated/client';
import { PrismaService } from 'src/prisma.service';
import { convertObservationValueToDefaultUnit } from 'src/utils/conversions';

@Injectable()
export class SeriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSeries(
    subject: Subject,
    analyte: Analyte & {
      defaultTargetUnit: Unit;
      analyteAllowedUnit: { unit: Unit }[];
    },
    targetUnit?: Unit,
  ) {
    const observations = (
      await this.prismaService.observation.findMany({
        where: {
          subjectId: subject.id,
          analyteId: analyte.id,
          deletedAt: null,
        },
        include: {
          analyte: {
            include: {
              defaultTargetUnit: true,
              analyteAllowedUnit: { include: { unit: true } },
            },
          },
          analyteAllowedUnit: { include: { unit: true } },
        },
        orderBy: { measuredAt: 'desc' },
      })
    ).map((obs) => ({
      ...obs,
      value: convertObservationValueToDefaultUnit(obs, targetUnit),
    }));

    return observations.map(({ measuredAt, value }) => ({
      measuredAt,
      value,
      unit: targetUnit ? targetUnit.name : analyte.defaultTargetUnit.name,
    }));
  }
}
