const express = require("express");
const router = express.Router();
const path = require("path");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// DATABASE setting
const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "1234",
  database: "nodejs",
});
connection.connect();

router.get("/", (req, res) => {
  let msg;
  let errMsg = req.flash("error");
  if(errMsg) msg = errMsg;
  res.render("join.ejs", {"message": "안녕"});
  //res.sendFile(path.join(__dirname, "../../public/join.html"));
});

passport.serializeUser((user, done) => {
  console.log(`passport session save: ${user.id}`)
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log(`passport session get id: ${id}`)
  done(null, id);
})

passport.use("local-join", new LocalStrategy({
    usernameField: "id",
    passwordField: "password",
    passReqToCallBack: true,
  }, (req, id, password, email, done) => {
    let query = connection.query(`select * from user where id = ?`, [id], (err, rows) => {
      if(err) {
        done(err);
      }
      if(rows.length) {
        console.log("existed user");
        done(null, false, {message: "your email is already used"});
      } else {
        let sql = {id: id, password: password};
        let query = connection.query("insert into user set ?", sql, (err, rows) => {
          if(err) {
            throw err;
          }
          done(null, {"id": id, "password": password});
        })
      }
    })
  }
));


router.post("/", passport.authenticate("local-join", {
  successRedirect: "/main",
  failureRedirect: "/join",
  failureFlash: true,
}));
/*
router.post("/", (req, res) => {
  const body = req.body;
  const id = body.id;
  const password = body.password;
  const email = body.nodemail;

  let data = { id: id, password: password, email: email };
  let sql = "insert into user set ? ";

  let query = connection.query(sql, data, (err, rows) => {
    if (err) {
      throw err;
    } else {
			console.log("ok db insert");
			res.render("welcome.ejs", {"id": id});
		}
  });
});
*/

module.exports = router;
