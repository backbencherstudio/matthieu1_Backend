import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { TeamsUploadService } from './teams-upload.service';

@Module({
  controllers: [TeamsController],
  providers: [TeamsService, TeamsUploadService],
})
export class TeamsModule {}
