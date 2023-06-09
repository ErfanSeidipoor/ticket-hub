import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Ticket } from '@tickethub/tickets/models';
import { Connection, Model } from 'mongoose';

@Injectable()
export class DBService {
  constructor(
    @InjectConnection() public readonly connection: Connection,
    @InjectModel(Ticket.name) public ticketModel: Model<Ticket>
  ) {}
}
