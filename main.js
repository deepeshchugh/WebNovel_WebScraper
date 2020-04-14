var scraper = require("./func.js");
// scraper("https://boxnovel.com/novel/virtual-world-close-combat-mage/",[10,15])

var express = require("express");
var app = express();
app.set("view engine","ejs");
var bodyParser = require("body-parser");
const fs = require('fs');
const path = require("path")
const dir = './chapters';

const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')

const isDirectory = source => lstatSync(source).isDirectory()
 function getDirectories(source){
    content = readdirSync(source);
    contentList = content.map(name => join(source,name));
    returnList = []
    console.log("Here")
    console.log(content.length)
    console.log(content)
    for(var i = 0;i<content.length;i++){
        console.log(contentList)
        if(isDirectory(contentList[i])){
            returnList.push(content[i])
        }
    }
return returnList
}

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));


                                    //GET requestss
app.get('/', async function(req,res) {
    res.render('main.ejs');
});
app.get('/download', async function(req,res) {
    res.render('download.ejs');
});
app.get('/novels', async function(req,res) {
    fl =  await getDirectories("./chapters")
    console.log(fl)
    res.render('novelList.ejs',{folders:fl});
});

app.get('/404',function(req,res){
    res.render('404.ejs');
});

app.get('/:novelname', async function(req,res) {
    var novelName = req.params.novelname;
    if (!fs.existsSync("./chapters/"+novelName)) {
        res.redirect("/404")
    }
    else{
        fs.readdir(join("./chapters",novelName), (err, files) => {
            console.log(files)
            truncatedFiles = files.map(file=>path.parse(file).name)
            res.render('novel.ejs',{chapters:truncatedFiles,novelName:novelName});
    
          });
    }

});

//misc pages
app.get('/:novelname/:chapterno', function(req,res) {
    var chno = req.params.chapterno;
    var novelName = req.params.novelname;
    var content;
    try {
        if (!fs.existsSync("./chapters/"+novelName+"/"+chno+".html")) {
          res.redirect("/404")
        }
        else{
            fs.readFile("./chapters/"+novelName+"/"+chno+".html", function read(err, data) {
                if (err) {
                    throw err;
                }
                nextchno = parseInt(chno)+1;
                prevchno = parseInt(chno)-1;
                content = data;
                res.render('chapter.ejs',{chno:chno,content:content,nextchno:nextchno,prevchno:prevchno,novelName:novelName});
            });
        }
      } catch(err) {
        console.error(err)
    }
    
    
});

app.post('/',function(req,res){
    console.log(req.body);
    index = req.body.index;
    start = parseInt(req.body.start);
    end = parseInt(req.body.end);
    scraper(index,[start,end]);
    res.redirect("/");
});
app.listen(3000 ,()=>{
    console.log("Server started at port 3000");
});
