export type RMQConnectionUriParams = {
	host: string;
	port: number;
	username?: string;
	password?: string;
	vhost?: string;
};

export const getRMQConnectionUri = (params: RMQConnectionUriParams): string => {
	const {
		host, port, username, password, vhost,
	} = params;

	let uri = 'amqp://';

	if (username && password) {
		uri += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
	}

	uri += `${host}:${port}`;

	if (vhost && vhost !== '/') {
		uri += `/${encodeURIComponent(vhost)}`;
	}

	return uri;
};
