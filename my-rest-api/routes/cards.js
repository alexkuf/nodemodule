const router = require("express").Router();
const auth = require("../middleware/auth");
const { validateCard, Card, generateBizNumber } = require("../models/card");
const { currentUser, isBiz } = require("../middleware/permissions");

router.get("/", auth, async (req, res) => {
  if (!req.user.biz) {
    res.status(401).send("Access Denied");
    return;
  }
  const cards = await Card.find({ user_id: req.user._id });
  res.send(cards);
});

router.delete("/:id", auth, currentUser, async (req, res) => {
  const card = await Card.findOneAndRemove({
    _id: req.params.id,
    user_id: req.user._id,
  });
  if (!card)
    if (req.user.isAdmin) {
      let card = await Card.findOneAndRemove({ _id: req.params.id });
      return res.json(card);
    } else {
      return res.status(404).send("The card with the given ID was not found.");
    }

  res.json(card);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let card = await Card.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    req.body
  );
  if (!card)
    return res.status(404).send("The card with the given ID was not found.");

  card = await Card.findOne({ _id: req.params.id, user_id: req.user._id });
  res.send(card);
});

router.get("/:id", auth, async (req, res) => {
  const card = await Card.findOne({
    _id: req.params.id,
    user_id: req.user._id,
  });
  if (!card)
    return res.status(404).send("The card with the given ID was not found.");
  res.send(card);
});

router.post("/", auth, isBiz, async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) {
    res.status(400).json(error.details[0].message);
    return;
  }
  const card = new Card({
    ...req.body,
    bizNumber: await generateBizNumber(),
    user_id: req.user._id,
  });
  await card.save();
  res.json(card);
});

router.patch("/:id", auth, async (req, res) => {
  const card = await Card.findOne({
    _id: req.params.id,
    "likes.user_id": req.user_id,
  });
  if (!card) return res.status(404).send("You already liked this card.");

  const updateCard = await Card.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { likes: { user_id: req.user._id } } },
    { new: true }
  );
  res.json(updateCard);
});

module.exports = router;
