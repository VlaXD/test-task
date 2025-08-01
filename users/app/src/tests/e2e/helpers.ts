import { INestApplication } from '@nestjs/common';
import { USERS_ROUTE } from '@app/tests/constants/routes';
import * as request from 'supertest';
import { getRandomInt } from '@app/common/helpers/get-random-int';

export const createUser = async (
	app: INestApplication, userId = getRandomInt(),
) =>
	request(app.getHttpServer())
		.post(USERS_ROUTE)
		.send({ user: userId });

