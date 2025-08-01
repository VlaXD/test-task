import { NestFactory } from '@nestjs/core';
import { configureApp } from '@app/common/builders/configure-app';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '@app/app.module';

async function bootstrap() {
	const fastifyAdapter = new FastifyAdapter();

	// await fastifyAdapter.register(compression, {
	// 	global: true,
	// 	encodings: ['gzip', 'deflate'],
	// 	threshold: 1024,
	// });

	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		fastifyAdapter,
	);

	configureApp(app);

	await app.listen(3737, process.env.HOST_APP || '0.0.0.0');
}

bootstrap();
