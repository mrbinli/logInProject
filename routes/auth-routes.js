const router = require("express").Router();
const passport = require("passport");
const { authenticate } = require("passport");
const User = require("../modules/user_model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  return res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});
router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

//passport裡的authenticate()，使用google認證
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);
//signup post
router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  if (password.length < 8) {
    req.flash("error_msg", "密碼長度過短，至少需要8個數字或英文字");
    return res.redirect("/auth/signup");
  }
  //確認信箱是否被註冊過
  const foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash(
      "error_msg",
      "信箱已經被註冊，請使用另一個信箱，或嘗試更改密碼登入系統"
    );
  }
  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  // let savedUser = await newUser.save();
  await newUser.save();
  req.flash("success_msg", "註冊成功！可以登入系統了！");
  return res.redirect("/auth/login");
});
//本地post
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "登入失敗，帳號或密碼不正確。",
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  console.log("進入/redirect");
  return res.redirect("/profile");
});
module.exports = router;
