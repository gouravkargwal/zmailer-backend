const nodemailer = require("nodemailer");
const createError = require("http-errors");
const Customer = require("../model/customerModel");
const jwt = require("jsonwebtoken");
const {
  default: appConstant,
} = require("../../client/src/Constant/appConstant");
const { OAuth2Client } = require("google-auth-library");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const doesExist = await Customer.findOne({ email: email });
    if (doesExist) throw createError.Conflict(`${email} already exist!`);

    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: "1d",
      }
    );

    let transporter = nodemailer.createTransport({
      host: "mail.cashbite.in",
      port: 587,
      secure: false,
      auth: {
        user: "gourav",
        pass: 9414318317,
      },
    });

    let emailData = await transporter.sendMail({
      from: `The FlipShope Team <gouravkargwalverma@gmail.com>`,
      to: `<${email}>`,
      subject: `Acount Activation Link`,
      html: `<p>Please use the link to activate your account</p>
      <p>${appConstant.authURL}activate/${token}</p>
      <hr/>
      <p>This email may contain sensitive info</p>
      `,
      date: new Date(),
    });
    console.log(emailData);
    if (!emailData) throw createError.InternalServerError();
    res.status(200).json({
      message: `Email has been sent to ${email}.Follow the instructions to activate your account`,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email: email });

    if (!customer) throw createError.NotFound("User not registered");

    const isMatch = await customer.isValidPassword(password);
    if (!isMatch) throw createError.Unauthorized("Username/Password not valid");

    console.log(customer);

    const { _id, role, name } = customer;

    const token = jwt.sign({ _id: customer._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login Successful",
      user: { _id, email, role, name },
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

exports.accountActivation = async (req, res, next) => {
  try {
    console.log(req.body);
    const { token } = req.body;

    if (token) {
      jwt.verify(
        token,
        process.env.JWT_ACCOUNT_ACTIVATION,
        async function (err, decoded) {
          if (err)
            throw createError.Unauthorized("Expired Link. Signup Again!");

          const { name, email, password } = jwt.decode(token);

          const customer = new Customer({
            name: name,
            email: email,
            password: password,
          });
          customer.save(function (err) {
            if (err && err.code !== 11000)
              throw createError.InternalServerError();

            if (err && err.code === 11000)
              throw createError.Conflict("User already exists!");

            res.status(200).json({
              message: "Registered Successfully. Please signin",
            });
          });
        }
      );
    } else {
      res.status(422).json({
        message: "Something went wrong! Try Again.",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const doesExist = await Customer.findOne({ email });
    // if (!doesExist) throw createError.Unauthorized(`${email} doesnot exists!`);
    if (!doesExist) {
      return res.status(401).json({
        error: `${email} doesnot exists!`,
      });
    }

    const token = jwt.sign(
      { _id: doesExist._id },
      process.env.JWT_RESET_PASSWORD,
      {
        expiresIn: "1d",
      }
    );

    let transporter = nodemailer.createTransport({
      host: "mail.cashbite.in",
      port: 587,
      secure: false,
      auth: {
        user: "gourav",
        pass: 9414318317,
      },
    });

    let emailData = await transporter.sendMail({
      from: `The FlipShope Team <gouravkargwalverma@gmail.com>`,
      to: `<${email}>`,
      subject: `Reset Password Link`,
      html: `<p>Please use the link to reset your password</p>
      <p>${appConstant.authURL}password/reset/${token}</p>
      <hr/>
      <p>This email may contain sensitive info</p>
      `,
      date: new Date(),
    });
    console.log(emailData);
    if (!emailData) throw createError.InternalServerError();
    const updateResetPasswordLink = await Customer.updateOne(
      { email },
      { resetPasswordLink: token }
    );
    console.log(updateResetPasswordLink);
    if (!updateResetPasswordLink) throw createError.InternalServerError();
    res.status(200).json({
      message: `Email has been sent to ${email}.Follow the instructions to reset your password`,
    });
  } catch (error) {
    res.json({
      message: error,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    console.log(req.body);
    const { resetPasswordLink, newPassword } = req.body;
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      async function (err, decoded) {
        if (err)
          throw createError.Unauthorized("Reset link expired. Try Again!");

        const customer = await Customer.findOne({ resetPasswordLink });
        console.log(customer);

        if (!customer) throw createError.Unauthorized("User doesn't exists!");

        customer.password = newPassword;
        customer.resetPasswordLink = "";
        const savedCustomer = await customer.save();

        if (!savedCustomer) throw createError.InternalServerError();

        res.status(200).json({
          message: `Great now login with your new password.`,
        });
      }
    );
  } catch (error) {
    res.json({
      message: error,
    });
  }
};

const client = new OAuth2Client(
  "279958223634 - eojt0d9qnn09sok4g7qssf3qo53q115l.apps.googleusercontent.com"
);

exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const user = await client.verifyIdToken({
      idToken,
      audience:
        "279958223634-eojt0d9qnn09sok4g7qssf3qo53q115l.apps.googleusercontent.com",
    });

    const { email_verified, name, email } = user.payload;

    if (email_verified === false)
      throw createError.Unauthorized("Google login failed. Try Again!");

    const doesExist = await Customer.findOne({ email });
    if (doesExist) {
      const token = jwt.sign({ _id: doesExist._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      const { _id, name, email, role } = doesExist;
      return res.json({
        token,
        user: { _id, email, name, role },
      });
    } else {
      let password = email + process.env.JWT_SECRET;
      const customer = new Customer({ name, email, password });

      customer.save(function (err, data) {
        if (err && err.code !== 11000) throw createError.InternalServerError();

        if (err && err.code === 11000)
          throw createError.Conflict("User already exists!");

        const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });
        const { _id, name, email, role } = data;
        return res.json({
          token,
          user: { _id, email, name, role },
        });
      });
    }
  } catch (error) {
    console.log(error);
    next(createError.InternalServerError());
  }
};
