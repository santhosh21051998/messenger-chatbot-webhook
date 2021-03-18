const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server
const axios = require('axios');
let VERIFY_TOKEN = "";

function sendApi(VERIFY_TOKEN, reply)  {
  console.log('sendApi initiated');
  console.log(`sendApi::request: ${JSON.stringify(reply)}`)
  axios.post(`https://graph.facebook.com/v8.0/me/messages?access_token=${VERIFY_TOKEN}`,reply).then((res)=>{
    //console.log(`sendApi::response: ${JSON.stringify(res)}`);
  }).catch((error)=>{
    console.log(`sendApi:: ${error}`); 
  })
} 
  app.post('/webhook', (req, res) => {  
    let body = req.body;
    let reply = {
                 "messaging_type": "<MESSAGING_TYPE>",
                 "recipient" : {
                  "id":"<PSID>"
                 },
                 "message":{
                  "text":"Hey I am Spider-Man, how can I help you"
                 }
                };
    
   // console.log(`messenger request: ${JSON.stringify(req.body)}`)
  
    // Checks this is an event from a page subscription
    if (body.object === "page") {
  
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];
        reply.recipient.id = webhook_event.sender.id;
        reply.messaging_type = "RESPONSE";
        sendApi(VERIFY_TOKEN, reply);
        //console.log(`webhook::request: ${JSON.stringify(webhook_event)}`);
      });
      // Returns a '200 OK' response to all requests
    
      res.status(200).send('EVENT_RECEIVED');
    } 
     else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    } 
  
  });

 app.get('/', (req, res) => {
  res.status(200).send("Welcome to webhook API");
 })


  // Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

   
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  });


app.listen(process.env.PORT || 1000, () => console.log('webhook is listening'));
