import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Document, Types } from 'mongoose';

import { OrderStatusEnum } from '@tickethub/enums';
import { Ticket } from './ticket.model';

export type OrderDocument = HydratedDocument<Order>;

@Schema({
  collection: 'orders',
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret.__v;
      delete ret._id;
    },
  },
})
export class Order extends Document {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: OrderStatusEnum, required: true })
  status: OrderStatusEnum;

  @Prop({ type: Date, default: Date.now })
  expiresAt: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Ticket' })
  ticket: Ticket;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});
