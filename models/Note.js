var mongoose = require("mongoose");

var Schema = mongoose.Schema;

// Create the Note schema
var NoteSchema = new Schema({
	title: {
		type: String
	},

	body: {
		type: String
	}
});

var Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;