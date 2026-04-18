import { Test, TestingModule } from '@nestjs/testing';
import { TrySaddleController } from './try-saddle.controller';
import { TrySaddleService } from './try-saddle.service';

describe('TrySaddleController', () => {
  let controller: TrySaddleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrySaddleController],
      providers: [TrySaddleService],
    }).compile();

    controller = module.get<TrySaddleController>(TrySaddleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
