const { body, validationResult } = require("express-validator");
const async = require("async");

const Product = require("../models/product");
const Category = require("../models/category");

exports.category_list = (req, res, next) => {
  Category.find()
    .sort([["name", "asc"]])
    .exec((err, list_categories) => {
      if (err) return next(err);
      res.render("category_list", {
        title: "Category List",
        category_list: list_categories,
      });
    });
};

exports.category_detail = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_products(callback) {
        Product.find({ category: req.params.id }).exec(callback);
      },
    },
    async (err, results) => {
      if (err) return next(err);
      if (results.category == null) {
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }

      for (const product of results.category_products) {
        await product.getUrl();
      }

      res.render("category_detail", {
        category: results.category,
        category_products: results.category_products,
      });
    }
  );
};

exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "Create category" });
};

exports.category_create_post = [
  body("name", "Category must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create Category",
        category,
        errors: errors.array(),
      });
      return;
    } else {
      Category.findOne({ name: req.body.name }).exec((err, found_category) => {
        if (err) return next(err);
        if (found_category) res.redirect(found_category.url);
        else {
          category.save((err) => {
            if (err) return next(err);
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

exports.category_delete_get = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_products(callback) {
        Product.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.category == null) res.redirect("/categories");
      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        category_products: results.category_products,
      });
    }
  );
};

exports.category_delete_post = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.body.categoryid).exec(callback);
      },
      category_products(callback) {
        Product.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.category_products.length > 0) {
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          category_products: results.category_products,
        });
        return;
      }
      Category.findByIdAndRemove(req.body.categoryid, (err) => {
        if (err) return next(err);
        res.redirect("/categories");
      });
    }
  );
};

exports.category_update_get = (req, res, next) => {
  Category.findById(req.params.id, (err, result) => {
    if (err) return next(err);
    if (result == null) {
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    res.render("category_form", {
      title: "Update Category",
      category: result,
    });
  });
};

exports.category_update_post = [
  body("name", "Category must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category,
        errors: errors.array(),
      });
      return;
    } else {
      Category.findOne({ name: category.name }).exec((err, found_category) => {
        if (err) return next(err);
        if (found_category) res.redirect(found_category.url);
        else {
          Category.findByIdAndUpdate(
            req.params.id,
            category,
            {},
            (err, thecategory) => {
              if (err) return next(err);
              res.redirect(thecategory.url);
            }
          );
        }
      });
    }
  },
];
