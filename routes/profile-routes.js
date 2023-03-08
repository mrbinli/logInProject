const router = require("express").Router();
const Post = require("../modules/post-models");

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.redirect("/auth/login");
  }
};

router.get("/", authCheck, async (req, res) => {
  //給之前寫好的東西
  let postFound = await Post.find({ author: req.user._id });
  return res.render("profile", { user: req.user, posts: postFound }); //從deSerializeUser()讓user被給予req.user參數
});
router.get("/post", authCheck, (req, res) => {
  return res.render("post", { user: req.user });
});
router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save();
    return res.redirect("/profile");
  } catch (e) {
    req.flash("error_msg", "標題與內容都需要填寫。");
    return res.redirect("/profile/post");
  }
});

module.exports = router;
