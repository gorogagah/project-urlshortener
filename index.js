require('dotenv').config();

const dns = require('node:dns');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const savedUrl = [];

app.post("/api/shorturl", function(req, res){
  const url = req.body["url"];

  let tempDnsUrl = url.slice(url.indexOf("//") + 2);
  let slashIndex = tempDnsUrl.indexOf("/");
  var dnsUrl = slashIndex < 0 ? tempDnsUrl : tempDnsUrl.slice(0, slashIndex); 
  
  dns.lookup(dnsUrl, function(err, address){
    if(err && !url.includes("localhost")){
      res.json({ error: 'invalid url' });
    }else{
      savedUrl[savedUrl.length + 1] = url;
      res.json({ original_url : url, short_url : savedUrl.length-1});
    }
  });
});

app.get("/api/shorturl/:short_url", function(req, res){
  const short_url = req.params.short_url;
  res.redirect(savedUrl[short_url]);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
