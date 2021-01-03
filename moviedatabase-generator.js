const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
const fs = require("fs");
const path = require("path");
var faker = require('faker');
const { writer } = require("repl");
const baseURL = "http://localhost:3000";
const moviesURL="/movies/";
const usersURL="/users/";
const actorsURL = "/actors/"
const directorURL = "/directors/"
writerURL = "/writers/"
const reviewsURL = "/reviews/"
const { v4: uuidv4 } = require('uuid');

let MovieObject = require("./movie-data.json");
let movies = [];

for(let i = 0; i < MovieObject.length; i++){
    let newMovie = {};
    newMovie.id = uuidv4();
    newMovie.URL = baseURL+moviesURL+":"+newMovie.id;
    newMovie.Title = MovieObject[i].Title;
    newMovie.Year = MovieObject[i].Year;
    newMovie.Released = MovieObject[i].Released;
    newMovie.Runtime = MovieObject[i].Runtime;
    newMovie.Genre = MovieObject[i].Genre;
    newMovie.Director = MovieObject[i].Director;
    newMovie.Writer = MovieObject[i].Writer;
    newMovie.Actors = MovieObject[i].Actors;
    newMovie.Plot = MovieObject[i].Plot;
    newMovie.Awards = MovieObject[i].Awards;
    newMovie.Poster = MovieObject[i].Poster;
    newMovie.Rating = MovieObject[i].Rating;
    newMovie.reviews = [];
    newMovie.minrating;
    newMovie.maxrating;
    movies.push(newMovie);
}

let UserObject = require("./users.json");
let Users = [];

let PictureObject = require("./profilepic.json");
let UsedPictures = [];
function generateAvatar(){
    let randomizer;

    randomizer = Math.floor((Math.random()*PictureObject.length)+0);
    while(UsedPictures.includes(randomizer)){
        randomizer = Math.floor((Math.random()*PictureObject.length)+0);
    }
    UsedPictures.push(randomizer);
    return PictureObject[randomizer].download_url;

}

for(let i =0; i<UserObject.length; i++){
    let newUser = {};

    newUser.id = uuidv4();
    newUser.URL = baseURL+usersURL+":"+newUser.id;
    newUser.username = UserObject[i].username;
    newUser.password= UserObject[i].password;
    newUser.following= [];
    newUser.followers= [];
    newUser.reviews= [];
    newUser.moviesAdded= [];
    newUser.profilePicture= generateAvatar();
    newUser.contributingUser= UserObject[i].contributingUser;
    newUser.isonline= UserObject[i].isonline;

    //Add a random amount of movies to the user's reviewed movies
    let numMovies = 100;
    let randMovie;
    //Keeps track of what the user has reviewed
    let reviewedMovies = [];
    for(let j = 0; j < numMovies; j++){
        randMovie = Math.floor((Math.random()*MovieObject.length)+0);
        //Ensures all reviews are unique
        while(reviewedMovies.includes(randMovie)){
            randMovie = Math.floor((Math.random()*MovieObject.length)+0);
        }
        reviewedMovies.push(randMovie);
        newUser.reviews.push(movies[randMovie].Title);
        let customreview = {};
        customreview.owner = newUser.username;
        customreview.starrating = Math.floor((Math.random()*10)+1);
        //Gets the date
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        customreview.date = date+' '+time
        customreview.longreview = faker.lorem.sentences();
        movies[randMovie].reviews.push(customreview);
    }
    Users.push(newUser);
}

/*
Initally used to generate an additional 500 random accounts
for(let i =0; i<500; i++){
    let newUser = {};

    newUser.id = uuidv4();
    newUser.URL = baseURL+usersURL+":"+newUser.id;
    newUser.username = faker.internet.userName();
    newUser.password= faker.internet.password();
    newUser.following= [];
    newUser.followers= [];
    newUser.reviews= [];
    newUser.moviesAdded= [];
    newUser.profilePicture= faker.internet.avatar();
    newUser.contributingUser= false;
    newUser.isonline= false;

    //Add a random amount of movies to the user's reviewed movies
    let numMovies = 100;
    let randMovie;
    //Keeps track of what the user has reviewed
    let reviewedMovies = [];
    for(let j = 0; j < numMovies; j++){
        randMovie = Math.floor((Math.random()*MovieObject.length)+0);
        //Ensures all reviews are unique
        while(reviewedMovies.includes(randMovie)){
            randMovie = Math.floor((Math.random()*MovieObject.length)+0);
        }
        reviewedMovies.push(randMovie);
        newUser.reviews.push(movies[randMovie].Title);
        let customreview = {};
        customreview.owner = newUser.username;
        customreview.starrating = Math.floor((Math.random()*10)+1);
        //Gets the date
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        customreview.date = date+' '+time
        customreview.longreview = faker.lorem.sentences();
        movies[randMovie].reviews.push(customreview);
    }
    Users.push(newUser);
}
*/
let Actor = [];
let splitActors;

