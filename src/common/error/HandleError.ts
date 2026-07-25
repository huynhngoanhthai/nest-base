import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HandleError implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = (exception?.status ||
      exception?.statusCode ||
      500) as number;

    const message = (exception?.message || 'Server error!') as string;

    const messageSummary = `Request: ${request.method} ${request.url} - CODE: ${statusCode}`;
    console.log('err:', exception);
    console.log(messageSummary);

    return response.status(statusCode).json({
      message,
      data: {},
      status: false,
    });
  }
}
