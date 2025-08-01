/* eslint-disable no-restricted-imports */
import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { AppLoggerService, LogMessage } from './logger.service';

export type Meta = {
	event?: string;
	defaultErrorMessage?: string;
	data?: Record<string, any>;
};

/**
 * Helper method to rethrow exceptions or throw Internal Server Error for non-NestJS errors
 */
export const getAndLogException = (error: any, logger?: AppLoggerService | Logger, meta?: Meta): HttpException => {
	const { event, defaultErrorMessage, data = {} } = meta || {};
	const errorMessage =
		error.response?.data?.message || error?.message || defaultErrorMessage || 'An unexpected error occurred';

	if (logger) {
		if (!(logger instanceof AppLoggerService)) {
			logger.warn({ message: 'NestJs common logger deprecated. Use instead AppLogger' });
		}

		logger.error({
			event,
			message: errorMessage,
			data: { ...data, error: error.message, stack: error.stack },
		});
	}

	if (error instanceof HttpException) {
		return error;
	}

	return new HttpException(
		{
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			error: errorMessage,
			message: errorMessage,
		},
		error.status || HttpStatus.INTERNAL_SERVER_ERROR,
	);
};

export type CustomResponse = Response & { data?: any };

function getErrorExpandedMessage(exception: any): string {
	if (exception instanceof AxiosError) {
		return `\n\tInternal request data:
    \turl: ${exception?.config?.url}
    \tmethod: ${exception?.config?.method}
    \tstatus: ${exception?.response?.status}
    \tstatusText: ${exception?.response?.statusText},
    \theaders: ${JSON.stringify(exception?.response?.headers)}
    \tdata: ${JSON.stringify(exception?.response?.data)}`;
	}

	return `\tstack: ${exception?.stack}`;
}

export function catchHandler(exception: any, host: ArgumentsHost) {
	const ctx = host.switchToHttp();
	const response: any = ctx.getResponse<CustomResponse>(); // clown smile
	const request = ctx.getRequest<Request>();
	const status =
		(exception instanceof HttpException ? exception.getStatus() : exception.status) ||
		HttpStatus.INTERNAL_SERVER_ERROR;

	const errorResponse = exception instanceof HttpException ? exception.getResponse() : exception.response?.data;
	const errorMessage =
		typeof errorResponse === 'string' ? errorResponse : errorResponse?.message || exception.message;

	const errorTypeCode = errorResponse?.error || 'INTERNAL_SERVER_ERROR';

	const msg: string = `\nError occurred:
    url: ${request.url}
    method: ${request.method}
    status: ${status}
    message: ${errorMessage}}
    headers: ${JSON.stringify(request.headers)}
    request_ip: ${JSON.stringify((request as any)?.ip)}
    info: ${getErrorExpandedMessage(exception)}`;

	const statusCode = typeof status === 'object' ? Number(status) : status;

	response.status(statusCode).json({
		statusCode,
		message: errorMessage,
		error: errorTypeCode,
	});

	return msg;
}

export const createErrorLogData = (error: any, payload: Record<string, any> = {}): LogMessage['data'] => ({
	message: error.message,
	data: { ...payload, error: error.message, stack: error.stack },
});

export const getDefaultPinoLoggerConfig = ({ logLevel }: {
	logLevel?: string;
}) => ({
	pinoHttp: {
		level: logLevel || 'info',
		formatters: {
			level(label: string): {
				level: string;
			} {
				return { level: label };
			},
		},
		autoLogging: {
			ignore: (req: {
				url?: string;
			}) => req.url?.includes('/health') || req.url?.includes('/metrics') || false,
		},
		genReqId: (req: {
			headers: Record<string, string | string[] | undefined>;
			id: string | number | object;
		}) => req.headers['x-request-id'] as string || `${Date.now()}-${Math.random()}`,
		quietReqLogger: true,
	},
});
