const isloggedin=function(req,res,next){
   if(!req.isAuthenticated())
   {
      req.session.prevurl=req.originalURL;
      req.flash('error','Login Required');
      res.redirect('/login');
      return;
   }
   return next();
};

module.exports=isloggedin;