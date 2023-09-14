const config = require("config");
const mongoose = require("mongoose");
const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    middle: { type: String },
    last: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 255,
    },
    _id: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.mongo.ObjectId(),
    },
  },
  phone: {
    type: String,
    required: true,
    minlength: 9,
    maxlength: 10,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
  },
  image: {
    url: {
      type: String,
      minlength: 11,
      maxlength: 1024,
    },
    alt: {
      type: String,
      minlength: 2,
      maxlength: 1024,
    },
    _id: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.mongo.ObjectId(),
    },
  },
  address: {
    state: {
      type: String,
      minlength: 0,
      maxlength: 400,
      default: "",
    },
    country: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 400,
    },
    city: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 400,
    },
    street: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 400,
    },
    houseNumber: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 8,
    },
    zip: {
      type: String,
      minlength: 1,
      maxlength: 14,
    },
    _id: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.mongo.ObjectId(),
    },
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  biz: {
    type: Boolean,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  cards: Array,
});
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, biz: this.biz, isAdmin: this.isAdmin },
    config.get("auth.JWT_SECRET")
  );
  return token;
};

const User = mongoose.model("User", userSchema, "users");

function validateUsers(user) {
  const schema = Joi.object({
    name: Joi.object({
      first: Joi.string().min(2).max(255).required(),
      middle: Joi.string().min(2).max(255).empty(""),
      last: Joi.string().min(2).max(255).required(),
    }).required(),
    phone: Joi.string()
      .min(9)
      .max(10)
      .required()
      .regex(/^0[2-9]\d{7,8}$/),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
    image: Joi.object({
      url: Joi.string().min(11).max(1024).required(),
      alt: Joi.string().min(2).max(1024).required(),
    }).required(),
    address: Joi.object({
      state: Joi.string().allow(""),
      country: Joi.string().min(2).max(400).required(),
      city: Joi.string().min(2).max(400).required(),
      street: Joi.string().min(2).max(400).required(),
      houseNumber: Joi.string().min(1).max(8).required(),
      zip: Joi.string().min(1).max(14).empty(""),
    }).required(),
    isAdmin: Joi.boolean().required(),
    biz: Joi.boolean().required(),
  });
  return schema.validate(user);
}
function validateCards() {
  const schema = Joi.object({
    cards: Joi.array().min(1).required(),
  });
  return schema.validate(cards);
}

module.exports = { User, validateUsers, validateCards };
