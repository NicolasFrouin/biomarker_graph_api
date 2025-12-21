import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';
import { PrismaService } from 'src/prisma.service';
import { GetSeriesDto } from './dto/get-series.dto';

describe('SeriesController', () => {
  let controller: SeriesController;
  let seriesService: SeriesService;
  let prismaService: PrismaService;

  const mockSeriesService = {
    getSeries: jest.fn(),
  };

  const mockPrismaService = {
    subject: {
      findUnique: jest.fn(),
    },
    analyte: {
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
      controllers: [SeriesController],
      providers: [
        {
          provide: SeriesService,
          useValue: mockSeriesService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<SeriesController>(SeriesController);
    seriesService = module.get<SeriesService>(SeriesService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSeries', () => {
    it('should return series data when valid parameters are provided', async () => {
      const getSeriesDto: GetSeriesDto = {
        subjectId: 1,
        loinc: '2345-7',
        targetUnit: 'mg/dL',
      };

      const expectedSeries = [
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
      ];

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(mockAnalyte);
      mockSeriesService.getSeries.mockResolvedValue(expectedSeries);

      const result = await controller.getSeries(getSeriesDto);

      expect(result).toEqual(expectedSeries);
      expect(prismaService.subject.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.analyte.findFirst).toHaveBeenCalledWith({
        where: { loincCode: '2345-7' },
        include: {
          analyteAllowedUnit: { include: { unit: true } },
          defaultTargetUnit: true,
        },
      });
      expect(seriesService.getSeries).toHaveBeenCalledWith(
        mockSubject,
        mockAnalyte,
        mockUnitMgDl,
      );
    });

    it('should return series data without target unit when not specified', async () => {
      const getSeriesDto: GetSeriesDto = {
        subjectId: 1,
        loinc: '2345-7',
        targetUnit: undefined as any,
      };

      const expectedSeries = [
        {
          measuredAt: new Date('2025-12-15T10:00:00Z'),
          value: 100,
          unit: 'mg/dL',
        },
      ];

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(mockAnalyte);
      mockSeriesService.getSeries.mockResolvedValue(expectedSeries);

      const result = await controller.getSeries(getSeriesDto);

      expect(result).toEqual(expectedSeries);
      expect(seriesService.getSeries).toHaveBeenCalledWith(
        mockSubject,
        mockAnalyte,
        undefined,
      );
    });

    it('should throw UnprocessableEntityException when subject does not exist', async () => {
      const getSeriesDto: GetSeriesDto = {
        subjectId: 999,
        loinc: '2345-7',
        targetUnit: 'mg/dL',
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(null);

      await expect(controller.getSeries(getSeriesDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      await expect(controller.getSeries(getSeriesDto)).rejects.toThrow(
        'Invalid subjectId',
      );

      expect(prismaService.subject.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(prismaService.analyte.findFirst).not.toHaveBeenCalled();
      expect(seriesService.getSeries).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when analyte does not exist', async () => {
      const getSeriesDto: GetSeriesDto = {
        subjectId: 1,
        loinc: 'invalid-loinc',
        targetUnit: 'mg/dL',
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(null);

      await expect(controller.getSeries(getSeriesDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      await expect(controller.getSeries(getSeriesDto)).rejects.toThrow(
        'Invalid loinc',
      );

      expect(prismaService.subject.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.analyte.findFirst).toHaveBeenCalledWith({
        where: { loincCode: 'invalid-loinc' },
        include: {
          analyteAllowedUnit: { include: { unit: true } },
          defaultTargetUnit: true,
        },
      });
      expect(seriesService.getSeries).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when targetUnit is not allowed for analyte', async () => {
      const getSeriesDto: GetSeriesDto = {
        subjectId: 1,
        loinc: '2345-7',
        targetUnit: 'invalid-unit',
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(mockAnalyte);

      await expect(controller.getSeries(getSeriesDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      await expect(controller.getSeries(getSeriesDto)).rejects.toThrow(
        'targetUnit is not valid for the given loinc',
      );

      expect(seriesService.getSeries).not.toHaveBeenCalled();
    });

    it('should return empty array when no observations exist', async () => {
      const getSeriesDto: GetSeriesDto = {
        subjectId: 1,
        loinc: '2345-7',
        targetUnit: undefined as any,
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(mockAnalyte);
      mockSeriesService.getSeries.mockResolvedValue([]);

      const result = await controller.getSeries(getSeriesDto);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle different target units correctly', async () => {
      const getSeriesDto: GetSeriesDto = {
        subjectId: 1,
        loinc: '2345-7',
        targetUnit: 'mmol/L',
      };

      const expectedSeries = [
        {
          measuredAt: new Date('2025-12-15T10:00:00Z'),
          value: 5.55,
          unit: 'mmol/L',
        },
      ];

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(mockAnalyte);
      mockSeriesService.getSeries.mockResolvedValue(expectedSeries);

      const result = await controller.getSeries(getSeriesDto);

      expect(result).toEqual(expectedSeries);
      expect(seriesService.getSeries).toHaveBeenCalledWith(
        mockSubject,
        mockAnalyte,
        mockUnitMmolL,
      );
    });

    it('should return series with multiple observations in chronological order', async () => {
      const getSeriesDto: GetSeriesDto = {
        subjectId: 1,
        loinc: '2345-7',
        targetUnit: undefined as any,
      };

      const expectedSeries = [
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
      ];

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(mockAnalyte);
      mockSeriesService.getSeries.mockResolvedValue(expectedSeries);

      const result = await controller.getSeries(getSeriesDto);

      expect(result).toHaveLength(3);
      expect(result[0].measuredAt).toEqual(new Date('2025-12-15T10:00:00Z'));
      expect(result[1].measuredAt).toEqual(new Date('2025-12-16T10:00:00Z'));
      expect(result[2].measuredAt).toEqual(new Date('2025-12-17T10:00:00Z'));
    });
  });
});
