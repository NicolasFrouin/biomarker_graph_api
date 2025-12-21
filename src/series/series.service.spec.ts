import { Test, TestingModule } from '@nestjs/testing';
import { SeriesService } from './series.service';
import { PrismaService } from 'src/prisma.service';

describe('SeriesService', () => {
  let service: SeriesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    observation: {
      findMany: jest.fn(),
    },
  };

  const mockSubject = {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockUnitMgDl = {
    id: 1,
    name: 'mg/dL',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockUnitMmolL = {
    id: 2,
    name: 'mmol/L',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockAnalyte = {
    id: 1,
    loincCode: '2345-7',
    name: 'glucose',
    longName: 'Glucose [Mass/volume] in Serum or Plasma',
    defaultTargetUnitId: 1,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    defaultTargetUnit: mockUnitMgDl,
    analyteAllowedUnit: [
      {
        id: 1,
        analyteId: 1,
        unitId: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        unit: mockUnitMgDl,
      },
      {
        id: 2,
        analyteId: 1,
        unitId: 2,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        unit: mockUnitMmolL,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SeriesService>(SeriesService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSeries', () => {
    it('should return empty array when no observations exist', async () => {
      mockPrismaService.observation.findMany.mockResolvedValue([]);

      const result = await service.getSeries(mockSubject, mockAnalyte);

      expect(result).toEqual([]);
      expect(prismaService.observation.findMany).toHaveBeenCalledWith({
        where: {
          subjectId: mockSubject.id,
          analyteId: mockAnalyte.id,
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
      });
    });

    it('should return series data with default unit when no target unit specified', async () => {
      const mockObservations = [
        {
          id: 1,
          subjectId: mockSubject.id,
          analyteId: mockAnalyte.id,
          analyteAllowedUnitId: 1,
          value: 100,
          measuredAt: new Date('2025-12-15T10:00:00Z'),
          rawPayload: {},
          createdAt: new Date('2025-12-15T10:00:00Z'),
          updatedAt: new Date('2025-12-15T10:00:00Z'),
          deletedAt: null,
          analyte: mockAnalyte,
          analyteAllowedUnit: {
            id: 1,
            analyteId: 1,
            unitId: 1,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            unit: mockUnitMgDl,
          },
        },
        {
          id: 2,
          subjectId: mockSubject.id,
          analyteId: mockAnalyte.id,
          analyteAllowedUnitId: 1,
          value: 110,
          measuredAt: new Date('2025-12-16T10:00:00Z'),
          rawPayload: {},
          createdAt: new Date('2025-12-16T10:00:00Z'),
          updatedAt: new Date('2025-12-16T10:00:00Z'),
          deletedAt: null,
          analyte: mockAnalyte,
          analyteAllowedUnit: {
            id: 1,
            analyteId: 1,
            unitId: 1,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            unit: mockUnitMgDl,
          },
        },
        {
          id: 3,
          subjectId: mockSubject.id,
          analyteId: mockAnalyte.id,
          analyteAllowedUnitId: 1,
          value: 105,
          measuredAt: new Date('2025-12-17T10:00:00Z'),
          rawPayload: {},
          createdAt: new Date('2025-12-17T10:00:00Z'),
          updatedAt: new Date('2025-12-17T10:00:00Z'),
          deletedAt: null,
          analyte: mockAnalyte,
          analyteAllowedUnit: {
            id: 1,
            analyteId: 1,
            unitId: 1,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            unit: mockUnitMgDl,
          },
        },
      ];

      mockPrismaService.observation.findMany.mockResolvedValue(
        mockObservations,
      );

      const result = await service.getSeries(mockSubject, mockAnalyte);

      expect(result).toEqual([
        {
          measuredAt: new Date('2025-12-15T10:00:00Z'),
          value: 100,
          unit: 'mg/dL',
        },
        {
          measuredAt: new Date('2025-12-16T10:00:00Z'),
          value: 110,
          unit: 'mg/dL',
        },
        {
          measuredAt: new Date('2025-12-17T10:00:00Z'),
          value: 105,
          unit: 'mg/dL',
        },
      ]);
    });

    it('should return series data in chronological order', async () => {
      const mockObservations = [
        {
          id: 1,
          subjectId: mockSubject.id,
          analyteId: mockAnalyte.id,
          analyteAllowedUnitId: 1,
          value: 100,
          measuredAt: new Date('2025-12-15T10:00:00Z'),
          rawPayload: {},
          createdAt: new Date('2025-12-15T10:00:00Z'),
          updatedAt: new Date('2025-12-15T10:00:00Z'),
          deletedAt: null,
          analyte: mockAnalyte,
          analyteAllowedUnit: {
            id: 1,
            analyteId: 1,
            unitId: 1,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            unit: mockUnitMgDl,
          },
        },
        {
          id: 2,
          subjectId: mockSubject.id,
          analyteId: mockAnalyte.id,
          analyteAllowedUnitId: 1,
          value: 110,
          measuredAt: new Date('2025-12-19T10:00:00Z'),
          rawPayload: {},
          createdAt: new Date('2025-12-19T10:00:00Z'),
          updatedAt: new Date('2025-12-19T10:00:00Z'),
          deletedAt: null,
          analyte: mockAnalyte,
          analyteAllowedUnit: {
            id: 1,
            analyteId: 1,
            unitId: 1,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            unit: mockUnitMgDl,
          },
        },
      ];

      mockPrismaService.observation.findMany.mockResolvedValue(
        mockObservations,
      );

      const result = await service.getSeries(mockSubject, mockAnalyte);

      expect(result[0].measuredAt).toEqual(new Date('2025-12-15T10:00:00Z'));
      expect(result[1].measuredAt).toEqual(new Date('2025-12-19T10:00:00Z'));
      expect(prismaService.observation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { measuredAt: 'desc' },
        }),
      );
    });

    it('should convert values when target unit is different from default unit', async () => {
      const mockObservations = [
        {
          id: 1,
          subjectId: mockSubject.id,
          analyteId: mockAnalyte.id,
          analyteAllowedUnitId: 1,
          value: 100,
          measuredAt: new Date('2025-12-15T10:00:00Z'),
          rawPayload: {},
          createdAt: new Date('2025-12-15T10:00:00Z'),
          updatedAt: new Date('2025-12-15T10:00:00Z'),
          deletedAt: null,
          analyte: mockAnalyte,
          analyteAllowedUnit: {
            id: 1,
            analyteId: 1,
            unitId: 1,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            unit: mockUnitMgDl,
          },
        },
        {
          id: 2,
          subjectId: mockSubject.id,
          analyteId: mockAnalyte.id,
          analyteAllowedUnitId: 1,
          value: 200,
          measuredAt: new Date('2025-12-16T10:00:00Z'),
          rawPayload: {},
          createdAt: new Date('2025-12-16T10:00:00Z'),
          updatedAt: new Date('2025-12-16T10:00:00Z'),
          deletedAt: null,
          analyte: mockAnalyte,
          analyteAllowedUnit: {
            id: 1,
            analyteId: 1,
            unitId: 1,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            unit: mockUnitMgDl,
          },
        },
      ];

      mockPrismaService.observation.findMany.mockResolvedValue(
        mockObservations,
      );

      const result = await service.getSeries(
        mockSubject,
        mockAnalyte,
        mockUnitMmolL,
      );

      // 100 mg/dL * 0.0555 = 5.55 mmol/L
      // 200 mg/dL * 0.0555 = 11.1 mmol/L
      expect(result).toEqual([
        {
          measuredAt: new Date('2025-12-15T10:00:00Z'),
          value: 5.55,
          unit: 'mmol/L',
        },
        {
          measuredAt: new Date('2025-12-16T10:00:00Z'),
          value: 11.1,
          unit: 'mmol/L',
        },
      ]);
    });

    it('should not convert values when target unit is same as default unit', async () => {
      const mockObservations = [
        {
          id: 1,
          subjectId: mockSubject.id,
          analyteId: mockAnalyte.id,
          analyteAllowedUnitId: 1,
          value: 100,
          measuredAt: new Date('2025-12-15T10:00:00Z'),
          rawPayload: {},
          createdAt: new Date('2025-12-15T10:00:00Z'),
          updatedAt: new Date('2025-12-15T10:00:00Z'),
          deletedAt: null,
          analyte: mockAnalyte,
          analyteAllowedUnit: {
            id: 1,
            analyteId: 1,
            unitId: 1,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            unit: mockUnitMgDl,
          },
        },
      ];

      mockPrismaService.observation.findMany.mockResolvedValue(
        mockObservations,
      );

      const result = await service.getSeries(
        mockSubject,
        mockAnalyte,
        mockUnitMgDl,
      );

      expect(result).toEqual([
        {
          measuredAt: new Date('2025-12-15T10:00:00Z'),
          value: 100,
          unit: 'mg/dL',
        },
      ]);
    });

    it('should handle single observation', async () => {
      const mockObservations = [
        {
          id: 1,
          subjectId: mockSubject.id,
          analyteId: mockAnalyte.id,
          analyteAllowedUnitId: 1,
          value: 100,
          measuredAt: new Date('2025-12-15T10:00:00Z'),
          rawPayload: {},
          createdAt: new Date('2025-12-15T10:00:00Z'),
          updatedAt: new Date('2025-12-15T10:00:00Z'),
          deletedAt: null,
          analyte: mockAnalyte,
          analyteAllowedUnit: {
            id: 1,
            analyteId: 1,
            unitId: 1,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            unit: mockUnitMgDl,
          },
        },
      ];

      mockPrismaService.observation.findMany.mockResolvedValue(
        mockObservations,
      );

      const result = await service.getSeries(mockSubject, mockAnalyte);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        measuredAt: new Date('2025-12-15T10:00:00Z'),
        value: 100,
        unit: 'mg/dL',
      });
    });

    it('should exclude deleted observations', async () => {
      mockPrismaService.observation.findMany.mockResolvedValue([]);

      await service.getSeries(mockSubject, mockAnalyte);

      expect(prismaService.observation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        }),
      );
    });
  });
});
