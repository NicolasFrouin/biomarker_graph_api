import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { GetSummaryDto } from './dto/get-summary.dto';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

describe('SummaryController', () => {
  let controller: SummaryController;
  let summaryService: SummaryService;
  let prismaService: PrismaService;

  const mockSummaryService = {
    getSummary: jest.fn(),
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

  const mockAnalyte = {
    id: 1,
    loincCode: '2161-8',
    name: 'Creatinine',
    longName: 'Creatinine [Mass/volume] in Serum or Plasma',
    defaultTargetUnitId: 1,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummaryController],
      providers: [
        {
          provide: SummaryService,
          useValue: mockSummaryService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<SummaryController>(SummaryController);
    summaryService = module.get<SummaryService>(SummaryService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return summary data when valid parameters are provided', async () => {
      const getSummaryDto: GetSummaryDto = {
        subjectId: 1,
        loinc: '2161-8',
        window: 30,
      };

      const expectedSummary = {
        lastValue: {
          value: 1.2,
          unit: 'mg/dL',
        },
        lastUpdated: '2025-12-19T10:00:00.000Z',
        trend: 'stable',
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(mockAnalyte);
      mockSummaryService.getSummary.mockResolvedValue(expectedSummary);

      const result = await controller.getSummary(getSummaryDto);

      expect(result).toEqual(expectedSummary);
      expect(prismaService.subject.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.analyte.findFirst).toHaveBeenCalledWith({
        where: { loincCode: '2161-8' },
      });
      expect(summaryService.getSummary).toHaveBeenCalledWith(
        mockSubject,
        mockAnalyte,
        30,
      );
    });

    it('should return summary data without window parameter', async () => {
      const getSummaryDto: GetSummaryDto = {
        subjectId: 1,
        loinc: '2161-8',
      };

      const expectedSummary = {
        lastValue: {
          value: 1.2,
          unit: 'mg/dL',
        },
        lastUpdated: '2025-12-19T10:00:00.000Z',
        trend: 'stable',
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(mockAnalyte);
      mockSummaryService.getSummary.mockResolvedValue(expectedSummary);

      const result = await controller.getSummary(getSummaryDto);

      expect(result).toEqual(expectedSummary);
      expect(summaryService.getSummary).toHaveBeenCalledWith(
        mockSubject,
        mockAnalyte,
        undefined,
      );
    });

    it('should throw BadRequestException when subject does not exist', async () => {
      const getSummaryDto: GetSummaryDto = {
        subjectId: 999,
        loinc: '2161-8',
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(null);

      await expect(controller.getSummary(getSummaryDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getSummary(getSummaryDto)).rejects.toThrow(
        'Invalid subjectId',
      );

      expect(prismaService.subject.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(prismaService.analyte.findFirst).not.toHaveBeenCalled();
      expect(summaryService.getSummary).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when analyte does not exist', async () => {
      const getSummaryDto: GetSummaryDto = {
        subjectId: 1,
        loinc: 'invalid-loinc',
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(null);

      await expect(controller.getSummary(getSummaryDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getSummary(getSummaryDto)).rejects.toThrow(
        'Invalid loinc',
      );

      expect(prismaService.subject.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.analyte.findFirst).toHaveBeenCalledWith({
        where: { loincCode: 'invalid-loinc' },
      });
      expect(summaryService.getSummary).not.toHaveBeenCalled();
    });

    it('should handle null values from summary service', async () => {
      const getSummaryDto: GetSummaryDto = {
        subjectId: 1,
        loinc: '2161-8',
      };

      const expectedSummary = {
        lastValue: null,
        lastUpdated: null,
        trend: null,
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(mockAnalyte);
      mockSummaryService.getSummary.mockResolvedValue(expectedSummary);

      const result = await controller.getSummary(getSummaryDto);

      expect(result).toEqual(expectedSummary);
      expect(result.lastValue).toBeNull();
      expect(result.lastUpdated).toBeNull();
      expect(result.trend).toBeNull();
    });

    it('should handle rising trend', async () => {
      const getSummaryDto: GetSummaryDto = {
        subjectId: 1,
        loinc: '2161-8',
        window: 7,
      };

      const expectedSummary = {
        lastValue: {
          value: 1.5,
          unit: 'mg/dL',
        },
        lastUpdated: '2025-12-19T10:00:00.000Z',
        trend: 'rising',
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(mockAnalyte);
      mockSummaryService.getSummary.mockResolvedValue(expectedSummary);

      const result = await controller.getSummary(getSummaryDto);

      expect(result.trend).toBe('rising');
      expect(result.lastValue?.value).toBe(1.5);
    });

    it('should handle falling trend', async () => {
      const getSummaryDto: GetSummaryDto = {
        subjectId: 1,
        loinc: '2161-8',
        window: 7,
      };

      const expectedSummary = {
        lastValue: {
          value: 0.9,
          unit: 'mg/dL',
        },
        lastUpdated: '2025-12-19T10:00:00.000Z',
        trend: 'falling',
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findFirst.mockResolvedValue(mockAnalyte);
      mockSummaryService.getSummary.mockResolvedValue(expectedSummary);

      const result = await controller.getSummary(getSummaryDto);

      expect(result.trend).toBe('falling');
      expect(result.lastValue?.value).toBe(0.9);
    });
  });
});
