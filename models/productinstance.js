const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductInstanceSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  model: { type: String, required: true },
  condition: {
    type: String,
    enum: [
      "New",
      "Used - Like New",
      "Used - Some Damage",
      "Used - Poor Condition",
    ],
    default: "New",
    required: true,
  },
  price: { type: Schema.Types.Decimal128, required: true },
  description: { type: String },
});

ProductInstanceSchema.virtual("price_formatted").get(function () {
  return "$" + this.price;
});

ProductInstanceSchema.virtual("url").get(function () {
  return `/productinstance/${this._id}`;
});

module.exports = mongoose.model("ProductInstance", ProductInstanceSchema);
