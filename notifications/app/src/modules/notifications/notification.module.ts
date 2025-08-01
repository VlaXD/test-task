import { Module } from '@nestjs/common';
import { EmailsExternalModule } from '@app/common/external-services/notifications/emails.external.module';
import { NotificationConsumer } from './notification.consumer';
import { NotificationService } from './notification.service';

@Module({
	imports: [EmailsExternalModule],
	providers: [NotificationConsumer, NotificationService],
	exports: [NotificationService],
})
export class NotificationModule { } 
