const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
  updateMessageStatus,
} = require("../controllers/messageController");

router.post("/", auth, sendMessage);
router.get("/:chatId", auth, getMessages);
router.put("/status", auth, updateMessageStatus);

module.exports = router;
