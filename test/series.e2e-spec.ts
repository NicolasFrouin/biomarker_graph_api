import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('SeriesController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/series (GET)', () => {
    it('should return series data for valid subject and loinc code', () => {
      return request(app.getHttpServer())
        .get('/series')
        .query({ subjectId: 1, loinc: '2161-8' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('value');
            expect(res.body[0]).toHaveProperty('measuredAt');
            expect(res.body[0]).toHaveProperty('unit');
          }
        });
    });

    it('should filter by date range with start date', () => {
      return request(app.getHttpServer())
        .get('/series')
        .query({
          subjectId: 1,
          loinc: '2161-8',
          start: '2024-12-01T00:00:00Z',
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter by date range with end date', () => {
      return request(app.getHttpServer())
        .get('/series')
        .query({
          subjectId: 1,
          loinc: '2161-8',
          end: '2025-01-01T00:00:00Z',
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter by date range with both start and end dates', () => {
      return request(app.getHttpServer())
        .get('/series')
        .query({
          subjectId: 1,
          loinc: '2161-8',
          start: '2024-12-01T00:00:00Z',
          end: '2024-12-31T23:59:59Z',
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return 422 for invalid subject', () => {
      return request(app.getHttpServer())
        .get('/series')
        .query({ subjectId: 99999, loinc: '2161-8' })
        .expect(422)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid subject');
        });
    });

    it('should return 422 for invalid loinc code', () => {
      return request(app.getHttpServer())
        .get('/series')
        .query({ subjectId: 1, loinc: 'invalid-loinc' })
        .expect(422)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid loinc');
        });
    });

    it('should return 400 for missing subjectId', () => {
      return request(app.getHttpServer())
        .get('/series')
        .query({ loinc: '2161-8' })
        .expect(400);
    });

    it('should return 400 for missing loinc', () => {
      return request(app.getHttpServer())
        .get('/series')
        .query({ subjectId: 1 })
        .expect(400);
    });

    it('should return 422 for invalid targetUnit', () => {
      return request(app.getHttpServer())
        .get('/series')
        .query({ subjectId: 1, loinc: '2161-8', targetUnit: 'invalid-unit' })
        .expect(422)
        .expect((res) => {
          expect(res.body.message).toContain('targetUnit is not valid');
        });
    });
  });
});
