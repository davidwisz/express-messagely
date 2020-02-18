const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");


describe("User Routes Test", function () {

  let _token;

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let response = await request(app)
      .post("/auth/register")
      .send({
        username: "test1",
        password: "password",
        first_name: "Test1",
        last_name: "Testy1",
        phone: "+14155550000",
      });

    _token = response.body._token;

    // let u2 = await User.register({
    //   username: "test2",
    //   password: "password",
    //   first_name: "Test2",
    //   last_name: "Testy2",
    //   phone: "+14155550000",
    // });

    // let m1 = await Message.create({
    //   from_username: "test1",
    //   to_username: "test2",
    //   body: "HELLO, THIS IS TEST"
    // });
  });

  /** GET/users/ => all users  */

  describe("GET /users", function () {
    test("can see all users", async function () {
      let response = await request(app)
        .get("/users")
        .send({ _token });

      expect(response.body).toEqual({
        users: [{
          username: "test1",
          first_name: "Test1",
          last_name: "Testy1",
          phone: "+14155550000",
        }]
      });
    });
  });

//   /** POST /auth/login => token  */

//   describe("POST /auth/login", function () {
//     test("can login", async function () {
//       let response = await request(app)
//         .post("/auth/login")
//         .send({ username: "test1", password: "password" });


//       let token = response.body._token;
//       expect(jwt.decode(token)).toEqual({
//         username: "test1",
//         iat: expect.any(Number),
//         exp: expect.any(Number),
//       });
//     });

//     test("won't login w/wrong password", async function () {
//       let response = await request(app)
//         .post("/auth/login")
//         .send({ username: "test1", password: "WRONG" });
//       expect(response.statusCode).toEqual(400);
//     });

//     test("won't login w/wrong password", async function () {
//       let response = await request(app)
//         .post("/auth/login")
//         .send({ username: "not-user", password: "password" });
//       expect(response.statusCode).toEqual(400);
//     });
//   });
// });

// afterAll(async function () {
//   await db.end();
});
