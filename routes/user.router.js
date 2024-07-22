const express = require("express");
const router = express.Router({ mergeParams: true });
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");
const validator = require("validator");

router.get("/", auth, async (req, res) => {
  try {
    const { _id } = req.user;

    const currentUser = await User.findOne({ _id }).select(
      "-password -passport -isOnline"
    );
    if (currentUser.gender === "male") {
      delete currentUser.passportIsVerified;
    }

    res.status(200).json(currentUser);
  } catch (error) {
    res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

router.get("/catalog", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    let girls = [];

    if (limit >= 0 && offset >= 0) {
      girls = await User.find({ passportIsVerified: true, gender: "female" })
        .skip(offset)
        .limit(limit)
        .select("nickname avatar isOnline");
    } else {
      girls = await User.find({
        passportIsVerified: true,
        gender: "female",
      }).select("nickname avatar isOnline");
    }

    res.status(200).json({ girls });
  } catch (error) {
    res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

router.put("/update/nickname", auth, async (req, res) => {
  try {
    const { nickname } = req.body;
    const { _id: userId } = req.user;

    if (!nickname) {
      return res.status(400).json({
        message: "Не введён никнейм",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { nickname },
      { new: true }
    ).select("-password -passport");

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

router.put("/update/email", auth, async (req, res) => {
  try {
    const { email } = req.body;
    const { _id: userId } = req.user;

    if (!email) {
      return res.status(400).json({
        message: "Не введёна почта",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Некорректный email",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { email },
      { new: true }
    ).select("-password -passport");

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

router.put("/update/phone", auth, async (req, res) => {
  try {
    const { phone } = req.body;
    const { _id: userId } = req.user;

    if (!phone) {
      return res.status(400).json({
        message: "Не введён номер телефона",
      });
    }

    if (!validator.isMobilePhone(phone)) {
      return res.status(400).json({
        message: "Некорректный номер телефона",
      });
    }

    const isExistUser = await User.findOne({ phone });
    if (isExistUser) {
      return res.status(400).json({
        message: "Пользователь с таким номером телефона уже зарегистрирован",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { phone },
      { new: true }
    ).select("-password -passport");

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

router.put("/update/password", auth, async (req, res) => {
  try {
    const { password } = req.body;
    const { _id: userId } = req.user;

    if (!password) {
      return res.status(400).json({
        message: "Не введён пароль",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Длина пароля должна быть не менее 8 символов",
      });
    }
    if (password.length >= 20) {
      return res.status(400).json({
        message: "Длина пароля должна быть не более 20 символов",
      });
    }
    if (/[а-яА-Я]/.test(password)) {
      return res.status(400).json({
        message:
          "Пароль может содержать только латинские символы, цифры и специальные символы",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { password: hashedPassword },
      { new: true }
    ).select("-password -passport");

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

router.put("/update/avatar", auth, async (req, res) => {
  try {
    const { avatar } = req.body;
    const { _id: userId } = req.user;

    if (!avatar) {
      return res.status(400).json({
        message: "Не введён url изображения",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { avatar },
      { new: true }
    ).select("-password -passport");

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

router.put("/update/passport", auth, async (req, res) => {
  try {
    const { passport } = req.body;
    const { _id: userId } = req.user;
    console.log(passport);
    if (!passport.length) {
      return res.status(400).json({
        message: "Массив изображений пустой",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { passport },
      { new: true }
    ).select("-password -passport");

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

module.exports = router;
