const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/data');
const { json } = require('express/lib/response');
require('dotenv').config()

dbUrl = process.env.MONGODB_URL

mongoose.connect(dbUrl)
.then((result) => console.log('database connected'))
.catch((err) => console.log(err));
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const name = req.body.username;
  const user = new User({
    username: name
  });

  user.save()
  .then((result) => {
    res.json({username: name, _id: result._id});
  })
  .catch((err) => res.send('username already taken'));
});

app.get('/api/users', (req, res) => {
  User.find()
  .then((result) => {
    res.send(result);
    console.log(result);
  })
  .catch((err) => res.send('cannot find any users'));
});

app.post('/api/users/:_id/exercises', (req, res) => {
    let userId = req.params._id;
    let desc = req.body.description;
    let dur = req.body.duration;
    let day = req.body.date;

    if(day === '') {
      day = new Date().toDateString();
    } else {
      day = new Date(day).toDateString()
    }


  User.findByIdAndUpdate(userId, {$push:{log:{description: desc, duration: dur, date: day}}},
      {new: true},
      (err, data) => {
          if (err) {
            res.send('user not found');
          }
          if (data) {
            let returnObj = {
              _id: userId,
              username: data.username,
              description: desc,
              duration: parseInt(dur),
              date: day
            }
          res.json(returnObj);
          }
      })

});

app.get('/api/users/:id/logs', (req, res) => {
  let userId = req.params.id;
 let from = req.query.from;
  let to = req.query.to;
  let limit = parseInt(req.query.limit);

 User.findById(userId, (err, data) => {

      if (err) {
        res.send('user not found');
      }
    
      let log = data.log.map(item => {
        return {
          description: item.description,
          duration: parseInt(item.duration),
          date: new Date(item.date).toDateString(),
        }
      })

      if (from) {
        let newFrom = new Date(from);
        log = log.filter(item => {
          return new Date(item.date) >= newFrom
        });
      }
       if (to) {
        let newTo = new Date(to);
        log = log.filter(item => {
          return new Date(item.date) <= newTo
        });
      }
      if (limit) { 
        log = log.slice(0, limit)
      }
      
        let returnUser = new Object();
        returnUser.username = data.username;
        returnUser._id = data._id;
        returnUser.count = parseInt(data.log.length);
        returnUser.log = log;
        console.log(returnUser);
       return res.send(returnUser);
    
      
    })

})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
