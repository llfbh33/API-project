// utils files are utilities,exported functions which can be used by routes
//or other files within the backend server

const { validationResult } = require('express-validator');
const { check } = require('express-validator');

const handleValidationErrors = (req, _res, next) => {
 // calling validationResult with the req will check and store any errors associated witht the request
    const validationErrors = validationResult(req);
// if there are any documented errors stored in the created variable...
    if (!validationErrors.isEmpty()) {
        const errors = {};
        validationErrors
            .array()
            .forEach(error => errors[error.path] = error.msg);

        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request.";
        next(err);
    };
// if there are no errors, contnue, nothing to see here
    next();
}


const validGroupCreation = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 60 })
        .notEmpty()
        .withMessage("Name must be 60 characters or less"),
    check('about')
        .exists({ checkFalsy: true })
        .isLength({ min: 50 })
        .notEmpty()
        .withMessage("About must be 50 characters or more"),
    check('type')
      .exists({ checkFalsy: true })
      .isIn(["Online", "In person"])
      .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
      .exists({ checkFalsy: true })
      .isBoolean()
      .withMessage("Private must be a boolean"),
    check('city')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage("City is required"),
    check('state')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage("State is required"),
    handleValidationErrors
  ];


  const validVenueCreation = [
    check('address')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("Street address is required"),
    check('city')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("City is required"),
    check('state')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("State is required"),
    check('lat')
        .exists({ checkFalsy: true })
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be within -90 and 90"),
    check('lng')
        .exists({ checkFalsy: true })
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be within -180 and 180"),
    handleValidationErrors
  ];


  const validEventCreation = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ min: 5 })
        .withMessage("Name must be at least 5 characters"),
    check('type')
        .exists({ checkFalsy: true })
        .isIn(["Online", "In person"])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('capacity')
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage("Capacity must be an integer"),
    check('price')
      .exists({ checkFalsy: true })
      .isNumeric()
      .withMessage("Price is invalid"),
    check('description')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage("Description is required"),
    check('startDate')
        .notEmpty()
        .withMessage("Start date must be in the future")
        .custom((value) => {
            const curr = new Date().getTime();
            const given = new Date(value).getTime();
            if (given < curr) {
                return false
            }
            return true
        })
        .withMessage("Start date must be in the future"),
    check('endDate')
        .notEmpty()
        .withMessage("End date is less than start date")
        .custom((value, {req}) => {
            const start = new Date(req.body.startDate).getTime();
            const end = new Date(value).getTime();
            if (end < start) {
                return false
            }
            return true
        })
        .withMessage("End date is less than start date"),
    handleValidationErrors
  ];


module.exports = { handleValidationErrors, validGroupCreation, validVenueCreation, validEventCreation };
