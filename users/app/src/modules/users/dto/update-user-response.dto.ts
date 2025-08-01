import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserResponseDto {
	@ApiProperty({
		description: 'Indicates if the update was acknowledged by the database',
		example: true,
	})
	acknowledged: boolean;

	@ApiProperty({
		description: 'Number of documents matched by the filter',
		example: 1,
		minimum: 0,
	})
	matchedCount: number;

	@ApiProperty({
		description: 'Number of documents modified',
		example: 1,
		minimum: 0,
	})
	modifiedCount: number;

	@ApiProperty({
		description: 'ID of the upserted document (null if no upsert)',
		example: null,
		nullable: true,
	})
	upsertedId: string | null;

	@ApiProperty({
		description: 'Number of documents upserted',
		example: 0,
		minimum: 0,
	})
	upsertedCount: number;
} 
