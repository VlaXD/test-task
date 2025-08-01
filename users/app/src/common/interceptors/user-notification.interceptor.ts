import { Injectable, NestInterceptor, ExecutionContext, CallHandler, applyDecorators, UseInterceptors } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import { UserNotificationAction, NOTIFICATION_EXCHANGE, NOTIFICATION_ROUTING_KEY, NOTIFICATION_ERROR_ROUTING_KEY } from '@app/common/modules/rabbitmq/rabbitmq.constants';
import { RabbitMQService } from '@app/common/modules/rabbitmq/rabbitmq.service';
import { UserNotificationMessage } from '@app/common/modules/rabbitmq/rabbitmq.types';
import { AppLoggerService } from '@app/common/logger/logger.service';

export interface UserNotificationOptions {
	successAction: UserNotificationAction;
	errorAction: UserNotificationAction;
	includeUserData?: boolean;
	includeRequestBody?: boolean;
}

@Injectable()
export class UserNotificationInterceptor implements NestInterceptor {
	private readonly logger = new AppLoggerService(UserNotificationInterceptor.name);

	constructor(private readonly rabbitMQService: RabbitMQService) { }

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const startTime = Date.now();
		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();
		const requestId = randomUUID();

		const notificationOptions: UserNotificationOptions = Reflect.getMetadata(
			'userNotificationOptions',
			context.getHandler(),
		);

		if (!notificationOptions) {
			this.logger.warn({
				message: 'User notification options not defined',
				data: { handler: context.getHandler().name },
			});
			return next.handle();
		}

		return next.handle().pipe(
			tap((data: any) => {
				this.sendNotification({
					action: notificationOptions.successAction,
					success: true,
					data,
					request,
					response,
					startTime,
					requestId,
					notificationOptions,
				});
			}),
			catchError((error: any) => {
				this.sendNotification({
					action: notificationOptions.errorAction,
					success: false,
					error,
					request,
					response,
					startTime,
					requestId,
					notificationOptions,
				});

				return throwError(error);
			}),
		);
	}

	private async sendNotification(params: {
		action: UserNotificationAction;
		success: boolean;
		data?: any;
		error?: any;
		request: any;
		response: any;
		startTime: number;
		requestId: string;
		notificationOptions: UserNotificationOptions;
	}) {
		const {
			action,
			success,
			data,
			error,
			request,
			response,
			startTime,
			requestId,
			notificationOptions,
		} = params;

		try {
			const duration = Date.now() - startTime;

			let userId: string | undefined;
			let userEmail: string | undefined;
			let userName: string | undefined;
			let userData: Record<string, any> | undefined;

			if (success && data) {
				userId = data._id || data.id;
				userEmail = data.email;
				userName = data.name;

				if (notificationOptions.includeUserData) {
					userData = { ...data };
					if (userData) {
						delete userData.password;
						delete userData.__v;
					}
				}
			} else if (notificationOptions.includeRequestBody && request.body) {
				userEmail = request.body.email;
				userName = request.body.name;
			}

			const message: UserNotificationMessage = {
				action,
				userId,
				userEmail,
				userName,
				userData,
				timestamp: new Date(),
				service: 'users-api',
				success,
				error: error?.message || error?.response?.message,
				metadata: {
					duration,
					statusCode: response.statusCode,
					endpoint: request.url,
					method: request.method,
					requestId,
				},
			};

			const routingKey = success
				? NOTIFICATION_ROUTING_KEY
				: NOTIFICATION_ERROR_ROUTING_KEY;

			await this.rabbitMQService.sendMessageAsync(
				NOTIFICATION_EXCHANGE,
				routingKey,
				message,
			);

			this.logger.log({
				message: `User notification sent: ${action}`,
				data: {
					action,
					success,
					userId,
					userEmail,
					routingKey,
				},
			});

		} catch (notificationError) {
			this.logger.error({
				message: 'Failed to send user notification',
				data: {
					action,
					error: notificationError.message,
					stack: notificationError.stack,
				},
			});
		}
	}
}

export const UserNotification = (options: UserNotificationOptions) =>
	(target: any, key: string, descriptor: PropertyDescriptor) => {
		Reflect.defineMetadata('userNotificationOptions', options, descriptor.value);
		return descriptor;
	};

export function UseUserNotificationInterceptor(options: UserNotificationOptions) {
	return applyDecorators(
		UseInterceptors(UserNotificationInterceptor),
		UserNotification(options),
	);
} 
