import { Test, TestingModule } from '@nestjs/testing';
import { ObservationsService } from './observations.service';
import { PrismaService } from 'src/prisma.service';
import { CreateObservationDto } from './dto/create-observation.dto';
import { UpdateObservationDto } from './dto/update-observation.dto';
import { ListObservationsDto } from './dto/list-observations.dto';

describe('ObservationsService', () => {
  let service: ObservationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    observation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    analyteAllowedUnit: {
      findUnique: jest.fn(),
    },
    analyte: {
      findUnique: jest.fn(),
    },
  };

  const mockUnit = {
    id: 1,
    name: 'mg/dL',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockAnalyteAllowedUnit = {
    id: 1,
    analyteId: 1,
    unitId: 1,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    unit: mockUnit,
  };

  const mockAnalyte = {
    id: 1,
    loincCode: '2161-8',
    name: 'Creatinine',
    longName: 'Creatinine [Mass/volume] in Serum or Plasma',
    defaultTargetUnitId: 1,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    defaultTargetUnit: mockUnit,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ObservationsService>(ObservationsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an observation with same unit as default', async () => {
      const createDto: CreateObservationDto = {
        subjectId: 1,
        analyteId: 1,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date('2025-12-19T10:00:00Z'),
      };

      const expectedObservation = {
        id: 1,
        ...createDto,
        rawPayload: JSON.stringify(createDto),
        createdAt: new Date('2025-12-19'),
        updatedAt: new Date('2025-12-19'),
        deletedAt: null,
      };

      mockPrismaService.analyteAllowedUnit.findUnique.mockResolvedValue(
        mockAnalyteAllowedUnit,
      );
      mockPrismaService.analyte.findUnique.mockResolvedValue(mockAnalyte);
      mockPrismaService.observation.create.mockResolvedValue(
        expectedObservation,
      );

      const result = await service.create(createDto);

      expect(result).toEqual(expectedObservation);
      expect(prismaService.observation.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          rawPayload: JSON.stringify(createDto),
        },
      });
    });

    it('should create an observation and store original value when units match', async () => {
      const createDto: CreateObservationDto = {
        subjectId: 1,
        analyteId: 1,
        analyteAllowedUnitId: 1,
        value: 100.5,
        measuredAt: new Date('2025-12-19T10:00:00Z'),
      };

      mockPrismaService.analyteAllowedUnit.findUnique.mockResolvedValue(
        mockAnalyteAllowedUnit,
      );
      mockPrismaService.analyte.findUnique.mockResolvedValue(mockAnalyte);
      mockPrismaService.observation.create.mockResolvedValue({
        id: 1,
        ...createDto,
        rawPayload: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await service.create(createDto);

      expect(prismaService.observation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            value: 100.5,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated observations with default parameters', async () => {
      const listDto: ListObservationsDto = {};
      const mockObservations = [
        {
          id: 1,
          subjectId: 1,
          analyteId: 1,
          analyteAllowedUnitId: 1,
          value: 1.2,
          measuredAt: new Date('2025-12-19T10:00:00Z'),
          rawPayload: {},
          createdAt: new Date('2025-12-19'),
          updatedAt: new Date('2025-12-19'),
          deletedAt: null,
        },
      ];

      mockPrismaService.observation.findMany.mockResolvedValue(
        mockObservations,
      );

      const result = await service.findAll(listDto);

      expect(result).toEqual(mockObservations);
      expect(prismaService.observation.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          measuredAt: {
            gte: undefined,
            lte: undefined,
          },
          subjectId: undefined,
          analyteId: undefined,
        },
        take: 20,
        skip: 0,
        orderBy: { id: 'asc' },
      });
    });

    it('should filter observations by subjectId', async () => {
      const listDto: ListObservationsDto = {
        filter: { subjectId: 1 },
      };

      mockPrismaService.observation.findMany.mockResolvedValue([]);

      await service.findAll(listDto);

      expect(prismaService.observation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            subjectId: 1,
          }),
        }),
      );
    });

    it('should filter observations by analyteId array', async () => {
      const listDto: ListObservationsDto = {
        filter: { analyteId: [1, 2, 3] },
      };

      mockPrismaService.observation.findMany.mockResolvedValue([]);

      await service.findAll(listDto);

      expect(prismaService.observation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            analyteId: { in: [1, 2, 3] },
          }),
        }),
      );
    });

    it('should filter observations by date range', async () => {
      const listDto: ListObservationsDto = {
        filter: {
          measuredAtFrom: '2025-01-01',
          measuredAtTo: '2025-12-31',
        },
      };

      mockPrismaService.observation.findMany.mockResolvedValue([]);

      await service.findAll(listDto);

      expect(prismaService.observation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            measuredAt: {
              gte: new Date('2025-01-01'),
              lte: new Date('2025-12-31'),
            },
          }),
        }),
      );
    });

    it('should apply custom sorting', async () => {
      const listDto: ListObservationsDto = {
        sort: { measuredAt: 'desc', analyteId: 'asc' },
      };

      mockPrismaService.observation.findMany.mockResolvedValue([]);

      await service.findAll(listDto);

      expect(prismaService.observation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { measuredAt: 'desc' },
            { analyteId: 'asc' },
          ],
        }),
      );
    });

    it('should apply pagination', async () => {
      const listDto: ListObservationsDto = {
        page: 3,
        limit: 10,
      };

      mockPrismaService.observation.findMany.mockResolvedValue([]);

      await service.findAll(listDto);

      expect(prismaService.observation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20, // (page 3 - 1) * 10
        }),
      );
    });

    it('should exclude deleted observations', async () => {
      const listDto: ListObservationsDto = {};

      mockPrismaService.observation.findMany.mockResolvedValue([]);

      await service.findAll(listDto);

      expect(prismaService.observation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single observation by id', async () => {
      const mockObservation = {
        id: 1,
        subjectId: 1,
        analyteId: 1,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date('2025-12-19T10:00:00Z'),
        rawPayload: {},
        createdAt: new Date('2025-12-19'),
        updatedAt: new Date('2025-12-19'),
        deletedAt: null,
      };

      mockPrismaService.observation.findUnique.mockResolvedValue(
        mockObservation,
      );

      const result = await service.findOne(1);

      expect(result).toEqual(mockObservation);
      expect(prismaService.observation.findUnique).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
      });
    });

    it('should return null if observation not found', async () => {
      mockPrismaService.observation.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an observation', async () => {
      const updateDto: UpdateObservationDto = {
        value: 1.5,
      };

      const updatedObservation = {
        id: 1,
        subjectId: 1,
        analyteId: 1,
        analyteAllowedUnitId: 1,
        value: 1.5,
        measuredAt: new Date('2025-12-19T10:00:00Z'),
        rawPayload: {},
        createdAt: new Date('2025-12-19'),
        updatedAt: new Date('2025-12-20'),
        deletedAt: null,
      };

      mockPrismaService.observation.update.mockResolvedValue(
        updatedObservation,
      );

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedObservation);
      expect(prismaService.observation.update).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should soft delete an observation', async () => {
      const deletedObservation = {
        id: 1,
        subjectId: 1,
        analyteId: 1,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date('2025-12-19T10:00:00Z'),
        rawPayload: {},
        createdAt: new Date('2025-12-19'),
        updatedAt: new Date('2025-12-20'),
        deletedAt: new Date('2025-12-20'),
      };

      mockPrismaService.observation.update.mockResolvedValue(
        deletedObservation,
      );

      const result = await service.remove(1);

      expect(result).toEqual(deletedObservation);
      expect(prismaService.observation.update).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
