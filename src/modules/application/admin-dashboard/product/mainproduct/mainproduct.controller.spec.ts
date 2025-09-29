import { Test, TestingModule } from '@nestjs/testing';
import { MainproductController } from './mainproduct.controller';
import { MainproductService } from './mainproduct.service';

describe('MainproductController', () => {
  let controller: MainproductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MainproductController],
      providers: [MainproductService],
    }).compile();

    controller = module.get<MainproductController>(MainproductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
