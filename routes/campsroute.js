const express=require('express');

const router=express.Router();

const Campsmodel=require('../models/camps.js');
const ejsmate=require('ejs-mate');
const methodOverride=require('method-override')
const ReviewModel=require('../models/reviews');
const isloggedin=require('./middleware')

const multer=require('multer');
const {cloudinary,storage}=require('../cloudinary');
const upload= multer({storage});



router.get('/',async (req,res,next)=>{
    try{
    const camps=await Campsmodel.find({});
    // console.log(camps);
    res.render('camps/index',{camps});
    }catch(e){
        return next(e);
    }

});


router.get('/new',isloggedin,(req,res)=>{

    res.render('camps/new');

});



router.post('/',isloggedin, upload.array('image'),async(req,res,next)=>
{
    const camp=new Campsmodel(req.body.Camp);
    camp.author= await req.user._id;
      
    camp.image= await req.files.map(f=>({url:f.path,filename:f.filename}));
    await camp.save();
    console.log(req.body, req.files);
    req.flash('success','Voilaa!! New Camp Added');
    res.redirect('/camps');
});


router.get('/:id',async (req,res,next)=>{

   try{
    const {id}=req.params;
    const camp=await Campsmodel.findOne({_id:id}).populate({path:'reviews', populate:{path:'author'}}).populate('author');
    // console.log(camp.image[0].url);
    res.render('camps/showcamp',{camp,currentuser: req.user});
   }catch(e){
    return next(e);
   }
});

router.post('/:id/reviews',isloggedin,async (req,res,next)=>{

    try{
     const {id}=req.params;
     const review=new ReviewModel(req.body.review);
     review.author=req.user._id;

     const camp= await Campsmodel.findOne({_id:id});
     camp.reviews.push(review);
     // console.log(camp);

     await review.save();
     await camp.save();

     req.flash('success','Review Added');
     res.redirect(`/camps/${id}`);

    }catch(e){
     return next(e);
    }
 });

 router.delete('/:id/review/:reviewId',isloggedin,async(req,res,next)=>{
    try{
        const id=req.params.id;
        const reviewId=req.params.reviewId;
        const thisreview=await ReviewModel.findOne({_id:reviewId});

        if(thisreview.author._id.equals(req.user._id))
        {
        const review=await ReviewModel.findByIdAndDelete(reviewId);
         await Campsmodel.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
         req.flash('delete','Review Deleted');
        res.redirect(`/camps/${id}`);
        }
        else{
            req.flash('error', "Not Allowed");
            res.redirect(`/camps/${id}`);
        }
       }
       catch(e){
         next(e);
       }

 });


router.get('/:id/edit',isloggedin,async (req,res,next)=>{
    try{
    const {id}=req.params;
    const camp=await Campsmodel.findOne({_id:id});
    if(camp.author._id.equals(req.user._id))
    res.render('camps/edit',{camp});
    else
    {
        req.flash('error', "You are Not author of This:");
        res.redirect(`/camps/${id}`);
    }
    }catch(e){
        return next(e);
    }
});


router.put('/:id',isloggedin,upload.array('image'),async (req,res,next)=>{
    try{
    const {id}=req.params;
    const camp=await Campsmodel.findOne({_id:id});

    if(camp.author._id.equals(req.user._id))
    {
    
    await Campsmodel.findByIdAndUpdate(id,req.body.Camp);
    const camp=await Campsmodel.findOne({_id:id});

    let images=( req.files.map(f=>({url:f.path,filename:f.filename})));
    camp.image.push(...images);
    await camp.save();
   
    
    res.redirect(`/camps/${id}`);
    }
    else
    {
        req.flash('error', "You are Not author of This:");
        res.redirect(`/camps/${id}`);
    }
    }catch(e){
        return next(e);
    }

});


router.delete('/:id',isloggedin,async (req,res,next)=>{
    try{
    const {id}=req.params;
    const camp=await Campsmodel.findOne({_id:id});

    if(camp.author._id.equals(req.user._id))
    {
        for(let i=0;i<camp.image.length;i++)
        {
            cloudinary.uploader.destroy(camp.image[i].filename);
        }
        await Campsmodel.findByIdAndDelete(id);
        res.redirect('/camps');
    }
    else
    {
        req.flash('error', "You are Not author of This:");
        res.redirect(`/camps/${id}`);
    }
    
    }catch(e)
    {
        return next(e);
    }

});


module.exports=router;