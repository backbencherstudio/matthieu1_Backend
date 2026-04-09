import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutAddressService } from './checkout-address.service';

describe('CheckoutAddressService', () => {
  let service: CheckoutAddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckoutAddressService],
    }).compile();

    service = module.get<CheckoutAddressService>(CheckoutAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
