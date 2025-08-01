import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AbstractRepository } from '@app/common/classes/abstract-repository';
import { IUser } from '@app/common/interfaces/user';
import { UserDocument } from '@app/common/schemas/user.schema';
import { WRITE_DB_CONNECTION, READ_DB_CONNECTION } from '@app/common/modules/mongodb/mongodb.module';

@Injectable()
export class UsersRepository extends AbstractRepository<UserDocument, IUser> {
	constructor(
		@InjectModel(UserDocument.name, WRITE_DB_CONNECTION)
		protected writeRepository: Model<UserDocument>,
		@InjectModel(UserDocument.name, READ_DB_CONNECTION)
		protected readRepository: Model<UserDocument>,
	) {
		super();
	}
}
