import { NestFactory } from '@nestjs/core';
import { configureApp } from '@app/common/builders/configure-app';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '@app/app.module';

async function bootstrap() {
	const fastifyAdapter = new FastifyAdapter();

	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		fastifyAdapter,
	);

	configureApp(app);

	await app.listen(3333, process.env.HOST_APP || '0.0.0.0');
}

bootstrap();
