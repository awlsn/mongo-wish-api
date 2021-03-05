// init project
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
let db;
const app = express();

const data = require("../imports/data.js");

const client = new MongoClient(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(express.urlencoded());
app.use(express.json());

// Using `public` for static files: http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// Connect to database and insert default users into users collection
client.connect((err) => {
  console.log("Connected successfully to database");
  db = client.db(process.env.DB_NAME);

  // Remove existing data and add seed data to their collections
  db.collection("users").deleteMany({ name: { $exists: true } }, function (
    err,
    r
  ) {
    db.collection("users").insertMany(data.users, function (err, r) {
      console.log("Inserted initial users");
    });
  });

  db.collection("items").deleteMany({ title: { $exists: true } }, function (
    err,
    r
  ) {
    db.collection("items").insertMany(data.items, function (err, r) {
      console.log("Inserted initial items");
    });
  });
});

app.get("/items", function (request, response) {
  db.collection("items")
    .find()
    .toArray(function (err, dbItems) {
      // finds all entries in the users collection
      response.send(dbItems); // sends users back to the page
    });
});

// Send user data - used by client.js
app.get("/users", function (request, response) {
  db.collection("users")
    .find()
    .toArray(function (err, users) {
      // finds all entries in the users collection
      response.send(users); // sends users back to the page
    });
});

// Create a new entry in the users collection
app.post("/new", function (request, response) {
  //console.log(request);
  db.collection("users").insert([{ name: request.body.user }], function (
    err,
    r
  ) {
    console.log("Added a user");
    response.redirect("/");
  });
});

// Removes users from users collection and re-populates with the default users
app.get("/reset", function (request, response) {});

// Serve the root url: http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile("/sandbox/views/index.html");
});

// Listen on port 8080
var listener = app.listen(8080, function () {
  console.log("Listening on port " + listener.address().port);
});
