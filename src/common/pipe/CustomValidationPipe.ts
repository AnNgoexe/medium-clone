import {
  ArgumentMetadata,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ERROR_CLASS_VALIDATION_FAILED } from '@common/constant/error.constant';

export class CustomValidationPipe implements PipeTransform {
  /**
   * Checks if the provided metatype should be validated.
   *
   * @param metatype - The constructor function (class) of the argument's type.
   *
   * @returns boolean - Returns true if the metatype is a custom class (i.e., not a built-in JS type),
   *                    meaning it requires validation. Returns false for primitive/built-in types
   *                    like String, Number, Boolean, Array, or Object to skip validation.
   */
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

  /**
   * Transforms and optionally validates the incoming value based on its metadata.
   *
   * @param value - The raw data from the incoming request (body, query, param, etc.).
   * @param metadata - Metadata about the argument being processed, including its expected type (metatype).
   *
   * @returns The transformed value if validation is not required, or the original value otherwise.
   */
  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    const { metatype } = metadata;

    // If no metatype is provided, or if the metatype is a built-in JS type
    // (e.g., String, Number, Boolean, Array, Object), skip validation and return the original value.
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // If the metatype is a custom class, we assume it requires validation.
    // Convert plain object to class instance to enable decorator-based validation
    const object: unknown = plainToInstance(metatype, value);

    // Perform validation using class-validator
    if (object instanceof Object) {
      const errors = await validate(object);

      // If validation errors exist, throw BadRequestException with detailed messages
      if (errors.length > 0) {
        // Format errors for readability
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

    // Return the transformed and validated object
    return object;
  }
}
