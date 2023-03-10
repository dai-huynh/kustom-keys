require("dotenv/config");

const { body, validationResult } = require("express-validator");
const async = require("async");
const fs = require("fs");

const { upload } = require("../utils/multer");
const { cloudinary } = require("../utils/cloudinary");

const Product = require("../models/product");
const ProductInstance = require("../models/productinstance");
const Brand = require("../models/brand");
const Category = require("../models/category");

exports.index = (req, res) => {
  Product.findOne()
    .sort({ _id: "desc" })
    .exec(async (err, product) => {
      if (!product) return;
      if (err) return next(err);
      if (product.image_key) await product.getUrl();
      res.render("index", { title: "Home", product: product });
    });
};

exports.product_list = (req, res, next) => {
  Product.find()
    .select("name price image_key")
    .sort({ price: "desc" })
    .exec(async (err, list_products) => {
      if (err) return next(err);

      for (const product of list_products) {
        if (product.image_key) await product.getUrl();
      }

      res.render("product_list", {
        title: "Product List",
        product_list: list_products,
      });
    });
};

exports.product_detail = (req, res, next) => {
  async.parallel(
    {
      product(callback) {
        Product.findById(req.params.id)
          .populate("brand")
          .populate("category")
          .exec(callback);
      },
      product_instances(callback) {
        ProductInstance.find({ product: req.params.id }).exec(callback);
      },
    },
    async (err, results) => {
      if (err) return next(err);
      if (results.product == null) {
        const err = new Error("Product not found");
        err.status = 404;
        return next(err);
      }

      await results.product.getUrl();

      res.render("product_detail", {
        product: results.product,
        product_instances: results.product_instances,
      });
    }
  );
};

exports.product_create_get = (req, res, next) => {
  async.parallel(
    {
      brands(callback) {
        Brand.find()
          .sort([["name", "asc"]])
          .exec(callback);
      },
      categories(callback) {
        Category.find()
          .sort([["name", "asc"]])
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("product_form", {
        title: "Create Product",
        brands: results.brands,
        categories: results.categories,
      });
    }
  );
};

exports.product_create_post = [
  // refers to file input with name "image"
  upload.single("image"),

  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be greater than $0.00")
    .isLength({ min: 1 })
    .withMessage("Price must not be empty")
    .escape(),
  body("details", "Details must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("brand.*", "Brand must not be empty.").escape(),
  body("category.*").escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const product = new Product({
      brand: req.body.brand,
      category: req.body.category,
      price: req.body.price,
      name: req.body.name,
      details: req.body.details,
      image_key: "",
    });

    await product.uploadImage(req.file);

    if (!errors.isEmpty()) {
      await product.removeImage();

      async.parallel(
        {
          brands(callback) {
            Brand.find()
              .sort([["name", "asc"]])
              .exec(callback);
          },
          categories(callback) {
            Category.find()
              .sort([["name", "asc"]])
              .exec(callback);
          },
        },
        (err, results) => {
          if (err) return next(err);

          for (const brand of results.brands) {
            if (brand._id.toString() === product.brand.toString()) {
              brand.selected = "selected";
            }
          }
          // Category is optional, so check if it exists to avoid error
          if (product.category) {
            for (const category of results.categories) {
              if (category._id.toString() === product.category.toString()) {
                category.checked = "true";
              }
            }
          }

          res.render("product_form", {
            title: "Create Product",
            brands: results.brands,
            categories: results.categories,
            product,
            errors: errors.array(),
          });
        }
      );
      return;
    }
    product.save((err) => {
      if (err) return next(err);
      res.redirect(product.url);
    });
  },
];

exports.product_delete_get = (req, res, next) => {
  async.parallel(
    {
      product(callback) {
        Product.findById(req.params.id).exec(callback);
      },
      product_instances(callback) {
        ProductInstance.find({ product: req.params.id })
          .sort({ price: "desc" })
          .exec(callback);
      },
    },
    async (err, results) => {
      if (err) return next(err);
      if (results.product == null) res.redirect("/products");
      await results.product.getUrl();
      res.render("product_delete", {
        title: "Delete Product",
        product: results.product,
        product_instances: results.product_instances,
      });
    }
  );
};

exports.product_delete_post = (req, res, next) => {
  async.parallel(
    {
      product(callback) {
        Product.findById(req.body.productid).exec(callback);
      },
      product_instances(callback) {
        ProductInstance.find({ product: req.body.productid })
          .sort({ price: "desc" })
          .exec(callback);
      },
    },
    async (err, results) => {
      if (err) return next(err);
      await results.product.getUrl();
      if (results.product_instances.length > 0) {
        res.render("product_delete", {
          title: "Delete Product",
          product: results.product,
          product_instances: results.product_instances,
        });
        return;
      }
      await results.product.removeImage();

      Product.findByIdAndRemove(req.body.productid, (err) => {
        if (err) return next(err);
        res.redirect("/products");
      });
    }
  );
};

exports.product_update_get = (req, res, next) => {
  async.parallel(
    {
      product(callback) {
        Product.findById(req.params.id)
          .populate("brand")
          .populate("category")
          .exec(callback);
      },
      brands(callback) {
        Brand.find()
          .sort([["name", "asc"]])
          .exec(callback);
      },
      categories(callback) {
        Category.find()
          .sort([["name", "asc"]])
          .exec(callback);
      },
    },
    async (err, results) => {
      if (err) return next(err);
      if (results.product == null) {
        const err = new Error("Product not found");
        err.status = 404;
        return next(err);
      }

      for (const brand of results.brands) {
        if (brand._id.toString() === results.product.brand._id.toString()) {
          brand.selected = "selected";
        }
      }
      if (results.product.category) {
        for (const category of results.categories) {
          if (
            category._id.toString() === results.product.category._id.toString()
          ) {
            category.checked = "true";
          }
        }
      }

      await results.product.removeImage(); // Remove old image regardless of whether new image is uploaded

      res.render("product_form", {
        title: "Update Product",
        product: results.product,
        brands: results.brands,
        categories: results.categories,
      });
    }
  );
};

exports.product_update_post = [
  upload.single("image"),

  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("price", "Price must be greater than $0.00")
    .isFloat({ min: 0.01 })
    .escape(),
  body("details", "Details must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("brand.*", "Brand must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*").escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const product = new Product({
      brand: req.body.brand,
      category: req.body.category,
      price: req.body.price,
      name: req.body.name,
      details: req.body.details,
      image_key: "",
      _id: req.params.id,
    });

    await product.uploadImage(req.file);

    if (!errors.isEmpty()) {
      await product.removeImage();

      async.parallel(
        {
          brands(callback) {
            Brand.find()
              .sort([["name", "asc"]])
              .exec(callback);
          },
          categories(callback) {
            Category.find()
              .sort([["name", "asc"]])
              .exec(callback);
          },
        },
        (err, results) => {
          if (err) return next(err);

          for (const brand of results.brands) {
            if (brand._id.toString() === product.brand.toString()) {
              brand.selected = "selected";
            }
          }
          if (product.category) {
            for (const category of results.categories) {
              if (category._id.toString() === product.category.toString()) {
                category.checked = "true";
              }
            }
          }

          res.render("product_form", {
            title: "Update Product",
            product: product,
            brands: results.brands,
            categories: results.categories,
            errors: errors.array(),
          });
        }
      );
      return;
    }
    Product.findByIdAndUpdate(req.params.id, product, {}, (err, theproduct) => {
      if (err) return next(err);
      res.redirect(theproduct.url);
    });
  },
];
