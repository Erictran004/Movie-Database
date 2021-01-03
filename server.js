const express = require('express');
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const { v4: uuidv4 } = require('uuid');

app.set("view engine", "pug");


const baseURL = "http://localhost:3000";
const moviesURL="/movies/";
const usersURL="/users/";

const session = require('express-session');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const { start, writer } = require('repl');
const { dir } = require('console');

app.use(session({ secret: 'some secret here'}))
app.use(express.urlencoded({extended: true}));

//Initially bring the user to the login page
app.use((req, res, next)=>{
  if(req.path == "/" || req.path == "/login" || req.path == "/Images/logo.png" || req.path == "/Images/LoginBackground.jpg" || req.path == "/signup" || req.path == "/Signup.html"){
    next();
  }
  else{
    auth(req,res,next);
  }
})

app.use("/", function(req, res, next){
  next();
});
app.use(express.static(__dirname));
app.use(express.static("Images"));
app.use(express.static("CSS"));
app.use(express.static("JSON"));
app.use(express.static("Pages"));

//Gets the movies objects from the json file
let movies = require("./JSON/movie-data.json");
let users = require("./JSON/users.json");
let director = require("./JSON/directors.json");
let actors = require("./JSON/actors.json");
let writers = require("./JSON/writers.json");

app.get("/", (req, res,next)=> {
  res.sendFile(path.join(__dirname + '/index.html'))
  
});

app.get("/client.js", (req, res)=> {
    fs.readFile("client.js", function(err, data){
                if(err){
                    res.status(500).send("erorr: no such file!")
                    return;
                }
                res.status(200).type('.js').send(data);
            });
})

app.post("/login", function(req, res, next){
    if(CheckValidLogin(req.body.username,req.body.password) == 1){
      req.session.username = req.body.username;
      res.redirect('/homepage');
    }
    else{
      res.status(401).send("Invalid credentials");
    }
  })

//Ensures that information enter matches an account and prevents multiple users from login into the same account at the same time
function CheckValidLogin(enteredUsername,enteredPassword){
  for(let x of users){
    if((enteredUsername==x.username) && (enteredPassword==x.password) && (x.isonline == false)){
        let currentuser=get_user(enteredUsername)
        currentuser.isonline = true;
       return 1;
    }
  }
  return 0;
}

//Logs the user out of the account and makes the account go offline and thus available again to login into
function CheckValidLogout(enteredUsername){
  for(let x of users){
    if((enteredUsername==x.username) && (x.isonline == true)){
        let currentuser=get_user(enteredUsername)
        currentuser.isonline = false;
       return 1;
    }
  }
  return 0;
}
//Calls the createUser function to use the information provided in the textboxes 
app.post("/signup", function(req, res, next){
  createUser(req.body.username,req.body.password);
  res.redirect('/');
})

/*
Used to create a new user:
-Assumes that a username and password are provided
-First checks that fields are not missing information
-Checks to ensure that the username provided is unique. If it isn't then the user will not be created and the function returns null
*/

function createUser(username, password){      
  if(!username || !password){       
      return null;
  }

  for(let x of users){
      if(x != null){
          if(x.username == username){ 
              return null;
          }
      }
  }

  /*
  Set initial values for the new user:
  Notable Values Include: username, password, ID, and a URL link to access the user's profile
  -Once initial values are set the new user will be pushed onto the users array and will exist for the duration of the server running
  */
  let newUser = {};

  newUser.id = uuidv4();
  newUser.URL = baseURL+usersURL+":"+newUser.id;
  newUser.username = username;
  newUser.password= password;
  newUser.following=[];
  newUser.followers= [];
  newUser.reviews= [];
  newUser.moviesAdded= [];
  newUser.profilePicture= "https://www.computerhope.com/jargon/g/guest-user.jpg";
  newUser.contributingUser= false;
  newUser.isonline= false;
  newUser.searchedObject = {};

  users.push(newUser);

  return newUser;
}


/*
  Logs out by setting the session's username to undefined
*/
app.post("/logout", function(req, res, next){
  if(CheckValidLogout(req.session.username) == 1){
    req.session.username = undefined;
    res.redirect('/');
  }
  else{
    res.status(401).send("You are already logged out");
  }
})

/*
  Very useful function that used a lot by the server
  Gets the a string representing a potential username and searches through the list of users for a matching string and sends back the user object associated with the string

  -Mostly used to get the current user's info: get_user(req.session.username)
*/
function get_user(requestingusername){
  for(let x of users){
      if(x != null){
          if(x.username == requestingusername){
              return x;
          }
      }
  }
  return -1;
}
/*
  Useful function that performs similarly to get_user(username)

  -Checks a string (n) if it matches the name of any existing titles in the movies array
  -If there is a match then the function will send back the movie object associated with var n
*/
function getMovieByName(n){
  for(m of movies){
    if(m.Title === n){
      return m;
    }
  }
}

