import { Module } from '@nestjs/common';
import { HttpModule as NextHttpModule } from '@nestjs/axios';

import { HttpService } from './httpService';

@Module({
	imports: [NextHttpModule],
	providers: [HttpService],
	exports: [HttpService],
})
export class HttpModule {}
