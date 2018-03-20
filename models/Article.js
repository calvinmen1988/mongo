var mongoose = require("mongoose");

// Create Schema class
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
	title: {
		type: String,
		require: true
	},
	link: {
		type: String,
		require: true
	},
	note: {
		type: Schema.Types.ObjectId,
		ref: "Note"
	}
});

var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;