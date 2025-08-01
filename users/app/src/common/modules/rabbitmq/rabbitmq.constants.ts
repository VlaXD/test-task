export const NOTIFICATION_EXCHANGE = 'notification_exchange';

export const NOTIFICATION_ROUTING_KEY = 'notification.create';
export const NOTIFICATION_QUEUE = 'notification_create_queue';

export const NOTIFICATION_ERROR_ROUTING_KEY = 'notification.error';
export const NOTIFICATION_ERROR_QUEUE = 'notification_error_queue';

// Dead Letter Exchange constants
export const NOTIFICATION_DLX_EXCHANGE = 'notification_dlx_exchange';
export const NOTIFICATION_DLX_QUEUE = 'notification_dlx_queue';
export const NOTIFICATION_DLX_ROUTING_KEY = 'notification.dlx';

export const NOTIFICATION_ERROR_DLX_QUEUE = 'notification_error_dlx_queue';
export const NOTIFICATION_ERROR_DLX_ROUTING_KEY = 'notification.error.dlx';

export enum UserNotificationAction {
	USER_CREATED = 'USER_CREATED',
	USER_UPDATED = 'USER_UPDATED',
	USER_DELETED = 'USER_DELETED',
	USER_CREATION_FAILED = 'USER_CREATION_FAILED',
	USER_UPDATE_FAILED = 'USER_UPDATE_FAILED',
	USER_DELETE_FAILED = 'USER_DELETE_FAILED',
}
