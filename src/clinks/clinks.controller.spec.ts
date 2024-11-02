import { Test, TestingModule } from '@nestjs/testing';
import { ClinksController } from './clinks.controller';
import { ClinksService } from './clinks.service';

describe('ClinksController', () => {
  let controller: ClinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinksController],
      providers: [ClinksService],
    }).compile();

    controller = module.get<ClinksController>(ClinksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
