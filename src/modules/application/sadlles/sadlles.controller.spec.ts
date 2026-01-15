import { Test, TestingModule } from '@nestjs/testing';
import { SadllesController } from './sadlles.controller';
import { SadllesService } from './sadlles.service';

describe('SadllesController', () => {
  let controller: SadllesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SadllesController],
      providers: [SadllesService],
    }).compile();

    controller = module.get<SadllesController>(SadllesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
