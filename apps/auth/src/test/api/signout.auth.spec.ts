import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@tickethub/auth/app/app.module';
import { setupApp } from '@tickethub/auth/setup-app';
import { HelperDB } from '@tickethub/auth/test/helper.db';
import request from 'supertest';
import { Jwt } from '@tickethub/utils';

const url = '/signout';

describe('auth(GET) api/auth/signout', () => {
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

  it('returns 201 on successful', async () => {
    const { userJwt } = await helperDB.createUser({});
    const response = await request(app.getHttpServer())
      .get(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(200);

    const Verified = Jwt.getVerifiedFromCookie(response.get('Set-Cookie'));
    expect(Verified).toBeUndefined();
  });
});
