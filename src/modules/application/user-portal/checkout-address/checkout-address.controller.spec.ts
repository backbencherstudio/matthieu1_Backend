import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutAddressController } from './checkout-address.controller';
import { CheckoutAddressService } from './checkout-address.service';

describe('CheckoutAddressController', () => {
  let controller: CheckoutAddressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutAddressController],
      providers: [CheckoutAddressService],
    }).compile();

    controller = module.get<CheckoutAddressController>(CheckoutAddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
