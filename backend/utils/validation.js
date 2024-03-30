// utils files are utilities,exported functions which can be used by routes
//or other files within the backend server

const { validationResult } = require('express-validator');

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

module.exports = { handleValidationErrors };
