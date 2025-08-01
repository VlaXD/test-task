import { getAndLogException } from '@app/common/logger/logger.helper';
import { AppLoggerService } from '@app/common/logger/logger.service';
import { HttpService } from '@app/common/modules/http/httpService';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserCreatedEvent } from './types/user-created-event';

@Injectable()
export class EmailsExternalService {
	private readonly logger = new AppLoggerService(
		EmailsExternalService.name,
	);
	private readonly emailsBaseUrl: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
	) {
		this.emailsBaseUrl = this.configService.getOrThrow(
			'EMAILS_BASE_URL',
		);
	}

	async sendWelcomeEmail(params: UserCreatedEvent) {
		const url = `${this.emailsBaseUrl}/events/user-created`;

		try {
			// return await this.httpService.post(url, params);
			this.logger.log({
				message: `Welcome email sent to ${params.userEmail}`,
				data: { params, url },
			});


		} catch (error) {
			throw getAndLogException(error, this.logger);
		}
	}
}
