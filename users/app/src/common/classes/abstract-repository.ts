import { Injectable } from '@nestjs/common';
import { Model,
	Document,
	RootFilterQuery,
	ProjectionType,
	QueryOptions,
	UpdateQuery,
	ObjectId,
	PipelineStage, AggregateOptions } from 'mongoose';
import { DeleteResult } from 'mongodb';

@Injectable()
export abstract class AbstractRepository<T extends Document<ObjectId>, M> {
	protected abstract writeRepository: Model<T>;
	protected abstract readRepository: Model<T>;

	get collectionName() {
		return this.writeRepository.collection.name;
	}

	async find(
		query: RootFilterQuery<T> = {},
		projection: ProjectionType<T> = {},
		options: QueryOptions<T> = {},
	) {
		return this.readRepository.find(query, projection, options)
			.lean()
			.exec();
	}

	async insertMany(data: M[], options: any = { ordered: false, throwOnValidationError: true }) {
		return this.writeRepository.insertMany(data, options);
	}

	async updateMany(query: any, set: any) {
		return this.writeRepository.updateMany(query, set);
	}

	async bulkWrite(operations: any[]) {
		return this.writeRepository.bulkWrite(operations, { ordered: false });
	}

	async findOne(filter: RootFilterQuery<T>, projection?: ProjectionType<T> | null, options?: QueryOptions<T> | null) {
		return this.readRepository.findOne(filter, projection, options).lean().exec();
	}

	async updateOne(query: any, set: any) {
		return this.writeRepository.updateOne(query, set);
	}

	async create(data: Omit<M, 'createdAt' | 'updatedAt'>) {
		return this.writeRepository.create(data);
	}

	async count(query: RootFilterQuery<T> = {}) {
		return this.readRepository.countDocuments(query);
	}

	async findOneAndUpdate(
		query: RootFilterQuery<T>,
		update: UpdateQuery<T>,
		options: QueryOptions<T> = {},
	) {
		return this.writeRepository.findOneAndUpdate(query, update, options);
	}

	async deleteOne(filter: RootFilterQuery<T>): Promise<DeleteResult> {
		return this.writeRepository.deleteOne(filter);
	}

	async countDocuments(filter: RootFilterQuery<T>): Promise<number> {
		return this.readRepository.countDocuments(filter);
	}

	async aggregate(pipeline?: PipelineStage[], options?: AggregateOptions) {
		return this.readRepository.aggregate(pipeline, options);
	}

	async distinct(
		field: keyof T & string,
		filter: RootFilterQuery<T> = {},
		options: QueryOptions<T> = {},
	) {
		return this.readRepository.distinct(field, filter, options);
	}

	getCursor(query: RootFilterQuery<T> = {}) {
		return this.readRepository.find(query).lean().cursor();
	}
}
