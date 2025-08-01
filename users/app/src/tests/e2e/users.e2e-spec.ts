import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@app/app.module';
import * as request from 'supertest';
import { USERS_ROUTE } from '@app/tests/constants/routes';
import { configureApp } from '@app/common/builders/configure-app';
import { getRandomInt } from '@app/common/helpers/get-random-int';

const BASE_PATH = USERS_ROUTE;

describe('UsersController (e2e)', () => {
	let app: INestApplication;
	let createdUserId: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();

		app = moduleFixture.createNestApplication();
		configureApp(app);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	describe('/users (POST)', () => {
		it('should create a user successfully', async () => {
			const mockEmail = `test${getRandomInt()}@example.com`;
			const mockName = 'John Doe';
			
			const response = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: mockEmail, name: mockName });

			const { body } = response;
			expect(response.status).toBe(HttpStatus.CREATED);
			expect(body).toHaveProperty('email', mockEmail);
			expect(body).toHaveProperty('name', mockName);
			expect(body).toHaveProperty('createdAt');
			expect(body).toHaveProperty('updatedAt');
			expect(body).toHaveProperty('id');
			
			// Store the created user ID for later tests
			createdUserId = body.id;
		});

		it('should fail to create user without email', async () => {
			const response = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ name: 'John Doe' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
			expect(response.body).toHaveProperty('errorCode', 'Bad Request');
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('Email is required');
		});

		it('should fail to create user without name', async () => {
			const response = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: 'test@example.com' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
			expect(response.body).toHaveProperty('errorCode', 'Bad Request');
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('Name is required');
		});

		it('should fail to create user with invalid email format', async () => {
			const response = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: 'invalid-email', name: 'John Doe' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
			expect(response.body).toHaveProperty('errorCode', 'Bad Request');
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('Please provide a valid email address');
		});

		it('should fail to create user with name too short', async () => {
			const response = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: 'test@example.com', name: 'A' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
			expect(response.body).toHaveProperty('errorCode', 'Bad Request');
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('Name must be at least 2 characters long');
		});

		it('should fail to create user with duplicate email', async () => {
			const mockEmail = `duplicate${getRandomInt()}@example.com`;
			
			await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: mockEmail, name: 'First User' });

			const response = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: mockEmail, name: 'Second User' });

			expect(response.status).toBe(HttpStatus.CONFLICT);
		});
	});

	describe('/users (GET)', () => {
		it('should get all users', async () => {
			const response = await request(app.getHttpServer())
				.get(BASE_PATH);

			expect(response.status).toBe(HttpStatus.OK);
			expect(Array.isArray(response.body)).toBe(true);
			
			if (response.body.length > 0) {
				const user = response.body[0];
				expect(user).toHaveProperty('id');
				expect(user).toHaveProperty('email');
				expect(user).toHaveProperty('name');
				expect(user).toHaveProperty('createdAt');
				expect(user).toHaveProperty('updatedAt');
			}
		});

		it('should get all users with pagination', async () => {
			const response = await request(app.getHttpServer())
				.get(`${BASE_PATH}?page=1&limit=10`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(Array.isArray(response.body)).toBe(true);
		});

		it('should get all users with projection', async () => {
			const response = await request(app.getHttpServer())
				.get(`${BASE_PATH}?projection=email,name`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(Array.isArray(response.body)).toBe(true);
			
			if (response.body.length > 0) {
				const user = response.body[0];
				expect(user).toHaveProperty('email');
				expect(user).toHaveProperty('name');
				// Should not have other properties when projection is used
				expect(user).not.toHaveProperty('createdAt');
				expect(user).not.toHaveProperty('updatedAt');
			}
		});
	});

	describe('/users/:id (GET)', () => {
		it('should get a user by ID', async () => {
			const createResponse = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: `get${getRandomInt()}@example.com`, name: 'Get User' });

			const userId = createResponse.body.id;

			const response = await request(app.getHttpServer())
				.get(`${BASE_PATH}/${userId}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('id', userId);
			expect(response.body).toHaveProperty('email');
			expect(response.body).toHaveProperty('name');
			expect(response.body).toHaveProperty('createdAt');
			expect(response.body).toHaveProperty('updatedAt');
		});

		it('should get a user by ID with projection', async () => {
			const createResponse = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: `projection${getRandomInt()}@example.com`, name: 'Projection User' });

			const userId = createResponse.body.id;

			const response = await request(app.getHttpServer())
				.get(`${BASE_PATH}/${userId}?projection=email,name`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('id', userId);
			expect(response.body).toHaveProperty('email');
			expect(response.body).toHaveProperty('name');
			// Should not have other properties when projection is used
			expect(response.body).not.toHaveProperty('createdAt');
			expect(response.body).not.toHaveProperty('updatedAt');
		});

		it('should return 404 for non-existent user ID', async () => {
			const fakeId = '64f8b1c8e4b0a1234567890a'; // Valid ObjectId format but non-existent
			
			const response = await request(app.getHttpServer())
				.get(`${BASE_PATH}/${fakeId}`);

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
			expect(response.body).toHaveProperty('errorCode', 'Not Found');
		});

		it('should return 400 for invalid user ID format', async () => {
			const invalidId = 'invalid-id';
			
			const response = await request(app.getHttpServer())
				.get(`${BASE_PATH}/${invalidId}`);

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
			expect(response.body).toHaveProperty('errorCode', 'Bad Request');
		});
	});

	describe('/users/:id (PUT)', () => {
		it('should update a user successfully', async () => {
			const createResponse = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: `update${getRandomInt()}@example.com`, name: 'Original Name' });

			const userId = createResponse.body.id;
			const newName = 'Updated Name';

			const response = await request(app.getHttpServer())
				.put(`${BASE_PATH}/${userId}`)
				.send({ name: newName });

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('id', userId);
			expect(response.body).toHaveProperty('name', newName);
			expect(response.body).toHaveProperty('email');
			expect(response.body).toHaveProperty('createdAt');
			expect(response.body).toHaveProperty('updatedAt');
		});

		it('should update user email successfully', async () => {
			const createResponse = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: `emailupdate${getRandomInt()}@example.com`, name: 'Email Update User' });

			const userId = createResponse.body.id;
			const newEmail = `newemail${getRandomInt()}@example.com`;

			const response = await request(app.getHttpServer())
				.put(`${BASE_PATH}/${userId}`)
				.send({ email: newEmail });

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('id', userId);
			expect(response.body).toHaveProperty('email', newEmail);
			expect(response.body).toHaveProperty('name');
		});

		it('should update both email and name successfully', async () => {
			const createResponse = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: `bothupdate${getRandomInt()}@example.com`, name: 'Original Name' });

			const userId = createResponse.body.id;
			const newEmail = `newboth${getRandomInt()}@example.com`;
			const newName = 'Updated Both Name';

			const response = await request(app.getHttpServer())
				.put(`${BASE_PATH}/${userId}`)
				.send({ email: newEmail, name: newName });

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('id', userId);
			expect(response.body).toHaveProperty('email', newEmail);
			expect(response.body).toHaveProperty('name', newName);
		});

		it('should return 404 for non-existent user ID on update', async () => {
			const fakeId = '64f8b1c8e4b0a1234567890a';
			
			const response = await request(app.getHttpServer())
				.put(`${BASE_PATH}/${fakeId}`)
				.send({ name: 'Updated Name' });

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
			expect(response.body).toHaveProperty('errorCode', 'Not Found');
		});

		it('should return 400 for invalid email format on update', async () => {
			const createResponse = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: `invalidupdate${getRandomInt()}@example.com`, name: 'Invalid Update User' });

			const userId = createResponse.body.id;

			const response = await request(app.getHttpServer())
				.put(`${BASE_PATH}/${userId}`)
				.send({ email: 'invalid-email' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
			expect(response.body).toHaveProperty('errorCode', 'Bad Request');
			expect(response.body.message).toContain('Please provide a valid email address');
		});

		it('should return 400 for name too short on update', async () => {
			const createResponse = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: `shortname${getRandomInt()}@example.com`, name: 'Short Name User' });

			const userId = createResponse.body.id;

			const response = await request(app.getHttpServer())
				.put(`${BASE_PATH}/${userId}`)
				.send({ name: 'A' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
			expect(response.body).toHaveProperty('errorCode', 'Bad Request');
			expect(response.body.message).toContain('Name must be at least 2 characters long');
		});
	});

	describe('/users/:id (DELETE)', () => {
		it('should delete a user successfully', async () => {
			const createResponse = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: `delete${getRandomInt()}@example.com`, name: 'Delete User' });

			const userId = createResponse.body.id;

			const response = await request(app.getHttpServer())
				.delete(`${BASE_PATH}/${userId}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('deletedCount', 1);
			expect(response.body).toHaveProperty('message', 'User successfully deleted');
		});

		it('should return 404 for non-existent user ID on delete', async () => {
			const fakeId = '64f8b1c8e4b0a1234567890a';
			
			const response = await request(app.getHttpServer())
				.delete(`${BASE_PATH}/${fakeId}`);

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
			expect(response.body).toHaveProperty('errorCode', 'Not Found');
		});

		it('should return 400 for invalid user ID format on delete', async () => {
			const invalidId = 'invalid-id';
			
			const response = await request(app.getHttpServer())
				.delete(`${BASE_PATH}/${invalidId}`);

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
			expect(response.body).toHaveProperty('errorCode', 'Bad Request');
		});

		it('should verify user is actually deleted', async () => {
			const createResponse = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({ email: `verifydelete${getRandomInt()}@example.com`, name: 'Verify Delete User' });

			const userId = createResponse.body.id;

			await request(app.getHttpServer())
				.delete(`${BASE_PATH}/${userId}`);

			const getResponse = await request(app.getHttpServer())
				.get(`${BASE_PATH}/${userId}`);

			expect(getResponse.status).toBe(HttpStatus.NOT_FOUND);
		});
	});
}); 