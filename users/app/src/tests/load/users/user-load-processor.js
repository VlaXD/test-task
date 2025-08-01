/**
 * Processor script for user load testing
 * This generates random user data for creating and finding users during load testing
 */

const usedEmails = new Set();
const MAX_USER_ID = 1000000;

const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa', 'Robert', 'Maria'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

/**
 * Generates random user data for creating a new user
 * 
 * @param {Object} userContext - The current user context
 * @param {Object} events - Artillery events
 * @param {Function} done - Callback function
 */
function generateUserData(userContext, events, done) {
	// Generate random name components
	const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
	const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
	const fullName = `${firstName} ${lastName}`;
	
	// Generate unique email
	const emailDomain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
	const randomNumber = Math.floor(Math.random() * 10000);
	const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
	let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${randomNumber}.${timestamp}@${emailDomain}`;
	
	// Ensure email uniqueness (unlikely with timestamp, but good practice)
	while (usedEmails.has(email)) {
		const newRandomNumber = Math.floor(Math.random() * 10000);
		email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${newRandomNumber}.${Date.now().toString().slice(-6)}@${emailDomain}`;
	}
	
	// Add to used set
	usedEmails.add(email);
	
	// Clear set if it gets too large to prevent memory issues
	if (usedEmails.size > 10000) {
		usedEmails.clear();
	}
	
	// Generate user ID for finding operations
	const userId = Math.floor(Math.random() * MAX_USER_ID) + 1;
	
	// Initialize vars if not exists and store values
	if (!userContext.vars) {
		userContext.vars = {};
	}
	
	const {vars} = userContext;
	vars.user_email = email;
	vars.user_name = fullName;
	vars.user_id = userId.toString();
	vars.created_at = new Date().toISOString();
	
	// Generate additional metadata for testing
	vars.metadata = {
		source: ['web', 'mobile', 'api'][Math.floor(Math.random() * 3)],
		testRun: `load-test-${Date.now()}`,
		userAgent: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
		timestamp: Date.now()
	};
	
	return done();
}

/**
 * Generates a random existing user ID for read operations
 * This assumes users with IDs 1-1000 exist in the database
 * 
 * @param {Object} userContext - The current user context
 * @param {Object} events - Artillery events
 * @param {Function} done - Callback function
 */
function generateExistingUserId(userContext, events, done) {
	// Generate a random user ID from a smaller range (assuming these users exist)
	const existingUserId = Math.floor(Math.random() * 1000) + 1;
	
	// Initialize vars if not exists
	if (!userContext.vars) {
		userContext.vars = {};
	}
	
	const {vars} = userContext;
	vars.existing_user_id = existingUserId.toString();
	
	return done();
}

/**
 * Stores created user ID for subsequent operations
 * 
 * @param {Object} requestParams - Request parameters
 * @param {Object} response - Response object
 * @param {Object} context - User context
 * @param {Object} ee - Event emitter
 * @param {Function} next - Callback function
 */
function storeCreatedUserId(requestParams, response, context, ee, next) {
	// Initialize vars if not exists
	if (!context.vars) {
		context.vars = {};
	}
	
	let userId = null;
	
	// Try different ways to get the user ID from response
	if (response.body) {
		// Parse JSON response if it's a string
		let parsedBody = response.body;
		if (typeof response.body === 'string') {
			try {
				parsedBody = JSON.parse(response.body);
			} catch (e) {
				// If parsing fails, body might already be parsed
				parsedBody = response.body;
			}
		}
		
		// Get user ID from parsed body
		if (parsedBody && parsedBody._id) {
			userId = parsedBody._id;
		}
	}
	
	// Fallback: try response.json if available
	if (!userId && response.json && response.json._id) {
		userId = response.json._id;
	}
	
	// Store the user ID if found
	if (userId) {
		context.vars.created_user_id = userId;
	} else {
		// Debug: log when we can't find the user ID
		console.log('Warning: Could not extract user ID from response:', {
			hasBody: !!response.body,
			bodyType: typeof response.body,
			hasJson: !!response.json,
			responseKeys: Object.keys(response)
		});
	}
	
	return next();
}

module.exports = {
	generateUserData,
	generateExistingUserId,
	storeCreatedUserId
}; 
