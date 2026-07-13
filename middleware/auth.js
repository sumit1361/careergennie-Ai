const protect = async (req, res, next) => {
  // your token validation logic
};

//  CORRECT: Must be wrapped inside an object block
module.exports = {
  protect
};