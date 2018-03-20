// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var request = require("request");
var cheerio = require("cheerio");

// javascript ES6 promises
mongoose.Promise = Promise;

var app = express();

//morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
	extended: false
}));

// requiring handlebars
let exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(express.static("public"));

// db configuration w/ mongoose
mongoose.connect("mongodb://heroku_0x0wl2kv:l4dt8qkicrnc9mdfjobo8vd0k3@ds127034.mlab.com:27034/heroku_0x0wl2kv");
var db = mongoose.connection;


db.on("error", function(error) {
	console.log("Mongoose Error: ", error); //db errors are thrown
});

db.once("open", function() {
	console.log("Mongoose connection successful."); //db success message 
});

// routes
app.get("/", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error); //log error if thrown.
    }
    else {
      res.render("index", {articles: doc});
    }
  });
});

app.get("/scrape", function(req, res) {
	//grab the body of the html with request
	request("http://nypost.com/sports/", function(error, response, html) {
		// load into cheerio and save it to $ for a shorthand selector
		var $ = cheerio.load(html);
		// grab every h2 within an article tag
		$("article h3").each(function(i, element) {
			var result = {};

			result.title = $(this).children("a").text();
			result.link = $(this).children("a").attr("href");

			var entry = new Article(result);
			//save to db mongoose
			entry.save(function(err, doc) {
				if (err) {
					console.log(err); //log errors 
				}
				else {
					console.log(doc);
				}
			});
		});
	});

	res.redirect("/");
});

// get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {

	Article.find({}, function(error, doc) {
		if (error) {
			console.log(error); //log errors 
		}
		// Otherwise, send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
	// Using the id passed in the id parameter, prepare a query that finds the matching one in our db.
	Article.findOne({ "_id": req.params.id })
	// .. and populate all of the notes associated with it
	.populate("note")
	// now, execute our query
	.exec(function(error, doc) {
		// Log any errors
		if (error) {
			console.log(error);
		}
		// Otherwise, send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
	var newNote = new Note(req.body);

	// And save the new note the db
	newNote.save(function(error, doc) {
		// Log any errors
		if (error) {
			console.log(error);
		}
		else {
			Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
			// Execute the above query
			.exec(function(err, doc) {
				if (err) {
					console.log(err); //log error
				}
				else {
					res.send(doc);
				}
			});
		}
	});
});

// Listen on port 3000
app.listen(process.env.PORT || 3000, function() {
	console.log("App running on port 3000.");
});