//Splits the actors property by comma
for(let i = 0; i<MovieObject.length; i++){
    splitActors = movies[i].Actors.split(',');
    
    //Going through the actor array
    for(let j = 0; j<splitActors.length; j++){
        //Removes any spaces
        splitActors[j] = splitActors[j].replace(/\s+/g, '');
    }
    //at this point split actors is what the actors in each movie it is 
    for(let j = 0; j < splitActors.length; j++){
        for(let k = 0; k < Actor.length; k++){
            //if this actor already exists in the database...
            if(Actor[k].name == splitActors[j]){
                Actor[k].works.push(movies[i].Title);
                //send notification as well to the users maybe idk not server side
            }
        }
        //if this part is achieved then it means splitactors[j] does not belong to a database
        //this is where you create a new actor
        let newActor = {};
        newActor.name = splitActors[j];
        newActor.id = uuidv4();
        newActor.URL = baseURL+actorsURL+":"+newActor.id;
        newActor.works = []
        newActor.works.push(movies[i].Title);
        Actor.push(newActor);
    }
}

let Director = [];
let splitDirectors;

//Splits the director property by comma
for(let i = 0; i<MovieObject.length; i++){
    splitDirectors = movies[i].Director.split(',');
    
    //Going through the directors array
    for(let j = 0; j<splitDirectors.length; j++){
        //Removes any spaces
        splitDirectors[j] = splitDirectors[j].replace(/\s+/g, '');
    }
    //at this point split directors is what the actors in each movie it is 
    for(let j = 0; j < splitDirectors.length; j++){
        for(let k = 0; k < Director.length; k++){
            //if this director already exists in the database...
            if(Director[k].name == splitDirectors[j]){
                Director[k].works.push(movies[i].Title);
            }
        }
        //if this part is achieved then it means splitactors[j] does not belong to a database
        //this is where you create a new actor
        let newDirector = {};
        newDirector.name = splitDirectors[j];
        newDirector.id = uuidv4();
        newDirector.URL = baseURL+directorURL+":"+newDirector.id;
        newDirector.works = []
        newDirector.works.push(movies[i].Title);
        Director.push(newDirector);
    }

}

for(let i = 0; i < MovieObject.length; i++){
    let minrating = 10;
    for(let j = 0; j < movies[i].reviews.length; j++){
        if(movies[i].reviews[j].starrating < minrating){
            minrating = movies[i].reviews[j].starrating;
        }
        movies[i].minrating = minrating;
    }
}

for(let i = 0; i < MovieObject.length; i++){
    let maxrating = 0;
    for(let j = 0; j < movies[i].reviews.length; j++){
        if(movies[i].reviews[j].starrating > maxrating){
            maxrating = movies[i].reviews[j].starrating;
        }
        movies[i].maxrating = maxrating;
    }
}


fs.writeFile(path.join(".","movie-Data.json"), JSON.stringify(movies), function(err){
    if(err){
		console.log("Error saving movies.");
		console.log(err);
	}else{
		console.log("Movies saved.");
	}
});
fs.writeFile(path.join(".","directors.json"), JSON.stringify(Director), function(err){
    if(err){
		console.log("Error saving Director.");
		console.log(err);
	}else{
		console.log("directors saved.");
	}
});
fs.writeFile(path.join(".","actors.json"), JSON.stringify(Actor), function(err){
    if(err){
		console.log("Error saving actor.");
		console.log(err);
	}else{
		console.log("actors saved.");
	}
});
fs.writeFile(path.join(".","users.json"), JSON.stringify(Users), function(err){
    if(err){
        console.log("Error saving movies.");
        console.log(err);
    }else{
        console.log("Movies saved.");
    }
});


let Writer = [];
let splitWriters;

//Splits the writers property by comma
for(let i = 0; i<MovieObject.length; i++){
    splitWriters = movies[i].Writer.split(',');
    
    //Going through the writer array
    for(let j = 0; j<splitWriters.length; j++){
        //Removes any spaces
        splitWriters[j] = splitWriters[j].replace(/\s+/g, '');
    }
    //at this point split writer is what the actors in each movie it is 
    for(let j = 0; j < splitWriters.length; j++){
        for(let k = 0; k < Writer.length; k++){
            //if this writer already exists in the database...
            if(Writer[k].name == splitWriters[j]){
                Writer[k].works.push(movies[i].Title);
            }
        }
        //if this part is achieved then it means splitactors[j] does not belong to a database
        //this is where you create a new actor
        let newWriter = {};
        newWriter.name = splitWriters[j];
        newWriter.id = uuidv4();
        newWriter.URL = baseURL+writerURL+":"+newWriter.id;
        newWriter.works = []
        newWriter.works.push(movies[i].Title);
        Writer.push(newWriter);
    }
}
fs.writeFile(path.join(".","writers.json"), JSON.stringify(Writer), function(err){
    if(err){
		console.log("Error saving writers.");
		console.log(err);
	}else{
		console.log("writers saved.");
    }
})
