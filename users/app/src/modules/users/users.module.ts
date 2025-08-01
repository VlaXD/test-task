import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema } from '@app/common/schemas/user.schema';
import { WRITE_DB_CONNECTION, READ_DB_CONNECTION } from '@app/common/modules/mongodb/mongodb.module';
import { UserNotificationInterceptor } from '@app/common/interceptors/user-notification.interceptor';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: UserDocument.name, schema: UserSchema },
		], WRITE_DB_CONNECTION),
		MongooseModule.forFeature([
			{ name: UserDocument.name, schema: UserSchema },
		], READ_DB_CONNECTION),
	],
	controllers: [UsersController],
	providers: [UsersService, UsersRepository, UserNotificationInterceptor],
	exports: [UsersService, UsersRepository],
})
export class UsersModule { } 
