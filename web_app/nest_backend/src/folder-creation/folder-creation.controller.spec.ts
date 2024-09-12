import { Test, TestingModule } from '@nestjs/testing';
import { FolderCreationController } from './folder-creation.controller';

describe('FolderCreationController', () => {
  let controller: FolderCreationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FolderCreationController],
    }).compile();

    controller = module.get<FolderCreationController>(FolderCreationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
