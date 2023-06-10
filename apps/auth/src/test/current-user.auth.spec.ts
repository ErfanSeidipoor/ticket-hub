import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@tickethub/auth/app/app.module';
import { setupApp } from '@tickethub/auth/setup-app';
import { Helper } from '@tickethub/auth/test/helper';
import request from 'supertest';

const url = '/current-user';

describe('auth(GET) api/auth/current-user', () => {
  let app: INestApplication;
  let helper: Helper;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    helper = new Helper(app);
  });

  beforeEach(async () => {
    helper.dropAllCollections();
  });

  afterAll(async () => {
    helper.closeConnection();
  });

  it('returns 200 on successful', async () => {
    const { user, userJwt } = await helper.createUser({});
    const response = await request(app.getHttpServer())
      .get(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(200);

    const { email, id } = response.body;
    expect(email).toBe(user.email);
    expect(id).toBe(user.id);
  });

  it('responds with null if not authenticated', async () => {
    await helper.createUser({});
    await request(app.getHttpServer()).get(url).expect(403);
  });
});
