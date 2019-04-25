module.exports = function(app, passport, db) {
var mongodb = require('mongodb');
// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // app.get('/test', function(req, res) {
    //     res.render('test.ejs');
    // });

    // PROFILE SECTION =========================
    //all urls app can reach/ end points ' profile'

//if logged in grabs posts from that user and renders their videos
    app.get('/test', isLoggedIn, function(req, res) {
      console.log("get /test");
      if (req.user.type === "music_producer") return res.redirect('/feed')
        db.collection('posts').find({username: req.user.local.email}).toArray((err, result) => {
          if (err) return console.log(err)
          res.render('test.ejs', {
            user : req.user,
            posts: result
          })
        })
    });

    app.get('/feed', function(req, res) {
      console.log("get /test");
        db.collection('posts').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('feed.ejs', {
            posts: result
          })
        })
    });



    //i need a page that has a lists of links that can can take you the
    //oneVideo path with the respective video id
//gets one video id from the database and loads that post
//renders it into oneVideo ejs template
    app.get('/oneVideo/:videoId', isLoggedIn, function(req, res) {
      const videoId = req.params.videoId
      console.log("this is the video id", videoId);
        db.collection('posts').findOne({videoId: videoId},(err, result) => {
          if (err) return console.log(err)
          console.log(result);
          res.render('oneVideo.ejs', {
            user : req.user,
            post: result
          })
        })
    });

    app.get('/checkMember', isLoggedIn, function(req, res) {
    console.log("this is the /checkMember filter", req.user.local.house)
    if(req.user.local.house){
      res.redirect('/test')
    }else{
      res.redirect('/feed')
    }
  })

    app.get('/feedVideo/:videoId', function(req, res) {
      const videoId = req.params.videoId
      console.log("this is the video id", videoId);
        db.collection('posts').findOne({videoId: videoId},(err, result) => {
          if (err) return console.log(err)
          console.log(result);
          res.render('feedVideo.ejs', {
            user : req.user,
            post: result
          })
        })
    });
    //passing in user that came with the request as well as the messages^

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });



    // app.post('/vids', (req, res) => {
    //   db.collection('posts').save({name: req.body.name, vid: req.body.vid, description:req.body.description, link: req.body.link, }, (err, result) => {
    //     if (err) return console.log(err)
    //     console.log('saved to database')
    //     res.redirect('/profile')
    //   })
    // })
//post video id to database
    app.post('/videoList', (req, res) => {
      db.collection('posts').insertOne({username: req.user.local.email, videoId: req.body.videoId, scUrl: []}, (err, result) => {
        if (err) return console.log("Something is wrong! ", err)
        console.log('saved to database')
        res.redirect('/test')
      })
    })


    //need a post that can submit a song to a video on the one video page

    app.post('/addSong', (req, res) => {

      console.log('add song', req.body)
      db.collection('posts')
      .findOneAndUpdate({videoId: req.body.videoId}, {$push: {scUrl: req.body.song }}, (err, result) => {
        if (err) return res.send(err)
        res.redirect('/feedVideo/' + req.body.videoId)
      })
    })



    app.delete('/video', (req, res) => {
      console.log(req.body.videoId);
      db.collection('posts').findOneAndDelete({videoId: req.body.videoId}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        //passport stratagies (local strategy is just email and password, additional strategies are facebook etc logins)
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/test', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/test', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
