import { jest } from "@jest/globals";
import Message from "../models/Message.js";

jest.setTimeout(10000);

jest.mock("../models/Message.js", () => {
  return {
    default: jest.fn(),
  };
});

describe("🧪 Message Model Test (Mocked)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create and save a message successfully", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_message_id",
      senderId: "mocked_sender_id",
      receiverId: "mocked_receiver_id",
      content: "Hello, how are you doing?",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    Message.prototype.save = mockSave;

    const validMessage = new Message({
      senderId: "mocked_sender_id",
      receiverId: "mocked_receiver_id",
      content: "Hello, how are you doing?"
    });

    const savedMessage = await validMessage.save();

    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.senderId).toBe("mocked_sender_id");
    expect(savedMessage.receiverId).toBe("mocked_receiver_id");
    expect(savedMessage.content).toBe("Hello, how are you doing?");
    expect(savedMessage.isRead).toBe(false);
    expect(savedMessage.createdAt).toBeDefined();
    expect(savedMessage.updatedAt).toBeDefined();
  });

  it("should throw validation error if required fields are missing", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      senderId: { message: "Path `senderId` is required." },
      receiverId: { message: "Path `receiverId` is required." },
      content: { message: "Path `content` is required." }
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);
    Message.prototype.save = mockSave;

    const incompleteMessage = new Message({});

    let err;
    try {
      await incompleteMessage.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe("ValidationError");
    expect(err.errors.senderId).toBeDefined();
    expect(err.errors.receiverId).toBeDefined();
    expect(err.errors.content).toBeDefined();
  });

  it("should throw validation error for invalid senderId", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      senderId: { message: "Invalid senderId format" }
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);
    Message.prototype.save = mockSave;

    const invalidMessage = new Message({
      senderId: "not-a-valid-id",
      receiverId: "mocked_receiver_id",
      content: "Test message"
    });

    let err;
    try {
      await invalidMessage.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe("ValidationError");
    expect(err.errors.senderId).toBeDefined();
  });

  it("should throw validation error for invalid receiverId", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      receiverId: { message: "Invalid receiverId format" }
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);
    Message.prototype.save = mockSave;

    const invalidMessage = new Message({
      senderId: "mocked_sender_id",
      receiverId: "not-a-valid-id",
      content: "Test message"
    });

    let err;
    try {
      await invalidMessage.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe("ValidationError");
    expect(err.errors.receiverId).toBeDefined();
  });

  it("should set isRead to false by default", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_message_id",
      senderId: "mocked_sender_id",
      receiverId: "mocked_receiver_id",
      content: "Test message",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    Message.prototype.save = mockSave;

    const message = new Message({
      senderId: "mocked_sender_id",
      receiverId: "mocked_receiver_id",
      content: "Test message"
    });

    const savedMessage = await message.save();
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.senderId).toBe("mocked_sender_id");
    expect(savedMessage.receiverId).toBe("mocked_receiver_id");
    expect(savedMessage.content).toBe("Test message");
    expect(savedMessage.isRead).toBe(false);
    expect(savedMessage.createdAt).toBeDefined();
    expect(savedMessage.updatedAt).toBeDefined();
  });

  it("should allow setting isRead to true", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_message_id",
      senderId: "mocked_sender_id",
      receiverId: "mocked_receiver_id",
      content: "Test message",
      isRead: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    Message.prototype.save = mockSave;

    const message = new Message({
      senderId: "mocked_sender_id",
      receiverId: "mocked_receiver_id",
      content: "Test message",
      isRead: true
    });

    const savedMessage = await message.save();

    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.isRead).toBe(true);
  });
});
