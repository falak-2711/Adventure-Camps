require('dotenv').config();
const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const Campsmodel=require('./models/camps.js');
const ejsmate=require('ejs-mate');
const methodOverride=require('method-override')
const joi=require('joi');
const ReviewModel=require('./models/reviews');
const campsroute=require('./routes/campsroute');

const session=require('express-session');
const mongostore=require('connect-mongo');

const flash=require('connect-flash');
const passport=require('passport');
const Localstrategy=require('passport-local');
const usermodel=require('./models/user');
const userroutes=require('./routes/userroutes');


try{
mongoose.connect(process.env.MONGO_DB_URL)
    console.log('DataBase Connected');
}catch(err){
    console.log('Database Not Connected');
    console.log(err.message);
}

app.engine('ejs',ejsmate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

// Session database.
const store=new mongostore({mongoUrl:process.env.MONGO_DB_URL,
                           });
store.on('error',()=>{
    console.log('Session Database error!');
})
const sessionconfig={store,
                      secret:process.env.Session_secret,
                      resave:false,
                      saveUnintialized:true,
                      cookie:{
                        experies: Date.now()+10*60*60*24*7,
                      }
                    
 }
 app.use(session(sessionconfig));
 app.use(flash());

 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new Localstrategy(usermodel.authenticate()));

 passport.serializeUser(usermodel.serializeUser());
 passport.deserializeUser(usermodel.deserializeUser());



 app.use((req,res,next)=>{
    res.locals.currentuser=req.user;
    res.locals.success=req.flash('success');
    res.locals.deleted=req.flash('delete');
    res.locals.error=req.flash('error');
    next();
 });


 app.use('/',userroutes);


app.use('/camps',campsroute);

app.get('/',(req,res)=>{
    res.render('camps/home',{currentuser:req.user});
});


app.use((err,req,res,next)=>{
    res.render('error',{err,currentuser:req.user});
});




var port=process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})