const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const path = require("path");
const User = require("../database/models/User");
const { mockUsers } = require("../mocks/mockUsers");
const { userLogin, userRegister } = require("./userControllers");

const mockToken = "token";

describe("Given a userLogin function", () => {
  const req = {
    body: mockUsers[0],
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  describe("When it receives a request with a user present in the database", () => {
    User.findOne = jest.fn().mockResolvedValue(true);
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    jsonwebtoken.sign = jest.fn().mockReturnValue(mockToken);
    test("Then it should call the status response's method with 200", async () => {
      const expectedStatus = 200;

      await userLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
    });

    test("Then it should call the json response's method with a token", async () => {
      await userLogin(req, res);

      expect(res.json).toHaveBeenCalledWith({ token: mockToken });
    });
  });

  describe("When it receives a request with a user not present in the database", () => {
    const next = jest.fn();

    test("Then it should call the received next function with a 'Username or password incorrect' error", async () => {
      const expectedErrorMessage = "Username or password incorrect";

      User.findOne = jest.fn().mockResolvedValue(false);

      await userLogin(req, res, next);

      const expectedError = new Error(expectedErrorMessage);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe("When it receives a request with a user already present in the database but with the wrong password", () => {
    const next = jest.fn();

    test("Then it should call the received next function with a 'Password incorrect", async () => {
      const expectedErrorMessage = "Password incorrect";

      User.findOne = jest.fn().mockResolvedValue(true);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await userLogin(req, res, next);

      const expectedError = new Error(expectedErrorMessage);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});

describe("Given a userRegister function", () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  jest.spyOn(path, "join").mockResolvedValue("image");

  describe("When invoked with new users credentials in its body", () => {
    test("Then it should call the response's status method with 201", async () => {
      const req = {
        body: mockUsers[0],
        file: {
          filename: "12798217782",
          originalname: "image.jpg",
        },
      };

      const expectedStatus = 201;

      User.findOne = jest.fn().mockResolvedValue(false);
      bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
      User.create = jest.fn().mockResolvedValue(mockUsers[0]);

      await userRegister(req, res);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
    });
  });

  describe("When invoked with new users credentials in its body but no file", () => {
    test("Then it should call the response's status method with 201", async () => {
      const req = {
        body: mockUsers[0],
        file: null,
      };

      const expectedStatus = 201;

      User.findOne = jest.fn().mockResolvedValue(false);
      bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
      User.create = jest.fn().mockResolvedValue(mockUsers[0]);

      await userRegister(req, res);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
    });
  });

  describe("When it is called with a user that is already in the database", () => {
    test("Then it should call the 'next' received function with an error 'This user already exists'", async () => {
      const req = {
        body: mockUsers[0],
        file: null,
      };

      const expectedErrorMessage = "This user already exists";

      const next = jest.fn();

      User.findOne = jest.fn().mockResolvedValue(true);

      await userRegister(req, res, next);
      const expectedError = new Error(expectedErrorMessage);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe("When it is called and the User.create method fails", () => {
    test("Then it should call the 'next' received function", async () => {
      const req = {
        body: mockUsers[0],
        file: {
          filename: "12798217782",
          originalname: "image.jpg",
        },
      };

      const next = jest.fn();

      User.findOne = jest.fn().mockResolvedValue(false);
      User.create = jest.fn().mockRejectedValue();

      await userRegister(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
