import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppService } from '@app/app.service';
import { AppController } from '@app/app.controller';
import { HealthModule } from '@app/modules/health/health.module';
import { RabbitMQConfigModule } from '@app/common/modules/rabbitmq/rabbitmq.module';
import { getDefaultPinoLoggerConfig } from '@app/common/logger/logger.helper';
import { NotificationModule } from './modules/notifications/notification.module';


@Module({
	imports: [
		LoggerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (config: ConfigService) => {
				const logLevel = config.get('LOG_LEVEL');

				return getDefaultPinoLoggerConfig({ logLevel });
			},
		}),
		ConfigModule.forRoot({ isGlobal: true }),
		HealthModule,
		NotificationModule,
		RabbitMQConfigModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
