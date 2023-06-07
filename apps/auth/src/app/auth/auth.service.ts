import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Jwt, JwtToken, Password } from '@tickethub/utils';
import { SigninRequestAuth, SignupRequestAuth } from '@tickethub/dto';
import {
  CustomError,
  EMAIL_ALREADY_EXISTS,
  EMAIL_OR_PASSWORD_IS_INCORRECT,
} from '@tickethub/error';
import { Response } from 'express';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../models/user.model';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async signin(
    response: Response,
    { email, password }: SigninRequestAuth
  ): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new CustomError(EMAIL_OR_PASSWORD_IS_INCORRECT);
    }

    const IsMatch = await Password.compare(user.password, password);

    if (!IsMatch) {
      throw new CustomError(EMAIL_OR_PASSWORD_IS_INCORRECT);
      return;
    }

    const jwtToken: JwtToken = {
      id: user.id,
      email: user.email,
    };

    const signed = Jwt.sign(jwtToken);

    response.cookie('jwt', signed);

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

    const signed = Jwt.sign(jwtToken);

    response.cookie('jwt', signed);
    return await user.save();
  }
}
