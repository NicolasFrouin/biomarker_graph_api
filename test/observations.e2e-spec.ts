import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('ObservationsController (e2e)', () => {
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

  describe('/observations (GET)', () => {
    it('should return all observations with pagination', () => {
      return request(app.getHttpServer())
        .get('/observations')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('subjectId');
            expect(res.body[0]).toHaveProperty('value');
            expect(res.body[0]).toHaveProperty('measuredAt');
          }
        });
    });

    it('should filter observations by subjectId', () => {
      return request(app.getHttpServer())
        .get('/observations')
        .query({ filter: JSON.stringify({ subjectId: 1 }) })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((obs: any) => {
            expect(obs.subjectId).toBe(1);
          });
        });
    });

    it('should paginate observations', () => {
      return request(app.getHttpServer())
        .get('/observations')
        .query({ page: 1, limit: 5 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('/observations (POST)', () => {
    let createdObservationId: number;

    it('should create a new observation', async () => {
      const response = await request(app.getHttpServer())
        .post('/observations')
        .send({
          subjectId: 1,
          analyteId: 1,
          analyteAllowedUnitId: 1,
          value: 5.5,
          measuredAt: new Date('2024-12-01T10:00:00Z').toISOString(),
          rawPayload: {},
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.subjectId).toBe(1);
      expect(response.body.value).toBe(5.5);
      expect(response.body.deletedAt).toBeNull();

      createdObservationId = response.body.id;
    });

    it('should fail when creating observation with future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      return request(app.getHttpServer())
        .post('/observations')
        .send({
          subjectId: 1,
          analyteId: 1,
          analyteAllowedUnitId: 1,
          value: 5.5,
          measuredAt: futureDate.toISOString(),
          rawPayload: {},
        })
        .expect(422)
        .expect((res) => {
          expect(res.body.message).toContain(
            'measuredAt cannot be in the future',
          );
        });
    });

    it('should fail when creating observation with invalid subject', () => {
      return request(app.getHttpServer())
        .post('/observations')
        .send({
          subjectId: 99999,
          analyteId: 1,
          analyteAllowedUnitId: 1,
          value: 5.5,
          measuredAt: new Date('2024-12-01T10:00:00Z').toISOString(),
          rawPayload: {},
        })
        .expect(422)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid subject');
        });
    });

    afterAll(async () => {
      // Cleanup created observation
      if (createdObservationId) {
        await request(app.getHttpServer()).delete(
          `/observations/${createdObservationId}`,
        );
      }
    });
  });

  describe('/observations/:id (GET)', () => {
    it('should return a single observation by id', () => {
      return request(app.getHttpServer())
        .get('/observations/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('value');
          expect(res.body).toHaveProperty('subjectId');
        });
    });

    it('should return 404 for non-existent observation', () => {
      return request(app.getHttpServer())
        .get('/observations/999999')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });
  });

  describe('/observations/:id (PUT)', () => {
    let testObservationId: number;

    beforeAll(async () => {
      // Create a test observation
      const response = await request(app.getHttpServer())
        .post('/observations')
        .send({
          subjectId: 1,
          analyteId: 1,
          analyteAllowedUnitId: 1,
          value: 4.5,
          measuredAt: new Date('2024-12-10T10:00:00Z').toISOString(),
          rawPayload: {},
        });
      testObservationId = response.body.id;
    });

    it('should update an observation', () => {
      return request(app.getHttpServer())
        .put(`/observations/${testObservationId}`)
        .send({
          value: 5.5,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testObservationId);
          expect(res.body.value).toBe(5.5);
        });
    });

    it('should return 404 when updating non-existent observation', () => {
      return request(app.getHttpServer())
        .put('/observations/999999')
        .send({
          value: 5.5,
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });

    afterAll(async () => {
      // Cleanup
      if (testObservationId) {
        await request(app.getHttpServer()).delete(
          `/observations/${testObservationId}`,
        );
      }
    });
  });

  describe('/observations/:id (DELETE)', () => {
    let testObservationId: number;

    beforeAll(async () => {
      // Create a test observation
      const response = await request(app.getHttpServer())
        .post('/observations')
        .send({
          subjectId: 1,
          analyteId: 1,
          analyteAllowedUnitId: 1,
          value: 3.5,
          measuredAt: new Date('2024-12-15T10:00:00Z').toISOString(),
          rawPayload: {},
        });
      testObservationId = response.body.id;
    });

    it('should soft delete an observation', async () => {
      await request(app.getHttpServer())
        .delete(`/observations/${testObservationId}`)
        .expect(200);

      // Verify it returns 404 when trying to get it
      await request(app.getHttpServer())
        .get(`/observations/${testObservationId}`)
        .expect(404);
    });

    it('should handle deleting non-existent observation gracefully', () => {
      return request(app.getHttpServer())
        .delete('/observations/999999')
        .expect(200);
    });
  });
});
