const request = require("request");
const cheerio = require("cheerio");
const scoreCardObj = require("./scorecard");
function getAllMatchesLink(url){
    request(url, function(err, response, html){
        if(err){
            console.log(err);
            return;
        }else{
            // console.log(html);
            extractAllLinks(html);
        }
    });
}

function extractAllLinks(html){
    let $ = cheerio.load(html);
    let scoreCardLinks = $("a[data-hover='Scorecard']");
    for(let i = 0 ; i < scoreCardLinks.length ; i++){
        let link = $(scoreCardLinks[i]).attr("href");
        let fullLink = "https://www.espncricinfo.com" + link;
        console.log(fullLink);
        //now provide this full link to scorecard.js
        scoreCardObj.ps(fullLink);
    }
}

module.exports = {
    gAlmatches: getAllMatchesLink
}