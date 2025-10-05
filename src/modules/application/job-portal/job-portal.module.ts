import { Module } from '@nestjs/common';
import { JobPortalService } from './job-portal.service';
import { JobPortalController } from './job-portal.controller';
import { JobUploadService } from './job-upload.service';

@Module({
  controllers: [JobPortalController],
  providers: [JobPortalService, JobUploadService],
})
export class JobPortalModule { }
