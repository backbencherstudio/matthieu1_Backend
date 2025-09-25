import { Test, TestingModule } from '@nestjs/testing';
import { TpaypalController } from './tpaypal.controller';
import { TpaypalService } from './tpaypal.service';

describe('TpaypalController', () => {
  let controller: TpaypalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TpaypalController],
      providers: [TpaypalService],
    }).compile();

    controller = module.get<TpaypalController>(TpaypalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
