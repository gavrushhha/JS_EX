const orderController = require('../order/orderController'); 
const Order = require('../models/Order'); 

jest.mock('../models/Order');

describe('newOrder', () => {
  it('should create a new order', async () => {
    const req = {
      body: {
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockSavedOrder = {
    };
    Order.prototype.save.mockResolvedValue(mockSavedOrder);

    await orderController.newOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      message: 'Заказ успешно добавлен',
    }, mockSavedOrder);
  });

  it('should handle errors when creating a new order', async () => {
    const req = {
      body: { 
       },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };


    const mockError = new Error('Failed to create order');
    Order.prototype.save.mockRejectedValue(mockError);

    await orderController.newOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      error: 'Internal Server Error',
      message: 'Failed to create order',
    });
  });

});

describe('updatedOrder', () => {
    it('should update an order', async () => {
      const req = {
        params: { id: 'mockOrderId' },
        body: {
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      const mockUpdatedOrder = {
      };
      Order.findByIdAndUpdate.mockResolvedValue(mockUpdatedOrder);
  
      await orderController.updatedOrder(req, res);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: true,
        message: 'Заказ успешно обновлен',
      }, mockUpdatedOrder);
    });
  
    it('should handle errors when updating an order', async () => {
      const req = {
        params: { id: 'mockOrderId' },
        body: {
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockError = new Error('Failed to update order');
      Order.findByIdAndUpdate.mockRejectedValue(mockError);
  
      await orderController.updatedOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        error: 'Internal Server Error',
        message: 'Failed to update order',
      });
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      const req = {
        params: { id: 'mockOrderId' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      Order.findByIdAndDelete.mockResolvedValue();
  
      await orderController.deleteOrder(req, res);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: true,
        message: 'Заказ успешно удален',
      });
    });
  
    it('should handle errors when deleting an order', async () => {
      const req = {
        params: { id: 'mockOrderId' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      const mockError = new Error('Failed to delete order');
      Order.findByIdAndDelete.mockRejectedValue(mockError);

      await orderController.deleteOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        error: 'Internal Server Error',
        message: 'Failed to delete order',
      });
    });
  });

  describe('getUserOrders', () => {
    it('should get user orders', async () => {
      const req = {
        params: { userId: 'mockUserId' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      const mockUserOrders = {
      };
      Order.findOne.mockResolvedValue(mockUserOrders);
  
      await orderController.getUserOrders(req, res);
  
      expect(res.json).toHaveBeenCalledWith(mockUserOrders);
    });
  
    it('should handle errors when getting user orders', async () => {
      const req = {
        params: { userId: 'mockUserId' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      const mockError = new Error('Failed to get user orders');
      Order.findOne.mockRejectedValue(mockError);
  
      await orderController.getUserOrders(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        error: 'Internal Server Error',
        message: 'Failed to get user orders',
      });
    });
  });


  describe('getAllOrders', () => {
    it('should get all orders', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockOrders = [
      ];
      Order.find.mockResolvedValue(mockOrders);
  
      await orderController.getAllOrders(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: true,
        message: 'Вот список актуальных заказов',
        data: mockOrders,
      });
    });
  
    it('should handle errors when getting all orders', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      const mockError = new Error('Failed to get all orders');
      Order.find.mockRejectedValue(mockError);
  
      await orderController.getAllOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        error: 'Internal Server Error',
        message: 'Failed to get all orders',
      });
    });
  });


  describe('getMonthlyIncome', () => {
    it('should get monthly income', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      const mockIncome = [
      ];
      Order.aggregate.mockResolvedValue(mockIncome);
  
      await orderController.getMonthlyIncome(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockIncome);
    });
  
    it('should handle errors when getting monthly income', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      const mockError = new Error('Failed to get monthly income');
      Order.aggregate.mockRejectedValue(mockError);

      await orderController.getMonthlyIncome(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        error: 'Internal Server Error',
        message: 'Failed to get monthly income',
      });
    });
  });


