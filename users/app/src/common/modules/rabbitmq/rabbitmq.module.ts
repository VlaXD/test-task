import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQService } from './rabbitmq.service';
import { getRMQConnectionUri } from './rabbitmq.helper';
import { NOTIFICATION_EXCHANGE, NOTIFICATION_DLX_EXCHANGE } from './rabbitmq.constants';

@Global()
@Module({
	imports: [
		RabbitMQModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				exchanges: [
					{
						name: NOTIFICATION_EXCHANGE,
						type: 'topic',
						options: {
							durable: true,
							autoDelete: false,
						},
					},
					{
						name: NOTIFICATION_DLX_EXCHANGE,
						type: 'topic',
						options: {
							durable: true,
							autoDelete: false,
						},
					},
				],
				uri: getRMQConnectionUri({
					username: configService.get<string>('RMQ_USER'),
					password: configService.get<string>('RMQ_PASS'),
					host: configService.getOrThrow<string>('RMQ_HOST'),
					port: Number(configService.getOrThrow<number>('RMQ_PORT')),
				}),
				connectionInitOptions: { wait: false },
				enableControllerDiscovery: true,
			}),
			inject: [ConfigService],
		}),
	],
	providers: [RabbitMQService],
	exports: [RabbitMQService],
})
export class RabbitMQConfigModule { }
