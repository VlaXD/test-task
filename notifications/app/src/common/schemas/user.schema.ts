import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, ObjectId } from 'mongoose';
import { IUser } from '../interfaces/user';

@Schema({ collection: 'users', timestamps: true })
export class UserDocument extends Document<ObjectId> implements IUser {
	@ApiProperty({ type: String, description: 'Email of the user' })
	@Prop({ type: String, required: true, unique: true })
	email: string;

	@ApiProperty({ type: String, description: 'Name of the user' })
	@Prop({ type: String, required: true })
	name: string;

	@ApiProperty({ type: Date, description: 'Created at' })
	@Prop({ type: Date, default: Date.now })
	createdAt: Date;

	@ApiProperty({ type: Date, description: 'Updated at' })
	@Prop({ type: Date, default: Date.now })
	updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
