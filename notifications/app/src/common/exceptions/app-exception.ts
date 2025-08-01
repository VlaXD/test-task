import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppExceptionOptions {
	errorCode: string;
	message: string;
	translationCode?: string;
	status?: HttpStatus;
	error?: string;
}

export class AppException extends HttpException {
	private readonly errorCode: string;
	private readonly messageText: string;
	private readonly translationCode?: string;
	private readonly error?: string;

	constructor(options: AppExceptionOptions) {
		const {
			errorCode,
			message,
			translationCode,
			error,
			status = HttpStatus.INTERNAL_SERVER_ERROR,
		} = options;

		super(
			{
				status,
				errorCode,
				message,
				translationCode,
				error: error || message,
			},
			status,
		);

		this.error = error;
		this.errorCode = errorCode;
		this.messageText = message;
		this.translationCode = translationCode;
	}

	getOriginalMessage(): string {
		return this.messageText;
	}

	getErrorCode(): string {
		return this.errorCode;
	}

	getTranslationCode(): string | undefined {
		return this.translationCode;
	}

	getError(): string | undefined {
		return this.error;
	}
}
