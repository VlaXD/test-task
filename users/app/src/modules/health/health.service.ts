import { Injectable,
	HttpException,
	HttpStatus,
	OnModuleInit } from '@nestjs/common';
import { HttpHealthIndicator } from '@nestjs/terminus';
import { Observable, from, firstValueFrom, forkJoin } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { RabbitMQService } from '@app/common/modules/rabbitmq/rabbitmq.service';
import { requiredEnvs } from '@app/modules/health/health.constants';
import { HealthCheckInstance } from '@app/modules/health/health.types';
import { AppLoggerService } from '@app/common/logger/logger.service';

@Injectable()
export class HealthService implements OnModuleInit {
	private instancesUrls: HealthCheckInstance[] = [];
	private readonly logger = new AppLoggerService(HealthService.name);

	constructor(
		private readonly http: HttpHealthIndicator,
		private readonly rabbitMQService: RabbitMQService,
	) { }

	onModuleInit(): void {
		// @TODO: Add urls
		this.instancesUrls = [];
	}

	async check(): Promise<string> {
		if (this.instancesUrls.length) {
			await firstValueFrom(
				this.checkMicroservicesReachability(this.instancesUrls),
			);
		}

		this.rabbitMQService.checkIsReachable();
		this.validateEnvs();

		return 'OK';
	}

	ping(): string {
		return 'OK';
	}

	private validateEnvs(): void {
		const missingEnvs: string[] = requiredEnvs.filter(
			(env) => !process.env[env],
		);

		if (missingEnvs.length) {
			throw new HttpException(
				`Missing required environment variables: ${missingEnvs.join(', ')}`,
				HttpStatus.SERVICE_UNAVAILABLE,
			);
		}
	}

	private checkMicroservicesReachability(
		instancesUrls: HealthCheckInstance[],
	): Observable<any> {
		const healthChecksObservables = instancesUrls.map(({ name, url }) =>
			from(this.http.pingCheck(name, url)).pipe(
				retry(3),
				map(() => ({ status: 'up', name, url })),
				catchError((err) => {
					this.logger.error({
						message: `Health check failed for ${name}`,
						data: {
							error: err.message,
							stack: err.stack,
						},
					});

					return [{ status: 'down', name, url }];
				}),
			),
		);

		return forkJoin(healthChecksObservables).pipe(
			map((results) => {
				const failedServices = results.filter(
					(res) => res.status === 'down',
				);

				if (failedServices.length) {
					this.logger.error({
						message:
							'Health check failed for the following service(s)',
						data: { failedServices },
					});

					failedServices.forEach((failedService) => {
						this.logger.error({
							message: `- ${failedService.name}: ${failedService.url}`,
							data: {
								name: failedService.name,
								url: failedService.url,
							},
						});
					});

					throw new HttpException(
						`Service(s) Unavailable: ${failedServices.map((service) => service.name).join(', ')}`,
						HttpStatus.SERVICE_UNAVAILABLE,
					);
				}

				results.forEach((result) => {
					if (result.status === 'up') {
						this.logger.log({
							message: `Health check for ${result.name} is OK!`,
							data: {
								name: result.name,
								url: result.url,
							},
						});
					}
				});
			}),
			catchError((error) => {
				this.logger.error({
					message: 'Health check failed',
					data: { error: error.response, stack: error.stack },
				});

				throw new HttpException(
					{
						error: `Health check failed: ${error.response}`,
						message: `Health check failed: ${error.response}`,
					},
					HttpStatus.SERVICE_UNAVAILABLE,
				);
			}),
		);
	}
}
