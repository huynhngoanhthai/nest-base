import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom Exception: BadRequest (HTTP 400)
 * @example throw new BadRequest('Invalid password');
 */
export class BadRequest extends HttpException {
  constructor(message: string = 'Bad Request') {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Custom Exception: Unauthorized (HTTP 401)
 * @example throw new Unauthorized('Unauthorized access');
 */
export class Unauthorized extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: 'Unauthorized',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Custom Exception: Forbidden (HTTP 403)
 * @example throw new Forbidden('Permission denied');
 */
export class Forbidden extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
        error: 'Forbidden',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Custom Exception: NotFound (HTTP 404)
 * @example throw new NotFound('Resource not found');
 */
export class NotFound extends HttpException {
  constructor(message: string = 'Not Found') {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
