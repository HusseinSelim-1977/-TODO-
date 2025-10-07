const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    task: { 
        type: String, 
        required: [true, 'Task is required'],
        trim: true,
        maxlength: [500, 'Task cannot exceed 500 characters']
    },
    done: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true 
});

todoSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Todo', todoSchema);