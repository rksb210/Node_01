var express = require('express')
var router = express.Router()
var pool = require('./pool')
var upload = require('./multer')
var fs = require('fs')
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

router.get('/movieinterface',function(req,res,next){
    if(checkAdminSession()){
    res.render('movieinterface',{status:0})
    }
    else{
        res.redirect('/admin/adminlogin')
    }
})


router.get('/fetch_all_states',function(req,res,next){
    pool.query("select * from states",function(error,result){
        // console.log(result)
        if(error)
            { res.status(500).json({message:'Database error',status:false,data:[]})
        }else{
            res.status(200).json({message:'Success',status:true,data:result}) 
        }
    })
})



router.get('/fetch_all_cities',function(req,res,next){
    pool.query("select * from cities where stateid=?",[req.query.stateid],function(error,result){
        
        if(error)
            { res.status(500).json({message:'Database error',status:false,data:[]})
        }else{
            res.status(200).json({message:'Success',status:true,data:result}) 
        }
    })
})



router.post('/movie_submit',upload.single("moviepicture"),function(req,res,next){
    pool.query("insert into details (moviename, date, state,city, description,cinema, rating, moviepicture) values(?,?,?,?,?,?,?,?)",[req.body.moviename, req.body.date, req.body.state,req.body.city, req.body.description,req.body.cinema, req.body.rating, req.file.filename],function(error,result){
        if(error){console.log('ERROR:',error)
            res.render('movieinterface',{status:1})
        }
        else { 
            res.render('movieinterface',{status:2})}
    })
})

router.get('/display_all_movies',function(req,res,next){
    if(checkAdminSession()){
    pool.query('select D.*,(select S.statename from states S where S.stateid=D.state) as statename ,(select C.cityname from cities C where C.cityid=D.city) as cityname from details D ',function(error,result){
        if(error){
            console.log(error)
            res.render('displayallmovies',{data:[]})
        }
        else {
           console.log(result) 
            res.render('displayallmovies',{data:result})
        }
    })
}
else{
    res.redirect('/admin/adminlogin')
}
})

router.get('/showmovietoedit',function(req,res,next){
    pool.query('select D.*,(select S.statename from states S where S.stateid=D.state) as statename ,(select C.cityname from cities C where C.cityid=D.city) as cityname from details D where D.detailsid=?',[req.query.mid],function(error,result){
       
    if(error){
            console.log(error)
            res.render('showmovietoedit',{data:[]})
        }else{
            console.log(result)
            res.render('showmovietoedit', {data:result[0]})
        }   
    })
})

router.post('/movie_edit_data',function(req,res){
    console.log('BODY',req.body)
    if(req.body.btn=="Edit"){
    pool.query('update details set moviename=?,date=?,state=?,city=?,description=?,cinema=?,rating=? where detailsid=?',[req.body.moviename,req.body.date,req.body.state,req.body.city,req.body.description,req.body.cinema,req.body.rating,req.body.detailsid],function(error,result){
        if(error){console.log(error)
            res.redirect('display_all_movies')
        }
        else{console.log(result)
            res.redirect('display_all_movies')
        }
    })
}
else{
    pool.query("delete from details where detailsid=?",[req.body.detailsid],function(error,result){
        if(error){
            res.redirect('display_all_movies')
        }
        else{
            res.redirect('display_all_movies') 
        }
    } )
}
})

router.get('/showmoviepicturetoedit',function(req,res){
    res.render('showmoviepicturetoedit',{data:req.query})
})

router.post('/editmoviepicture',upload.single('moviepicture'),function(req,res){
    pool.query('update details set moviepicture=? where detailsid=?',[req.file.filename,req.body.mid],function(error,result){
        if(error){
            console.log(error)
            res.redirect('display_all_movies')
        }
        else{console.log(result)
            fs.unlinkSync(`public/images/${req.body.oldpicture}`)
            res.redirect('display_all_movies') 
        }  
    })
})


module.exports=router