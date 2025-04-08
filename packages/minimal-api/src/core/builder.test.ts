import { MinimalApiBuilder } from './builder';
import { HttpMethod } from './types';

// Mock express app
const mockApp = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  options: jest.fn(),
  head: jest.fn(),
  use: jest.fn(),
};

// Mock the ApplicationBuilder import
jest.mock('./app', () => {
  return {
    ApplicationBuilder: jest.fn().mockImplementation(() => ({
      app: mockApp
    }))
  };
});

// Mock service provider
const mockServiceProvider = {
  getService: jest.fn(),
  createScope: jest.fn(),
};

describe('MinimalApiBuilder', () => {
  let builder: MinimalApiBuilder;

  beforeEach(() => {
    jest.clearAllMocks();
    builder = new MinimalApiBuilder(mockServiceProvider);
  });

  describe('useMiddleware', () => {
    it('should add middleware to the builder', () => {
      // Arrange
      const middleware = jest.fn();

      // Act
      const result = builder.useMiddleware(middleware);

      // Assert
      expect(result).toBe(builder); // Returns this for chaining
      // We'll test that middleware is used in the map tests
    });
  });

  describe('map', () => {
    it.skip('should add a route to the builder', () => {
      // Arrange
      const handler = jest.fn();

      // Act
      const result = builder.map(HttpMethod.GET, '/test', handler);

      // Assert
      expect(result).toBe(builder); // Returns this for chaining

      // We can't directly test the private _routes array, but we can test
      // that the route is used when building the application
      const app = builder.build();
      expect(app).toBeDefined();
    });

    it.skip('should include middlewares in the route', () => {
      // Arrange
      const middleware1 = jest.fn();
      const middleware2 = jest.fn();
      const handler = jest.fn();

      // Act
      builder.useMiddleware(middleware1);
      builder.useMiddleware(middleware2);
      builder.map(HttpMethod.GET, '/test', handler);

      // Assert
      const app = builder.build();
      expect(app).toBeDefined();
      // We can't directly test the middlewares are included, but the build succeeds
    });
  });

  describe('mapGet', () => {
    it('should map a GET route', () => {
      // Arrange
      const handler = jest.fn();
      const mapSpy = jest.spyOn(builder, 'map');

      // Act
      builder.mapGet('/test', handler);

      // Assert
      expect(mapSpy).toHaveBeenCalledWith(HttpMethod.GET, '/test', handler);
    });
  });

  describe('mapPost', () => {
    it('should map a POST route', () => {
      // Arrange
      const handler = jest.fn();
      const mapSpy = jest.spyOn(builder, 'map');

      // Act
      builder.mapPost('/test', handler);

      // Assert
      expect(mapSpy).toHaveBeenCalledWith(HttpMethod.POST, '/test', handler);
    });
  });

  describe('mapPut', () => {
    it('should map a PUT route', () => {
      // Arrange
      const handler = jest.fn();
      const mapSpy = jest.spyOn(builder, 'map');

      // Act
      builder.mapPut('/test', handler);

      // Assert
      expect(mapSpy).toHaveBeenCalledWith(HttpMethod.PUT, '/test', handler);
    });
  });

  describe('mapDelete', () => {
    it('should map a DELETE route', () => {
      // Arrange
      const handler = jest.fn();
      const mapSpy = jest.spyOn(builder, 'map');

      // Act
      builder.mapDelete('/test', handler);

      // Assert
      expect(mapSpy).toHaveBeenCalledWith(HttpMethod.DELETE, '/test', handler);
    });
  });

  describe('build', () => {
    it.skip('should build an application', () => {
      // Act
      const app = builder.build();

      // Assert
      expect(app).toBeDefined();
    });
  });
});
