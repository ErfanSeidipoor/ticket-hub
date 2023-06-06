import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@tickethub/auth/app/app.module';
import { setupApp } from '@tickethub/auth/setup-app';
import { Helper } from '@tickethub/auth/test/helper';
import request from 'supertest';
import { Jwt } from '../utils';

const url = '/signout';

describe('auth(GET) api/auth/signout', () => {
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

  it('returns 201 on successful', async () => {
    const { userJwt } = await helper.createUser({});
    const response = await request(app.getHttpServer())
      .get(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(200);

    const Verified = Jwt.getVerifiedFromCookie(response.get('Set-Cookie'));
    expect(Verified).toBeUndefined();
  });
});
