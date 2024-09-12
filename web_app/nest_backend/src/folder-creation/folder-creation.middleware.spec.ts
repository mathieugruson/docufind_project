import { FolderCreationMiddleware } from './folder-creation.middleware';

describe('FolderCreationMiddleware', () => {
  it('should be defined', () => {
    expect(new FolderCreationMiddleware()).toBeDefined();
  });
});
