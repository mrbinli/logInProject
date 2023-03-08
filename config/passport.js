const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../modules/user_model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  console.log("serialize使用者．．．");
  console.log(user);
  done(null, user._id); //將mongoDB id存在session內部並且將id簽名後以cookie形式給使用者
});
passport.deserializeUser(async (_id, done) => {
  console.log("deserialize使用者，取得用serialize儲存的id，找到資料庫內的資料");
  let foundUser = await User.findOne({ _id });
  done(null, foundUser); //將req.user這個屬性設定為foundUser
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("進入google strategy的區域");
      //   console.log(profile);
      //   console.log("===========");
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log("使用者已經註冊過了，無須存入資料庫內。");
        done(null, foundUser);
      } else {
        console.log("偵測到新用戶，存入資料庫內。");
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        let savedUser = await newUser.save();
        console.log("成功創建新用戶。");
        done(null, savedUser);
      }
    }
  )
);

//local
passport.use(
  new LocalStrategy(async (username, password, done) => {
    let foundUser = await User.findOne({ email: username });
    if (foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if (result) {
        done(null, foundUser);
      } else {
        done(null, false);
      }
    } else {
      done(null, false);
    }
  })
);
