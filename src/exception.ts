import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class IoTsValidationException extends BadRequestException {
  constructor(describe: string) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      describe: describe,
    });
  }
}
