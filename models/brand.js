const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BrandSchema = new Schema({
  name: { type: String, maxLength: 50, required: true },
});

BrandSchema.virtual("url").get(function () {
  return `/brand/${this._id}`;
});

module.exports = mongoose.model("Brand", BrandSchema);
