const express = require("express");
const router = express.Router();

const product_controller = require("../controllers/productController");
const product_instance_controller = require("../controllers/productinstanceController");
const brand_controller = require("../controllers/brandController");
const category_controller = require("../controllers/categoryController");

// Product Routes

/* GET home page. */
router.get("/", product_controller.index);

// GET request for list of all products
router.get("/products", product_controller.product_list);

// GET request for creating product
router.get("/product/create", product_controller.product_create_get);

// POST request for creating product
router.post("/product/create", product_controller.product_create_post);

// GET request for deleting product
router.get("/product/:id/delete", product_controller.product_delete_get);

// POST request for deleting product
router.post("/product/:id/delete", product_controller.product_delete_post);

// GET request for updating product
router.get("/product/:id/update", product_controller.product_update_get);

// POST request for updating product
router.post("/product/:id/update", product_controller.product_update_post);

// GET request for one product
router.get("/product/:id", product_controller.product_detail);

// Product Instance Routes

// GET request for creating product instance
router.get(
  "/productinstance/:id/create",
  product_instance_controller.productinstance_create_get
);

// POST request for creating product instance
router.post(
  "/productinstance/:id/create",
  product_instance_controller.productinstance_create_post
);

// GET request for deleting product instance
router.get(
  "/productinstance/:id/delete",
  product_instance_controller.productinstance_delete_get
);

// POST request for deleting product instance
router.post(
  "/productinstance/:id/delete",
  product_instance_controller.productinstance_delete_post
);

// GET request for updating product instance
router.get(
  "/productinstance/:id/update",
  product_instance_controller.productinstance_update_get
);

// POST request for updating product instance
router.post(
  "/productinstance/:id/update",
  product_instance_controller.productinstance_update_post
);

// GET request for one product instance
router.get(
  "/productinstance/:id",
  product_instance_controller.productinstance_detail
);

// Brand Routes

// GET request for list of all brands
router.get("/brands", brand_controller.brand_list);

// GET request for creating brand
router.get("/brand/create", brand_controller.brand_create_get);

// POST request for creating brand
router.post("/brand/create", brand_controller.brand_create_post);

// GET request for deleting brand
router.get("/brand/:id/delete", brand_controller.brand_delete_get);

// POST request for deleting brand
router.post("/brand/:id/delete", brand_controller.brand_delete_post);

// GET request for updating brand
router.get("/brand/:id/update", brand_controller.brand_update_get);

// POST request for updating brand
router.post("/brand/:id/update", brand_controller.brand_update_post);

// GET request for one brand
router.get("/brand/:id", brand_controller.brand_detail);

// Category Routes

// GET request for list of all categories
router.get("/categories", category_controller.category_list);

// GET request for creating category
router.get("/category/create", category_controller.category_create_get);

// POST request for creating category
router.post("/category/create", category_controller.category_create_post);

// GET request for deleting category
router.get("/category/:id/delete", category_controller.category_delete_get);

// POST request for deleting category
router.post("/category/:id/delete", category_controller.category_delete_post);

// GET request for updating category
router.get("/category/:id/update", category_controller.category_update_get);

// POST request for updating category
router.post("/category/:id/update", category_controller.category_update_post);

// GET request for one category
router.get("/category/:id", category_controller.category_detail);

module.exports = router;
