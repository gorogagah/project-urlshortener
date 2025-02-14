const express = require('express');
const { customAlphabet } = require("nanoid");
const db = require("../database/index");

const router = express.Router();

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");

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
router.post("/shorten", async function(req, res){
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

    db.addUrl(shortId, url).then((data) => {
        console.log(`url added: ${data}`);
        return res.json({ original_url: url, short_id: shortId });
    }).catch((error) => {
        console.log(`error on adding url: ${error}`);
        return res.status(400).json({ error: "database insert", message: "failed to add url to database"});
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

router.get("/:short_id", async function(req, res){
    const url = await db.getOriginalUrl(req.params.short_id);
    res.redirect(url);
});

module.exports = router;