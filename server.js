var express = require("express");
const session = require("express-session");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");

var app = express();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded())
app.use(express.static("public"));
app.set("view engine", "ejs");

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

app.get("/", function (req, res) {
    res.render('pages/index')
});

app.get("/all", function (req, res) {
    db.scrapedData.find({}, function (error, found) {
        if (error) {
            console.log(error);
        }
        else {
            // res.json(found);
            res.render('pages/news', { result:[0] });
        }
    });
});

app.get("/scrape", function (req, res) {
    axios.get("https://www.ign.com/articles?tags=news").then(function (response) {
        var $ = cheerio.load(response.data);

        var promises = [];
        $(".listElmnt-blogItem").each(function (i, element) {
            var title = $(element).children().eq(0).text();
            var summary = $(element).children().eq(1).text();
            var link = $(element).children().eq(0).attr("href");

            // console.log('------line40-----')
            // console.log($(element).children().eq(0).attr('href'));
            // console.log($(element).children().eq(0).text());
            // console.log($(element).children().eq(1).text());
            // console.log('------line42-----')

            // console.log(title, summary, link)

            if (title && summary && link) {
                var promise = myfunction(title, summary, link)
                promises.push(promise)
            }
        })
        // res.send('VGN Scrapped!')
        Promise.all(promises)
            .then(function (result) {
                console.log(result)
                // res.json(result)
                res.render('pages/news', { result });
            })
    });
});

app.listen(3001, function () {
    console.log("App running on port 3001!")
});

function myfunction(title, summary, link) {
    return new Promise(function (resolve, reject) {
        db.scrapedData.insert({
            title: title,
            summary: summary,
            link: link
        }, function (err, res) {
            if (err) {
                return reject()
            }
            return resolve(res)
        })
    })
}