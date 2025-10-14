import { Test, TestingModule } from '@nestjs/testing';
import { SaddleAlertController } from './saddle-alert.controller';
import { SaddleAlertService } from './saddle-alert.service';

describe('SaddleAlertController', () => {
  let controller: SaddleAlertController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaddleAlertController],
      providers: [SaddleAlertService],
    }).compile();

    controller = module.get<SaddleAlertController>(SaddleAlertController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
