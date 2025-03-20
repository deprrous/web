const express = require("express");
const mongoose = require("mongoose");
const myError = require("./utils/myError");
const usersRoutes = require("./routes/user");
const { protect, authorize } = require("./middleware/auth");
const errorHandler = require("./middleware/error");
require("dotenv").config();
mongoose
   .connect(process.env.MONGODB)
   .then(() => console.log("Амжилтай өгөгдлийн санд холбогдлоо."))
   .catch((error) =>
      console.error("Өгөгдлийн сантай холбогдоход алдаа гарлаа: ", error),
   );
const app = express();

app.use(express.json());
app.get("/flag", protect, authorize("admin"), (req, res) => {
   res.json({ message: "ccsCTF{UpD4T3_Y0uRS3lf_T0_4Dm1N!}" });
});

app.use(express.json({ limit: "10kb" }));
app.use("/users", usersRoutes);
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(errorHandler);

const server = app.listen(
   process.env.PORT,
   console.log("Express server " + process.env.PORT + " port deer aslaa.."),
);

process.on(`unhandledRejection`, (err, promise) => {
   console.log(`Error : ${err.message}`);
   server.close(() => {
      process.exit(1);
   });
});
