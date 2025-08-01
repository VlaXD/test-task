import { UserNotificationAction } from './rabbitmq.constants';

export type UserNotificationMessage = {
	action: UserNotificationAction;
	userId?: string;
	userEmail?: string;
	userName?: string;
	userData?: Record<string, any>;
	timestamp: Date;
	service: string;
	success: boolean;
	error?: string;
	metadata?: {
		duration?: number;
		statusCode?: number;
		endpoint?: string;
		method?: string;
		requestId?: string;
	};
};

export type MessageType = UserNotificationMessage;
