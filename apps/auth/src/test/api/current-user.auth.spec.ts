import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@tickethub/auth/app/app.module';
import { setupApp } from '@tickethub/auth/setup-app';
import { HelperDB } from '@tickethub/auth/test/helper.db';
import request from 'supertest';

const url = '/current-user';

describe('auth(GET) api/auth/current-user', () => {
  let app: INestApplication;
  let helperDB: HelperDB;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    helperDB = new HelperDB(app);
  });

  beforeEach(async () => {
    helperDB.dropAllCollections();
  });

  afterAll(async () => {
    helperDB.closeConnection();
  });

  it('returns 200 on successful', async () => {
    const { user, userJwt } = await helperDB.createUser({});
    const response = await request(app.getHttpServer())
      .get(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(200);

    const { email, id } = response.body;
    expect(email).toBe(user.email);
    expect(id).toBe(user.id);
  });

  it('responds with null if not authenticated', async () => {
    await helperDB.createUser({});
    await request(app.getHttpServer()).get(url).expect(403);
  });
});
