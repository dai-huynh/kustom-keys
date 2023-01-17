const { cloudinary } = require("../utils/cloudinary");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  price: { type: Schema.Types.Decimal128, required: true },
  name: { type: String, maxLength: 100, required: true },
  details: { type: String, required: true },
  image_key: String,
});

ProductSchema.virtual("price_formatted").get(function () {
  return "$" + this.price;
});

ProductSchema.virtual("url").get(function () {
  return `/product/${this._id}`;
});

ProductSchema.methods.getUrl = async function () {
  if (!this.image_key) return;
  await cloudinary.api.resource(this.image_key, (err, result) => {
    if (err) return next(err);
    this.image = result.url;
  });
};

ProductSchema.methods.uploadImage = async function (imageFile) {
  if (!imageFile) return;
  await cloudinary.uploader.upload(
    imageFile.path,
    { transformation: [{ width: 300, height: 200, crop: "fill" }] },
    (err, result) => {
      if (err) return next(err);
      this.image_key = result.public_id;
      console.log("Uploaded image " + this.image_key);
    }
  );
};

ProductSchema.methods.removeImage = async function () {
  if (!this.image_key) return;
  cloudinary.uploader.destroy(this.image_key, (err) => {
    if (err) return next(err);
    console.log("Deleted image " + this.image_key);
  });
};

module.exports = mongoose.model("Product", ProductSchema);
