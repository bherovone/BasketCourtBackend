const express = require("express");
const { auth, checkAdmin } = require("../middleware/auth");
const userController = require("../controllers/userController");
const userRouter = express.Router();

userRouter.get("/getuser/:id", auth, userController.getuser);
userRouter.get("/getallusers", auth, checkAdmin, userController.getallusers); // Only admin can get all users
userRouter.post("/adduser", auth, checkAdmin, userController.adduser); // Only admin can get all users
userRouter.post("/login", userController.login);
userRouter.post("/signup", userController.signup);
userRouter.put("/updateprofile", auth, userController.updateprofile);
userRouter.delete("/deleteuser", auth, checkAdmin, userController.deleteuser); // Only admin can delete a user

userRouter.post("/auth/send-otp", userController.sendOtp); // Send OTP for verification
userRouter.post("/auth/verify-otp", userController.verifyOtp); // Verify OTP for login or signup
userRouter.post("/auth/forgot-password", userController.forgotPassword); // Forgot password process
userRouter.post("/auth/reset-password", userController.resetPassword); // Reset password using token


module.exports = userRouter;
