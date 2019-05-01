var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");

var app = express();

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

app.get("/", function (req, res) {
    res.send("Ready!")
});

app.get("/all", function (req, res) {
    db.scrapedData.find({}, function (error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });
});

app.get("/scrape", function (req, res) {
    axios.get("https://www.ign.com/articles?tags=news").then(function (response) {
        var $ = cheerio.load(response.data);
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
                db.scrapedData.insert({
                    title: Title,
                    summary: Summary,
                    link: Link
                },
                function (err, inserted) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(inserted);
                    }
                });
            }

        })
    });
    res.send("Scrape Complete");
});

app.listen(3000, function () {
    console.log("App running on port 3000!")
});