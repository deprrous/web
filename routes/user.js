const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
   getUsers,
   getUser,
   updateUser,
   register,
   login,
} = require("../controller/user");
const router = express.Router();

// api/v1/users
router.route("/").get(protect, authorize("admin", "user"), getUsers);

router.route("/register").post(register);

router.route("/login").post(login);

// api/v1/users/:id
router
   .route("/:id")
   .get(protect, authorize("admin", "user"), getUser)
   .put(protect, authorize("admin", "user"), updateUser);

module.exports = router;
