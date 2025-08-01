import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AppLoggerService } from '../logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new AppLoggerService(AllExceptionsFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<FastifyReply>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let errorCode = 'INTERNAL_SERVER_ERROR';
		let message = 'An unexpected error occurred';

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const res: any = exception.getResponse();

			if (typeof res === 'object' && res !== null) {
				errorCode = res.errorCode ?? res.error ?? errorCode;
				message = res.message ?? message;
			}
		}

		this.logger.error({
			message: `Code: ${errorCode} | Message: ${message}`,
			data: { errorCode, message },
		});

		response.status(status).send({
			errorCode,
			statusCode: status,
			message,
		});
	}
}
