const { body, validationResult } = require("express-validator");
const async = require("async");

const Product = require("../models/product");
const Brand = require("../models/brand");

exports.brand_list = (req, res, next) => {
  Brand.find()
    .sort([["name", "asc"]])
    .exec((err, list_brands) => {
      if (err) return next(err);
      res.render("brand_list", {
        title: "Brand List",
        brand_list: list_brands,
      });
    });
};

exports.brand_detail = (req, res, next) => {
  async.parallel(
    {
      brand(callback) {
        Brand.findById(req.params.id).exec(callback);
      },
      brand_products(callback) {
        Product.find({ brand: req.params.id }).exec(callback);
      },
    },
    async (err, results) => {
      if (err) return next(err);
      if (results.brand == null) {
        const err = new Error("Brand not found");
        err.status = 404;
        return next(err);
      }

      for (const product of results.brand_products) {
        await product.getUrl();
      }

      res.render("brand_detail", {
        brand: results.brand,
        brand_products: results.brand_products,
      });
    }
  );
};

exports.brand_create_get = (req, res, next) => {
  res.render("brand_form", { title: "Create Brand" });
};

exports.brand_create_post = [
  body("name", "Brand must not be empty").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const brand = new Brand({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render("brand_form", {
        title: "Create Brand",
        brand,
        errors: errors.array(),
      });
      return;
    } else {
      Brand.findOne({ name: req.body.name }).exec((err, found_brand) => {
        if (err) return next(err);
        if (found_brand) res.redirect(found_brand.url);
        else {
          brand.save((err) => {
            if (err) return next(err);
            res.redirect(brand.url);
          });
        }
      });
    }
  },
];

exports.brand_delete_get = (req, res, next) => {
  async.parallel(
    {
      brand(callback) {
        Brand.findById(req.params.id).exec(callback);
      },
      brand_products(callback) {
        Product.find({ brand: req.params.id }).exec(callback);
      },
    },
    async (err, results) => {
      if (err) return next(err);
      if (results.brand == null) res.redirect("/brands");

      res.render("brand_delete", {
        title: "Delete Brand",
        brand: results.brand,
        brand_products: results.brand_products,
      });
    }
  );
};

exports.brand_delete_post = (req, res, next) => {
  async.parallel(
    {
      brand(callback) {
        Brand.findById(req.body.brandid).exec(callback);
      },
      brand_products(callback) {
        Product.find({ brand: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.brand_products.length > 0) {
        res.render("brand_delete", {
          title: "Delete Brand",
          brand: results.brand,
          brand_products: results.brand_products,
        });
        return;
      }
      Brand.findByIdAndRemove(req.body.brandid, (err) => {
        if (err) return next(err);
        res.redirect("/brands");
      });
    }
  );
};

exports.brand_update_get = (req, res, next) => {
  Brand.findById(req.params.id, (err, result) => {
    if (err) return next(err);
    if (result == null) {
      const err = new Error("Brand not found");
      err.status = 404;
      return next(err);
    }
    res.render("brand_form", {
      title: "Update Brand",
      brand: result,
    });
  });
};

exports.brand_update_post = [
  body("name", "Brand must not be empty").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const brand = new Brand({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) {
      res.render("brand_form", {
        title: "Update Brand",
        brand,
        errors: errors.array(),
      });
      return;
    } else {
      Brand.findOne({ name: brand.name }).exec((err, found_brand) => {
        if (err) return next(err);
        if (found_brand) res.redirect(found_brand.url);
        else {
          Brand.findByIdAndUpdate(req.params.id, brand, {}, (err, thebrand) => {
            if (err) return next(err);
            res.redirect(thebrand.url);
          });
        }
      });
    }
  },
];
