import { Test, TestingModule } from '@nestjs/testing';
import { UsedSaddleController } from './used-saddle.controller';
import { UsedSaddleService } from './used-saddle.service';

describe('UsedSaddleController', () => {
  let controller: UsedSaddleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsedSaddleController],
      providers: [UsedSaddleService],
    }).compile();

    controller = module.get<UsedSaddleController>(UsedSaddleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
