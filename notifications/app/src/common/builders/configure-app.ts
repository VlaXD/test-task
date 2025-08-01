import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from '@app/common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const configureApp = (app: INestApplication): INestApplication => {
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		}),
	);
	app.useLogger(app.get(Logger));
	app.useGlobalFilters(new AllExceptionsFilter());

	const config = new DocumentBuilder()
		.setTitle('Bot Users API')
		.setDescription('The Bot Users API documentation')
		.setVersion('1.0')
		.addTag('Users', 'User management endpoints')
		.addTag('Health', 'Health check endpoints')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document, {
		customSiteTitle: 'Bot Users API Documentation',
		customCss: '.swagger-ui .topbar { display: none }',
		swaggerOptions: {
			persistAuthorization: true,
			displayRequestDuration: true,
		},
	});

	return app;
};
