// Modules
const express = require('express')
const path = require("path")
const push = require('./push')
const bodyParser = require('body-parser');

const app = express();
// console.log("DIRNAME; ",__dirname)
// console.log("DIR; ",path.join(__dirname,"../client"))
app.use(express.static(path.join(__dirname,"../client")))

app.use(bodyParser.json())

app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  next();
})
app.use((req,res,next)=>{
 console.log(req.url);
  next();
})

app.post("/subscribe",(req,res)=>{
  const sub = req.body;
  push.addSubscription(sub);
  res.end();
})

/*
 curl -X POST --header "Content-type: application/json" -d '{"msg":"hello"}' http://localhost:3333/push
*/
app.post("/push",(req,res)=>{
  const msg = JSON.stringify(req.body);
  push.send(msg);
  res.end();
})

app.get("/key",(req,res)=>{
  res.end( push.getKey()) ;
}) 

  
// Start the Server
app.listen( 3333, () =>  console.log('Server Running') )
