import { Test, TestingModule } from '@nestjs/testing';
import { CustomerAlertController } from './customer-alert.controller';
import { CustomerAlertService } from './customer-alert.service';

describe('CustomerAlertController', () => {
  let controller: CustomerAlertController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerAlertController],
      providers: [CustomerAlertService],
    }).compile();

    controller = module.get<CustomerAlertController>(CustomerAlertController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
