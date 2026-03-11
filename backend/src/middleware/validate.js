import { validationResult, param } from "express-validator";


// General validation error handler
export const validate = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    return res.status(400).json({
      errors: errors.array(),
    });

  }

  next();

};


// UUID param validator middleware
export const validateUUIDParam = (paramName) => {

  return [

    param(paramName)
      .isUUID()
      .withMessage(`${paramName} must be a valid UUID`),

    validate,

  ];

};