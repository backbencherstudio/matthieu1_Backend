import { Test, TestingModule } from '@nestjs/testing';
import { ApplepayController } from './applepay.controller';
import { ApplepayService } from './applepay.service';

describe('ApplepayController', () => {
  let controller: ApplepayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplepayController],
      providers: [ApplepayService],
    }).compile();

    controller = module.get<ApplepayController>(ApplepayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
