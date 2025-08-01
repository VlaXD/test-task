import { Module } from '@nestjs/common';
import { HttpModule } from '@app/common/modules/http/httpModule';
import { EmailsExternalService } from './emails.external.service';

@Module({
	imports: [HttpModule],
	providers: [EmailsExternalService],
	exports: [EmailsExternalService],
})
export class EmailsExternalModule { }
