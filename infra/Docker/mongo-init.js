db = db.getSiblingDB('admin');
db.auth('root', 'example');

['users', 'notifications'].forEach((database) => {
	db = db.getSiblingDB(database);
	db.createUser(
		{
			user: 'admin',
			pwd: 'password',
			roles: [{ role: 'dbOwner', db: database }]
		}
	);
});