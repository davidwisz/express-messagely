const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, JWT_OPTIONS } = require("../config");
const ExpressError = require('../expressError');

const router = new express.Router();

const app = express();
app.use(express.json());

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    if (await User.authenticate(username, password)) {
      let payload = { username };
      let token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);
      await User.updateLoginTimestamp();
      return res.send({ _token: token });
    } else {
      throw new ExpressError("Invalid Username/Password!", 400);
    }
  } catch (err) {
    return next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function (req, res, next) {
  try {
    let results = await User.register(req.body);
    let payload = { username: results.username };
    let token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);
    await User.updateLoginTimestamp();
    return res.send({ _token: token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
