import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { randomUUID } from 'crypto';
import * as _ from 'lodash';
import { AppLoggerService } from '@app/common/logger/logger.service';

@Injectable()
export class RabbitMQService {
	private readonly logger: AppLoggerService = new AppLoggerService(
		RabbitMQService.name,
	);

	constructor(private readonly amqpConnection: AmqpConnection) {}

	getAmqpConnection(): AmqpConnection {
		return this.amqpConnection;
	}

	checkIsReachable(): void {
		const isReachable = this.amqpConnection.managedConnection.isConnected();

		if (!isReachable) {
			throw new HttpException(
				'RabbitMQ is not reachable',
				HttpStatus.SERVICE_UNAVAILABLE,
			);
		}
	}

	async sendRpcRequest<Payload = any, ResponseData = any>(
		exchange: string,
		routingKey: string,
		payload: Payload,
		timeout = 10000,
	): Promise<{ success: boolean; error?: string; data?: ResponseData }> {
		try {
			const correlationId = randomUUID();

			const response = await this.amqpConnection.request<{
				success: boolean;
				error?: string;
				data?: ResponseData;
			}>({
				exchange,
				routingKey,
				correlationId,
				payload,
				timeout,
				headers: { 'X-Request-ID': randomUUID() },
			});

			this.logger.log({
				event: 'RPC_REQUEST',
				message: 'Request sent to RabbitMQ (rpc)',
				data: {
					exchange,
					routingKey,
					payload,
					response,
				},
			});

			if (!response) {
				const msg =
					'Failed to send request to RabbitMQ (rpc): No response';
				this.logger.error({
					event: 'RPC_REQUEST',
					message: msg,
					data: {
						exchange,
						routingKey,
						payload,
					},
				});
				throw new HttpException(
					'Failed to send request to RabbitMQ (rpc): No response',
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}

			if (
				response.error ||
				(_.isBoolean(response.success) && !response.success)
			) {
				const error = response.error || 'Unknown response error';
				this.logger.error({
					event: 'RPC_REQUEST',
					message:
						'Failed to send request to RabbitMQ (rpc): Response error',
					data: {
						exchange,
						routingKey,
						payload,
						error,
					},
				});
				throw new HttpException(
					error,
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}

			return response;
		} catch (error) {
			const msg = `Failed to send request (rpc): ${error.message}`;
			this.logger.error(
				{
					event: 'RPC_REQUEST',
					message: msg,
					data: {
						exchange,
						routingKey,
						payload,
					},
				},
				error.stack,
			);
			throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async sendMessageAsync<Message = any>(
		exchange: string,
		routingKey: string,
		message: Message,
	): Promise<void> {
		try {
			await this.amqpConnection.publish(exchange, routingKey, message);
			this.logger.log({
				event: 'SEND_MESSAGE',
				message: 'Message sent to RabbitMQ (async)',
				data: { exchange, routingKey, message },
			});
		} catch (error) {
			const msg = `Failed to send message (async): ${error.message}`;
			this.logger.error({
				event: 'SEND_MESSAGE',
				message: msg,
				data: { exchange, routingKey, message },
			});
			throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async sendMessageToExchangeAsync(
		exchange: string,
		message: any,
	): Promise<void> {
		try {
			await this.amqpConnection.publish(exchange, '', message, { persistent: true });
			this.logger.log({ message: `Message sent to exchange (async): ${exchange}` });
		} catch (error) {
			this.logger.error({
				message: 'Failed to send message to exchange (async)',
				data: { error: error.message, stack: error.stack },
			});
			throw new HttpException(
				'Failed to send message to exchange (async)',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
