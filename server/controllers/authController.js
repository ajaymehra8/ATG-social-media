const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const crypto = require("crypto");

// creating jwt token
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's exist or not

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in ! Please login", 401));
  }

  // 2) Validate token / Verification of token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exist
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError("The user is no longer exists", 401));
  }

  // 4) Check if the user changed the password after the JWT was issued
  if (user.checkPasswordIsChanged(decoded.iat)) {
    return next(
      new AppError(
        "User recently changed their password, Please login again",
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = user;
  res.locals.user = user;
  next();
});

// creating user account

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return res.status(400).json({
      success: false,
      message: "User with this email already exist. Try with another email.",
    });
  }
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });


  const token = signToken(newUser._id);
  const user = await User.findById(newUser._id).select(
    "-password -createdAt -updatedAt -__v"
  );

  res.status(201).json({
    success: true,
    token,
    user,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) Check if email or password actually exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  //2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  //3) If everything ok, send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    success: true,
    token,
    user,
  });
});

//log out controller

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.cookie("user", "loggedOut", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

// FORGOT PASSWORD FUNCTIONALITY

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user on based on posted email
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("There is no user with that email", 404));
  }
  // 2) Genrate the random token
  var resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email

  try {
    
    
    new Email(user, resetToken).sendPasswordReset();
    return res.status(200).json({
      success: true,
      message: "Token sent to the email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error in sending email", 500));
  }
});

// RESET PASSWORD FUNCTIONALITY
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) Check the token is not expired and user exists and then set new password
  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Updated changedPaswordAt property for the user

  // 4) Log the user in and send JWT
  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    message:"Password updated successfully, Please login"
  });
});
// some middlewares

exports.updateMe=catchAsync(async(req,res)=>{
  const {name}=req.body;
  
  const fields={name};
  if (req.file) {
    fields.pic = req.file.filename;
  }
const user=await User.findByIdAndUpdate(req.params.id,fields,{new:true});

res.status(200).json({
  success:true,
  user
})
})
