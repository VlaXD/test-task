import { Injectable } from '@nestjs/common';
import { HealthService } from '@app/modules/health/health.service';

@Injectable()
export class AppService {
	constructor(private readonly healthService: HealthService) { }

	async healthy(): Promise<string> {
		return this.healthService.check();
	}

	ping(): string {
		return this.healthService.ping();
	}
}
