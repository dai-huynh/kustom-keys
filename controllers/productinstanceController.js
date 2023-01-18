const { body, validationResult } = require("express-validator");
const async = require("async");

const Product = require("../models/product");
const ProductInstance = require("../models/productinstance");

exports.productinstance_detail = (req, res, next) => {
  ProductInstance.findById(req.params.id)
    .populate("product")
    .exec(async (err, productinstance) => {
      if (err) return next(err);
      if (productinstance == null) {
        const err = new Error("Product Instance not found");
        err.status = 404;
        return next(err);
      }
      await productinstance.product.getUrl();
      res.render("productinstance_detail", {
        productinstance,
      });
    });
};

exports.productinstance_create_get = (req, res, next) => {
  // Finds one or all products depending on where the user is coming from
  if (req.params.id !== "1") {
    // make sure to predefine all product fields into form
    // when coming from its detail page
    Product.findById(req.params.id).exec(async (err, result) => {
      if (err) return next(err);
      await result.getUrl();
      res.render("productinstance_form", {
        title: "Create Product Instance",
        product: result,
      });
    });
  } else {
    Product.find()
      .select("name")
      .sort({ name: "asc" })
      .exec((err, products) => {
        if (err) return next(err);
        res.render("productinstance_form", {
          title: "Create Product Instance",
          product_list: products,
        });
      });
  }
};

exports.productinstance_create_post = [
  body("product", "Product must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("model", "Model must not be empty").trim().isLength({ min: 1 }).escape(),
  body("condition", "Condition must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price")
    .isLength({ min: 1 })
    .withMessage("Price must not be empty")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be greater than $0.00")
    .escape(),
  body("description").trim().optional({ checkFalsy: true }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const productinstance = new ProductInstance({
      product: req.body.product,
      model: req.body.model,
      condition: req.body.condition,
      price: req.body.price,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // Checks if the user is coming from the product detail page
      if (req.params.id != "1") {
        Product.findById(req.params.id).exec(async (err, result) => {
          if (err) return next(err);
          await result.getUrl();
          res.render("productinstance_form", {
            title: "Create Product Instance",
            product: result,
            productinstance,
            errors: errors.array(),
          });
        });
      } else {
        Product.find()
          .select("name")
          .sort({ name: "asc" })
          .exec((err, products) => {
            if (err) return next(err);
            res.render("productinstance_form", {
              title: "Create Product Instance",
              product_list: products,
              productinstance,
              errors: errors.array(),
            });
          });
      }
      return;
    }
    productinstance.save((err) => {
      if (err) return next(err);
      res.redirect(productinstance.url);
    });
  },
];

exports.productinstance_delete_get = (req, res, next) => {
  ProductInstance.findById(req.params.id)
    .populate("product")
    .exec((err, result) => {
      if (err) return next(err);
      if (result == null)
        res.redirect(`/product/${productinstance.product._id}`);
      res.render("productinstance_delete", {
        title: "Delete Product Instance",
        productinstance: result,
      });
    });
};

exports.productinstance_delete_post = (req, res, next) => {
  ProductInstance.findById(req.body.productinstanceid).exec((err, result) => {
    if (err) return next(err);
    if (result == null) res.redirect(`/product/${productinstance.product._id}`);
    ProductInstance.findByIdAndRemove(req.body.productinstanceid, (err) => {
      if (err) return next(err);
      res.redirect(`/product/${result.product._id}`);
    });
  });
};

exports.productinstance_update_get = (req, res, next) => {
  async.parallel(
    {
      productinstance(callback) {
        ProductInstance.findById(req.params.id).exec(callback);
      },
      products(callback) {
        Product.find(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.productinstance == null) {
        const err = new Error("Product Instance not found");
        err.status = 404;
        return next(err);
      }
      for (const product of results.products) {
        if (
          results.productinstance.product.toString() === product._id.toString()
        ) {
          product.selected = "true";
        }
      }

      res.render("productinstance_form", {
        title: "Update Product Instance",
        product_list: results.products,
        productinstance: results.productinstance,
      });
    }
  );
};

exports.productinstance_update_post = [
  body("product", "Product must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("model", "Model must not be empty").trim().isLength({ min: 1 }).escape(),
  body("condition", "Condition must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price")
    .isLength({ min: 1 })
    .withMessage("Price must not be empty")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be greater than $0.00")
    .escape(),
  body("description").trim().optional({ checkFalsy: true }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const productinstance = new ProductInstance({
      product: req.body.product,
      model: req.body.model,
      condition: req.body.condition,
      price: req.body.price,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Product.find()
        .select("name")
        .sort({ name: "asc" })
        .exec((err, products) => {
          if (err) return next(err);
          for (const product of products) {
            if (productinstance.product.toString() === product._id.toString()) {
              product.selected = "true";
            }
          }
          res.render("productinstance_form", {
            title: "Update Product Instance",
            product_list: products,
            productinstance,
            errors: errors.array(),
          });
        });

      return;
    }
    ProductInstance.findByIdAndUpdate(
      req.params.id,
      productinstance,
      {},
      (err, theproductinstance) => {
        if (err) return next(err);
        res.redirect(theproductinstance.url);
      }
    );
  },
];
