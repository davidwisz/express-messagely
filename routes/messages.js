const express = require("express");
const Message = require("../models/message");
const { ensureLoggedIn, ensureMessageUser } = require('../middleware/auth');
// const ExpressError = require('../expressError');

const router = new express.Router();

const app = express();
router.use(express.json());
router.use(ensureLoggedIn);

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureMessageUser, async function (req, res, next) {
  try {
    const message = req.message;
    console.log("MESSAGE: ", message)
    return res.send({"message": { "id": message.id, "body": message.body, "sent_at": message.sent_at, "from_user": {"username": message.from_user.username, "first_name": message.from_user.first_name, "last_name": message.from_user.last_name, "phone": message.from_user.phone}, "to_user": {"username": message.to_user.username, "first_name": message.to_user.first_name, "last_name": message.to_user.last_name, "phone": message.to_user.phone}}});
  } catch (err) {
    return next(err);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", async function (req, res, next) {
  try {
    let message = await Message.create({"from_username": req.user.username, "to_username": req.body.to_username, "body": req.body.body});
    return res.send({ message });
  } catch (err) {
    return next(err);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.get("/:id/read", ensureMessageUser, async function (req, res, next) {
  try {
    const message = await Message.markRead(req.params.id);
    return res.send({ message });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
