const pgp = require('pg-promise')(/* options */)
const db = pgp(`postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_IP}:${process.env.DB_PORT}/${process.env.DB_NAME}`)

exports.addUrl = function(shortId, originalUrl){
    return db.one('INSERT INTO urls(short_id, original_url) VALUES($1, $2) RETURNING *', [shortId, originalUrl]);
}

exports.urlExists = async function(shortId){
    try{
        const urls = await db.any('SELECT original_url FROM urls WHERE short_id = $1', [shortId]);
        if(urls.length > 0){
            console.log(`url retrieved ${urls[0]}`);
            return true;
        }
        
        console.log("url is empty");
    }catch(error){
        console.log(`error on retrieving url: ${error}`);
    }

    return false;
}

exports.getOriginalUrl = async function(shortId){
    try{
        const url = await db.one('SELECT original_url FROM urls WHERE short_id = $1', [shortId]);
        return url.original_url;
    }catch(error){
        console.log(`error on retrieving url: ${error}`);
    }

    return "";
}

exports.addUser = async function(email, passwordHash){
    return db.one('INSERT INTO users(email, password_hash) VALUES($1, $2) RETURNING *', [email, passwordHash]);
}

exports.getUser = async function(email){
    try{
        const user = await db.one('SELECT * FROM users WHERE email = $1', [email]);
        return user;
    }catch(error){
        console.log(`error on retrieving user: ${error}`);
    }

    return null;
}