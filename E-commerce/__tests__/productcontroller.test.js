const request = require('supertest');
const app = require('../index');
const { addProducts, getProducts} = require('../product/productController');
const Product = require('../models/Product');

jest.mock('../models/Product');

describe('addProducts', () => {
  it('should add a new product', async () => {
    const req = {
      body: {
        title: 'Test Product',
        description: 'Test Description',
        price: 9.99,
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    Product.findOne.mockResolvedValue(null);
    Product.prototype.save.mockResolvedValue();

    await addProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      message: 'Товар успешно добавлен',
    });
  });

  it('should return a conflict error when a product with the same title already exists', async () => {
    const req = {
      body: {
        title: 'Existing Product',
        description: 'Test Description',
        price: 9.99,
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    Product.findOne.mockResolvedValue({ title: 'Existing Product' });

    await addProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      error: 'Conflict',
      message: 'Товар с таким названием уже существует',
    });
  });

  it('should handle internal server error', async () => {
    const req = {
      body: {
        title: 'Test Product',
        description: 'Test Description',
        price: 9.99,
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    Product.findOne.mockRejectedValue(new Error('Some database error'));

    await addProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      error: 'Internal Server Error',
      message: 'Add error',
    });
  });
});


describe('getProducts', () => {
    it('should retrieve a list of products', async () => {
      const products = [
        { title: 'Product 1', description: 'Description 1', price: 10.99 },
        { title: 'Product 2', description: 'Description 2', price: 20.99 },
      ];
  
      const req = {};
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
      Product.find.mockResolvedValue(products);
  
      await getProducts(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: true,
        message: 'Вот список актуальных товаров',
        data: products,
      });
    });
  
    it('should handle internal server error', async () => {
      const req = {};
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
      Product.find.mockRejectedValue(new Error('Some database error'));
  
      await getProducts(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve products',
      });
    });
  });