import { Injectable } from '@nestjs/common';
import { SigninRequestAuth, SignupRequestAuth } from '@tickethub/dto';
import { User, UserDocument } from '../../models/user.model';
import {
  CustomError,
  EMAIL_ALREADY_EXISTS,
  EMAIL_AND_PASSWORD_IS_INCORRECT,
} from '@tickethub/error';
import { InjectModel } from '@nestjs/mongoose';
import jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { Password } from '@tickethub/auth/utils';
import { Request, Response } from 'express';
import { JwtToken } from '@tickethub/auth/middlewares';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async signin(
    response: Response,
    { email, password }: SigninRequestAuth
  ): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new CustomError(EMAIL_AND_PASSWORD_IS_INCORRECT);
    }

    const IsMatch = await Password.compare(user.password, password);

    if (!IsMatch) {
      throw new CustomError(EMAIL_AND_PASSWORD_IS_INCORRECT);
      return;
    }

    const jwtToken: JwtToken = {
      id: user.id,
      email: user.email,
    };

    const userJwt = jwt.sign(jwtToken, process.env['JWT_KEY']);

    response.cookie('jwt', userJwt);

    return user;
  }

  async signout(response: Response) {
    response.clearCookie('jwt');
  }

  async currentUser(userId: string): Promise<UserDocument | null> {
    return await this.userModel.findById(userId);
  }

  async signup(
    response: Response,
    { email, password }: SignupRequestAuth
  ): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      throw new CustomError(EMAIL_ALREADY_EXISTS);
    }

    const hashed = await Password.toHash(password);
    const user = new this.userModel({ email, password: hashed });

    const jwtToken: JwtToken = {
      id: user.id,
      email: user.email,
    };

    const userJwt = jwt.sign(jwtToken, process.env['JWT_KEY']);

    response.cookie('jwt', userJwt);
    return await user.save();
  }
}
