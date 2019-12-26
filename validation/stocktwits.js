const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};
// Convert empty fields to an empty string so we can use validator functions
  data.user_id = !isEmpty(data.user_id.toString()) ? data.user_id : "";
  data.username = !isEmpty(data.username) ? data.username : "";
  data.access_token = !isEmpty(data.access_token) ? data.access_token : "";

// user_id checks
  if (Validator.isEmpty(data.user_id.toString())) {
    errors.name = "user_id field is required";
  }

// username checks
if (Validator.isEmpty(data.username)) {
    errors.password = "username field is required";
  }

// access_token checks
  if (Validator.isEmpty(data.access_token)) {
    errors.password = "access_token field is required";
  }


return {
    errors,
    isValid: isEmpty(errors)
  };
};