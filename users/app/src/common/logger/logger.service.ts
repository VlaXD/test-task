// eslint-disable-next-line
import { Injectable, Logger, Scope } from '@nestjs/common';

export interface LogMessage<Data = Record<string, any>> {
	event?: string;
	message: string;
	context?: string;
	data?: Data;
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService extends Logger {
	constructor(readonly context: string) {
		super(context);
	}

	log(message: LogMessage): void;
	log(message: LogMessage, context?: string): void;
	log(message: LogMessage, context?: string): void {
		if (context) {
			super.log(this.updateMessage(message), context);
		} else {
			super.log(this.updateMessage(message));
		}
	}

	warn(message: LogMessage): void;
	warn(message: LogMessage, context?: string): void;
	warn(message: LogMessage, context?: string): void {
		if (context) {
			super.warn(this.updateMessage(message), context);
		} else {
			super.warn(this.updateMessage(message));
		}
	}

	error(message: LogMessage): void;
	error(message: LogMessage, stack: string): void;
	error(message: LogMessage, stack: string, context?: string): void;
	error(message: LogMessage, stackOrContext?: string, context?: string): void {
		if (typeof stackOrContext === 'string' && context) {
			super.error(this.updateMessage(message), stackOrContext, context);
		} else if (typeof stackOrContext === 'string') {
			super.error(this.updateMessage(message), undefined, stackOrContext);
		} else {
			super.error(this.updateMessage(message));
		}
	}

	debug(message: LogMessage): void;
	debug(message: LogMessage, context?: string): void;
	debug(message: LogMessage, context?: string): void {
		if (context) {
			super.debug(this.updateMessage(message), context);
		} else {
			super.debug(this.updateMessage(message));
		}
	}

	verbose(message: LogMessage): void;
	verbose(message: LogMessage, context?: string): void;
	verbose(message: LogMessage, context?: string): void {
		if (context) {
			super.verbose(this.updateMessage(message), context);
		} else {
			super.verbose(this.updateMessage(message));
		}
	}

	/**
	 * Prevent errors from being thrown in catch blocks due to invalid "any" argument passing.
	 */
	private prepareMessage(message: any): LogMessage {
		if (!this.isLogMessage(message)) {
			return { message };
		}

		return message;
	}

	private isLogMessage(message: any): message is LogMessage {
		return message && typeof message === 'object' && 'message' in message;
	}

	private updateMessage(message: LogMessage): LogMessage {
		const preparedMessage = this.prepareMessage(message);

		if (!preparedMessage.context) {
			// eslint-disable-next-line no-param-reassign
			preparedMessage.context = this.context;
		}

		return preparedMessage;
	}
}
