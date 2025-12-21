import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { conversions } from 'src/utils/conversions';
import { CreateObservationDto } from './dto/create-observation.dto';
import { ListObservationsDto } from './dto/list-observations.dto';
import { UpdateObservationDto } from './dto/update-observation.dto';

@Injectable()
export class ObservationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createObservationDto: CreateObservationDto) {
    const { analyteAllowedUnitId, value, analyteId } = createObservationDto;

    const allowedUnit = await this.prismaService.analyteAllowedUnit.findUnique({
      where: { id: analyteAllowedUnitId },
      include: { unit: true },
    });
    const analyte = await this.prismaService.analyte.findUnique({
      where: { id: analyteId },
      include: { defaultTargetUnit: true },
    });

    if (analyte!.defaultTargetUnit.id !== allowedUnit!.unit.id) {
      const conversionFn =
        conversions[analyte!.name]?.[
          `${allowedUnit!.unit.id}->${analyte!.defaultTargetUnit.id}`
        ];
      if (!conversionFn) {
        throw new Error(
          `No conversion function from unit ${allowedUnit!.unit.name} to ${analyte!.defaultTargetUnit.name}`,
        );
      }
      createObservationDto.value = conversionFn(value);
    }

    return this.prismaService.observation.create({
      data: {
        ...createObservationDto,
        rawPayload: JSON.stringify(createObservationDto),
      },
    });
  }

  findAll(listObservationsDto: ListObservationsDto) {
    const { filter, sort, page = 1, limit = 20 } = listObservationsDto;

    return this.prismaService.observation.findMany({
      where: {
        deletedAt: null,
        measuredAt: {
          gte: filter?.measuredAtFrom
            ? new Date(filter.measuredAtFrom)
            : undefined,
          lte: filter?.measuredAtTo ? new Date(filter.measuredAtTo) : undefined,
        },
        subjectId: filter?.subjectId,
        analyteId: filter?.analyteId ? { in: filter.analyteId } : undefined,
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: sort
        ? Object.entries(sort).map(([key, value]) => ({ [key]: value }))
        : { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prismaService.observation.findUnique({
      where: { id, deletedAt: null },
    });
  }

  update(id: number, updateObservationDto: UpdateObservationDto) {
    return this.prismaService.observation.update({
      where: { id, deletedAt: null },
      data: updateObservationDto,
    });
  }

  remove(id: number) {
    return this.prismaService.observation.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
