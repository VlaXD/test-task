import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
	@ApiPropertyOptional({
		description: 'User email address',
		example: 'john.doe@example.com',
		format: 'email',
	})
	@IsOptional()
	@IsEmail({}, { message: 'Please provide a valid email address' })
	email?: string;

	@ApiPropertyOptional({
		description: 'User full name',
		example: 'John Doe',
		minLength: 2,
	})
	@IsOptional()
	@IsString({ message: 'Name must be a string' })
	@MinLength(2, { message: 'Name must be at least 2 characters long' })
	name?: string;
} 
