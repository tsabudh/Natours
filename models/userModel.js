const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//name email photo password password confirm
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us you name'],
  },

  email: {
    type: String,
    required: [true, 'An email is required'],
    validate: [validator.isEmail, 'Please provide a valid email'],
    unique: true,
  },
  photo: {
    type: String,
  },

  role: {
    type: String,
    required: [true, 'A role must be specified'],
    enum: {
      values: ['admin', 'user', 'guide', 'lead-guide'],
      message: 'role must be one of the defined ones in enum array',
    },
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //THIS ONLY WORKS ON model CREATE and SAVE !!
      validator: function (el) {
        return el === this.password; //password
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: true,
  },
});

userSchema.pre(/^find/, function (next) {
  //this points to current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  //only runs this function if password is actually modified
  if (!this.isModified('password')) return next();

  //hash the password with costs of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //this.password not available because password:{select:false}

  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp; //comparing token-issued-timestamp with password-changed-timestamp
  }
  //FALSE means password is not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
