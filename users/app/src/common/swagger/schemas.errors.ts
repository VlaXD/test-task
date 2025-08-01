const INTERNAL_SERVER_ERROR_SCHEMA = {
	type: 'object',
	properties: {
		statusCode: { type: 'number', example: 500 },
		message: { type: 'string', example: 'Internal server error' },
		error: { type: 'string', example: 'Internal Server Error' },
	},
};

const BAD_REQUEST_SCHEMA = {
	type: 'object',
	properties: {
		statusCode: { type: 'number', example: 400 },
		message: { type: 'string', example: 'Invalid ID format' },
		error: { type: 'string', example: 'Bad Request' },
	},
};

const NOT_FOUND_SCHEMA = {
	type: 'object',
	properties: {
		statusCode: { type: 'number', example: 404 },
		message: { type: 'string', example: 'User not found' },
		error: { type: 'string', example: 'Not Found' },
	},
};

export { INTERNAL_SERVER_ERROR_SCHEMA, BAD_REQUEST_SCHEMA, NOT_FOUND_SCHEMA };
