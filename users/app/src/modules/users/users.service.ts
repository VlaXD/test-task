import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AppLoggerService } from '@app/common/logger/logger.service';
import { IUser } from '@app/common/interfaces/user';
import { getAndLogException } from '@app/common/logger/logger.helper';
import { UpdateResult } from 'mongodb';
import { QueryPaginationRequest } from '@app/common/requests/query-pagination.request';
import { getPaginationParameters } from '@app/common/helpers/get-pagination';
import { UsersRepository } from './users.repository';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
	private readonly logger = new AppLoggerService(UsersService.name);

	constructor(
		private readonly usersRepository: UsersRepository,
	) { }

	async createUser(createUserDto: CreateUserDto): Promise<IUser> {
		try {
			const existingUser = await this.usersRepository.findOne({ email: createUserDto.email });

			if (existingUser) {
				throw new HttpException(
					`User with email ${createUserDto.email} already exists`,
					HttpStatus.CONFLICT,
				);
			}

			return await this.usersRepository.create(createUserDto);
		} catch (error) {
			throw getAndLogException(error, this.logger, { event: 'createUser' });
		}
	}

	async findAll(options: QueryPaginationRequest, projection: (keyof IUser)[]): Promise<IUser[]> {
		try {
			const paginationOptions = getPaginationParameters(options.limit, options.offset);

			return await this.usersRepository.find({}, projection, paginationOptions);
		} catch (error) {
			throw getAndLogException(error, this.logger, { event: 'findAllUsers' });
		}
	}

	async findOne(id: string, projection: (keyof IUser)[]): Promise<IUser> {
		try {
			const user = await this.usersRepository.findOne({ _id: id }, projection);

			if (!user) {
				throw new HttpException('User not found', HttpStatus.NOT_FOUND);
			}

			return user as IUser;
		} catch (error) {
			throw getAndLogException(error, this.logger, { event: 'findOneUser' });
		}
	}

	async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
		try {
			const dbUser = await this.usersRepository.findOne({ _id: id });

			if (!dbUser) {
				throw new HttpException('User not found for update', HttpStatus.NOT_FOUND);
			}

			return await this.usersRepository.updateOne({ _id: id }, updateUserDto);
		} catch (error) {
			throw getAndLogException(error, this.logger, { event: 'updateUser' });
		}
	}

	async deleteUser(id: string): Promise<number> {
		try {
			const user = await this.usersRepository.findOne({ _id: id });

			if (!user) {
				throw new HttpException('User not found for deletion', HttpStatus.NOT_FOUND);
			}

			const result = await this.usersRepository.deleteOne({ _id: id });

			return result.deletedCount;
		} catch (error) {
			throw getAndLogException(error, this.logger, { event: 'deleteUser' });
		}
	}
}
