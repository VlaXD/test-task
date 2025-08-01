import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, MaxLength } from 'class-validator';

export class QueryPaginationRequest {
	@ApiProperty({
		example: 10,
		description: 'Clause to select a limited number of records',
		default: 50,
		maxLength: 100,
		required: false,
	})
	@IsNumberString()
	@IsOptional()
	limit?: string;

	@ApiProperty({
		example: 1,
		description: 'Clause specifies the number of rows to skip before starting to return rows from the query',
		default: 0,
		required: false,
	})
	@IsNumberString()
	@IsOptional()
	offset?: string;
}
