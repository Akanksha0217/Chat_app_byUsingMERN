const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { createChat, createGroup } = require("../controllers/chatController");

router.post("/", auth, createChat);
router.post("/group", auth, createGroup);

module.exports = router;