import { Test, TestingModule } from '@nestjs/testing';
import { ContactInfosService } from './contact-infos.service';

describe('ContactInfosService', () => {
  let service: ContactInfosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactInfosService],
    }).compile();

    service = module.get<ContactInfosService>(ContactInfosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
