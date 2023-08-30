import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({
  collection: 'payments',
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret.__v;
      delete ret._id;
    },
  },
})
export class Payment extends Document {
  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  stripeId: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});
