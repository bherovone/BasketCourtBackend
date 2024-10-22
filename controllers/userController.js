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
      return res.status(400).send({success: false, message:"Incorrect credentials"});
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({success: false, message: "Incorrect credentials"});
    }

    if (user.status !== 'active') {
      return res.status(403).send({success: false, message:"Account is not active"});
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2 days" }
    );
    user.password = undefined;
    console.log(user);
    return res.status(200).send({ success: true, message: "User logged in successfully great", token, user});
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).send({ success: false, message:"Unable to login user"});
  }
};


const signup = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({ success: false, message:"Email already exists"});
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });
    const result = await newUser.save();

    if (!result) {
      return res.status(500).send({ success: false, message:"Unable to register user"});
    }

    return res.status(201).send({ success: true, message:"User registered successfully", success:true});
  } catch (error) {
    return res.status(500).send({ success: false, message:"Unable to register user"});
  }
};

const updateprofile = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const result = await User.findByIdAndUpdate(req.user.userId, updates, { new: true });

    if (!result) {
      return res.status(500).send("Unable to update user");
    }

    return res.status(200).send("User updated successfully");
  } catch (error) {
    return res.status(500).send("Unable to update user");
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
    

    const user = await User.findOne({ email: req.body.email });
    

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    const otpCode = 123456;
    user.otpCode = otpCode;
    await user.save();

    // Send OTP via email (or SMS if implemented)
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: user.email,
    //   subject: "Your OTP Code",
    //   text: `Your OTP code is ${otpCode}`,
    // });

    return res.status(200).send({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).send({ success: false, message: "Error sending OTP" });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    const user = await User.findOne({ email, otpCode });

    if (!user) {
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }

    // Reset OTP after successful verification
    user.otpCode = null;
    user.status = 'active'; // Mark user as active if necessary
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2 days" });

    return res.status(200).send({ success: true, message: "OTP verified", token });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).send({ success: false, message: "Error verifying OTP" });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 60 * 60 * 1000; // 1-hour expiry

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    // Send reset token via email
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: user.email,
    //   subject: "Password Reset Request",
    //   text: `To reset your password, use the following token: ${resetToken}. It will expire in 1 hour.`,
    // });

    return res.status(200).send({ success: true, message: "Password reset token sent to email" });
  } catch (error) {
    console.error("Error during forgot password:", error);
    return res.status(500).send({ success: false, message: "Error during forgot password" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // Ensure token hasn't expired
    });

    if (!user) {
      return res.status(400).send({ success: false, message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    return res.status(200).send({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error during password reset:", error);
    return res.status(500).send({ success: false, message: "Error during password reset" });
  }
};

module.exports = {
  getuser,
  getallusers,
  login,
  signup,
  updateprofile,
  deleteuser,
  adduser,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
};
