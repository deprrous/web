const User = require("../model/User");
const myError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

exports.getUsers = asyncHandler(async (req, res, next) => {
   const sort = req.query.sort;
   const select = req.query.select;
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 50;
   ["sort", "select", "page", "limit"].forEach((el) => delete req.query[el]);
   const pagination = await paginate(User, page, limit);
   const users = await User.find(req.query, select)
      .sort(sort)
      .skip(pagination.start - 1)
      .limit(pagination.limit);
   if (users.length === 0) {
      throw new myError("Хэрэглэгч бүртгэгдээгүй байна.", 404);
   }
   res.status(200).json({
      succes: true,
      data: users,
   });
});
exports.getUser = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.params.id);
   if (!user) throw new myError(`User not found id with ${req.params.id}`);
   res.status(200).json({
      succes: true,
      user,
   });
});
exports.updateUser = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.params.id);
   if (!user) {
      throw new myError(`User not found id with ${req.params.id}`, 400);
   }
   if (req.params.id !== req.userId && req.userRole !== "admin") {
      throw new myError(`Уучлаарай та хэрэглэгчийг өөрчлөх эрхгүй байна.`, 400);
   }

   Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
   });
   await user.save();
   res.status(200).json({
      succes: true,
      user,
   });
});

exports.register = asyncHandler(async (req, res, next) => {
   req.body.role = "user"; // Setting default role as "user"

   // Create a new user
   const user = await User.create(req.body);

   // If user creation fails
   if (!user) {
      throw new myError(
         "magadgui username dawhardsan baih aa xD yaraad sn hiij chadaague.",
         403,
      );
   }

   // Generate JWT token
   const token = user.getJWT();

   // Exclude sensitive information like password from the user object
   const userWithoutPassword = user.toObject();
   delete userWithoutPassword.password;

   // Send the response with user info and token
   res.status(200).json({
      success: true,
      user: userWithoutPassword,
      token,
   });
});
exports.login = asyncHandler(async (req, res, next) => {
   const { email, password } = req.body;
   if (!email || !password)
      throw new myError("Нууц үг эсвэл username талбар хоосон байна", 400);
   const user = await User.findOne({ email: email }).select("+password");
   if (!user) throw new myError(`User not found`);
   const match = user.checkPass(password);
   console.log(user);
   if (!match) {
      throw new myError("Нууц үг эсвэл username талбар буруу байна", 400);
   }

   res.status(200).json({
      succes: true,
      user,
      token: user.getJWT(),
   });
});