//Used to get a director object based on a string
function get_director(name){
  for(eachdirector of director){
    if(eachdirector.name == name){
      return eachdirector;
    }
  }
}
//Used to get a writer object based on a string
function get_writer(name){
  for(eachwriter of writers){
    if(eacwrtier.name == name){
      return eachwriter;
    }
  }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

app.get("/movies",queryParser);
app.get("/movies", loadMovies);
app.get("/movies", respondMovies);

function queryParser(req,res,next){
  const MAX_MOVIES = 25;
  //build a query string to use for pagination later
	let params = [];
	for(prop in req.query){
		if(prop == "page"){
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");
	
	try{
		if(!req.query.limit){
			req.query.limit = 21;
		}	
		
		req.query.limit = Number(req.query.limit);
		
		if(req.query.limit > MAX_MOVIES){ 
			req.query.limit = MAX_MOVIES;
		}
	}catch{
		req.query.limit = 21;
	}
	
	//Parse page parameter
	try{
		if(!req.query.page){
			req.query.page = 1;
		}
		
		req.query.page = Number(req.query.page);
		
		if(req.query.page < 1){
			req.query.page = 1;
		}
	}catch{
		req.query.page = 1;
	}
  
  //Query for min rating of a movie
	if(req.query.minrating){
		try{
			req.query.minrating = Number(req.query.minrating);
		}catch(err){
			req.query.minrating = undefined;
		}
  }
  
  //Query for max rating of a movie
	if(req.query.maxrating){
		try{
			req.query.maxrating = Number(req.query.maxrating);
		}catch(err){
			req.query.maxrating = undefined;
		}
	}
  
  //Query based on title
	if(!req.query.title){
		req.query.title = "*";
  }
  
  //Query based on single genre
  if(!req.query.genre){
    req.query.genre = "*";
  }
	
	next();
}

//If there is a match for the various query searches a user can perform
function movieMatch(movie, query){
  let titleCheck = query.title == "*" || movie.Title.toLowerCase().includes(query.title.toLowerCase());
	let minRatingCheck = (!query.minrating) || movie.minrating >= query.minrating;
  let maxRatingCheck = (!query.maxrating) || movie.maxrating <= query.maxrating;
  let genreCheck = query.genre == "*" || movie.Genre.toLowerCase().includes(query.genre.toLowerCase());
	return titleCheck && minRatingCheck && maxRatingCheck && genreCheck;
}

//Loads the movies that match the query search into the results array
function loadMovies(req, res, next){
	let results = [];
	let startIndex = (req.query.page-1) * Number(req.query.limit);
  let count = 0;
  for(let i = 0; i < movies.length; i++){
    let movie = movies[i];
    if(movieMatch(movie,req.query)){
      if(count >=startIndex){
        results.push(movie);
      }
      if(results.length >= req.query.limit){
        break;
      }
      count++;
    }
  }
  res.movies = results;
  next();
}

//Used to  open the moviepage PUG file and pass through the necessary variables
function respondMovies(req, res, next){
  let c = get_user(req.session.username);
	res.format({
		"text/html": () => {res.render("moviepage", {TotalMovies: movies,curUser: c, movies: res.movies, qstring: req.qstring, current: req.query.page } )},
		"application/json": () => {res.status(200).json(res.movies)}
	});
	next();
}

/*
Used to display an indiviual movie's page. 
Information passed into the PUG includes:
-The movie object (getMovie)
-Arrays for the director, writers, actors, and the accounts that have left a review. 
*/
app.get("/movies/:id", getMovie,respondSingleMovie);

function getMovie(req, res, next){
  let id = (req.params.id).substring(1);
  let movieexists = 0;
  for(m of movies){
    if (m.id == id){
      req.movies = m;
      movieexists = 1;
      next();
    }
  }
	if(movieexists == 0){
    res.status(404).send("Could not find movie.");
  }
}
function respondSingleMovie(req, res,next){
  let c = get_user(req.session.username);

  //Gets the actor objects of the actors in the movie
  let splitActors = req.movies.Actors.split(',');
  let actorObjects = [];
  for(let i = 0; i<splitActors.length; i++){
    splitActors[i] = splitActors[i].replace(/\s+/g, '');
    for(let j = 0; j < actors.length; j++){
      if(actors[j].name == splitActors[i]){
        actorObjects.push(actors[j]);
        break;
      }
    }
  }

  //Gets the director objects of the directors in the movie
  let splitDirectors = req.movies.Director.split(',');
  let directorObjects = [];
  for(let i = 0; i<splitDirectors.length; i++){
    splitDirectors[i] = splitDirectors[i].replace(/\s+/g, '');
    for(let j = 0; j < director.length; j++){
      if(director[j].name == splitDirectors[i]){
        directorObjects.push(director[j]);
        break;
      }
    }
  }

  //Gets the writer objects of the writers in the movie
  let splitWriter = req.movies.Writer.split(',');
  let writerObjects = [];
  for(let i = 0; i<splitWriter.length; i++){
    splitWriter[i] = splitWriter[i].replace(/\s+/g, '');
    for(let j = 0; j < writers.length; j++){
      if(writers[j].name == splitWriter[i]){
        writerObjects.push(writers[j]);
        break;
      }
    }
  }

  //Get the links for accounts that have reviewed
  let reviewURL = [];
  for(u of req.movies.reviews){
    reviewURL.push(get_user(u.owner).URL)
  }
	res.format({
		"application/json": function(){
			res.status(200).json(req.movies);
		},
		"text/html": () => { res.render("MovieInfo", {curUser: c, MovieInfo: req.movies, ReviewerURL: reviewURL, DirectorInfo: directorObjects, ActorInfo: actorObjects, WriterInfo: writerObjects}); }		
  });
  next();
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Very similar to what was done for the movie query parsing 
app.get("/directors",directorqueryParser);
app.get("/directors", loadDirectors);
app.get("/directors", respondDirectors);

function directorqueryParser(req,res,next){
  const MAX_DIRECTORS = 10;
  //build a query string to use for pagination later
	let params = [];
	for(prop in req.query){
		if(prop == "page"){
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");
	
	try{
		if(!req.query.limit){
			req.query.limit = 10;
		}	
		
		req.query.limit = Number(req.query.limit);
		
		if(req.query.limit > MAX_DIRECTORS){ 
			req.query.limit = MAX_DIRECTORS;
		}
	}catch{
		req.query.limit = 10;
	}
	
	//Parse page parameter
	try{
		if(!req.query.page){
			req.query.page = 1;
		}
		
		req.query.page = Number(req.query.page);
		
		if(req.query.page < 1){
			req.query.page = 1;
		}
	}catch{
		req.query.page = 1;
	}
	
		
	if(!req.query.name){
		req.query.name = "*";
  }
  
  if(!req.query.works){
    req.query.works = "*";
  }
	
	next();
}

function directorMatch(director, query){
  let nameCheck = query.name == "*" || director.name.toLowerCase().includes(query.name.toLowerCase());
  let worksCheck = query.works == "*";
  for(let i = 0; i < director.works.length; i++){
    if(director.works[i].toLowerCase().includes(query.works.toLowerCase())){
      worksCheck = true; 
      break;
    }
  }
	return nameCheck && worksCheck;
}

//Loads the directors that match the query search into an array
function loadDirectors(req, res, next){
	let results = [];
	let startIndex = (req.query.page-1) * Number(req.query.limit);
  let count = 0;
  for(let i = 0; i < director.length; i++){
    let singledirector = director[i];
    if(directorMatch(singledirector,req.query)){
      if(count >=startIndex){
        results.push(singledirector);
      }
      if(results.length >= req.query.limit){
        break;
      }
      count++;
    }
  }
  res.director = results;
  next();
}
//Opens Directer PUG file and sends through the neccessary information needed to render the page
function respondDirectors(req, res, next){
  let c = get_user(req.session.username);
	res.format({
		"text/html": () => {res.render("Director", {TotalDirectors: director, curUser: c, DirectorInfo: res.director, qstring: req.qstring, current: req.query.page } )},
		"application/json": () => {res.status(200).json(res.director)}
	});
	next();
}
/*
Used to display an indiviual director's page. 
Information passed into the PUG includes:
-The director object (getDirector)
-An array of movies they have worked on (respondSingleDirector)
*/
app.get("/directors/:id", getDirector,respondSingleDirector);

function getDirector(req,res,next){
  let id = (req.params.id).substring(1);
  let directorexists = 0;
  for(d of director){
    if (d.id == id){
      req.director = d;
      directorexists = 1;
      next();
    }
  }
	if(directorexists == 0){
    res.status(404).send("Could not find director.");
  }
}
function respondSingleDirector(req, res,next){
  let c = get_user(req.session.username);
  let directorMovies = [];
  for(let i =0; i<req.director.works.length; i++){
    directorMovies.push(getMovieByName(req.director.works[i]));
  }

	res.format({
		"application/json": function(){
			res.status(200).json(req.director);
		},
		"text/html": () => { res.render("People", {type: 1,curUser: c, PeopleInfo: req.director, MovieObj: directorMovies}); }		
  });
  next();
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Very similar to what was done for the movie query parsing  
app.get("/actors",actorrqueryParser);
app.get("/actors", loadActors);
app.get("/actors", respondActors);

function actorrqueryParser(req,res,next){
  const MAX_ACTORS = 10;
  //build a query string to use for pagination later
	let params = [];
	for(prop in req.query){
		if(prop == "page"){
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");
	
	try{
		if(!req.query.limit){
			req.query.limit = 10;
		}	
		
		req.query.limit = Number(req.query.limit);
		
		if(req.query.limit > MAX_ACTORS){ 
			req.query.limit = MAX_ACTORS;
		}
	}catch{
		req.query.limit = 10;
	}
	
	//Parse page parameter
	try{
		if(!req.query.page){
			req.query.page = 1;
		}
		
		req.query.page = Number(req.query.page);
		
		if(req.query.page < 1){
			req.query.page = 1;
		}
	}catch{
		req.query.page = 1;
	}
	
		
	if(!req.query.name){
		req.query.name = "*";
  }
  
  if(!req.query.works){
    req.query.works = "*";
  }
	
	next();
}

function actorMatch(actor, query){
  let nameCheck = query.name == "*" || actor.name.toLowerCase().includes(query.name.toLowerCase());
  
  let worksCheck = query.works == "*";
  for(let i = 0; i < actor.works.length; i++){
    if(actor.works[i].toLowerCase().includes(query.works.toLowerCase())){
      worksCheck = true; 
      break;
    }
  }


	return nameCheck && worksCheck;
}

function loadActors(req, res, next){
	let results = [];
	let startIndex = (req.query.page-1) * Number(req.query.limit);
  let count = 0;
  for(let i = 0; i < actors.length; i++){
    let singleactor = actors[i];
    if(actorMatch(singleactor,req.query)){
      if(count >=startIndex){
        results.push(singleactor);
      }
      if(results.length >= req.query.limit){
        break;
      }
      count++;
    }
  }
  res.actor = results;
  next();
}

function respondActors(req, res, next){
  let c = get_user(req.session.username);
	res.format({
		"text/html": () => {res.render("Actor", {TotalActors: actors, curUser: c, ActorInfo: res.actor, qstring: req.qstring, current: req.query.page } )},
		"application/json": () => {res.status(200).json(res.actor)}
	});
	next();
}

/*
Used to display an indiviual actor's page. 
Information passed into the PUG includes:
-The actor object (getActor)
-An array of movies they have worked on (respondSingleActor)
*/
app.get("/actors/:id", getActor,respondSingleActor);

function getActor(req,res,next){
  let id = (req.params.id).substring(1);
  let actorexists = 0;
  for(a of actors){
    if (a.id == id){
      req.actor = a;
      actorexists = 1;
      next();
    }
  }
	if(actorexists == 0){
    res.status(404).send("Could not find actor.");
  }
}
function respondSingleActor(req, res,next){
  let actorMovies = [];
  let c = get_user(req.session.username);
  for(let i =0; i<req.actor.works.length; i++){
    actorMovies.push(getMovieByName(req.actor.works[i]));
  }

	res.format({
		"application/json": function(){
			res.status(200).json(req.director);
		},
		"text/html": () => { res.render("People", {type: 2,curUser: c, PeopleInfo: req.actor,MovieObj: actorMovies}); }		
  });
  next();
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Very similar to what was done for the movie query parsing 
app.get("/users",userqueryParser);
app.get("/users", loadUsers);
app.get("/users", respondUsers);

function userqueryParser(req,res,next){
  const MAX_USERS = 25;
  //build a query string to use for pagination later
	let params = [];
	for(prop in req.query){
		if(prop == "page"){
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");
	
	try{
		if(!req.query.limit){
			req.query.limit = 5;
		}	
		
		req.query.limit = Number(req.query.limit);
		
		if(req.query.limit > MAX_USERS){ 
			req.query.limit = MAX_USERS;
		}
	}catch{
		req.query.limit = 5;
	}
	
	//Parse page parameter
	try{
		if(!req.query.page){
			req.query.page = 1;
		}
		
		req.query.page = Number(req.query.page);
		
		if(req.query.page < 1){
			req.query.page = 1;
		}
	}catch{
		req.query.page = 1;
	}
	
	if(!req.query.username){
		req.query.username = "*";
  }
  
  if(!req.query.contributingUser){
    req.query.contributingUser = "*";
  }
	
	next();
}

function userMatch(user, query){
  let usernameCheck = query.username == "*" || user.username.toLowerCase().includes(query.username.toLowerCase());
  let contributingUserCheck = query.contributingUser == "*" || user.contributingUser == query.contributingUser;
	return usernameCheck && contributingUserCheck;
}

function loadUsers(req, res, next){
	let results = [];
	let startIndex = (req.query.page-1) * Number(req.query.limit);
  let count = 0;
  for(let i = 0; i < users.length; i++){
    let user = users[i];
    if(userMatch(user,req.query)){
      if(count >=startIndex){
        results.push(user);
      }
      if(results.length >= req.query.limit){
        break;
      }
      count++;
    }
  }
  res.users = results;
  next();
}

function respondUsers(req, res, next){
  let c = get_user(req.session.username);
	res.format({
		"text/html": () => {res.render("User", {TotalUsers: users, curUser: c, users: res.users, qstring: req.qstring, current: req.query.page } )},
		"application/json": () => {res.status(200).json(res.users)}
	});
	next();
}

/*
Used to display an indiviual user's page. 
Information passed into the PUG includes:
-The user object (getUser)
-An array of movies the user has reviewed and an array for the movies they have added if they chose to be a contributing user (respondSingleUser)
*/
app.get("/users/:id", getUser,respondSingleUser);

function getUser(req, res, next){
  let id = (req.params.id).substring(1);
  let userexists = 0;
  for(u of users){
    if (u.id == id){
      req.users = u;
      userexists = 1;
      next();
    }
  }
	if(userexists == 0){
    res.status(404).send("Could not find user.");
  }
}
function respondSingleUser(req, res,next){
  let c = get_user(req.session.username);
  let userReviews = [];
  for(let i =0; i<req.users.reviews.length; i++){
    userReviews.push(getMovieByName(req.users.reviews[i]));
  }

  let userMoviesAdded = [];
  for(let i =0; i<req.users.moviesAdded.length; i++){
    userMoviesAdded.push(getMovieByName(req.users.moviesAdded[i]));
  }
  
    res.format({
        "application/json": function(){
            res.status(200).json(req.users);
        },
        "text/html": () => { res.render("UserInfo", {curUser:c,UserInfo: req.users, UserReviews: userReviews, UserAddedMovies: userMoviesAdded}); }        
  });
  next();
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Very similar to what was done for the movie query parsing 
app.get("/writers",writerqueryParser);
app.get("/writers", loadWriters);
app.get("/writers", respondWriters);

function writerqueryParser(req,res,next){
  const MAX_WRITERS = 10;
  //build a query string to use for pagination later
	let params = [];
	for(prop in req.query){
		if(prop == "page"){
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");
	
	try{
		if(!req.query.limit){
			req.query.limit = 10;
		}	
		
		req.query.limit = Number(req.query.limit);
		
		if(req.query.limit > MAX_WRITERS){ 
			req.query.limit = MAX_WRITERS;
		}
	}catch{
		req.query.limit = 10;
	}
	
	//Parse page parameter
	try{
		if(!req.query.page){
			req.query.page = 1;
		}
		
		req.query.page = Number(req.query.page);
		
		if(req.query.page < 1){
			req.query.page = 1;
		}
	}catch{
		req.query.page = 1;
	}
	
		
	if(!req.query.name){
		req.query.name = "*";
  }
  
  if(!req.query.works){
    req.query.works = "*";
  }
	
	next();
}

function writerMatch(writer, query){
  //Search writers that have names containing the keyword
  let nameCheck = query.name == "*" || writer.name.toLowerCase().includes(query.name.toLowerCase());

  let worksCheck = query.works == "*";
  for(let i = 0; i < writer.works.length; i++){
    if(writer.works[i].toLowerCase().includes(query.works.toLowerCase())){
      worksCheck = true; 
      break;
    }
  }


	return nameCheck && worksCheck;
}

function loadWriters(req, res, next){
	let results = [];
	let startIndex = (req.query.page-1) * Number(req.query.limit);
	let endIndex = startIndex + Number(req.query.limit);
	let countLoaded = 0;
	let failed = false;
  let count = 0;
  //name writers.json 
  for(let i = 0; i < writers.length; i++){
    let singlewriter = writers[i];
    if(writerMatch(singlewriter,req.query)){
      if(count >=startIndex){
        results.push(singlewriter);
      }
      if(results.length >= req.query.limit){
        break;
      }
      count++;
    }
  }
  res.writer = results;
  next();
}

function respondWriters(req, res, next){
  let c = get_user(req.session.username);
	res.format({
		"text/html": () => {res.render("Writer", {TotalWriters: writers,curUser: c, WriterInfo: res.writer, qstring: req.qstring, current: req.query.page } )},
		"application/json": () => {res.status(200).json(res.writer)}
	});
	next();
}

/*
Used to display an indiviual user's page. 
Information passed into the PUG includes:
-The writer object (getWriters)
-An array of movies they have worked on (respondSingleWriter)
*/
app.get("/writers/:id", getWriters,respondSingleWriter);
function getWriters(req,res,next){
  let id = (req.params.id).substring(1);
  let writerexists = 0;
  for(w of writers){
    if (w.id == id){
      req.writer = w;
      writerexists = 1;
      next();
    }
  }
	if(writerexists == 0){
    res.status(404).send("Could not find actor.");
  }
}
function respondSingleWriter(req, res,next){
  let writerMovies = [];
  let c = get_user(req.session.username);
  for(let i =0; i<req.writer.works.length; i++){
    writerMovies.push(getMovieByName(req.writer.works[i]));
  }

	res.format({
		"application/json": function(){
			res.status(200).json(req.writer);
		},
		"text/html": () => { res.render("People", {type: 3, curUser: c, PeopleInfo: req.writer,MovieObj: writerMovies}); }		
  });
  next();
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

//This sends the user to the AddMovie PUG which will allow them to enter infomation of the new movie they are adding
app.get("/addmovie", respondAddMovie);
function respondAddMovie(req,res,next){
  let c = get_user(req.session.username);
  res.format({
    "text/html": () => { res.render("AddMovie", {curUser: c, DirectorObjects: director, ActorObjects: actors,WriterObjects: writers}); }		
  });
}

/*
This is called when the user presses the button designated as the confirmation button. 
The POST request is responsible for taking all of the information added and 
putting it in the correct properties of the newly created movie object
The new movie object is then pushed onto the movies array 
*/
app.post("/createMovie",createMovie);
function createMovie(req,res){      //this assumes we are provided with a username and password
  let newMovie = {};
  newMovie.id = uuidv4();
  newMovie.URL = baseURL+moviesURL+":"+newMovie.id;
  newMovie.Title = req.body.Title;
  newMovie.Released = req.body.Released;
  newMovie.Runtime = req.body.Runtime;
  newMovie.Genre = req.body.Genre;
  newMovie.Director = req.body.Director;
  newMovie.Writer = req.body.Writer;
  newMovie.Actors = req.body.Actors;
  newMovie.Plot = req.body.Plot;
  newMovie.Awards = req.body.Awards;
  newMovie.Poster = req.body.Poster;
  newMovie.reviews = [];
  
  movies.push(newMovie);
}

//Sends the user to the PUG page that will allow them to edit the information of a pre-existing movie. It will send the movie's current information into the PUG and display it
app.get("/movies/:id/edit", getMovie, respondMovieEdit);
function respondMovieEdit(req,res,next){
  let id = (req.params.id).substring(1);
  let c = get_user(req.session.username);
  
  console.log(id)
  if(c.contributingUser==false){
    res.status(404).send("Unauthorized.");
  }else{
    //Gets the actor objects of the actors in the movie
    let splitActors = req.movies.Actors.split(',');
    let actorObjects = [];
    for(let i = 0; i<splitActors.length; i++){
      splitActors[i] = splitActors[i].replace(/\s+/g, '');
      for(let j = 0; j < actors.length; j++){
        if(actors[j].name == splitActors[i]){
          actorObjects.push(actors[j]);
          break;
        }
      }
    }

    //Gets the director objects of the directors in the movie
    let splitDirectors = req.movies.Director.split(',');
    let directorObjects = [];
    for(let i = 0; i<splitDirectors.length; i++){
      splitDirectors[i] = splitDirectors[i].replace(/\s+/g, '');
      for(let j = 0; j < director.length; j++){
        if(director[j].name == splitDirectors[i]){
          directorObjects.push(director[j]);
          break;
        }
      }
    }

    //Gets the writer objects of the writers in the movie
    let splitWriter = req.movies.Writer.split(',');
    let writerObjects = [];
    for(let i = 0; i<splitWriter.length; i++){
      splitWriter[i] = splitWriter[i].replace(/\s+/g, '');
      for(let j = 0; j < writers.length; j++){
        if(writers[j].name == splitWriter[i]){
          writerObjects.push(writers[j]);
          break;
        }
      }
    }
    res.format({
      "text/html": () => { res.render("MovieInfoEdit", {curUser: c, MovieInfo: req.movies, DirectorObjects: director, DirectorInfo: directorObjects, ActorObjects: actors, ActorInfo: actorObjects, WriterObjects: writers, WriterInfo: writerObjects}); }		
    });
    }
  next();
}

/*
This is called when the user presses the button designated as the confirmation button. 
The POST request is responsible for taking all of the updated information and 
replacing the correpsonding properties of the movie object that is suppose to be edited
*/
app.post("/editMovieObject", editMovieObject);
function editMovieObject(req,res,next){
  curMovie = getMovieByName(req.body.Title);

  curMovie.Actors = req.body.Actors
  curMovie.Awards = req.body.Awards
  curMovie.Director = req.body.Director;
  curMovie.Genre = req.body.Genre;
  curMovie.Plot = req.body.Plot;
  curMovie.Poster=req.body.Poster;
  curMovie.Released = req.body.Released;
  curMovie.Runtime = req.body.Runtime;
  curMovie.Writer=req.body.Writer;
  
  //Update the Actor's Works;
  let splitActors = curMovie.Actors.split(',');
  for(let i = 0; i<splitActors.length; i++){
    splitActors[i] = splitActors[i].replace(/\s+/g, '');
    for(let j = 0; j < actors.length; j++){
      if(actors[j].name == splitActors[i]){
        let curActor = actors[j];
        if(!(curActor.works.includes(curMovie.Title))){
          curActor.works.push(curMovie.Title);
        }
      }
    }
  }

  //Update the Director's Works;
  let splitDirectors = curMovie.Director.split(',');
  for(let i = 0; i<splitDirectors.length; i++){
    splitDirectors[i] = splitDirectors[i].replace(/\s+/g, '');
    for(let j = 0; j < director.length; j++){
      if(director[j].name == splitDirectors[i]){
        let curDirector = director[j];
        if(!(curDirector.works.includes(curMovie.Title))){
          currentDirector.works.push(curMovie.Title);
        }
      }
    }
  }

  //Update the Writer's Works;
  let splitWriters = curMovie.Writer.split(',');
  for(let i = 0; i<splitWriters.length; i++){
    splitWriters[i] = splitWriters[i].replace(/\s+/g, '');
    for(let j = 0; j < writers.length; j++){
      if(writers[j].name == splitWriters[i]){
        let currentWriter = writers[j];
        if(!(currentWriter.works.includes(curMovie.Title))){
          currentWriter.works.push(curMovie.Title);
        }
      }
    }
  }
  next();
}

//Sends the user to the PUG that allows them to add a person (Writer, Actor, or Director)
app.get("/addperson", respondAddPerson);
function respondAddPerson(req,res,next){
  let c = get_user(req.session.username);
  res.format({
    "text/html": () => { res.render("AddPerson", {curUser: c}); }		
  });
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

app.get("/homepage", respondHomepage);

function respondHomepage(req, res, next){
  let c = get_user(req.session.username);
  res.format({
    "text/html": () => { res.render("homepage", {curUser:c, }); }	
  });
  next();
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

/*
  This opens the PUG file that will allow the user to filter for movies that contain specific genre
*/
app.get("/genres", respondGenre);
function respondGenre(req,res,next){
  let c = get_user(req.session.username);
  res.format({
    "text/html": () => { res.render("Genres", {curUser:c, }); }	
  });
  next();
}

/*
  This will take in the array of genres the user wants to search for from client.js
  When a movie contains the specific generes the user is looking for the object is pushed onto the tempmMovie array
*/
app.post("/getGenre", get_filtered_movies);

function get_filtered_movies(req, res, next){
  let GenresToSearch = req.body;  
  let tempMovie = [];
  let filteredMovies = movies;



  for(let g of GenresToSearch){
    for(let i =0; i<filteredMovies.length; i++){
        if(filteredMovies[i].Genre.includes(g)){
          tempMovie.push(filteredMovies[i])
        } 
    }
    filteredMovies = []
    filteredMovies = tempMovie.slice(0)
    tempMovie = []
  }
  
  get_user(req.session.username).filteredArray = filteredMovies;
  get_user(req.session.username).genreSearched = GenresToSearch;
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

app.get("/currentuser",respondCurrentuser);

function respondCurrentuser(req,res,next){
    res.status(200).json({"currentuser": get_user(req.session.username)})
}


//A person ot logged in will not have access to any other pages besides the login screen
function auth(req, res, next){
  if(req.session.username == undefined || get_user(req.session.username).isonline == false ){
    res.status(401).send("Unauthorized");
    return;
  }
  else{
    next();
  }
}

//Used to search for a user based on username
app.post("/searchuser", searchedUser);
function searchedUser(req,res){
  let searchedUser = get_user(req.body.input);
  if(searchedUser != -1){
    get_user(req.session.username).searchedObject = searchedUser.URL;
  }
  else{
    get_user(req.session.username).searchedObject = -1;
  }
}

//Function that updates a user's contributingUser property which grants them access to the ability to add/edit movies and people objects
app.post("/enablecontribute",enablecontribute);

function enablecontribute(req, res){
  let ContributingUser = req.body;
  get_user(req.session.username).contributingUser = ContributingUser.ContributingUser;

}

//Used to add a user's review which includes and long review (words) and the star rating (1-10)
app.post("/submitreview",respondReview);

function respondReview(req, res){
  let curUser = get_user(req.session.username);
  let new_movie_review = req.body;
  let hasReviewed = false;

  //Formats the review object to correct form in order to be stored in movie array
  let reviewObject= {}
  ReviewedMovieObject = getMovieByName(new_movie_review.movieTitle);

  reviewObject.owner = curUser.username
  reviewObject.starrating = new_movie_review.starrating
  reviewObject.date = new_movie_review.date
  reviewObject.longreview = new_movie_review.longReview
  
  //console.log(ReviewedMovieObject.reviews)
  for(r of ReviewedMovieObject.reviews){
    console.log(r)
    if(r.owner == curUser.username){
      hasReviewed = true;
    }
  }
  //stores the title of the movie that they already reviewed
  if(hasReviewed == false){
    curUser.reviews.push(new_movie_review.movieTitle);
  
    ReviewedMovieObject = getMovieByName(new_movie_review.movieTitle);
    ReviewedMovieObject.reviews.push(reviewObject);
    console.log(ReviewedMovieObject);
  }

  sendnotificationsreview(curUser.username,ReviewedMovieObject.Title);
  
  res.status(200).send;
}

//Used to send a notification to the person reviewing's notifications to alert that someone they are following edited something
//Notifications will also be sent to those following the respective actors, writers, or directors
app.post("/notifications",respondNotifications);
function respondNotifications(req,res){
  let currentuser = get_user(name);
  res.format({
		"application/json": function(){
			res.status(200).json(req.writer);
		},
		"text/html": () => { res.render("notifications", {curUser: currentuser}); }		
  });
  next();
}

app.post("/changeprofilepicture",changeprofilepicture);
function changeprofilepicture(req,res){
  let currentuser = get_user(req.session.username); 
  console.log(req.body);
  currentuser.profilePicture = req.body.input;
  res.status(200).send;
}

function sendnotificationsreview(name,moviename){
  let currentuser = get_user(name);
  console.log(name);
  for(let i = 0; i < currentuser.followers.length; i++){
    //currentuser.followers[i].notications.push(currentuser.username+" has reviewed a new movie called: "+moviename);
    let currentfollower = get_user(currentuser.followers[i]);
    currentfollower.notications.push(currentuser.username+" has reviewed a new movie called: "+moviename+",");
  }
}

function sendnotificationsadded(currentactor,moviename,eventtype){
  if(eventtype == 1){
    for(let i = 0; i < currentactor.followers.length; i++){
      currentactor.followers[i].notications.push(currentactor.name+" has been featured in a movie called: "+moviename);
    }
  }
  else{
    for(let i = 0; i < currentactor.followers.length; i++){
      currentactor.followers[i].notications.push(currentactor.name+" has been added to an existing movie called: "+moviename);
    }
  }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

//User A adds User B to their following array
//User B adds User A to their followers array
app.post("/follow",follow);
function follow(req,res){
  let user_a = get_user(req.session.username);
  let user_b = get_user(req.body.following);
  console.log(user_b)
  if(user_a == null || user_b == null){
    console.log("failed");
    return;
}
if(user_a.following.includes(user_b.username)){
    console.log("failed 1");
    return;     //if that person is already following that person
}
user_a.following.push(user_b.username);
user_b.followers.push(user_a.username);
console.log(user_a.following);
console.log(user_b.followers);
res.status(200).send
}

//User A removes User B to their following array
//User B removes User A to their followers array
app.post("/unfollow",unfollow);
function unfollow(req,res){       //user a wants to unfollow user b 
  let user_a = get_user(req.session.username);
  let user_b = get_user(req.body.following);
  //make sure that both of these exist 
  if(user_a == null || user_b == null){
      console.log("failed");
      return;
  }
  //make sure that this person is actually following that person
  if(user_a.following.includes(user_b.username)){
      removeItemOnce(user_a.following,user_b.username);
      removeItemOnce(user_b.followers,user_a.username);
      console.log(user_a.following);
      console.log(user_b.followers);
  }
  return;
}

function removeItemOnce(array, value) {         //this function removes a specific item from an array given the array and the value it will remove 
  let index = array.indexOf(value);             //will find the index of the given value in the array
  if (index > -1) {
    array.splice(index, 1);                     //will delete that specific value using the splice operation 
  }
  return array;
}

function createPerson(name,persontype){      //this assumes we are provided with a name
  if(!name){       //checks if name is empty
      return null;
  }

  for(let x of actors){
      if(x != null){
          if(x.name == name){ //check for same username 
              return null;
          }
      }
  }
  for(let x of writers){
    if(x != null){
        if(x.name == name){ //check for same username 
            return null;
        }
    }
}
for(let x of director){
  if(x != null){
      if(x.name == name){ //check for same username 
          return null;
      }
  }
}

  //Set initial values for the new user
  let newPerson = {};

  newPerson.id = uuidv4();
  if(persontype == "actor"){
    newPerson.URL = baseURL+"/actors/:"+newPerson.id;
    newPerson.works = [];
    actors.push(newPerson);
    return newPerson;
  }
  else if(persontype == "director"){
    newPerson.URL = baseURL+"/directors/:"+newPerson.id;
    newPerson.works = [];
    director.push(newPerson);
    return newPerson;
  }
  else if (persontype == "writer"){
    newPerson.URL = baseURL+"/writers/:"+newPerson.id;
    newPerson.works = [];
    writers.push(newPerson);
    return newPerson;
  }
  else{
    console.log("INVALID PERSON TYPE FAILED");
    return null;
  }
}

app.get("/recommendedMovies",getrecommendedMovies);
function getrecommendedMovies(req,res){   //this will go into the movies array and gather all of the movies that have the same genre to reccomend to the user
  let genre = req.body.movie.genre;
  let selfmovie = req.body.movie
  let results =[];
  for(let x of movies){
      if(x.genre == genre && x.title != selfmovie.title){
          results.push(x);
      }
  }
  res.status(200).send
  return results;
}

app.get("/recommendedActors",getRecommendedActors);
function getRecommendedActors(req,res){ 
  let results = [];
  //supplt them with the actor's name
  let requestingactor = get_actor(req.body.actor);
  for(eachmovie of movies){
      if(eachmovie.Actors.includes(requestingactor.name)){
          for(eachactor of eachmovie.Actors){
              if(eachactor != requestingactor.name){
                  results.push(eachactor);
              }
          }
      }
  }
  res.status(200).send
  return results;
}
app.get("/recommendedWriters",getRecommendedWriters);
function getRecommendedWriters(req,res){ 
  let results = [];
  //supplt them with the actor's name
  let requestingactor = get_writer(req.body.actor);
  for(eachmovie of movies){
      if(eachmovie.Writer.includes(requestingactor.name)){
          for(eachactor of eachmovie.Writer){
              if(eachactor != requestingactor.name){
                  results.push(eachactor);
              }
          }
      }
  }
  res.status(200).send
  return results;
}
app.get("/recommendedDirectors",getRecommendedDirectors);
function getRecommendedDirectors(req,res){ 
  let results = [];
  //supplt them with the actor's name
  let requestingactor = get_director(req.body.actor);
  for(eachmovie of movies){
      if(eachmovie.Director.includes(requestingactor.name)){
          for(eachactor of eachmovie.Director){
              if(eachactor != requestingactor.name){
                  results.push(eachactor);
              }
          }
      }
  }
  res.status(200).send
  return results;
}

app.post("/addActor",addActor);
//parameters include a body containing a moviename and the actorname
function addActor(req,res){
  let curMovie;
  for(x of movies){
    if(req.body.movieTitle == x.Title){
      curMovie = x;
    }
  }
  if(curMovie == undefined){
    console.log("movie could not be found");
    res.status(400).send;
    return null;

  }
  for(let i = 0; i < actors.length; i++){
    if(director[i].name == req.body.actor){
      curMovie.Actors = curMovie.Actors.concat(" ,"+req.body.actor);
      console.log("success!");
      console.log(curMovie.Actors);
      res.status(200).send;
      return 1;
    }
  }
  return 0;
}

//Used to add a writer type
app.post("/addWriter",addWriter);
function addWriter(req,res){
  let curMovie;
  for(x of movies){
    if(req.body.movieTitle == x.Title){
      curMovie = x;
    }
  }
  if(curMovie == undefined){
    console.log("movie could not be found");
    res.status(400).send;
    return null;

  }
  for(let i = 0; i < writers.length; i++){
    if(writers[i].name == req.body.writer){
      curMovie.Writer = curMovie.Writer.concat(" ,"+req.body.writer);
      console.log("success!");
      console.log(curMovie.Writer);
      res.status(200).send;
      return 1;
    }
  }
  return 0;
}

//Used to add a director type
app.post("/addDirector",addDirector);
function addDirector(req,res){
  let curMovie;
  for(x of movies){
    if(req.body.movieTitle == x.Title){
      curMovie = x;
    }
  }
  if(curMovie == undefined){
    console.log("movie could not be found");
    res.status(400).send;
    return null;

  }
  for(let i = 0; i < director.length; i++){
    if(director[i].name == req.body.director){
      curMovie.Director = curMovie.Director.concat(" ,"+req.body.director);
      console.log("success!");
      console.log(curMovie.Director);
      res.status(200).send;
      return 1;
    }
  }
  return 0;
}


app.listen(3000);
console.log("Server listening at http://localhost:3000");