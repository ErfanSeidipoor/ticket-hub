import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isMongoId } from 'class-validator';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!isMongoId(value)) {
      throw new HttpException(
        `Validation failed (objectId is expected)`,
        HttpStatus.BAD_REQUEST
      );
    }
    return value;
  }
}
