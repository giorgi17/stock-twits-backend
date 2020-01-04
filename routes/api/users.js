const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const Mongoose = require('mongoose')
const axios = require('axios');

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateStocktwitsInput = require("../../validation/stocktwits");

// Load User model
const User = require("../../models/User");
const StocktwitsUser = require("../../models/StocktwitsUser");

// Set "Access-Control-Allow-Origin" to give frotnend access to backend
router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'https://stock-twits-app.herokuapp.com');
  // res.setHeader('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  next();

    // // Request methods you wish to allow
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // // Set to true if you need the website to include cookies in the requests sent
    // // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);

    // // Pass to next layer of middleware
    // next();
});

// @route POST api/users/get-twits-data
// @desc Get twits from stocktwits api for certain symbol
// @access Public
router.post("/get-twits-data", (req, res) => {
  // Send request to stocktwits api to get twits for certain symbol

  const api_url = "https://api.stocktwits.com/api/2/streams/symbol/" + req.body.symbol.toUpperCase() + ".json";

  axios
    .get(api_url)
    .then(axios_response => {
      console.log(axios_response.data.symbol + " EEET");
      res.status(201).json(axios_response.data);
    }) 
      .catch(err => {
        res.status(400).json({errors: err.message});
      }
      );
});

// @route POST api/users/stocktwits-login
// @desc stockTwits authentication
// @access Public
router.post("/stocktwits-login", (req, res) => {
  // Form validation
  const { errors, isValid } = validateStocktwitsInput(req.body);
  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

  try {
    User.findOne({ email: req.body.user_id }).then(async user => {
      if (user) {
          const token_updated_result = await User.updateOne(
            { user_id: req.body.user_id }, 
            {$set: {access_token: req.body.access_token}}
          );
        res.status(201).json(token_updated_result);
      } else {
        const newUser = new User({
          user_id: req.body.user_id,
          username: req.body.username,
          access_token: req.body.access_token,
        });
        res.status(201).json(newUser);
      }
    });
  } catch (e) {
    res.status(400).json({erros: e.message});
  }
});

// @route POST api/users/delete-symbol
// @desc Delete symbol for user
// @access Public
router.post("/delete-symbol", (req, res) => {
  // Validation
  if (req.body.symbol.length == 0){
    return res.status(400).json({
      errors: "Input is empty!"
    });
  }
  try {
    if (req.body.stock){
      const u = StocktwitsUser.find( { user_id: req.body.id } ).then(async user => {
        if (user) {
          const symbolCopy = [...req.body.symbols];
          console.log("F - " + symbolCopy);
          const index = symbolCopy.indexOf(req.body.symbol);
          if (index > -1) {
            symbolCopy.splice(index, 1);
            console.log("This is index - " + index);
          }
          const symbolResult = await StocktwitsUser.updateOne(
              { user_id: req.body.id }, 
              {$set: {symbols: [...symbolCopy]}}
          );
          res.status(201).json(symbolResult);
        }
      }); 
    } else {
      const u = User.find( { _id: req.body.id } ).then(async user => {
        if (user) {
          const symbolCopy = [...user[0].symbols];
          console.log("F - " + symbolCopy);
          const index = symbolCopy.indexOf(req.body.symbol);
          if (index > -1) {
            symbolCopy.splice(index, 1);
          }
          const symbolResult = await User.updateOne(
              { _id: req.body.id }, 
              {$set: {symbols: [...symbolCopy]}}
          );
          res.status(201).json(symbolResult);
        }
      }); 
    }
    
  } catch (e) {
    res.status(400).json({erros: e.message});
  }
});

// @route POST api/users/add-symbol
// @desc Add new symbol for user
// @access Public
router.post("/add-symbol", (req, res) => {
  // Validation
  if (req.body.symbol.length == 0){
    return res.status(400).json({
      errors: "Input is empty!"
    });
  }
  try {
    if (req.body.stock){
      const u = StocktwitsUser.find( { user_id: req.body.id } ).then(async user => {
        if (user) {
          const symbolResult = await StocktwitsUser.updateOne(
              { user_id: req.body.id }, 
              {$set: {symbols: [...user[0].symbols, req.body.symbol.toUpperCase()]}}
          );
          res.status(201).json(symbolResult);
        }
      }); 
    } else {
      const u = User.find( { _id: req.body.id } ).then(async user => {
        if (user) {
          const symbolResult = await User.updateOne(
              { _id: req.body.id }, 
              {$set: {symbols: [...user[0].symbols, req.body.symbol.toUpperCase()]}}
          );
          res.status(201).json(symbolResult);
        }
      }); 
    }
    
  } catch (e) {
    res.status(400).json({erros: e.message});
  }
});

// @route GET api/users/get-symbols
// @desc get symbols list for user
// @access Public
router.post("/get-symbols", async (req, res) => {
  try {
    let user;
    if (req.body.stock){
      user = await StocktwitsUser.find( { user_id: req.body.id } );
    } else {
      user = await User.find( { _id: req.body.id } );
    }
    
    if (user) {
      res.status(201).json(user);
    }
    
    // const u = User.find( { _id: req.body.id } ).then( user => {
    //   if (user) {
    //     res.status(201).json(user);
    //   }
    // });
  } catch (e) {
    res.status(400).json({erros: e.message});
  }
     
});

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
    // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return res.status(400).json({ email: "Email already exists" });
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });
  // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    });
  });

  // @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
    // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  const email = req.body.email;
    const password = req.body.password;
  // Find user by email
    User.findOne({ email }).then(user => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: "Email not found" });
      }
  // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name
          };
  // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      });
    });
  });

  module.exports = router;