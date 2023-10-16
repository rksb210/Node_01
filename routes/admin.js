var express = require('express');
var router = express.Router();
var pool = require('./pool')
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

function checkAdminSession(){
  try{
    var admin = JSON.parse(localStorage.getItem('ADMIN'))
    if(admin==null){
      return false
    }
    else{
      return admin
    }    
  }
  catch(e){
   return false

  }
}


/* GET home page. */
router.get('/adminlogin', function(req, res, next) {
  var data = checkAdminSession()
  if (data){
    res.render('dashboard',{userdata:data})
  }
  else{
  res.render('adminlogin',{msg:''});
  }
});

router.get('/logout',function(req,res){
  localStorage.clear()
  res.redirect('/admin/adminlogin')
})
router.post('/checklogin',function(req,res){
  pool.query('select * from admins where (emailid=? or mobileno=?) and password=?',[req.body.emailid,req.body.emailid,req.body.password],function(error,result){
    if(error){
      res.render('adminlogin',{msg:'Server Error'})
    }
    else{
      if(result.length==1){
        res.render('dashboard',{userdata:result[0]})
        localStorage.setItem('ADMIN',JSON.stringify(result[0]))
      }
      else{
        res.render('adminlogin',{msg:'Invalid emailid/password'})
      }
    }
  })
})

module.exports = router;
