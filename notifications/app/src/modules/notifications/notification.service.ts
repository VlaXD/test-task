import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '@app/common/logger/logger.service';
import { UserNotificationAction } from '@app/common/modules/rabbitmq/rabbitmq.constants';
import { UserNotificationMessage } from '@app/common/modules/rabbitmq/rabbitmq.types';
import { EmailsExternalService } from '@app/common/external-services/notifications/emails.external.service';

@Injectable()
export class NotificationService {
	private readonly logger = new AppLoggerService(NotificationService.name);

	constructor(
		private readonly emailsExternalService: EmailsExternalService,
	) { }

	async processUserNotification(message: UserNotificationMessage): Promise<void> {
		this.logger.log({
			message: 'Processing user notification',
			data: {
				action: message.action,
				userId: message.userId,
				userEmail: message.userEmail,
				success: message.success,
				service: message.service,
			},
		});

		try {
			switch (message.action) {
			case UserNotificationAction.USER_CREATED:
				await this._handleUserCreated(message);
				break;
			case UserNotificationAction.USER_UPDATED:
				await this._handleUserUpdated(message);
				break;
			case UserNotificationAction.USER_DELETED:
				await this._handleUserDeleted(message);
				break;
			case UserNotificationAction.USER_CREATION_FAILED:
			case UserNotificationAction.USER_UPDATE_FAILED:
			case UserNotificationAction.USER_DELETE_FAILED:
				await this._handleUserActionFailed(message);
				break;
			default:
				this.logger.warn({
					message: 'Unknown user notification action',
					data: { action: message.action },
				});
			}
		} catch (error) {
			this.logger.error({
				message: 'Error processing user notification',
				data: {
					action: message.action,
					userId: message.userId,
					error: error.message,
					stack: error.stack,
				},
			});
			throw error;
		}
	}

	async processErrorNotification(message: UserNotificationMessage): Promise<void> {
		this.logger.error({
			message: 'Processing error notification',
			data: {
				action: message.action,
				error: message.error,
				metadata: message.metadata,
			},
		});

		// could send to monitoring systems, create alerts, etc.
	}

	private async _handleUserCreated(message: UserNotificationMessage): Promise<void> {
		this.logger.log({
			message: 'Processing user created notification',
			data: {
				userId: message.userId,
				userEmail: message.userEmail,
				userName: message.userName,
			},
		});

		await this._sendWelcomeEmail(message);
		// await this.updateUserAnalytics(message);
		// await this.notifyExternalSystems(message);
	}

	private async _handleUserUpdated(message: UserNotificationMessage): Promise<void> {
		this.logger.log({
			message: 'Processing user updated notification',
			data: {
				userId: message.userId,
				userEmail: message.userEmail,
				userName: message.userName,
			},
		});

		// await this._syncWithExternalSystems(message);
		// await this._invalidateUserCache(message);
		// await this._updateSearchIndex(message);
	}

	private async _handleUserDeleted(message: UserNotificationMessage): Promise<void> {
		this.logger.log({
			message: 'Processing user deleted notification',
			data: {
				userId: message.userId,
				userEmail: message.userEmail,
			},
		});

		// await this._cleanupUserData(message);
		// await this._removeFromExternalSystems(message);
		// await this._cancelUserSubscriptions(message);
	}

	private async _handleUserActionFailed(message: UserNotificationMessage): Promise<void> {
		this.logger.error({
			message: 'Processing user action failed notification',
			data: {
				action: message.action,
				userEmail: message.userEmail,
				error: message.error,
				metadata: message.metadata,
			},
		});

		// await this._sendFailureAlert(message);
		// await this._logToErrorTracking(message);
		// await this._createSupportTicket(message);
	}

	private async _sendWelcomeEmail(message: UserNotificationMessage): Promise<void> {
		this.logger.log({
			message: 'Sending welcome email',
			data: { userEmail: message.userEmail },
		});

		await this.emailsExternalService.sendWelcomeEmail({
			userId: message.userId,
			userEmail: message.userEmail,
			userName: message.userName,
		});
	}
}
