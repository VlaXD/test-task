import { Body, Controller, Delete, Get, Param, Post, Put, HttpStatus, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiParam, ApiBadRequestResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse, ApiCreatedResponse, ApiOkResponse, ApiConflictResponse } from '@nestjs/swagger';
import { BAD_REQUEST_SCHEMA, INTERNAL_SERVER_ERROR_SCHEMA, NOT_FOUND_SCHEMA } from '@app/common/swagger/schemas.errors';
import { UserNotificationAction } from '@app/common/modules/rabbitmq/rabbitmq.constants';
import { UseUserNotificationInterceptor } from '@app/common/interceptors/user-notification.interceptor';
import { IUser } from '@app/common/interfaces/user';
import { QueryPaginationRequest } from '@app/common/requests/query-pagination.request';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UpdateUserResponseDto } from './dto';

export interface IUsersController {
	create(user: CreateUserDto): Promise<UserResponseDto>;
	findAll(query: QueryPaginationRequest, projection: (keyof IUser)[]): Promise<UserResponseDto[]>;
	findOne(id: string, projection: (keyof IUser)[]): Promise<UserResponseDto>;
	update(id: string, user: UpdateUserDto): Promise<UpdateUserResponseDto>;
	delete(id: string): Promise<{ deletedCount: number; message: string }>;
}

@ApiTags('Users')
@Controller('users')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UsersController implements IUsersController {
	constructor(private readonly usersService: UsersService) { }

	@Post()
	@UseUserNotificationInterceptor({
		successAction: UserNotificationAction.USER_CREATED,
		errorAction: UserNotificationAction.USER_CREATION_FAILED,
		includeUserData: true,
		includeRequestBody: true,
	})
	@ApiOperation({
		summary: 'Create a new user',
		description: 'Creates a new user with the provided email and name. Email must be unique. Sends notification to RabbitMQ on success/failure.',
	})
	@ApiCreatedResponse({
		status: HttpStatus.CREATED,
		description: 'The user has been successfully created.',
		type: UserResponseDto,
	})
	@ApiBadRequestResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Validation failed. Check the request body.',
		schema: BAD_REQUEST_SCHEMA,
	})
	@ApiConflictResponse({
		status: HttpStatus.CONFLICT,
		description: 'A user with this email already exists.',
	})
	@ApiInternalServerErrorResponse({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		description: 'Internal server error occurred.',
		schema: INTERNAL_SERVER_ERROR_SCHEMA,
	})
	async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
		const user = await this.usersService.createUser(createUserDto);
		return user as UserResponseDto;
	}

	@Get()
	@ApiOperation({
		summary: 'Get all users',
		description: 'Retrieves a list of all users in the system. This operation reads from secondary database replicas when available.',
	})
	@ApiOkResponse({
		status: HttpStatus.OK,
		description: 'Successfully retrieved all users.',
		type: [UserResponseDto],
	})
	@ApiInternalServerErrorResponse({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		description: 'Internal server error occurred while retrieving users.',
		schema: INTERNAL_SERVER_ERROR_SCHEMA,
	})
	async findAll(@Query() query: QueryPaginationRequest, @Query('projection') projection: (keyof IUser)[]): Promise<UserResponseDto[]> {
		const users = await this.usersService.findAll(query, projection);
		return users as UserResponseDto[];
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a user by ID',
		description: 'Retrieves a specific user by their unique identifier. This operation reads from secondary database replicas when available.',
	})
	@ApiParam({
		name: 'id',
		description: 'Unique identifier of the user',
		type: 'string',
		format: 'uuid',
		example: '64f8b1c8e4b0a1234567890a',
	})
	@ApiOkResponse({
		status: HttpStatus.OK,
		description: 'Successfully retrieved the user.',
		type: UserResponseDto,
	})
	@ApiNotFoundResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'User with the specified ID was not found for get.',
		schema: NOT_FOUND_SCHEMA,
	})
	@ApiBadRequestResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid user ID format.',
		schema: BAD_REQUEST_SCHEMA,
	})
	async findOne(@Param('id') id: string, @Query('projection') projection: (keyof IUser)[]): Promise<UserResponseDto> {
		const user = await this.usersService.findOne(id, projection);
		return user as UserResponseDto;
	}

	@Put(':id')
	@UseUserNotificationInterceptor({
		successAction: UserNotificationAction.USER_UPDATED,
		errorAction: UserNotificationAction.USER_UPDATE_FAILED,
		includeUserData: false,
		includeRequestBody: true,
	})
	@ApiOperation({
		summary: 'Update a user by ID',
		description: 'Updates an existing user with the provided data. Only provided fields will be updated. This operation writes to the primary database. Sends notification on success/failure.',
	})
	@ApiParam({
		name: 'id',
		description: 'Unique identifier of the user to update',
		type: 'string',
		format: 'uuid',
		example: '64f8b1c8e4b0a1234567890a',
	})
	@ApiOkResponse({
		status: HttpStatus.OK,
		description: 'Successfully updated the user.',
		type: UpdateUserResponseDto,
	})
	@ApiNotFoundResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'User with the specified ID was not found for update.',
		schema: NOT_FOUND_SCHEMA,
	})
	@ApiBadRequestResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Validation failed or invalid user ID format.',
		schema: BAD_REQUEST_SCHEMA,
	})
	async update(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<UpdateUserResponseDto> {
		const result = await this.usersService.updateUser(id, updateUserDto);
		return result as UpdateUserResponseDto;
	}

	@Delete(':id')
	@UseUserNotificationInterceptor({
		successAction: UserNotificationAction.USER_DELETED,
		errorAction: UserNotificationAction.USER_DELETE_FAILED,
		includeUserData: false,
		includeRequestBody: false,
	})
	@ApiOperation({
		summary: 'Delete a user by ID',
		description: 'Permanently deletes a user from the system. This operation cannot be undone and writes to the primary database. Sends notification on success/failure.',
	})
	@ApiParam({
		name: 'id',
		description: 'Unique identifier of the user to delete',
		type: 'string',
		format: 'uuid',
		example: '64f8b1c8e4b0a1234567890a',
	})
	@ApiOkResponse({
		status: HttpStatus.OK,
		description: 'Successfully deleted the user.',
		schema: {
			type: 'object',
			properties: {
				deletedCount: { type: 'number', example: 1 },
				message: { type: 'string', example: 'User successfully deleted' },
			},
		},
	})
	@ApiNotFoundResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'User with the specified ID was not found for delete.',
		schema: NOT_FOUND_SCHEMA,
	})
	@ApiBadRequestResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid user ID format.',
		schema: BAD_REQUEST_SCHEMA,
	})
	async delete(@Param('id') id: string): Promise<{ deletedCount: number; message: string }> {
		const deletedCount = await this.usersService.deleteUser(id);
		return {
			deletedCount,
			message: 'User successfully deleted',
		};
	}
}
