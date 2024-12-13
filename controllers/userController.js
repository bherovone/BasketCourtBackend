const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getuser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send("Unable to get user");
  }
};



const getallusers = async (req, res) => {
  try {
    console.log("Getting all users for user:", req.locals.userId);
    const users = await User.find({ _id: { $ne: req.locals.userId } }).select("-password");
    return res.status(200).send(users);
  } catch (error) {
    console.error("Unable to get all users:", error);
    return res.status(500).send("Unable to get all users");
  }
};

const login = async (req, res) => {
  console.log("Login request received:", req.body);
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "INCORRECT_CREDENTIALS",
        statusCode: 400,
        errorCode: 'USER_NOT_FOUND', // Specific error code
      });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({
        success: false,
        message: "INCORRECT_CREDENTIALS",
        statusCode: 400,
        errorCode: 'INVALID_PASSWORD', // Specific error code
      });
    }

    if (user.status !== 'active') {
      return res.status(403).send({
        success: false,
        message: "ACCOUNT_INACTIVE",
        statusCode: 403,
        errorCode: 'ACCOUNT_INACTIVE', // Specific error code
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2 days" }
    );
    user.password = undefined; // Don't send back the password
    console.log(user);
    
    return res.status(200).send({
      success: true,
      message: "LOGGED_IN_SUCCESS",
      statusCode: 200,
      token,
      user,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).send({
      success: false,
      message: "UNABLE_LOGIN",
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR', // Specific error code
    });
  }
};



const signup = async (req, res) => {
  console.log("Signup request received:", req.body);
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "EMAIL_ALREADY_EXISTS",
        statusCode: 400,
        errorCode: 'EMAIL_EXISTS', // Specific error code
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });
    const result = await newUser.save();

    if (!result) {
      return res.status(500).send({
        success: false,
        message: "UNABLE_TO_REGISTER",
        statusCode: 500,
        errorCode: 'SAVE_FAILED', // Specific error code
      });
    }

    newUser.password = undefined; // Don't send back the password
    console.log("User registered successfully:", newUser);

    return res.status(201).send({
      success: true,
      message: "USER_REGISTERED_SUCCESSFULLY",
      statusCode: 201,
      user: newUser,
    });

  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).send({
      success: false,
      message: "UNABLE_TO_REGISTER",
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR', // Specific error code
    });
  }
};


const updateProfile = async (req, res) => {
  console.log("Profile update request received:", req.body);
  try {
    const userId = req.locals.userId; // Assuming `userId` is set in `req.locals` after auth middleware
    const updates = { ...req.body };

    // Hash password if it's being updated
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    // Find user and apply updates
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
    
    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        message: "USER_NOT_FOUND",
        statusCode: 404,
        errorCode: "USER_NOT_FOUND", // Specific error code
      });
    }

    updatedUser.password = undefined; // Remove password from the response
    console.log("Updated user profile:", updatedUser);

    return res.status(200).send({
      success: true,
      message: "PROFILE_UPDATED_SUCCESS",
      statusCode: 200,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).send({
      success: false,
      message: "UNABLE_UPDATE_PROFILE",
      statusCode: 500,
      errorCode: "INTERNAL_SERVER_ERROR", // Specific error code
    });
  }
};




const refreshProfile = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
      return res.status(200).send({
      success: true,
      message: "Profile refreshed successfully",
      statusCode: 200,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};


const deleteuser = async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.body.userId);

    if (!result) {
      return res.status(404).send("User not found");
    }

    return res.status(200).send("User deleted successfully");
  } catch (error) {
    return res.status(500).send("Unable to delete user");
  }
};

const adduser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });
    const result = await newUser.save();

    if (!result) {
      return res.status(500).send("Unable to register user");
    }

    return res.status(201).send("User registered successfully");
  } catch (error) {
    return res.status(500).send("Unable to register user");
  }
};


