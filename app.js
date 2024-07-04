const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const mongoose = require("mongoose");
require("dotenv").config();

const indexRouter = require("./routes/index");
const gameRouter = require("./routes/game");
const apiRouter = require("./routes/api");
const adminRouter = require("./routes/admin");

const app = express();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Error connecting to MongoDB Atlas:", err));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: "dynamic-wave",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use((req, res, next) => {
  res.locals.baseUrl = `${req.protocol}://${req.get("host")}`;
  next();
});
app.use("/sse", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  res.write("\n");

  if (!app.locals.sseClients) {
    app.locals.sseClients = new Set();
  }
  app.locals.sseClients.add(res);

  req.on("close", () => {
    app.locals.sseClients.delete(res);
  });
});

app.use("/", indexRouter);
app.use("/game", gameRouter);
app.use("/api", apiRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
