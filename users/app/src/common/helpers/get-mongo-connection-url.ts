export type MongoConnectionUrlParams = {
	MONGO_USER: string;
	MONGO_PASSWORD: string;
	MONGO_HOST: string;
	MONGO_PORT: string;
	MONGO_DB: string;
	MONGO_REPLICA_SET?: string;
	MONGO_READ_HOSTS?: string;
	MONGO_READ_PORTS?: string;
	MONGO_READ_PREFERENCE?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
};

export const getMongoConnectionUrl = (params: MongoConnectionUrlParams): string => {
	const {
		MONGO_USER,
		MONGO_PASSWORD,
		MONGO_HOST,
		MONGO_PORT,
		MONGO_DB,
		MONGO_REPLICA_SET,
		MONGO_READ_HOSTS,
		MONGO_READ_PORTS,
		MONGO_READ_PREFERENCE = 'primaryPreferred',
	} = params;

	let hosts = `${MONGO_HOST}:${MONGO_PORT}`;

	if (MONGO_READ_HOSTS && MONGO_READ_PORTS) {
		const readHosts = MONGO_READ_HOSTS.split(',');
		const readPorts = MONGO_READ_PORTS.split(',');

		readHosts.forEach((host, index) => {
			const port = readPorts[index] || MONGO_PORT;
			hosts += `,${host.trim()}:${port.trim()}`;
		});
	}

	let uri = `mongodb://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASSWORD)}@${hosts}/${MONGO_DB}`;

	const options: string[] = [];

	if (MONGO_REPLICA_SET) {
		options.push(`replicaSet=${MONGO_REPLICA_SET}`);
	}

	options.push(`readPreference=${MONGO_READ_PREFERENCE}`);

	options.push('maxPoolSize=20');
	options.push('minPoolSize=5');
	options.push('maxIdleTimeMS=30000');
	options.push('serverSelectionTimeoutMS=5000');
	options.push('socketTimeoutMS=45000');
	options.push('family=4');

	if (options.length > 0) {
		uri += `?${options.join('&')}`;
	}

	return uri;
};
