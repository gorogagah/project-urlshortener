require('dotenv').config()

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { customAlphabet } = require("nanoid");

const db = require("./database/index");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");

// Basic Configuration
const port = 3000;

const pattern = new RegExp(
  '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', // fragment locator
  'i'
);

// Create short link
app.post("/shorten", async function(req, res){
  const url = req.body["url"];
  if(!url){
    return res.json({ error: "invalid url", message: "url is empty" });
  }
  
  // Check validity
  if(!pattern.test(url)){
    return res.json({ error: "invalid url", url: url });
  }

  // Create short url
  let shortId = await createUrl();
  if(shortId == ""){
    console.log(`too many attempts to create short url`);
    return res.json({ error: "attempt limit", message: "failed to create short url many times"});
  }

  db.storeUrl(shortId, url).then((data) => {
    console.log(`url stored: ${data}`);
    return res.json({ original_url: url, short_id: shortId });
  }).catch((error) => {
    console.log(`error on storing url: ${error}`);
    return res.json({ error: "database insert", message: "failed to store url to database"});
  });
});

async function createUrl(){
  let size = 6;
  let attempt = 0;

  while (true) {
    let shortUrl = nanoid(size);
    if(!(await db.urlExists(shortUrl))){
      return shortUrl;
    }

    attempt++;
    if(attempt % 2 == 0 && size <= 10){
      size++;
    }

    if(attempt > 100){
      return "";
    }
  }
}

app.get("/:short_id", async function(req, res){
  const url = await db.getOriginalUrl(req.params.short_id);
  res.redirect(url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});