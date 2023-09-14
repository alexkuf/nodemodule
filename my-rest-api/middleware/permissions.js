const { User } = require("../models/user");

const isAdmin = async (req, res, next) => {
  if (!req.user.isAdmin)
    return res.status(401).send({ msg: "You dont have permissions!!!" });
  next();
};
const currentUser = async (req, res, next) => {
  let query = {
    _id: req.params.id,
  };
  if (req.user._id !== query._id)
    if (!req.user.isAdmin)
      return res.status(401).send({ msg: "You dont have permissions!!!" });

  next();
};
const isBiz = async (req, res, next) => {
  if (!req.user.biz)
    return res
      .status(401)
      .send({ msg: "You dont have access to create a card!!!" });
  next();
};

module.exports = { isAdmin, currentUser, isBiz };
