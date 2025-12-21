import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateObservationDto } from './dto/create-observation.dto';
import { UpdateObservationDto } from './dto/update-observation.dto';
import { ObservationsService } from './observations.service';
import { ListObservationsDto } from './dto/list-observations.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('observations')
export class ObservationsController {
  constructor(
    private readonly observationsService: ObservationsService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new observation' })
  async create(@Body() createObservationDto: CreateObservationDto) {
    const { analyteAllowedUnitId, analyteId, subjectId, measuredAt } =
      createObservationDto;

    if (new Date(measuredAt) >= new Date()) {
      throw new UnprocessableEntityException(
        'measuredAt cannot be in the future',
      );
    }

    const subject = await this.prismaService.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new UnprocessableEntityException('Invalid subjectId');
    }

    const analyte = await this.prismaService.analyte.findUnique({
      where: { id: analyteId },
      include: { analyteAllowedUnit: true },
    });
    if (!analyte) {
      throw new UnprocessableEntityException('Invalid analyteId');
    }

    if (
      !analyte.analyteAllowedUnit.some(
        (unit) => unit.id === analyteAllowedUnitId,
      )
    ) {
      throw new UnprocessableEntityException(
        'analyteAllowedUnitId is not valid for the given analyteId',
      );
    }

    return this.observationsService.create(createObservationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all observations' })
  findAll(@Query() listObservationsDto: ListObservationsDto) {
    return this.observationsService.findAll(listObservationsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an observation by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the observation to retrieve',
    example: 1,
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const obs = await this.observationsService.findOne(id);
    if (!obs) {
      throw new NotFoundException(`Observation with id ${id} not found`);
    }
    return obs;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an observation by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the observation to update',
    example: 1,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateObservationDto: UpdateObservationDto,
  ) {
    const obs = await this.observationsService.findOne(id);
    if (!obs) {
      throw new NotFoundException(`Observation with id ${id} not found`);
    }
    return await this.observationsService.update(id, updateObservationDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Observation deleted successfully' })
  @ApiOperation({ summary: 'Delete an observation by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the observation to delete',
    example: 1,
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const obs = await this.observationsService.findOne(id);
    if (obs) {
      await this.observationsService.remove(+id);
    }
  }
}
