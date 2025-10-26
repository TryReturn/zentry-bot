const { Schema, model } = require("mongoose");

const SuggestionSchema = new Schema({
  suggestionId: {
    type: String,
    required: true,
    unique: true
  },
  messageId: {
    type: String,
    require: true,
  },
  guildId: {
    type: String,
    required: true
  },
  authorId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['En revisión', 'Aceptada', 'Rechazada'],
    default: 'En revisión'
  },
  positiveVotes: {
    type: [String],
    default: []
  },
  negativeVotes: {
    type: [String],
    default: []
  },
  staffMember: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

SuggestionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = model("Suggestion", SuggestionSchema);