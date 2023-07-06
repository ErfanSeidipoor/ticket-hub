import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Document } from 'mongoose';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({
  collection: 'tickets',
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret.__v;
      delete ret._id;
    },
  },
})
export class Ticket extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Number, required: true })
  price: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
