import { DbSet } from './dbset';
import { DbContext } from './context';

// Mock entity
class TestEntity {
  id: number = 0;
  name: string = '';
}

// Mock repository
const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
};

// Mock DbContext
const mockContext = {
  getConnection: jest.fn().mockReturnValue({
    getRepository: jest.fn().mockReturnValue(mockRepository),
  }),
  add: jest.fn(),
  remove: jest.fn(),
} as unknown as DbContext;

describe('DbSet', () => {
  let dbSet: DbSet<TestEntity>;

  beforeEach(() => {
    jest.clearAllMocks();
    dbSet = new DbSet<TestEntity>(mockContext, TestEntity);
  });

  describe('add', () => {
    it('should add an entity to the context', () => {
      // Arrange
      const entity = new TestEntity();
      entity.id = 1;
      entity.name = 'Test Entity';

      // Act
      dbSet.add(entity);

      // Assert
      expect(mockContext.add).toHaveBeenCalledWith(entity);
    });
  });

  describe('addRange', () => {
    it('should add multiple entities to the context', () => {
      // Arrange
      const entity1 = new TestEntity();
      entity1.id = 1;
      entity1.name = 'Test Entity 1';

      const entity2 = new TestEntity();
      entity2.id = 2;
      entity2.name = 'Test Entity 2';

      // Act
      dbSet.addRange([entity1, entity2]);

      // Assert
      expect(mockContext.add).toHaveBeenCalledTimes(2);
      expect(mockContext.add).toHaveBeenCalledWith(entity1);
      expect(mockContext.add).toHaveBeenCalledWith(entity2);
    });
  });

  describe('remove', () => {
    it('should remove an entity from the context', () => {
      // Arrange
      const entity = new TestEntity();
      entity.id = 1;
      entity.name = 'Test Entity';

      // Act
      dbSet.remove(entity);

      // Assert
      expect(mockContext.remove).toHaveBeenCalledWith(entity);
    });
  });

  describe('removeRange', () => {
    it('should remove multiple entities from the context', () => {
      // Arrange
      const entity1 = new TestEntity();
      entity1.id = 1;
      entity1.name = 'Test Entity 1';

      const entity2 = new TestEntity();
      entity2.id = 2;
      entity2.name = 'Test Entity 2';

      // Act
      dbSet.removeRange([entity1, entity2]);

      // Assert
      expect(mockContext.remove).toHaveBeenCalledTimes(2);
      expect(mockContext.remove).toHaveBeenCalledWith(entity1);
      expect(mockContext.remove).toHaveBeenCalledWith(entity2);
    });
  });

  describe('find', () => {
    it('should find an entity by id', async () => {
      // Arrange
      const entity = new TestEntity();
      entity.id = 1;
      entity.name = 'Test Entity';
      mockRepository.findOneBy.mockResolvedValue(entity);

      // Act
      const result = await dbSet.find(1);

      // Assert
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(entity);
    });
  });

  describe('findAll', () => {
    it('should find all entities', async () => {
      // Arrange
      const entities = [
        { id: 1, name: 'Test Entity 1' },
        { id: 2, name: 'Test Entity 2' },
      ];
      mockRepository.find.mockResolvedValue(entities);

      // Act
      const result = await dbSet.findAll();

      // Assert
      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toBe(entities);
    });
  });

  describe('getRepository', () => {
    it('should return the repository', () => {
      // Act
      const result = dbSet.getRepository();

      // Assert
      expect(result).toBe(mockRepository);
    });
  });
});
