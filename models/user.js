/** User class for message.ly */
const bcrypt = require("bcrypt");
const {BCRYPT_WORK_FACTOR} = require("../config.js");
const db = require("../db");


/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR);
    try {
      const user = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING username, password, first_name, last_name, phone`,
        [username, hashedPassword, first_name, last_name, phone]);
      return user.rows[0];
    }
    catch (error) {
      return error;
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */
  static async authenticate(username, password) {
    try {
      const result = await db.query(
        `SELECT password FROM users WHERE username = $1`,
        [username]);
      const pw = result.rows[0];

      if (pw) {
        if (await bcrypt.compare(password, pw.password) === true) {
          return true;
        }
      }
      throw new ExpressError("Invalid user/password", 400);
    } catch (error) {
      return false;
    }
  }

  /** Update last_login_at for user */
  static async updateLoginTimestamp(username) {
    try {
      await db.query(
      `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE username = $1`,
      [username]);
    }
    catch(error) {
      return error;
    }
  }
  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */
  static async all() { 
    const users = await db.query(`SELECT username, first_name, last_name, phone FROM users`);
    console.log('users.rows', users.rows)
    return users.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    try {
      const user = await db.query(`SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username = $1`, [username]);
      return user.rows[0];
    }
    catch(error) {
      return error;
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    try {
      const messages = await db.query(`SELECT m.id, u.username, u.first_name, u.last_name, u.phone , m.body, m.sent_at, m.read_at FROM messages m JOIN users u ON u.username = m.to_username WHERE m.from_username = $1`, [username]);
      return messages.rows.map(m => ({
        id: m.id,
        to_user: {
          username: m.username,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at
      }));
    }
    catch(error) {
      return error;
    }
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    try {
      const messages = await db.query(`SELECT m.id, u.username, u.first_name, u.last_name, u.phone , m.body, m.sent_at, m.read_at FROM messages m JOIN users u ON u.username = m.from_username WHERE m.to_username = $1`, [username]);
      return messages.rows.map(m => ({
        id: m.id,
        from_user: {
          username: m.username,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at
      }));
    }
    catch(error) {
      return error;
    }
  }
}


module.exports = User;