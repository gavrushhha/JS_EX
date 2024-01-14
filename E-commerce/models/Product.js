const {Schema, model } = require('mongoose')

const Product = new Schema({
    title: {type: String, unique: true, required: true},
    description: {type: String, required: true}, 
    price: {type: Number, required: true}
});

module.exports = model('Product', Product)