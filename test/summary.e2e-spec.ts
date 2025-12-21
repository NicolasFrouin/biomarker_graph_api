import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('SummaryController (e2e)', () => {
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

  describe('/summary (GET)', () => {
    it('should return summary for valid subject and loinc code', () => {
      return request(app.getHttpServer())
        .get('/summary')
        .query({ subjectId: 1, loinc: '2161-8' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('lastValue');
          expect(res.body).toHaveProperty('lastUpdated');
          expect(res.body).toHaveProperty('trend');
          expect(res.body.lastValue).toHaveProperty('unit');
          expect(['rising', 'falling', 'stable']).toContain(res.body.trend);
        });
    });

    it('should return summary with custom window', () => {
      return request(app.getHttpServer())
        .get('/summary')
        .query({ subjectId: 1, loinc: '2161-8', window: 30 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('lastValue');
          expect(res.body).toHaveProperty('trend');
        });
    });

    it('should return 400 for invalid subject', () => {
      return request(app.getHttpServer())
        .get('/summary')
        .query({ subjectId: 99999, loinc: '2161-8' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid subject');
        });
    });

    it('should return 400 for invalid loinc code', () => {
      return request(app.getHttpServer())
        .get('/summary')
        .query({ subjectId: 1, loinc: 'invalid-loinc' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid loinc');
        });
    });

    it('should return 400 for missing subjectId', () => {
      return request(app.getHttpServer())
        .get('/summary')
        .query({ loinc: '2161-8' })
        .expect(400);
    });

    it('should return 400 for missing loinc', () => {
      return request(app.getHttpServer())
        .get('/summary')
        .query({ subjectId: 1 })
        .expect(400);
    });
  });
});
