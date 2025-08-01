import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConnectionUrl } from '@app/common/helpers/get-mongo-connection-url';

export const WRITE_DB_CONNECTION = 'WRITE_DB_CONNECTION';
export const READ_DB_CONNECTION = 'READ_DB_CONNECTION';

@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			connectionName: WRITE_DB_CONNECTION,
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: getMongoConnectionUrl({
					MONGO_HOST: configService.getOrThrow<string>('MONGO_HOST'),
					MONGO_PORT: configService.getOrThrow<string>('MONGO_PORT'),
					MONGO_DB: configService.getOrThrow<string>('MONGO_DB'),
					MONGO_USER: configService.getOrThrow<string>('MONGO_USER'),
					MONGO_PASSWORD: configService.getOrThrow<string>('MONGO_PASSWORD'),
					MONGO_REPLICA_SET: configService.get<string>('MONGO_REPLICA_SET'),
					MONGO_READ_HOSTS: configService.get<string>('MONGO_READ_HOSTS'),
					MONGO_READ_PORTS: configService.get<string>('MONGO_READ_PORTS'),
					MONGO_READ_PREFERENCE: 'primary',
				}),
			}),
			inject: [ConfigService],
		}),
		MongooseModule.forRootAsync({
			connectionName: READ_DB_CONNECTION,
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: getMongoConnectionUrl({
					MONGO_HOST: configService.getOrThrow<string>('MONGO_HOST'),
					MONGO_PORT: configService.getOrThrow<string>('MONGO_PORT'),
					MONGO_DB: configService.getOrThrow<string>('MONGO_DB'),
					MONGO_USER: configService.getOrThrow<string>('MONGO_USER'),
					MONGO_PASSWORD: configService.getOrThrow<string>('MONGO_PASSWORD'),
					MONGO_REPLICA_SET: configService.get<string>('MONGO_REPLICA_SET'),
					MONGO_READ_HOSTS: configService.get<string>('MONGO_READ_HOSTS'),
					MONGO_READ_PORTS: configService.get<string>('MONGO_READ_PORTS'),
					MONGO_READ_PREFERENCE: 'secondaryPreferred',
				}),
			}),
			inject: [ConfigService],
		}),
	],
	exports: [MongooseModule],
})
export class MongoDbModule { }
