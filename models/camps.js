const mongoose = require('mongoose');
const ReviewModel=require('./reviews');

// try{
//     mongoose.connect("mongodb://localhost:27017/Camps")
//         console.log('DataBase Connected');
//     }catch(err){
//         console.log('Database Not Connected');
//         console.log(err.message);
//     };

const Campschema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image:[
        {
            url:String,
            filename: String,
        }],
    location: String,
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
});
Campschema.post('findOneAndDelete',async function(doc){
    if(doc){
        ReviewModel.deleteMany({_id:{$in: doc.reviews}})
    }
});
const Camps = mongoose.model('Camps', Campschema); 

module.exports = Camps;
