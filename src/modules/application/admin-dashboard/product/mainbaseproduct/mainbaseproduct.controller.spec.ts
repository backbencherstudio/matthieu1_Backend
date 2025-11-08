import { Test, TestingModule } from '@nestjs/testing';
import { MainbaseproductController } from './mainbaseproduct.controller';
import { MainbaseproductService } from './mainbaseproduct.service';

describe('MainbaseproductController', () => {
  let controller: MainbaseproductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MainbaseproductController],
      providers: [MainbaseproductService],
    }).compile();

    controller = module.get<MainbaseproductController>(MainbaseproductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
