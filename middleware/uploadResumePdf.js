const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ❌ WRONG (This exports the whole object container):
// module.exports = upload; 

//  CORRECT (This exports the explicit middleware function callback):
module.exports = upload.single('resume');