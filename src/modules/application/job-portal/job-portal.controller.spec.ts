import { Test, TestingModule } from '@nestjs/testing';
import { JobPortalController } from './job-portal.controller';
import { JobPortalService } from './job-portal.service';

describe('JobPortalController', () => {
  let controller: JobPortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobPortalController],
      providers: [JobPortalService],
    }).compile();

    controller = module.get<JobPortalController>(JobPortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
