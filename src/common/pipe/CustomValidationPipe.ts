import {
  ArgumentMetadata,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ERROR_CLASS_VALIDATION_FAILED } from '@common/constant/error.constant';

export class CustomValidationPipe implements PipeTransform {
  private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
    const types: Array<new (...args: unknown[]) => unknown> = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return !types.includes(metatype);
  }

  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object: unknown = plainToInstance(metatype, value);
    if (object instanceof Object) {
      const errors = await validate(object);
      if (errors.length > 0) {
        const messages = errors.map((err) => ({
          property: err.property,
          errors: Object.values(err.constraints || []),
        }));

        throw new BadRequestException({
          ...ERROR_CLASS_VALIDATION_FAILED,
          message: messages,
        });
      }
    }

    return object;
  }
}
