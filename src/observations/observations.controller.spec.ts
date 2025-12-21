import { Test, TestingModule } from '@nestjs/testing';
import {
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { ObservationsController } from './observations.controller';
import { ObservationsService } from './observations.service';
import { PrismaService } from 'src/prisma.service';
import { CreateObservationDto } from './dto/create-observation.dto';
import { UpdateObservationDto } from './dto/update-observation.dto';
import { ListObservationsDto } from './dto/list-observations.dto';

describe('ObservationsController', () => {
  let controller: ObservationsController;
  let observationsService: ObservationsService;
  let prismaService: PrismaService;

  const mockObservationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPrismaService = {
    subject: {
      findUnique: jest.fn(),
    },
    analyte: {
      findUnique: jest.fn(),
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
    analyteAllowedUnit: [
      { id: 1, analyteId: 1, unitId: 1 },
      { id: 2, analyteId: 1, unitId: 2 },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObservationsController],
      providers: [
        {
          provide: ObservationsService,
          useValue: mockObservationsService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<ObservationsController>(ObservationsController);
    observationsService = module.get<ObservationsService>(ObservationsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an observation with valid data', async () => {
      const createDto: CreateObservationDto = {
        subjectId: 1,
        analyteId: 1,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date(Date.now() - 60000), // 1 minute ago
      };

      const expectedObservation = {
        id: 1,
        ...createDto,
        rawPayload: {},
        createdAt: new Date('2025-12-19'),
        updatedAt: new Date('2025-12-19'),
        deletedAt: null,
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findUnique.mockResolvedValue(mockAnalyte);
      mockObservationsService.create.mockResolvedValue(expectedObservation);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedObservation);
      expect(prismaService.subject.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.analyte.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { analyteAllowedUnit: true },
      });
      expect(observationsService.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw UnprocessableEntityException if measuredAt is in the future', async () => {
      const createDto: CreateObservationDto = {
        subjectId: 1,
        analyteId: 1,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date(Date.now() + 60000), // 1 minute in the future
      };

      await expect(controller.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      await expect(controller.create(createDto)).rejects.toThrow(
        'measuredAt cannot be in the future',
      );

      expect(prismaService.subject.findUnique).not.toHaveBeenCalled();
      expect(observationsService.create).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException if subject does not exist', async () => {
      const createDto: CreateObservationDto = {
        subjectId: 999,
        analyteId: 1,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date(Date.now() - 60000),
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(null);

      await expect(controller.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      await expect(controller.create(createDto)).rejects.toThrow(
        'Invalid subjectId',
      );

      expect(prismaService.subject.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(prismaService.analyte.findUnique).not.toHaveBeenCalled();
      expect(observationsService.create).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException if analyte does not exist', async () => {
      const createDto: CreateObservationDto = {
        subjectId: 1,
        analyteId: 999,
        analyteAllowedUnitId: 1,
        value: 1.2,
        measuredAt: new Date(Date.now() - 60000),
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findUnique.mockResolvedValue(null);

      await expect(controller.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      await expect(controller.create(createDto)).rejects.toThrow(
        'Invalid analyteId',
      );

      expect(observationsService.create).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException if analyteAllowedUnitId is not valid for analyte', async () => {
      const createDto: CreateObservationDto = {
        subjectId: 1,
        analyteId: 1,
        analyteAllowedUnitId: 999,
        value: 1.2,
        measuredAt: new Date(Date.now() - 60000),
      };

      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.analyte.findUnique.mockResolvedValue(mockAnalyte);

      await expect(controller.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      await expect(controller.create(createDto)).rejects.toThrow(
        'analyteAllowedUnitId is not valid for the given analyteId',
      );

      expect(observationsService.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all observations', async () => {
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

      mockObservationsService.findAll.mockResolvedValue(mockObservations);

      const result = await controller.findAll(listDto);

      expect(result).toEqual(mockObservations);
      expect(observationsService.findAll).toHaveBeenCalledWith(listDto);
    });

    it('should pass filter parameters to service', async () => {
      const listDto: ListObservationsDto = {
        filter: { subjectId: 1, analyteId: [1, 2] },
        page: 2,
        limit: 10,
      };

      mockObservationsService.findAll.mockResolvedValue([]);

      await controller.findAll(listDto);

      expect(observationsService.findAll).toHaveBeenCalledWith(listDto);
    });
  });

  describe('findOne', () => {
    it('should return a single observation', async () => {
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

      mockObservationsService.findOne.mockResolvedValue(mockObservation);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockObservation);
      expect(observationsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when observation not found', async () => {
      mockObservationsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(999)).rejects.toThrow(
        'Observation with id 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update an observation', async () => {
      const updateDto: UpdateObservationDto = {
        value: 1.5,
      };

      const existingObservation = {
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

      const updatedObservation = {
        ...existingObservation,
        value: 1.5,
        updatedAt: new Date('2025-12-20'),
      };

      mockObservationsService.findOne.mockResolvedValue(existingObservation);
      mockObservationsService.update.mockResolvedValue(updatedObservation);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(updatedObservation);
      expect(observationsService.findOne).toHaveBeenCalledWith(1);
      expect(observationsService.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException when observation not found', async () => {
      const updateDto: UpdateObservationDto = {
        value: 1.5,
      };

      mockObservationsService.findOne.mockResolvedValue(null);

      await expect(controller.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.update(999, updateDto)).rejects.toThrow(
        'Observation with id 999 not found',
      );
      expect(observationsService.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an observation if it exists', async () => {
      const existingObservation = {
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

      mockObservationsService.findOne.mockResolvedValue(existingObservation);
      mockObservationsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(result).toBeUndefined();
      expect(observationsService.findOne).toHaveBeenCalledWith(1);
      expect(observationsService.remove).toHaveBeenCalledWith(1);
    });

    it('should not call remove if observation does not exist', async () => {
      mockObservationsService.findOne.mockResolvedValue(null);

      const result = await controller.remove(999);

      expect(result).toBeUndefined();
      expect(observationsService.findOne).toHaveBeenCalledWith(999);
      expect(observationsService.remove).not.toHaveBeenCalled();
    });
  });
});
