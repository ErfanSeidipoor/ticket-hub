import { INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import { DBService } from '../app/db/db.service';
import { JwtToken, Password } from '@tickethub/utils';

export class Helper {
  DBservice: DBService;
  constructor(public app: INestApplication) {
    this.DBservice = app.get<DBService>(DBService);
  }

  async closeConnection() {
    this.DBservice.connection.close();
  }

  async dropAllCollections() {
    const {
      connection: { collections },
    } = this.DBservice;

    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }

  async createUser(attrs: { email?: string }) {
    const { email } = attrs;

    const password = faker.internet.password();
    const hashed = await Password.toHash(password);

    const user = await this.DBservice.userModel.create({
      email: email || faker.internet.email(),
      password: hashed,
    });

    const jwtToken: JwtToken = {
      id: user.id,
      email: user.email,
    };

    const userJwt = jwt.sign(jwtToken, process.env['JWT_KEY']);

    return {
      userJwt,
      user,
      password,
    };
  }
}
