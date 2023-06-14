const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
// const sendEmail = require('../utils/email');
const Email = require("../utils/email");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res, isLoggingIn) => {
  const token = signToken(user._id);
  let expireDate;
  if (isLoggingIn) {
    expireDate = new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    );
  } else {
    expireDate = new Date(Date.now() + 1000);
  }
  const cookieOptions = {
    expires: expireDate,
    secure: true,
    httpOnly: true,
  };
  
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // CONTINUE FROM HERECONTINUE FROM HERECONTINUE FROM HERECONTINUE FROM HERECONTINUE FROM HERECONTINUE FROM HERECONTINUE FROM HERECONTINUE FROM HERECONTINUE FROM HERE
  const existingUser = await User.findOne({ email });

  // console.log(existingUser.active); FIGURE OUT TO SIGN IN FOR TEMPORARILY INACTIVE USERS
  if (existingUser) {
    if (existingUser.active === false) {
      existingUser.update({
        name: req.body.name,
        active: true,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
      });

      createSendToken(existingUser, 201, res, true);
    } else if (existingUser.active === true) {
      // res.redirect(`${req.protocol}://${req.get('host')}/login`);
      res.status(400).json({
        status: "failure",
        message: "This email is already registered. Forgot Password?",
        code: "email-already-registered",
      });
    }
  } else {
    const newUser = await User.create({
      //If a field has DEFAULT value, then the field is CREATED ANYWAY
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });

    // send welcome email to user
    const url = `${req.protocol}://${req.get("host")}/me`;
    await new Email(
      { email: req.body.email, name: req.body.name },
      url
    ).sendWelcome();

    createSendToken(newUser, 201, res, true);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //step 1) check if email and password is provided
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  //step 2) check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  //step 3) If everything is ok, send token to client
  createSendToken(user, 200, res, true);
});

exports.logout = (req, res) => {
  const { user } = res.locals;
  createSendToken(user, 200, res, false);

  // res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if its there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;

    // if (token === "loggedout") {
    //   //* issue while logging out from "/me" solved by redirecting to "/"
    //   res.redirect("/");
    //   next();
    // }
  }

  if (!token) {
    next(
      new AppError("You are not logged in. Please log in to get access", 401)
    );
  }
  // 2) Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to the token no longer exists.", 401)
    );
  }

  // 4) Check if user changed password after JWT token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "The password is recently changed. Please log in again.",
        401
      )
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //((...roles) parameter is available now inside this scope, role='user'
    // roles is ['admin', 'lead-guide']

    if (!roles.includes(req.user.role)) {
      //req.user  is stored in request object from previous middleware
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }

    return next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset password token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Please try again.",
        500
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
});

exports.resetPassword = async (req, res, next) => {
  // Step 1) Get user based on the token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  // Step 2) If token has not expired, and there is a user, set the new password

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  try {
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    await user.save();
    // step 3) Update changedPasswordAt property for the user (done at userModel)

    // Step 4) Log the user in, send JWT
    createSendToken(user, 200, res, true);
  } catch (error) {
    res.status(400).json({
      status: "failure",
      message: error.message,
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is incorrect!", 401));
  }
  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // User.findByIdAndUpdate() is not used because password validator in password field does not
  //work for update  => mongoose does not keep current object in memory so "this" object does not work

  // 4) Log user in with new password  , send JWT

  createSendToken(user, 200, res, true);
};

// Only for rendered pages, and no errors
exports.isLoggedIn = async (req, res, next) => {
  // console.log('isLoggedIn');

  if (req.cookies.jwt) {
    try {
      // 1) Verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after JWT token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
