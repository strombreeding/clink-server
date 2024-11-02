import { Test, TestingModule } from '@nestjs/testing';
import { ReClinksController } from './re-clinks.controller';
import { ReClinksService } from './re-clinks.service';

describe('ReClinksController', () => {
  let controller: ReClinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReClinksController],
      providers: [ReClinksService],
    }).compile();

    controller = module.get<ReClinksController>(ReClinksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
