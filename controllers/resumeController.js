const express = require("express");
const router = express.Router();

const { uploadResume, getMyResumes } = require("../controllers/resumeController");

const auth = require("../middleware/auth");

router.post(
    "/upload",
    auth,
    uploadResume
);

router.get(
    "/mine",
    auth,
    getMyResumes
);

module.exports = router;