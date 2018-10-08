require("dotenv").config();
var request = require("request");
var moment = require("moment");
var fs = require("fs");
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var divider = "\n------------------------------------------------------------\n\n";
var command = process.argv[2];
var queryURL = "";
var media = process.argv.slice(3).join(" ");

// Check if valid command given from user
function init() {
    if (command === "concert-this") {
        concertThis();
    } else if (command === "spotify-this-song") {
        spotifyThis();
    } else if (command === "movie-this") {
        movieThis();
    } else if (command === "do-what-it-says") {
        doThis();
    } else {
        console.log("Please input a valid command followed by a valid media title:" + 
        "\n[concert-this,spotify-this-song,movie-this,do-what-it-says]")
    }
}

init();

function concertThis() {
    queryURL = "https://rest.bandsintown.com/artists/" +
        media + "/events?app_id=codingbootcamp";
    console.log(queryURL);
    request(queryURL, function (err, response, body) {
        // Parse the response body (string) to a JSON object
        var jsonData = JSON.parse(body)[0];
        
        var rawdate = moment(jsonData.datetime.split("T")[0], "YYYY-MM-DD");
        // showData ends up being the string containing the show data we will print to the console
        var showData = [
            "Name of Venue: " + jsonData.venue.name,
            "Venue Location: " + jsonData.venue.city + ", " + jsonData.venue.country,
            "Date: " + rawdate.format("MM/DD/YYYY"),
        ].join("\n\n");
        fs.appendFile("log.txt", showData + divider, function (err) {
            if (err) throw err;
            console.log(showData);
        });
    });
}

function spotifyThis() {
    var spotify = new Spotify({
        id: keys.spotify.id,
        secret: keys.spotify.secret
    });
    if (media === "") {
        media = "Ace of Base";
    }
    spotify.search({ type: 'track', query: media }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        var showData = [
            "Name of Artist: " + data.tracks.items[0].artists[0].name,
            "Name of Song: " + data.tracks.items[0].name,
            "Preview URL: " + data.tracks.items[0].preview_url,
            "Album: " + data.tracks.items[0].album.name,
        ].join("\n\n");
        fs.appendFile("log.txt", showData + divider, function (err) {
            if (err) throw err;
            console.log(showData);
        });
    });
}

function movieThis() {
    if (media === "") {
        media = "Mr. Nobody";
    }
    request("http://www.omdbapi.com/?t=" + media +
        "&y=&plot=short&apikey=trilogy",
        function (error, response, body) {
            if (!error && response.statusCode === 200) {
                jsonData = JSON.parse(body);
                var showData = [
                    "Movie Title: " + jsonData.Title,
                    "Movie Year: " + jsonData.Year,
                    "IMDB Rating: " + jsonData.imdbRating,
                    "Rotten Tomatoes Rating: " + jsonData.Ratings[1].Value,
                    "Country of Production: " + jsonData.Country,
                    "Movie Language: " + jsonData.Language,
                    "Plot: " + jsonData.Plot,
                    "Actors: " + jsonData.Actors
                ].join("\n\n");
                fs.appendFile("log.txt", showData + divider, function (err) {
                    if (err) throw err;
                    console.log(showData);
                });
            }
        });
}

function doThis () {
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) throw err;
        var dataArr = data.split(",");
        command = dataArr[0];
        media = dataArr[1];
        init();
    });
}