// Send OTP
const sendOtp = async (req, res) => {
  console.log("OTP request received:", req.body);

  try {
    // Build dynamic filter based on provided fields
    const filter = {};
    if (req.body.email) filter.email = req.body.email;
    if (req.body.mobile) filter.mobile = req.body.mobile;

    // Find the user by email or mobile
    const user = await User.findOne(filter);

    if (!user) {
      console.log("User not found");
      return res.status(404).send({
        success: false,
        message: "USER_NOT_FOUND",
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    }

    // Generate an OTP (for demonstration, we're using a fixed OTP here)
    const otpCode = Math.floor(100000 + Math.random() * 900000); // 6-digit random OTP
    console.log(`Generated OTP: ${otpCode} for user: ${user.email || user.mobile}`);

    // Save OTP in user's record
    user.otpCode = otpCode;
    await user.save();

    console.log(`OTP saved for user: ${user.email || user.mobile}`);

    return res.status(200).send({
      success: true,
      message: "OTP_SENT_SUCCESS",
      statusCode: 200,
      // No OTP in response to ensure security
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).send({
      success: false,
      message: "UNABLE_TO_SEND_OTP",
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
    });
  }
};




// Verify OTP
const verifyOtp = async (req, res) => {
  console.log("Verify OTP request received:", req.body);

  try {
    const { email, mobile, otpCode } = req.body;

    // Find user by email or mobile and verify OTP
    const user = await User.findOne({ email, mobile, otpCode });

    if (!user) {
      console.log("Invalid OTP or user not found");
      return res.status(404).send({
        success: false,
        message: "INVALID_OTP",
        statusCode: 404,
        errorCode: 'INVALID_OTP',
      });
    }

    // Reset OTP after successful verification
    user.otpCode = null;
    user.status = 'active'; // Mark user as active if necessary
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2 days" }
    );

    console.log("OTP verified successfully for user:", user.email || user.mobile);

    return res.status(200).send({
      success: true,
      message: "OTP_VERIFIED_SUCCESS",
      statusCode: 200,
      token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).send({
      success: false,
      message: "UNABLE_TO_VERIFY_OTP",
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
    });
  }
};


// Forgot Password
const forgotPassword = async (req, res) => {
  console.log("Forgot password request received:", req.body);

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).send({
        success: false,
        message: "USER_NOT_FOUND",
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    }

    // Generate a reset token and expiration time
    const resetToken = '123456abcxyz';  // Use a secure random token generator here in a real app
    const resetTokenExpire = Date.now() + 60 * 60 * 1000; // 1-hour expiry

    // Save token and expiration to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    // Send reset token via email
    // Uncomment and configure mail transporter when ready to send emails
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: user.email,
    //   subject: "Password Reset Request",
    //   text: `To reset your password, use the following token: ${resetToken}. It will expire in 1 hour.`,
    // });

    console.log(`Password reset token generated for user: ${email}`);

    return res.status(200).send({
      success: true,
      message: "RESET_TOKEN_SENT",
      statusCode: 200,
      // No reset token in the response for security
    });
  } catch (error) {
    console.error("Error during forgot password:", error);
    return res.status(500).send({
      success: false,
      message: "UNABLE_TO_PROCESS_REQUEST",
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
    });
  }
};


// Reset Password
const resetPassword = async (req, res) => {
  console.log("Reset password request received:", req.body);

  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // Ensure token hasn't expired
    });

    if (!user) {
      console.log("Invalid or expired password reset token");
      return res.status(400).send({
        success: false,
        message: "INVALID_OR_EXPIRED_TOKEN",
        statusCode: 400,
        errorCode: 'TOKEN_INVALID_EXPIRED',
      });
    }

    // Hash and update the new password, reset token, and expiry
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    console.log("Password reset successful for user:", user.email || user.mobile);

    return res.status(200).send({
      success: true,
      message: "PASSWORD_RESET_SUCCESS",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    return res.status(500).send({
      success: false,
      message: "UNABLE_TO_RESET_PASSWORD",
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
    });
  }
};


module.exports = {
  getuser,
  getallusers,
  login,
  refreshProfile,
  signup,
  updateProfile,
  deleteuser,
  adduser,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
};
