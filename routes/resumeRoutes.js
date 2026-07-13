const express = require("express");
const router = express.Router();

const {
    uploadResume,
    getMyResumes
} = require("../controllers/resumeController");

const auth = require("../middleware/auth");
const upload = require("../middleware/uploadResumePdf");

router.post(
    "/upload",
    auth,
    upload.single("resume"),
    uploadResume
);

router.get(
    "/mine",
    auth,
    getMyResumes
);

module.exports = router;