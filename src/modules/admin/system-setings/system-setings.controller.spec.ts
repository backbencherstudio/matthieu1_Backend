import { Test, TestingModule } from '@nestjs/testing';
import { SystemSettingsController } from './system-setings.controller';
import { SystemSettingsService } from './system-setings.service';


describe('SystemSetingsController', () => {
  let controller: SystemSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemSettingsController],
      providers: [SystemSettingsService],
    }).compile();

    controller = module.get<SystemSettingsController>(SystemSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
