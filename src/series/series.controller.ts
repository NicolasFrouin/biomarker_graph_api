import {
  Controller,
  Get,
  Query,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Analyte, Unit } from 'prisma/generated/client';
import { PrismaService } from 'src/prisma.service';
import { GetSeriesDto } from './dto/get-series.dto';
import { SeriesService } from './series.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('series')
export class SeriesController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Return time-series data points for graphing',
  })
  async getSeries(@Query() getSeriesDto: GetSeriesDto) {
    const { subjectId, loinc, targetUnit } = getSeriesDto;

    const subject = await this.prismaService.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new UnprocessableEntityException('Invalid subjectId');
    }

    const analyte:
      | (Analyte & {
          defaultTargetUnit: Unit;
          analyteAllowedUnit: { unit: Unit }[];
        })
      | null = await this.prismaService.analyte.findFirst({
      where: { loincCode: loinc },
      include: {
        analyteAllowedUnit: { include: { unit: true } },
        defaultTargetUnit: true,
      },
    });
    if (!analyte) {
      throw new UnprocessableEntityException('Invalid loinc');
    }

    const unit = analyte.analyteAllowedUnit.find(
      (allowedUnit) => allowedUnit.unit.name === targetUnit,
    )?.unit;
    if (targetUnit && !unit) {
      throw new UnprocessableEntityException(
        'targetUnit is not valid for the given loinc',
      );
    }

    return this.seriesService.getSeries(subject, analyte, unit);
  }
}
