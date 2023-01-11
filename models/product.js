const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  price: { type: Schema.Types.Decimal128, required: true },
  name: { type: String, maxLength: 100, required: true },
  details: { type: String, required: true },
  product_image: String,
});

ProductSchema.virtual("price_formatted").get(function () {
  return "$" + this.price;
});

ProductSchema.virtual("image").get(function () {
  return this.product_image.replace("public/uploads/", "/");
});

ProductSchema.virtual("url").get(function () {
  return `/product/${this._id}`;
});

module.exports = mongoose.model("Product", ProductSchema);
