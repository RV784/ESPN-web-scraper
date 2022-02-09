//const url = "https://www.espncricinfo.com/series/ipl-2021-1249214/mumbai-indians-vs-royal-challengers-bangalore-1st-match-1254058/full-scorecard";
//venue date opponent result runs balls fours sixes sr
const request = require("request");
const cheerio = require("cheerio");
const fs= require("fs");
const xlsx = require("xlsx");
const path = require("path");

function processScoreCard(url){
    request(url, cb);
}

function cb(err, response, html){
    if(err){
        console.log(err);
        return;
    }else{
        // console.log(html);
        extractMatchDetails(html);
    }
}

function extractMatchDetails(html){
    //venue date opponent result runs balls fours sixes sr
    
    // ipl
    //    team
    //       player
    //          runs balls fours sixes s.rate opponent venue date
    //for both teams in match, venue result date will stay same

    //.header-info .description    - venue/date
    //.event .status-text          - result
    let $ = cheerio.load(html);
    let descElem = $(".header-info .description");
    let result = $(".event .status-text");
    
    let stringArr = descElem.text().split(",");
    let venue = stringArr[1].trim();
    let date = stringArr[2].trim();
    result = result.text();

    let innings = $(".card.content-block.match-scorecard-table .Collapsible");
    // let htmlString = "";
    for(let i = 0 ; i < innings.length ; i++){
        // htmlString = $(innings[i]).html();
        // team
        let teamName = $(innings[i]).find("h5").text();
        teamName = teamName.split("INNINGS")[0].trim();
        let opponentIndex = i == 0 ? 1: 0;
        let opponentName = $(innings[opponentIndex]).find("h5").text();
        opponentName = opponentName.split("INNINGS")[0].trim();
        let cInnings = $(innings[i]);
        console.log(`${venue} | ${date} | ${teamName} | ${opponentName} | ${result}`);
        
        let allRows = cInnings.find(".table.batsman tbody tr");
        for(let j = 0 ; j < allRows.length ; j++){
            let allCols = $(allRows[j]).find("td");
            let isWorthy = $(allCols[0]).hasClass("batsman-cell");
            if(isWorthy == true){
                // console.log(allCols.text());
                //         runs balls fours sixes s.rate opponent
                let playerName = $(allCols[0]).text().trim();
                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let sr = $(allCols[7]).text().trim();
                console.log(`${playerName} | ${runs} | ${balls} | ${fours} | ${sixes} | ${sr}`);
                processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentName, venue, date, result);
            }
        }
        //     player
        //         runs balls fours sixes s.rate opponent


        
    }
    // console.log(htmlString);
}

function processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentName, venue, date, result){
    let teamPath = path.join(__dirname, "ipl", teamName);   //__dirname gives the directory name you are working on
    dirCreater(teamPath);

    let filePath = path.join(teamPath, playerName + ".xlsx");
    let content = excelReader(filePath, playerName);
    let playerObj = {
        teamName, 
        playerName, 
        runs, 
        balls, 
        fours, 
        sixes, 
        sr, 
        opponentName, 
        venue,  
        result
    }
    content.push(playerObj);
    excelWriter(filePath, content, playerName);
}

function dirCreater(filePath){
    if(fs.existsSync(filePath) == false){
        fs.mkdirSync(filePath);
    }
}

function excelWriter(filePath, data, sheetName){

    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, filePath);
}

function excelReader(filePath, sheetName){
    if(fs.existsSync(filePath) == false){
        return [];
    }
    let wb = xlsx.readFile(filePath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

module.exports = {
    ps: processScoreCard
}