const { body, validationResult } = require("express-validator");
const async = require("async");
const fs = require("fs");

const Product = require("../models/product");
const ProductInstance = require("../models/productinstance");
const Brand = require("../models/brand");
const Category = require("../models/category");

// multer setup
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("File format should be JPEG, JPG, PNG"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: fileFilter,
});

exports.index = (req, res) => {
  async.parallel(
    {
      new_products(callback) {
        Product.find()
          .select("name price image")
          .limit(5)
          .sort({ $natural: -1 })
          .exec(callback);
      },
      products(callback) {
        Product.find()
          .select("name category price image")
          .populate("category")
          .exec(callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Kustom Keys",
        error: err,
        new_products: results.new_products,
        products: results.products,
      });
    }
  );
};

exports.product_list = (req, res, next) => {
  Product.find()
    .select("name price product_image")
    .sort({ price: "desc" })
    .exec((err, list_products) => {
      if (err) return next(err);
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
    (err, results) => {
      if (err) return next(err);
      if (results.product == null) {
        const err = new Error("Product not found");
        err.status = 404;
        return next(err);
      }
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
  upload.single("product_image"),

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

  (req, res, next) => {
    const errors = validationResult(req);

    let filePath = "";
    if (req.file) {
      filePath = req.file.path;
    }

    const product = new Product({
      brand: req.body.brand,
      category: req.body.category,
      price: req.body.price,
      name: req.body.name,
      details: req.body.details,
      product_image: filePath,
    });

    if (!errors.isEmpty()) {
      if (product.product_image) {
        fs.unlink(req.file.path, (err) => console.log(err));
        console.log(`Deleted ${req.file.filename} from uploads`);
      }
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
          for (const category of results.categories) {
            if (category._id.toString() === product.category.toString()) {
              category.checked = "true";
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
    (err, results) => {
      if (err) return next(err);
      if (results.product == null) res.redirect("/products");
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
    (err, results) => {
      if (err) return next(err);
      if (results.product_instances.length > 0) {
        res.render("product_delete", {
          title: "Delete Product",
          product: results.product,
          product_instances: results.product_instances,
        });
        return;
      }
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
    (err, results) => {
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
      for (const category of results.categories) {
        if (
          category._id.toString() === results.product.category._id.toString()
        ) {
          category.checked = "true";
        }
      }
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
  upload.single("product_image"),

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

  (req, res, next) => {
    const errors = validationResult(req);

    let filePath = null;
    if (req.file) {
      filePath = req.file.path;
    }

    const product = new Product({
      brand: req.body.brand,
      category: req.body.category,
      price: req.body.price,
      name: req.body.name,
      details: req.body.details,
      product_image: filePath,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => console.log(err));
        console.log(`Deleted ${req.file.filename} from uploads`);
      }
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
          for (const category of results.categories) {
            if (
              category._id.toString() === results.product.category.toString()
            ) {
              category.checked = "true";
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
