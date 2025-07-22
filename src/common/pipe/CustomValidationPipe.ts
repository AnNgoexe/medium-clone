import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ERROR_CLASS_VALIDATION_FAILED } from '@common/constant/error.constant';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  private options = {
    transform: true,
    validate: true,
    errorMessage: ERROR_CLASS_VALIDATION_FAILED.message,
    transformOptions: { enableImplicitConversion: true },
    validateOptions: { whitelist: true, forbidNonWhitelisted: true },
  };

  constructor(private readonly i18n: I18nService) {}

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

    const object: unknown = plainToInstance(
      metatype,
      value,
      this.options.transformOptions,
    );
    if (object instanceof Object) {
      const errors = await validate(object, this.options.validateOptions);
      if (errors.length > 0) {
        const i18nContext = I18nContext.current();
        const lang = i18nContext?.lang || 'en';

        const messages = await Promise.all(
          errors.map(async (err) => {
            const { constraints = {}, property } = err;
            const translatedErrors = await Promise.all(
              Object.keys(constraints).map((constraintName) => {
                const i18nKey = `common.error.${property}_${constraintName}`;
                return this.i18n.translate(i18nKey, { lang });
              }),
            );
            return { property: property, errors: translatedErrors };
          }),
        );

        throw new BadRequestException({
          ...ERROR_CLASS_VALIDATION_FAILED,
          message: messages,
        });
      }
    }

    return object;
  }
}
