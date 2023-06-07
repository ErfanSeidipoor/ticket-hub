import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { AppModule } from '@tickethub/auth/app/app.module';
import { setupApp } from '@tickethub/auth/setup-app';
import { Helper } from '@tickethub/auth/test/helper';
import { SignupRequestAuth } from '@tickethub/dto';
import { Jwt } from '@tickethub/utils';
import { EMAIL_OR_PASSWORD_IS_INCORRECT } from '@tickethub/error';

const url = '/signin';

describe('auth(POST) api/auth/singin', () => {
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

  it('returns 201 on successful singin', async () => {
    const { user, password } = await helper.createUser({});

    requestBody = {
      email: user.email,
      password,
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

  it('fails 400(EMAIL_OR_PASSWORD_IS_INCORRECT) when an incorrect password is supplied', async () => {
    const { user } = await helper.createUser({});

    requestBody = {
      email: user.email,
      password: faker.internet.password(),
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(EMAIL_OR_PASSWORD_IS_INCORRECT.status);
    expect(message).toEqual(EMAIL_OR_PASSWORD_IS_INCORRECT.description);
  });

  it('fails 400(EMAIL_OR_PASSWORD_IS_INCORRECT) when an incorrect email is supplied', async () => {
    const { password } = await helper.createUser({});

    requestBody = {
      email: faker.internet.email(),
      password,
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(EMAIL_OR_PASSWORD_IS_INCORRECT.status);
    expect(message).toEqual(EMAIL_OR_PASSWORD_IS_INCORRECT.description);
  });
});
