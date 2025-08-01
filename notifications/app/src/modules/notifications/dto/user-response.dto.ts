import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '@app/common/interfaces/user';

export class UserResponseDto implements IUser {
	@ApiProperty({
		description: 'User ID',
		example: '64f8b1c8e4b0a1234567890a',
	})
	id: string;

	@ApiProperty({
		description: 'User email address',
		example: 'john.doe@example.com',
		format: 'email',
	})
	email: string;

	@ApiProperty({
		description: 'User full name',
		example: 'John Doe',
	})
	name: string;

	@ApiProperty({
		description: 'Date when the user was created',
		example: '2023-09-06T10:30:00.000Z',
		type: 'string',
		format: 'date-time',
	})
	createdAt: Date;

	@ApiProperty({
		description: 'Date when the user was last updated',
		example: '2023-09-06T10:30:00.000Z',
		type: 'string',
		format: 'date-time',
	})
	updatedAt: Date;
} 
