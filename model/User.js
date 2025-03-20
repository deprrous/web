const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const myError = require("../utils/myError");

const UserSchema = new mongoose.Schema(
   {
      username: {
         type: String,
      },
      email: {
         type: String,
         required: [true, "Email is required"],
         unique: [true, "Email already exists"],
         lowercase: true, // Convert email to lowercase before saving
         trim: true, // Remove whitespace from email
      },
      password: {
         type: String,
         minlength: 4,
         select: false,
         required: true,
      },

      role: {
         type: String,
         enum: ["user", "admin"], // Restrict allowed values
         default: "user", // Default to "user" if role is not provided
      },
      photo: {
         type: String,
         default: "no-photo.png",
      },
      photo_path: {
         type: String,
         default: "no-photo.png",
      },
      joinedDate: {
         type: Date,
         default: Date.now,
      },
      resetPasswordToken: String,
      resetPasswordExpire: Date,
   },
   { timestamps: true },
);

// Hash password before saving user
UserSchema.pre("save", async function (next) {
   if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
   }
   next();
});

// Method to generate JWT token
UserSchema.methods.getJWT = function () {
   const token = jwt.sign(
      {
         id: this._id,
         role: this.role,
      },
      process.env.JWT_SECRET,
      {
         expiresIn: process.env.EXPIRESIN || "7d", // Fallback to 7d if EXPIRESIN is not set
      },
   );
   return token;
};

// Method to check password match
UserSchema.methods.checkPass = async function (input) {
   let match;
   try {
      match = await bcrypt.compare(input, this.password);
   } catch (err) {
      throw new myError("username/password not match!", 401); // Provide clear error message
   }
   return match;
};

module.exports = mongoose.model("User", UserSchema);
