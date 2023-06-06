import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { AppModule } from '@tickethub/auth/app/app.module';
import { setupApp } from '@tickethub/auth/setup-app';
import { Helper } from '@tickethub/auth/test/helper';
import { SignupRequestAuth } from '@tickethub/dto';
import { Jwt } from '../utils';
import { EMAIL_ALREADY_EXISTS } from '@tickethub/error';

const url = '/signup';

describe('auth(POST) api/auth/signup', () => {
  let app: INestApplication;
  let helper: Helper;
  let requestBody: SignupRequestAuth;

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
    requestBody = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .send(requestBody)
      .expect(201);

    const { email } = response.body;
    expect(email).toBe(requestBody.email);

    expect(response.get('Set-Cookie')).toBeDefined();

    const Verified = Jwt.getVerifiedFromCookie(response.get('Set-Cookie'));

    expect(Verified.id).toBeDefined();
    expect(Verified.email).toBeDefined();
  });

  it('fails 400 with an invalid email', async () => {
    requestBody = {
      email: faker.internet.userName(),
      password: faker.internet.password(),
    };

    await request(app.getHttpServer()).post(url).send(requestBody).expect(400);
  });

  it('fails 400(EMAIL_ALREADY_EXISTS) with an invalid email duplicate emails', async () => {
    requestBody = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    await helper.createUser({ email: requestBody.email });

    const response = await request(app.getHttpServer())
      .post(url)
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(EMAIL_ALREADY_EXISTS.status);
    expect(message).toEqual(EMAIL_ALREADY_EXISTS.description);
  });
});
