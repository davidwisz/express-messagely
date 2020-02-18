/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const Message = require("../models/message");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload; // create a current user
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}

/** Middleware: Requires correct username. */

async function ensureMessageUser(req, res, next) {
  try {
    req.message = await Message.get(req.params.id);
    const is_from_user = (req.user.username === req.message.from_user.username);
    const is_to_user = (req.user.username === req.message.to_user.username);
    let is_authorized = false;

    console.log("FROM: ", is_from_user);
    console.log("TO: ", is_to_user);
    if (req.route.path.includes('/read')) {
      if (is_to_user){
        is_authorized = true;
      }
    } else if (is_from_user || is_to_user) {
      is_authorized = true;
    }

    console.log("AUTH: ", is_authorized);
    if (is_authorized) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}
// end

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureMessageUser
};
