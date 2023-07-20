// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { KafkaService } from '../../kafka/kafka.service';
// import { TicketCreatedCunsomer } from '@tickethub/event';
// import { Model } from 'mongoose';
// import { Ticket } from '@tickethub/orders/models';
// import { InjectModel } from '@nestjs/mongoose';

// @Injectable()
// export class TicketCreatedCunsomerHandler implements OnModuleInit {
//   constructor(
//     private readonly kafkaService: KafkaService,
//     @InjectModel(Ticket.name) private ticketModel: Model<Ticket>
//   ) {}

//   async onModuleInit() {
//     const kafkaConsumer = await this.kafkaService.createConsumer();
//     await new TicketCreatedCunsomer(kafkaConsumer, async (message) => {
//       const { id, price, title, userId } = message;

//       /* --------------------------------- change --------------------------------- */

//       const ticket = new this.ticketModel({ _id: id, title, price, userId });

//       /* ---------------------------------- save ---------------------------------- */

//       await ticket.save();
//     }).consume();
//   }
// }
