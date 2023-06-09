import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateTicketRequestTickets,
  GetTicketsRequestTickets,
} from '@tickethub/dto';
import { CustomError, TICKET_NOT_FOUND } from '@tickethub/error';
import { Ticket, TicketDocument } from '@tickethub/tickets/models';
import { IPaginate, paginate } from '@tickethub/utils';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class TicketsService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  async create(
    userId: string,
    { price, title }: CreateTicketRequestTickets
  ): Promise<TicketDocument> {
    const ticket = new this.ticketModel({ title, price, userId });
    return ticket.save();
  }

  async getById(ticketId: string): Promise<TicketDocument> {
    const ticket = await this.ticketModel.findOne({ _id: ticketId });

    console.log({
      ticketId,
      'findOne({ id: ticketId })': await this.ticketModel.findOne({
        id: ticketId,
      }),
      'findOne({ _id: ticketId })': await this.ticketModel.findOne({
        _id: ticketId,
      }),
      'findById({ id: ticketId })': await this.ticketModel.findById(ticketId),
    });

    if (!ticket) {
      throw new CustomError(TICKET_NOT_FOUND);
    }

    return ticket;
  }

  async get(query: GetTicketsRequestTickets): Promise<IPaginate<Ticket>> {
    const { limit, page, ticketId } = query;

    const queryBuilder: FilterQuery<Ticket> = {};

    if (ticketId) {
      queryBuilder.id = ticketId;
    }

    return paginate(this.ticketModel, queryBuilder, page, limit);
  }
  // async signin(
  //   response: Response,
  //   { email, password }: SigninRequestAuth
  // ): Promise<UserDocument> {
  //   const user = await this.userModel.findOne({ email });

  //   if (!user) {
  //     throw new CustomError(EMAIL_OR_PASSWORD_IS_INCORRECT);
  //   }

  //   const IsMatch = await Password.compare(user.password, password);

  //   if (!IsMatch) {
  //     throw new CustomError(EMAIL_OR_PASSWORD_IS_INCORRECT);
  //     return;
  //   }

  //   const jwtToken: JwtToken = {
  //     id: user.id,
  //     email: user.email,
  //   };

  //   const signed = Jwt.sign(jwtToken);

  //   response.cookie('jwt', signed);

  //   return user;
  // }

  // async signout(response: Response) {
  //   response.clearCookie('jwt');
  // }

  // async currentUser(userId: string): Promise<UserDocument | null> {
  //   return await this.userModel.findById(userId);
  // }

  // async signup(
  //   response: Response,
  //   { email, password }: SignupRequestAuth
  // ): Promise<UserDocument> {
  //   const existingUser = await this.userModel.findOne({ email });

  //   if (existingUser) {
  //     throw new CustomError(EMAIL_ALREADY_EXISTS);
  //   }

  //   const hashed = await Password.toHash(password);
  //   const user = new this.userModel({ email, password: hashed });

  //   const jwtToken: JwtToken = {
  //     id: user.id,
  //     email: user.email,
  //   };

  //   const signed = Jwt.sign(jwtToken);

  //   response.cookie('jwt', signed);
  //   return await user.save();
  // }
}
