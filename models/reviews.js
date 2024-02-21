const mongoose=require('mongoose');

const Reviewschema=new mongoose.Schema({
    body:String,
    rating:Number,
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
    
});
module.exports= mongoose.model('Review',Reviewschema);