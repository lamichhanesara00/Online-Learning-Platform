import { initiateKhaltiPayment, verifyKhaltiPayment } from '../../controllers/payment';
import Enrollment from '../../models/Enrollment';
import Payment from '../../models/Payment';
import { Course } from '../../models/Course';
import { User } from '../../models/User';
import axios from 'axios';
import { afterAll, expect, jest } from "@jest/globals";
import { saveEnrollmentDb } from '../../controllers/enrollment';

jest.mock('../../controllers/enrollment', () => {
  return {
    saveEnrollmentDb: jest.fn().mockResolvedValue({ _id: 'enrollment123' }),
    createEnrollment: jest.fn()
  };
});

// Mock all the mongoose models
jest.mock('../../models/Enrollment');
jest.mock('../../models/Payment');
jest.mock('../../models/Course');
jest.mock('../../models/User');
jest.mock('axios');

describe('initiateKhaltiPayment controller', () => {
  let req, res;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
  // Mock environment variables
  process.env.CLIENT_URL = 'http://test.com';
  process.env.KHALTI_URL = 'https://test-khalti.com/api/v2/';
  process.env.KHALTI_KEY = 'test-khalti-key';
    req = {
      body: {
        courseId: 'course123',
        user: {
          _id: 'user123'
        }
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Default mock implementations
    Enrollment.findOne = jest.fn().mockResolvedValue(null);
    
    Course.findById = jest.fn().mockResolvedValue({
      _id: 'course123',
      title: 'Test Course',
      price: 1000
    });
    
    User.findById = jest.fn().mockResolvedValue({
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com'
    });
    
    Payment.create = jest.fn().mockImplementation(data => Promise.resolve({
      _id: 'payment123',
      ...data
    }));
    
    Payment.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    
    axios.post = jest.fn().mockResolvedValue({
      data: {
        pidx: 'transaction123',
        payment_url: 'https://test-khalti.com/pay/transaction123'
      }
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
  
  test('should return 400 if user is already enrolled', async () => {
    // Mock that the user is already enrolled
    Enrollment.findOne.mockResolvedValue({
      _id: 'enrollment123',
      course: 'course123',
      user: 'user123',
      isPaid: true
    });
    
    await initiateKhaltiPayment(req, res);
    
    expect(Enrollment.findOne).toHaveBeenCalledWith({
      course: 'course123',
      user: 'user123',
      isPaid: true
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Already enrolled' });
  });
  
  test('should initiate payment successfully', async () => {
    // Mock successful payment initiation
    await axios.post.mockResolvedValue({
      data: {
        pidx: 'transaction123',
        payment_url: 'https://test-khalti.com/pay/transaction123'
      }
    });
    
    await initiateKhaltiPayment(req, res);
    
    expect(Enrollment.findOne).toHaveBeenCalled();
    expect(Course.findById).toHaveBeenCalledWith('course123');
    expect(User.findById).toHaveBeenCalledWith('user123');
    
    expect(Payment.create).toHaveBeenCalledTimes(1);
    expect(Payment.create.mock.calls[0][0]).toHaveProperty('amount', 1000);
    expect(Payment.create.mock.calls[0][0]).toHaveProperty('studentId', 'user123');
    expect(Payment.create.mock.calls[0][0]).toHaveProperty('provider', 'khalti');
    
    expect(Payment.updateOne).toHaveBeenCalled();
    
    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        paymentId: 'payment123'
      })
    }));
  });
});

describe('verifyKhaltiPayment controller', () => {
  let req, res, next;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    process.env.CLIENT_URL = 'http://test.com';
    process.env.KHALTI_URL = 'https://test-khalti.com/api/v2/';
    process.env.KHALTI_KEY = 'test-khalti-key';
    
    req = {
      body: {
        pidx: 'transaction123',
        courseId: 'course123'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Default mock implementations
    Payment.findOne = jest.fn().mockResolvedValue({
      _id: 'payment123',
      transactionId: 'transaction123',
      studentId: 'user123',
      amount: 1000,
      status: 'pending'
    });
    
    Payment.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    
    axios.post = jest.fn().mockResolvedValue({
      data: {
        pidx: 'transaction123',
        status: 'Completed',
        total_amount: 113000,
        transaction_id: 'khalti-txn-123'
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('should verify completed payment successfully and create enrollment', async () => {
    await verifyKhaltiPayment(req, res, next);
    
    expect(Payment.findOne).toHaveBeenCalledWith({
      transactionId: 'transaction123'
    });
    
    // Verify Khalti API call
    expect(axios.post).toHaveBeenCalledWith(
      'https://test-khalti.com/api/v2/epayment/lookup/',
      { pidx: 'transaction123' },
      expect.objectContaining({
        headers: {
          Authorization: 'key test-khalti-key'
        }
      })
    );
    
    // Verify payment status update
    expect(Payment.updateOne).toHaveBeenCalledWith(
      { _id: 'payment123' },
      expect.objectContaining({
        status: 'completed'
      })
    );
      });
  
  test('should handle pending payment status', async () => {
    // Mock a pending payment response from Khalti
    axios.post.mockResolvedValue({
      data: {
        pidx: 'transaction123',
        status: 'Pending',
        total_amount: 113000
      }
    });
    
    await verifyKhaltiPayment(req, res, next);
    
    // Verify Payment.findOne was called
    expect(Payment.findOne).toHaveBeenCalled();
    
    // Verify payment status update to pending
    expect(Payment.updateOne).toHaveBeenCalledWith(
      { _id: 'payment123' },
      expect.objectContaining({
        status: 'pending'
      })
    );
    
    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        message: 'Payment is pending',
        status: 'Pending'
      })
    });
  });
  
  test('should return 400 if required parameters are missing', async () => {
    // Test with missing pidx
    req.body = { courseId: 'course123' };
    
    await verifyKhaltiPayment(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Payment ID and Course ID are required'
    });
    
    // Reset mocks and test with missing courseId
    jest.clearAllMocks();
    res.status.mockReturnThis();
    req.body = { pidx: 'transaction123' };
    
    await verifyKhaltiPayment(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Payment ID and Course ID are required'
    });
  });
  
  test('should return 404 if payment record not found', async () => {
    // Mock payment not found
    Payment.findOne.mockResolvedValue(null);
    
    await verifyKhaltiPayment(req, res, next);
    
    expect(Payment.findOne).toHaveBeenCalledWith({
      transactionId: 'transaction123'
    });
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Payment record not found'
    });
  });
});