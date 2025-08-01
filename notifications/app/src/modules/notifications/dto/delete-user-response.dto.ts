import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserResponseDto {
	@ApiProperty({
		description: 'Number of deleted users',
		example: 1,
		minimum: 0,
	})
	deletedCount: number;

	@ApiProperty({
		description: 'Success message',
		example: 'User successfully deleted',
	})
	message: string;
} 
