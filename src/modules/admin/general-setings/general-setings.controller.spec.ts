import { Test, TestingModule } from '@nestjs/testing';
import { SetingsController } from './general-setings.controller';
import { SetingsService } from './general-setings.service';

describe('SetingsController', () => {
  let controller: SetingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SetingsController],
      providers: [SetingsService],
    }).compile();

    controller = module.get<SetingsController>(SetingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
