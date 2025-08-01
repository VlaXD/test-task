import { Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { HttpService as NestHttpService } from '@nestjs/axios';

interface RequestOptions extends Omit<AxiosRequestConfig, 'url' | 'method' | 'data'> {
	headers?: Record<string, string>;
}

@Injectable()
export class HttpService {
	private readonly axiosInstance: AxiosInstance;

	constructor(private readonly httpService: NestHttpService) {
		this.axiosInstance = httpService.axiosRef;
	}

	/**
	 * Extracts data from axios response
	 * @throws {Error} If response data is undefined
	 */
	private extractResponse<T>(response: AxiosResponse<T>): T {
		if (!response?.data) {
			throw new Error('Response data is undefined');
		}

		return response.data;
	}

	/**
	 * Performs GET request
	 * @throws {Error} If request fails
	 */
	async get<T>(url: string, options?: RequestOptions): Promise<T> {
		try {
			const response = await this.axiosInstance.get<T>(url, options);
			return this.extractResponse(response);
		} catch (error) {
			throw this.handleError(error, 'GET', url);
		}
	}

	/**
	 * Performs POST request
	 * @throws {Error} If request fails
	 */
	async post<T, D = unknown>(url: string, data?: D, options?: RequestOptions): Promise<T> {
		try {
			const response = await this.axiosInstance.post<T>(url, data, options);
			return this.extractResponse(response);
		} catch (error) {
			throw this.handleError(error, 'POST', url);
		}
	}

	/**
	 * Performs PUT request
	 * @throws {Error} If request fails
	 */
	async put<T, D = unknown>(url: string, data?: D, options?: RequestOptions): Promise<T> {
		try {
			const response = await this.axiosInstance.put<T>(url, data, options);
			return this.extractResponse(response);
		} catch (error) {
			throw this.handleError(error, 'PUT', url);
		}
	}

	/**
	 * Performs PATCH request
	 * @throws {Error} If request fails
	 */
	async patch<T, D = unknown>(url: string, data?: D, options?: RequestOptions): Promise<T> {
		try {
			const response = await this.axiosInstance.patch<T>(url, data, options);
			return this.extractResponse(response);
		} catch (error) {
			throw this.handleError(error, 'PATCH', url);
		}
	}

	/**
	 * Performs DELETE request
	 * @throws {Error} If request fails
	 */
	async delete<T>(url: string, options?: RequestOptions): Promise<T> {
		try {
			const response = await this.axiosInstance.delete<T>(url, options);
			return this.extractResponse(response);
		} catch (error) {
			throw this.handleError(error, 'DELETE', url);
		}
	}

	/**
	 * Handles and formats error messages
	 */
	private handleError(error: any, method: string, url: string): Error {
		const status = error.response?.status;
		const message = error.response?.data?.message || error.message;
		const statusText = status ? `[${status}] ` : '';

		return new Error(`${method} request to ${url} failed: ${statusText}${message}`);
	}
}
