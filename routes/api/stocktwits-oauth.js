const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const Mongoose = require('mongoose')
const axios = require('axios');

// Load input validation
const validateStocktwitsInput = require("../../validation/stocktwits");

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

  let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:8888/callback'

router.get('/stocktwits-login', function(req, res) {
  res.redirect('https://api.stocktwits.com/api/2/oauth/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.STOCKTWITS_CLIENT_ID,
      scope: 'read',
      redirect_uri
    }))
})

router.get('/callback', function(req, res) {
  console.log("This is the code - " + req.query.code)
  let code = req.query.code || null
  let authOptions = {
    url: 'https://api.stocktwits.com/api/2/oauth/token',
    form: {
      client_id: process.env.STOCKTWITS_CLIENT_ID,
      client_secret: process.env.STOCKTWITS_CLIENT_SECRET,
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    // headers: {
    //   'Authorization': 'Basic ' + process.env.STOCKTWITS_CLIENT_ID + ':' + process.env.STOCKTWITS_CLIENT_SECRET
    // },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    console.log(body);
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
    // console.log(access_token)
    // res.redirect(uri + '?access_token=' + access_token)
    // stocktwitsSignIn(body);

    //  LOGGING IN AFTER REGISTERING/UPDATING 
    const dataAfterRegisterLogin = stocktwitsSignIn(body);
      if (dataAfterRegisterLogin.errors == '') {
        // User matched
        // Create JWT Payload
        const payload = {
          user_id: body.user_id,
          username: body.username,
          access_token: body.access_token
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
          .json({ errors: "There was an error while authenticating!" });
      }
  })
})

const stocktwitsSignIn = stocktwitsUserData => {
  // Form validation
  const { errors, isValid } = validateStocktwitsInput(stocktwitsUserData);
  // Check validation
    if (!isValid) {
      return {errors: "Inputs are not valid!"};
    }

  try {
    User.findOne({ user_id: stocktwitsUserData.user_id }).then(async user => {
      if (user) {
          const token_updated_result = await StocktwitsUser.updateOne(
            { user_id: stocktwitsUserData.user_id }, 
            {$set: {access_token: stocktwitsUserData.access_token}}
          );
        return {result: token_updated_result, errors: ''}
      } else {
        const newUser = new StocktwitsUser({
          user_id: stocktwitsUserData.user_id,
          username: stocktwitsUserData.username,
          access_token: stocktwitsUserData.access_token,
        });
        return {result: newUser, errors: ''}
      }
    });
  } catch (e) {
    return {errors: e.message};
  }
};