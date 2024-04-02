const express=require('express');
const router=express.Router();
const usermodel=require('../models/user');
const passport=require('passport');
const isloggedin=require('./middleware')


router.get('/register',async(req,res)=>{
 res.render('user/useregisterform',{currentuser: req.user});
});


router.post('/register', async(req,res)=>{
    try{
        const {email,username,password}=req.body;
        const user= new usermodel({email,username});
        const registeruser= await usermodel.register(user,password);
        // console.log(registeruser);
        req.login(registeruser,err=>{
            if(err)
            return next(err);
            req.flash('success', 'Voilaa! Successfully Registered');
            res.redirect('/camps');   
        });
       
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
   });


router.get('/login',(req,res)=>{
res.render('user/login',{currentuser: req.user});
});

router.post('/login',passport.authenticate('local',{ failureMessage: 'Please Check your Username or Password', failureFlash: true,failureRedirect:'/login'}),(req,res)=>{

    req.flash('success','Yay! Successfully Logged In');
    const prevurl=req.session.prevurl || '/camps';
    res.redirect(prevurl);
    });

router.get('/logout',isloggedin, (req,res)=>{

        req.logout(function(err){
            if(err)
            return next(err);
            req.flash('success','Successfuly logged Out');
            res.redirect('/camps');
        });
       
        
    });    


module.exports= router;