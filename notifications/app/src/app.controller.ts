import { Controller, Get } from '@nestjs/common';
import { AppLoggerService } from '@app/common/logger/logger.service';
import { AppService } from '@app/app.service';

@Controller()
export class AppController {
	private readonly logger = new AppLoggerService(AppController.name);

	constructor(
		private readonly appService: AppService,
	) { }

	@Get('/healthy')
	async healthyGet(): Promise<string> {
		return this.appService.healthy();
	}

	@Get('/ping')
	ping(): string {
		return this.appService.ping();
	}
}
