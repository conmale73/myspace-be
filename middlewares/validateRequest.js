// middlewares/validateRequest.js

const Joi = require('joi');
const ErrorResponse = require('../utils/errorResponse');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      next(new ErrorResponse(error.details[0].message, 400));
    } else {
      next();
    }
  };
};

module.exports = validateRequest;
