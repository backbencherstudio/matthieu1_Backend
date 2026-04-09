import { Test, TestingModule } from '@nestjs/testing';
import { TackproductController } from './tackproduct.controller';
import { TackproductService } from './tackproduct.service';


describe('TackproductController', () => {
  let controller: TackproductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TackproductController],
      providers: [TackproductService],
    }).compile();

    controller = module.get<TackproductController>(
      TackproductController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
