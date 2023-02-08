require("dotenv/config");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const helmet = require("helmet");

// connect to mongodb
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// routers
const indexRouter = require("./routes/index");

const app = express();

// view engine setup
app.set("views", [
  path.join(__dirname, "src/views"),
  path.join(__dirname, "src/views/brands/"),
  path.join(__dirname, "src/views/categories/"),
  path.join(__dirname, "src/views/products/"),
  path.join(__dirname, "src/views/productinstances"),
]);
app.set("view engine", "pug");

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"],
    },
    crossOriginResourcePolicy: false,
  })
);
app.use(logger("dev"));
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public/")));
app.use(express.static(path.join(__dirname, "/public/uploads")));
app.use(express.static(path.join(__dirname, "/public/javascripts")));
app.use(express.static(path.join(__dirname, "/public/images")));
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
