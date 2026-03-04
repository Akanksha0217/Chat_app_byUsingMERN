const router = require("express").Router();
const { register, login, getAllUsers, getSingleUser ,updateProfile} = require("../controllers/authController");

const auth = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// 🔥 NEW ROUTES
router.get("/users", auth , getAllUsers);
router.get("/users/:id", auth , getSingleUser);

router.put("/update-profile", auth,updateProfile);

module.exports = router;