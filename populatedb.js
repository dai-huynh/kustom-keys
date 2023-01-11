#! /usr/bin/env node

console.log(
  "This script populates some test brands, categories, products, and product instances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Brand = require("./models/brand");
var Category = require("./models/category");
var Product = require("./models/product");
var ProductInstance = require("./models/productinstance");

var mongoose = require("mongoose");
const category = require("./models/category");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var brands = [];
var categories = [];
var products = [];
var productinstances = [];

function brandCreate(name, cb) {
  branddetail = {
    name: name,
  };

  var brand = new Brand(branddetail);

  brand.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Brand: " + brand);
    brands.push(brand);
    cb(null, brand);
  });
}

function categoryCreate(name, cb) {
  var category = new Category({ name: name });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function productCreate(brand, category, price, name, details, image, cb) {
  productdetail = {
    brand: brand,
    price: mongoose.Types.Decimal128(price),
    name: name,
    details: details,
  };
  if (category != false) productdetail.category = category;
  if (image != false) productdetail.image = image;

  var product = new Product(productdetail);
  product.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Product: " + product);
    products.push(product);
    cb(null, product);
  });
}

function productInstanceCreate(
  product,
  model,
  condition,
  price,
  description,
  cb
) {
  productinstancedetail = {
    product: product,
    model: model,
    condition: condition,
  };
  if (price != false)
    productinstancedetail.price = mongoose.Types.Decimal128(price);
  if (description != false) productinstancedetail.description = description;

  var productinstance = new ProductInstance(productinstancedetail);
  productinstance.save(function (err) {
    if (err) {
      console.log("ERROR CREATING ProductInstance: " + productinstance);
      cb(err, null);
      return;
    }
    console.log("New ProductInstance: " + productinstance);
    productinstances.push(productinstance);
    cb(null, product);
  });
}

function createBrandCategories(cb) {
  async.series(
    [
      // kb only brands
      function (callback) {
        brandCreate("KeyWerk", callback);
      },
      function (callback) {
        brandCreate("QWERTY", callback);
      },
      function (callback) {
        brandCreate("keymash", callback);
      },
      function (callback) {
        brandCreate("WootKeys", callback);
      },
      function (callback) {
        brandCreate("easeware", callback);
      },
      function (callback) {
        brandCreate("techlab", callback);
      },

      // keyboard categories
      function (callback) {
        categoryCreate("Keyboards", callback);
      },
      function (callback) {
        categoryCreate("Keyboard Kits", callback);
      },
      function (callback) {
        categoryCreate("Keycaps", callback);
      },
      function (callback) {
        categoryCreate("Switches", callback);
      },
      function (callback) {
        categoryCreate("Keyboard Accessories", callback);
      },
    ],
    // optional callback
    cb
  );
}

