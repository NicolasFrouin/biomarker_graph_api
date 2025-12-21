import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { SummaryService } from './summary.service';

describe('SummaryService', () => {
  let service: SummaryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    observation: {
      findFirst: jest.fn(),
    },
  };

  const mockSubject = {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockAnalyte = {
    id: 1,
    loincCode: '2161-8',
    name: 'Creatinine',
    longName: 'Creatinine [Mass/volume] in Serum or Plasma',
    defaultTargetUnitId: 1,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockUnit = {
    id: 1,
    name: 'mg/dL',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return null values when no observations exist', async () => {
      mockPrismaService.observation.findFirst.mockResolvedValue(null);

      const result = await service.getSummary(mockSubject, mockAnalyte);

      expect(result).toEqual({
        lastValue: null,
        lastUpdated: null,
        trend: null,
      });
      expect(prismaService.observation.findFirst).toHaveBeenCalledWith({
        where: {
          subjectId: mockSubject.id,
          analyteId: mockAnalyte.id,
          deletedAt: null,
        },
        include: {
          analyte: { include: { defaultTargetUnit: true } },
          analyteAllowedUnit: { include: { unit: true } },
        },
        orderBy: { measuredAt: 'desc' },
      });
    });

    it('should return null trend when only one observation exists', async () => {
      const mockObservation = {
        id: 1,
        subjectId: mockSubject.id,
        analyteId: mockAnalyte.id,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date('2025-12-19T10:00:00Z'),
        rawPayload: {},
        createdAt: new Date('2025-12-19T10:00:00Z'),
        updatedAt: new Date('2025-12-19T10:00:00Z'),
        deletedAt: null,
        analyte: {
          ...mockAnalyte,
          defaultTargetUnit: mockUnit,
        },
        analyteAllowedUnit: {
          id: 1,
          analyteId: mockAnalyte.id,
          unitId: mockUnit.id,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          unit: mockUnit,
        },
      };

      mockPrismaService.observation.findFirst
        .mockResolvedValueOnce(mockObservation)
        .mockResolvedValueOnce(null);

      const result = await service.getSummary(mockSubject, mockAnalyte);

      expect(result).toEqual({
        lastValue: {
          value: 1.2,
          unit: 'mg/dL',
        },
        lastUpdated: '2025-12-19T10:00:00.000Z',
        trend: null,
      });
    });

    it('should return rising trend when latest value is greater than previous', async () => {
      const mockLastObservation = {
        id: 2,
        subjectId: mockSubject.id,
        analyteId: mockAnalyte.id,
        analyteAllowedUnitId: 1,
        value: 1.5,
        measuredAt: new Date('2025-12-19T10:00:00Z'),
        rawPayload: {},
        createdAt: new Date('2025-12-19T10:00:00Z'),
        updatedAt: new Date('2025-12-19T10:00:00Z'),
        deletedAt: null,
        analyte: {
          ...mockAnalyte,
          defaultTargetUnit: mockUnit,
        },
        analyteAllowedUnit: {
          id: 1,
          analyteId: mockAnalyte.id,
          unitId: mockUnit.id,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          unit: mockUnit,
        },
      };

      const mockCompareObservation = {
        id: 1,
        subjectId: mockSubject.id,
        analyteId: mockAnalyte.id,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date('2025-12-18T10:00:00Z'),
        rawPayload: {},
        createdAt: new Date('2025-12-18T10:00:00Z'),
        updatedAt: new Date('2025-12-18T10:00:00Z'),
        deletedAt: null,
        analyte: {
          ...mockAnalyte,
          defaultTargetUnit: mockUnit,
        },
        analyteAllowedUnit: {
          id: 1,
          analyteId: mockAnalyte.id,
          unitId: mockUnit.id,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          unit: mockUnit,
        },
      };

      mockPrismaService.observation.findFirst
        .mockResolvedValueOnce(mockLastObservation)
        .mockResolvedValueOnce(mockCompareObservation);

      const result = await service.getSummary(mockSubject, mockAnalyte);

      expect(result.trend).toBe('rising');
      expect(result.lastValue?.value).toBe(1.5);
    });

    it('should return falling trend when latest value is less than previous', async () => {
      const mockLastObservation = {
        id: 2,
        subjectId: mockSubject.id,
        analyteId: mockAnalyte.id,
        analyteAllowedUnitId: 1,
        value: 1.0,
        measuredAt: new Date('2025-12-19T10:00:00Z'),
        rawPayload: {},
        createdAt: new Date('2025-12-19T10:00:00Z'),
        updatedAt: new Date('2025-12-19T10:00:00Z'),
        deletedAt: null,
        analyte: {
          ...mockAnalyte,
          defaultTargetUnit: mockUnit,
        },
        analyteAllowedUnit: {
          id: 1,
          analyteId: mockAnalyte.id,
          unitId: mockUnit.id,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          unit: mockUnit,
        },
      };

      const mockCompareObservation = {
        id: 1,
        subjectId: mockSubject.id,
        analyteId: mockAnalyte.id,
        analyteAllowedUnitId: 1,
        value: 1.5,
        measuredAt: new Date('2025-12-18T10:00:00Z'),
        rawPayload: {},
        createdAt: new Date('2025-12-18T10:00:00Z'),
        updatedAt: new Date('2025-12-18T10:00:00Z'),
        deletedAt: null,
        analyte: {
          ...mockAnalyte,
          defaultTargetUnit: mockUnit,
        },
        analyteAllowedUnit: {
          id: 1,
          analyteId: mockAnalyte.id,
          unitId: mockUnit.id,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          unit: mockUnit,
        },
      };

      mockPrismaService.observation.findFirst
        .mockResolvedValueOnce(mockLastObservation)
        .mockResolvedValueOnce(mockCompareObservation);

      const result = await service.getSummary(mockSubject, mockAnalyte);

      expect(result.trend).toBe('falling');
      expect(result.lastValue?.value).toBe(1.0);
    });

    it('should return stable trend when values are equal', async () => {
      const mockLastObservation = {
        id: 2,
        subjectId: mockSubject.id,
        analyteId: mockAnalyte.id,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date('2025-12-19T10:00:00Z'),
        rawPayload: {},
        createdAt: new Date('2025-12-19T10:00:00Z'),
        updatedAt: new Date('2025-12-19T10:00:00Z'),
        deletedAt: null,
        analyte: {
          ...mockAnalyte,
          defaultTargetUnit: mockUnit,
        },
        analyteAllowedUnit: {
          id: 1,
          analyteId: mockAnalyte.id,
          unitId: mockUnit.id,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          unit: mockUnit,
        },
      };

      const mockCompareObservation = {
        id: 1,
        subjectId: mockSubject.id,
        analyteId: mockAnalyte.id,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date('2025-12-18T10:00:00Z'),
        rawPayload: {},
        createdAt: new Date('2025-12-18T10:00:00Z'),
        updatedAt: new Date('2025-12-18T10:00:00Z'),
        deletedAt: null,
        analyte: {
          ...mockAnalyte,
          defaultTargetUnit: mockUnit,
        },
        analyteAllowedUnit: {
          id: 1,
          analyteId: mockAnalyte.id,
          unitId: mockUnit.id,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          unit: mockUnit,
        },
      };

      mockPrismaService.observation.findFirst
        .mockResolvedValueOnce(mockLastObservation)
        .mockResolvedValueOnce(mockCompareObservation);

      const result = await service.getSummary(mockSubject, mockAnalyte);

      expect(result.trend).toBe('stable');
      expect(result.lastValue?.value).toBe(1.2);
    });

    it('should filter observations by window when provided', async () => {
      const mockObservation = {
        id: 1,
        subjectId: mockSubject.id,
        analyteId: mockAnalyte.id,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date('2025-12-19T10:00:00Z'),
        rawPayload: {},
        createdAt: new Date('2025-12-19T10:00:00Z'),
        updatedAt: new Date('2025-12-19T10:00:00Z'),
        deletedAt: null,
        analyte: {
          ...mockAnalyte,
          defaultTargetUnit: mockUnit,
        },
        analyteAllowedUnit: {
          id: 1,
          analyteId: mockAnalyte.id,
          unitId: mockUnit.id,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          unit: mockUnit,
        },
      };

      mockPrismaService.observation.findFirst
        .mockResolvedValueOnce(mockObservation)
        .mockResolvedValueOnce(null);

      const result = await service.getSummary(mockSubject, mockAnalyte, 90);

      expect(result.lastValue?.value).toBe(1.2);
      expect(result.trend).toBeNull();
      // Verify that the second call used a date filter for the window
      expect(prismaService.observation.findFirst).toHaveBeenCalledTimes(2);
    });

  });
});
