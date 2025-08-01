import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { AppLoggerService } from '@app/common/logger/logger.service';
import { NOTIFICATION_EXCHANGE, NOTIFICATION_ROUTING_KEY, NOTIFICATION_ERROR_ROUTING_KEY, NOTIFICATION_QUEUE, NOTIFICATION_ERROR_QUEUE, NOTIFICATION_DLX_EXCHANGE, NOTIFICATION_DLX_ROUTING_KEY, NOTIFICATION_DLX_QUEUE, NOTIFICATION_ERROR_DLX_ROUTING_KEY, NOTIFICATION_ERROR_DLX_QUEUE } from '@app/common/modules/rabbitmq/rabbitmq.constants';
import { UserNotificationMessage } from '@app/common/modules/rabbitmq/rabbitmq.types';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationConsumer {
	private readonly logger = new AppLoggerService(NotificationConsumer.name);

	constructor(private readonly notificationService: NotificationService) { }

	@RabbitSubscribe({
		exchange: NOTIFICATION_EXCHANGE,
		routingKey: NOTIFICATION_ROUTING_KEY,
		queue: NOTIFICATION_QUEUE,
		queueOptions: {
			durable: true,
			arguments: {
				'x-message-ttl': 86400000, // 24 hours TTL
				'x-max-length': 10000,
				'x-dead-letter-exchange': NOTIFICATION_DLX_EXCHANGE,
				'x-dead-letter-routing-key': NOTIFICATION_DLX_ROUTING_KEY,
				'x-max-retries': 3,
			},
		},
		errorHandler: (channel, msg, error) => {
			channel.publish(NOTIFICATION_DLX_EXCHANGE, NOTIFICATION_DLX_ROUTING_KEY, msg.content, {
				headers: {
					error: error.message,
					errorStack: error.stack,
					failedAt: new Date().toISOString(),
				},
			});

			channel.ack(msg);
		},
	})
	async handleUserNotification(message: UserNotificationMessage): Promise<void> {
		this.logger.log({
			message: 'User notification received',
			data: {
				action: message.action,
				userId: message.userId,
				userEmail: message.userEmail,
				success: message.success,
				service: message.service,
			},
		});

		await this.notificationService.processUserNotification(message);
	}

	@RabbitSubscribe({
		exchange: NOTIFICATION_EXCHANGE,
		routingKey: NOTIFICATION_ERROR_ROUTING_KEY,
		queue: NOTIFICATION_ERROR_QUEUE,
		queueOptions: {
			durable: true,
			arguments: {
				'x-message-ttl': 604800000, // 7 days TTL for errors
				'x-max-length': 5000,
				'x-dead-letter-exchange': NOTIFICATION_DLX_EXCHANGE,
				'x-dead-letter-routing-key': NOTIFICATION_ERROR_DLX_ROUTING_KEY,
				'x-max-retries': 5,
			},
		},
		errorHandler: (channel, msg, error) => {
			channel.publish(NOTIFICATION_DLX_EXCHANGE, NOTIFICATION_DLX_ROUTING_KEY, msg.content, {
				headers: {
					error: error.message,
					errorStack: error.stack,
					failedAt: new Date().toISOString(),
				},
			});

			channel.ack(msg);
		},
	})
	async handleUserNotificationError(message: UserNotificationMessage): Promise<void> {
		this.logger.error({
			message: 'User notification error received',
			data: {
				action: message.action,
				userId: message.userId,
				userEmail: message.userEmail,
				error: message.error,
				service: message.service,
			},
		});

		await this.notificationService.processErrorNotification(message);
	}

	@RabbitSubscribe({
		exchange: NOTIFICATION_DLX_EXCHANGE,
		routingKey: NOTIFICATION_DLX_ROUTING_KEY,
		queue: NOTIFICATION_DLX_QUEUE,
		queueOptions: {
			durable: true,
			arguments: {
				'x-message-ttl': 2592000000, // 30 days TTL for DLX
				'x-max-length': 1000,
			},
		},
	})
	async deadLetterConsumer(message: UserNotificationMessage): Promise<void> {
		this.logger.error({
			message: 'Dead Letter Message received for user notification:',
			data: {
				action: message.action,
				userId: message.userId,
				userEmail: message.userEmail,
				service: message.service,
			},
		});

		// alert administrators, log to special monitoring system, etc.
	}

	@RabbitSubscribe({
		exchange: NOTIFICATION_DLX_EXCHANGE,
		routingKey: NOTIFICATION_ERROR_DLX_ROUTING_KEY,
		queue: NOTIFICATION_ERROR_DLX_QUEUE,
		queueOptions: {
			durable: true,
			arguments: {
				'x-message-ttl': 2592000000, // 30 days TTL for error DLX
				'x-max-length': 500,
			},
		},
	})
	async errorDeadLetterConsumer(message: UserNotificationMessage): Promise<void> {
		this.logger.error({
			message: 'Dead Letter Message received for user notification error:',
			data: {
				action: message.action,
				userId: message.userId,
				userEmail: message.userEmail,
				service: message.service,
			},
		});

		// alert administrators, log to special monitoring system, etc.
	}
}
