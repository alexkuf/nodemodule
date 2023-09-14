const router = require("express").Router();
const { User, validateUsers } = require("../models/user");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const auth = require("../middleware/auth");
const { Card } = require("../models/card");
const { isAdmin, currentUser } = require("../middleware/permissions");

router.get("/", auth, isAdmin, async (req, res) => {
  const users = await User.find({});
  res.send(users);
});

const getCards = async (cardsArray) => {
  const cards = await Card.find({ bizNumber: { $in: cardsArray } });
  return cards;
};

router.get("/cards", auth, async (req, res) => {
  if (!req.query.numbers) res.status(400).send("Missing numbers data");

  let data = {};
  data.cards = req.query.numbers.split(",");

  const cards = await getCards(data.cards);
  res.send(cards);
});

router.patch("/cards", auth, async (req, res) => {
  const { error } = validateCards(req.body);
  if (error) res.status(400).send(error.details[0].message);

  const cards = await getCards(req.body.cards);
  if (cards.length != req.body.cards.length)
    res.status(400).send("Card numbers don't match");

  let user = await User.findById(req.user._id);
  user.cards = req.body.cards;
  user = await user.save();
  res.send(user);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -__v");
  res.json(user);
});

router.post("/", async (req, res) => {
  const { error } = validateUsers(req.body);
  if (error) {
    res.status(400).json(error.details[0].message);
    return;
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    res.status(400).send("User already registered");
    return;
  }

  user = new User(req.body);
  user.password = await bcrypt.hash(user.password, 12);
  await user.save();
  res.json(_.pick(user, ["_id", "name", "email", "biz"]));
});

router.put("/:id", auth, async (req, res) => {
  let user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
  });
  if (!user) return res.status(404).send("No user found on db.");
  user = await User.findOne({
    _id: req.params.id,
    user_id: req.user._id,
  });
  res.send(user);
});

router.delete("/:id", auth, currentUser, async (req, res) => {
  const user = await User.findOneAndRemove({ _id: req.params.id });

  if (!user) return res.status(404).send("The with ID was not found.");
  res.send(user);
});

module.exports = router;