function createProducts(cb) {
  async.parallel(
    [
      function (callback) {
        productCreate(
          brands[0],
          categories[0],
          "250.099",
          "Paeron M1",
          "The KeyWerk Paeron M1 is a compact wireless mechanical keyboard designed for productivity and versatility. It has a 65% layout, which means it has around 68 keys, including a dedicated row for function keys, navigation keys, and multimedia controls. It features low profile mechanical switches, which provide a fast and responsive typing experience with a satisfying tactile feedback. The Q4 is equipped with Bluetooth 5.1 technology and has a long battery life of up to 72 hours with the backlighting turned off. It is compatible with multiple devices, including Windows, Mac, iOS, and Android, and comes with a USB-C cable for wired connectivity. The keyboard has a slim and sleek design with a sandblasted aluminum frame and RGB backlighting, which can be customized through the accompanying software.",
          false,
          callback
        );
      },
      function (callback) {
        productCreate(
          brands[0],
          categories[1],
          "175.00088",
          "Paeron M1 Barebones",
          "The KeyWerk Paeron M1 is a compact wireless mechanical keyboard designed for productivity and versatility. It has a 65% layout, which means it has around 68 keys, including a dedicated row for function keys, navigation keys, and multimedia controls. It features low profile mechanical switches, which provide a fast and responsive typing experience with a satisfying tactile feedback. The Q4 is equipped with Bluetooth 5.1 technology and has a long battery life of up to 72 hours with the backlighting turned off. It is compatible with multiple devices, including Windows, Mac, iOS, and Android, and comes with a USB-C cable for wired connectivity. The keyboard has a slim and sleek design with a sandblasted aluminum frame and RGB backlighting, which can be customized through the accompanying software.",
          false,
          callback
        );
      },
      function (callback) {
        productCreate(
          brands[2],
          categories[2],
          "5.50",
          "Standard PBT Doubleshot Keycaps - Black",
          "The KeyMash Standard PBT Doubleshot Keycaps are replacement keycaps for mechanical keyboards. They are made of PBT (polybutylene terephthalate), a type of plastic that is known for its durability and resistance to fading. The keycaps are produced using a double shot molding process, which involves injecting molten plastic into two separate molds. This results in the keycap legends (the symbols or letters on the keys) being made of a different color than the keycap itself. In the case of these keycaps, the legends are black, while the keycaps themselves are also black. PBT doubleshot keycaps are often preferred by enthusiasts due to their high quality and longer lifespan compared to other types of keycaps. They also have a slightly textured surface, which can improve grip and provide a more comfortable typing experience.",
          false,
          callback
        );
      },
      function (callback) {
        productCreate(
          brands[3],
          categories[3],
          "9.99",
          "Keyboard Switches",
          "A pack of Cherry MX Blue mechanical keyboard switches, perfect for customizing your keyboard or repairing a faulty switch.",
          false,
          callback
        );
      },
      function (callback) {
        productCreate(
          brands[1],
          categories[2],
          "4.99",
          "Keycaps",
          "A set of double-shot PBT keycaps in a retro beige color scheme, compatible with most standard mechanical keyboards.",
          false,
          callback
        );
      },

      function (callback) {
        productCreate(
          brands[3],
          false, // supposed to be a category but let user create
          "24.99",
          "Keyboard Stabilizers",
          "A complete set of PCB-mount stabilizers for a full-size mechanical keyboard, including wire stabilizers for the space bar and larger keys.",
          false,
          callback
        );
      },

      function (callback) {
        productCreate(
          brands[5],
          categories[0],
          "99.99",
          "Ultra-Thin Keyboard",
          "A super slim keyboard with low profile scissor switches and a minimalist design, perfect for minimalists and travelers.",
          false,
          callback
        );
      },

      function (callback) {
        productCreate(
          brands[4],
          categories[0],
          "149.99",
          "Ergonomic Split Keyboard",
          "An ergonomically designed split keyboard with a tenting feature to reduce wrist strain and improve typing posture.",
          false,
          callback
        );
      },

      function (callback) {
        productCreate(
          brands[5],
          categories[0],
          "79.99",
          "Gaming Keyboard",
          "A gaming keyboard with customizable RGB backlighting, macro keys, and mechanical switches for a fast and responsive gaming experience.",
          false,
          callback
        );
      },

      function (callback) {
        productCreate(
          brands[1],
          categories[0],
          "129.99",
          "Wireless Mechanical Keyboard",
          "A high-quality wireless mechanical keyboard with customizable backlighting and a choice of Cherry MX switch types. It has a range of up to 30 feet and a long battery life of up to 72 hours with the backlighting turned off. It is compatible with multiple devices, including Windows, Mac, iOS, and Android, and comes with a USB-C cable for wired connectivity.",
          false,
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createProductInstances(cb) {
  // undefined is used to default a schema value
  // false is for fields that are not required, thus having no value
  async.parallel(
    [
      function (callback) {
        productInstanceCreate(
          products[0],
          "0",
          undefined,
          false,
          false,
          callback
        );
      },
      function (callback) {
        productInstanceCreate(
          products[0],
          "1",
          "Used - Some Damage",
          "125",
          "Several keycaps are missing.",
          callback
        );
      },
      function (callback) {
        productInstanceCreate(
          products[2],
          "0",
          "Used - Like New",
          "12.5",
          false,
          callback
        );
      },
    ],
    // Optional callback
    cb
  );
}

async.series(
  [createBrandCategories, createProducts, createProductInstances],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("PRODUCTinstances: " + productinstances);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
