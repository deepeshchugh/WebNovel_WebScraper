var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var chrome  = require("chromedriver"); 
var waitTimer = 10; //time to wait before starting in seconds



// const capabilities = webdriver.Capabilities.phantomjs();
// capabilities.set(webdriver.Capability.ACCEPT_SSL_CERTS, true);
// capabilities.set(webdriver.Capability.SECURE_SSL, false);
// capabilities.set('phantomjs.cli.args', ['--web-security=no', '--ssl-protocol=any', '--ignore-ssl-errors=yes']);
// const driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome(), capabilities).build();

/** 
 * Set chrome command line options/switches
*/      

// var chromeCapabilities = webdriver.Capabilities.chrome();
// //setting chrome options to start the browser fully maximized
// var chromeOptions = {
//     'args': ['--ignore-ssl-errors', "--ignore-certificate-errors",'--allow-insecure-localhost']
// };
// chromeCapabilities.set('chromeOptions', chromeOptions);
// var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();


var fs = require("fs");
const path = require("path")

// var INDEX = "https://boxnovel.com/novel/virtual-world-close-combat-mage/"

module.exports = function(Index,chapterNumbers){
    const driver = new webdriver.Builder()
.forBrowser('chrome')
.build();
    driver.get(Index);
    pageList = []

    paramArray = [chapterNumbers,Index,pageList,driver]
    Pause(waitTimer,startGettingChapters,paramArray);
}

async function startGettingChapters(paramArray){
    console.log("Opening Webpage");   
    //clicking the show more button
    chapterNumbers = paramArray[0]
    link = paramArray[1]
    driver = paramArray[3]
    shortenedLink= link.substr(0,link.lastIndexOf("/"))
    novelName = shortenedLink.substr(shortenedLink.lastIndexOf("/")+1,shortenedLink.length)
    console.log(novelName);
    var dir = './chapters/'+novelName;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, err => { if (err) { 
            return console.error(err); 
          } });
    }
    driver.findElement(By.className("btn btn-link chapter-readmore less-chap")).click();
    Pause(waitTimer,getChapters,[chapterNumbers,novelName,paramArray[2],driver]);
}

function getChapters(paramArray){
    pageList = paramArray[2]
    driver = paramArray[3]
    driver.findElements(By.className("wp-manga-chapter")).then(async function(elementList){
        initCount = elementList.length;
        pageList = await GetLinks(elementList,initCount,pageList);
        await GetChapterTexts([paramArray[0],paramArray[1],pageList,driver]);
        console.log(pageList.length);
        Pause(waitTimer,QuitDriver,driver)
    });
}

async function GetLinks(elementList,count,pageList){
    for(null;count>0;count--){
        pageList = await GetLink(elementList,count,pageList);
    }
    return pageList;
}

async function GetLink(elementList,count,pageList){
    linkBlock = await elementList[count-1].findElement(By.tagName("a"));
    link = await linkBlock.getAttribute("href");
    pageList.push(link) ;
    return pageList;
}

async function GetChapterTexts(paramArray){
    numberArray = paramArray[0];
    pageList = paramArray[2];
    for(i = numberArray[0]-1;i<numberArray[1];i++){
        await GetChapterText(pageList[i],i,paramArray[1]);
    }
}
async function GetChapterText(link,chapterNumber,novelName){
    console.log("Getting text from chapter number " + (chapterNumber+1));
    driver = paramArray[3]
    driver.get(link);
    await timeout(waitTimer);
    chapterBlock = await driver.findElement(By.className("entry-content"));
    chapterText = await chapterBlock.getAttribute("innerHTML");
    //console.log(chapterText) 
    await fs.writeFile("./chapters/"+novelName+"/"+(chapterNumber+1)+".html", chapterText, (err) => { 
        
        // In case of a error throw err. 
        if (err) throw err; 
    }) 
}
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, 1000*ms));
}
function Pause(Time,FuncName,param1){
    if(typeof param1 !== "undefined") {setTimeout(FuncName,Time*1000,param1);}
    else {setTimeout(FuncName,Time*1000);}
}

function QuitDriver(driver){
    console.log("Closing Webpage")
    driver.close();
    driver.quit();
}
