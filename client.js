//this will retrieve all the users from the server
let request1 = new XMLHttpRequest();

request1.onreadystatechange = function (){
    if(this.readyState == 4 && this.status == 200){
        users = JSON.parse(this.responseText);
    }
}
request1.open("GET","/users",true);
request1.setRequestHeader('Accept', 'application/json');
request1.send();

//Gets the input from the search bar
function searchUser(){
  let input = document.getElementById("username").value;
  let request = new XMLHttpRequest();
  request.open("POST","/searchuser",true);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify({input}));
  console.log("Sent:" + input)
  updateSearch();
}
function updateSearch(){
  console.log("Search Results")
  let request = new XMLHttpRequest();
  request.onreadystatechange = function (){
    if(this.readyState == 4 && this.status == 200){
      let currentuser = JSON.parse(this.responseText);
      let userProfile = currentuser.currentuser.searchedObject;
      if(userProfile==-1){
        document.getElementById("username").value=null;
        document.getElementById("username").placeholder = "User does not exist";
      }
      else{
        window.location.href=userProfile;
      }
    }
  }
  request.open("GET","/currentuser",true);
  request.setRequestHeader('Accept', 'application/json');
  request.send();
}
function updateContributingUser(){
  let ContributingUser = document.getElementById("contribute").checked;
  
  let request = new XMLHttpRequest();
  console.log(ContributingUser)
	request.open("POST","/enablecontribute",true);
	request.setRequestHeader('Content-type', 'application/json');
	request.send(JSON.stringify({ContributingUser}));	
}
function submit(){
  let longReview = document.getElementById("longReview").value;
  let movieTitle = document.getElementById("Title").innerHTML;
  let starrating;

  let onestar = document.getElementById("e1").checked;
  let twostar = document.getElementById("e2").checked;
  let threestar = document.getElementById("e3").checked;
  let fourstar = document.getElementById("e4").checked;
  let fivestar = document.getElementById("e5").checked;
  let sixstar = document.getElementById("e6").checked;
  let sevenstar = document.getElementById("e7").checked;
  let eightstar = document.getElementById("e8").checked;
  let ninestar = document.getElementById("e9").checked;
  let tenstar = document.getElementById("e10").checked;

  
  if(onestar){starrating = 1;}
  if(twostar){starrating = 2;}
  if(threestar){starrating = 3;}
  if(fourstar){starrating = 4;}
  if(fivestar){starrating = 5;}
  if(sixstar){starrating = 6;}
  if(sevenstar){starrating = 7;}
  if(eightstar){starrating = 8;}
  if(ninestar){starrating = 9;}
  if(tenstar){starrating = 10;}
  
  if (starrating == undefined){
    document.getElementById("longReview").value = null;
    document.getElementById("longReview").placeholder ="Please enter a star rating"
  }
  else{
    let today = new Date();
    let d = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    date = d+' '+time

    let reviewToSend = {starrating, longReview, date, movieTitle};

    console.log(reviewToSend)

    let request = new XMLHttpRequest();
    
    request.open("POST","/submitreview",true);
    request.setRequestHeader('Content-type', 'application/json');
    request.send(JSON.stringify(reviewToSend));	
    
  }
  
}
//Gets the array of user selected genres needed to filter the movie object array
function getGenresToFilter(){
  let GenresToSearch = [];
  if(document.getElementById("B1").checked){
    GenresToSearch.push(document.getElementById("B1").value);
  }
  if(document.getElementById("B2").checked){
    GenresToSearch.push(document.getElementById("B2").value);
  }
  if(document.getElementById("B3").checked){
    GenresToSearch.push(document.getElementById("B3").value);
  }
  if(document.getElementById("B4").checked){
    GenresToSearch.push(document.getElementById("B4").value);
  }
  if(document.getElementById("B5").checked){
    GenresToSearch.push(document.getElementById("B5").value);
  }
  if(document.getElementById("B6").checked){
    GenresToSearch.push(document.getElementById("B6").value);
  }
  if(document.getElementById("B7").checked){
    GenresToSearch.push(document.getElementById("B7").value);
  }
  if(document.getElementById("B8").checked){
    GenresToSearch.push(document.getElementById("B8").value);
  }
  if(document.getElementById("B9").checked){
    GenresToSearch.push(document.getElementById("B9").value);
  }
  if(document.getElementById("B10").checked){
    GenresToSearch.push(document.getElementById("B10").value);
  }
  if(document.getElementById("B11").checked){
    GenresToSearch.push(document.getElementById("B11").value);
  }
  if(document.getElementById("B12").checked){
    GenresToSearch.push(document.getElementById("B12").value);
  }
  if(document.getElementById("B13").checked){
    GenresToSearch.push(document.getElementById("B13").value);
  }
  if(document.getElementById("B14").checked){
    GenresToSearch.push(document.getElementById("B14").value);
  }
  if(document.getElementById("B15").checked){
    GenresToSearch.push(document.getElementById("B15").value);
  }
  if(document.getElementById("B16").checked){
    GenresToSearch.push(document.getElementById("B16").value);
  }
  if(document.getElementById("B17").checked){
    GenresToSearch.push(document.getElementById("B17").value);
  }
  if(document.getElementById("B18").checked){
    GenresToSearch.push(document.getElementById("B18").value);
  }
  if(document.getElementById("B19").checked){
    GenresToSearch.push(document.getElementById("B19").value);
  }
  if(document.getElementById("B20").checked){
    GenresToSearch.push(document.getElementById("B20").value);
  }
  let request = new XMLHttpRequest();

  request.onreadystatechange=function(){
    if(this.readyState == 4 && this.status == 200){
      console.log(request.responseText);
    }
  }
  request.open("POST", "/getGenre",true);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify(GenresToSearch));
  updateFilterList();
}
function updateFilterList(){
  let request = new XMLHttpRequest();
  request.onreadystatechange = function (){
    if(this.readyState == 4 && this.status == 200){
      let currentuser = JSON.parse(this.responseText);
      let userFilteredMovies = currentuser.currentuser.filteredArray;
      let userGenreSearched = currentuser.currentuser.genreSearched;
      document.getElementById("Added").innerHTML = '';

      let GenresSearched = "Searching for: ";;
      for(let i = 0; i<userGenreSearched.length; i++){
        if(i+1 == userGenreSearched.length){
          GenresSearched += userGenreSearched[i]+" ("+userFilteredMovies.length+" movies)";
        }
        else{
          GenresSearched += userGenreSearched[i]+", ";
          console.log(GenresSearched)
        }
      }
      document.getElementById("GenresSearched").innerHTML = GenresSearched;
      for(let i = 0; i<userFilteredMovies.length; i++){
        var img = new Image();
        img.src = userFilteredMovies[i].Poster;
        img.className = "movieposter";
        img.onclick = function() {
            window.location.href = userFilteredMovies[i].URL;
        };
        document.getElementById("Added").appendChild(img);
      }
    }
  }
  request.open("GET","/currentuser",true);
  request.setRequestHeader('Accept', 'application/json');
  request.send();
}
//Uncheck the filters
function clearFilters(){
  document.getElementById("B1").checked = false;
  document.getElementById("B2").checked = false;
  document.getElementById("B3").checked = false;
  document.getElementById("B4").checked = false;
  document.getElementById("B5").checked = false;
  document.getElementById("B6").checked = false;
  document.getElementById("B7").checked = false;
  document.getElementById("B8").checked = false;
  document.getElementById("B9").checked = false;
  document.getElementById("B10").checked = false;
  document.getElementById("B11").checked = false;
  document.getElementById("B12").checked = false;
  document.getElementById("B13").checked = false;
  document.getElementById("B14").checked = false;
  document.getElementById("B15").checked = false;
  document.getElementById("B16").checked = false;
  document.getElementById("B17").checked = false;
  document.getElementById("B18").checked = false;
  document.getElementById("B19").checked = false;
  document.getElementById("B20").checked = false;
}

//Gets the input from the change profile picture bar
function changeProfile(){
  let input = document.getElementById("profile").value;
  let request = new XMLHttpRequest();
  request.open("POST","/changeprofilepicture",true);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify({input}));
  console.log("Sent:" + input)
}
function getEditInformation(){
  let Title = document.getElementById("Title").innerHTML;
  let Poster = document.getElementById("Poster").value;
  let Plot = document.getElementById("Plot").value;
  let Released = document.getElementById("Released").value;
  let Runtime = document.getElementById("Runtime").value;
  let Genre = document.getElementById("Genre").value;
  let Director = document.getElementById("Director").value;
  let Writer = document.getElementById("Writers").value;
  let Actors = document.getElementById("Actors").value;
  let Awards = document.getElementById("Awards").value;

  let editedMovieObject = {Title, Poster, Plot, Released, Runtime, Genre, Director, Writer, Actors, Awards}
  console.log(editedMovieObject);
  let request = new XMLHttpRequest();
    
  request.open("POST","/editMovieObject",true);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify(editedMovieObject));
}
function addMovie(){
  let Title = document.getElementById("Title").value;
  let Poster = document.getElementById("Poster").value;
  let Plot = document.getElementById("Plot").value;
  let Released = document.getElementById("Released").value;
  let Runtime = document.getElementById("Runtime").value;
  let Genre = document.getElementById("Genre").value;
  let Director = document.getElementById("Director").value;
  let Writer = document.getElementById("Writers").value;
  let Actors = document.getElementById("Actors").value;
  let Awards = document.getElementById("Awards").value;

  let editedMovieObject = {Title, Poster, Plot, Released, Runtime, Genre, Director, Writer, Actors, Awards}
  console.log(editedMovieObject);
  let request = new XMLHttpRequest();
    
  request.open("POST","/createMovie",true);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify(editedMovieObject));
}
function addPerson(){
  personName = document.getElementById("name").value;
  personType = document.getElementById("Type").value;
  personObject = {personName, personType}
  
  let request = new XMLHttpRequest();
    
  request.open("POST","/createPerson",true);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify(personObject));
}
function follow(){
  //eric help i dont know how to grab an element by their id it keeps returning undefined
  let following = document.getElementById("username").innerHTML;
  let request = new XMLHttpRequest();
	request.open("POST","/follow",true);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify({following}));
}

function unfollow(){
  let following = document.getElementById("username").innerHTML;
  let request = new XMLHttpRequest();
	request.open("POST","/unfollow",true);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify({following}));
}

function selectGenre(){
  document.getElementById("searchType").innerHTML = "genre"
}
function selectMinRating(){
  document.getElementById("searchType").innerHTML = "minrating"
}
function selectTitle(){
  document.getElementById("searchType").innerHTML = "title"
}

function searchMovie(){
  let searchType = document.getElementById("searchType").innerHTML 
  let searchContent = document.getElementById("mainsearch").value
  if((searchType!="Filter")){
    window.location.href="http://localhost:3000/movies"+"?"+searchType+"="+searchContent;
  }else{
    document.getElementById("mainsearch").value = null;
    document.getElementById("moainsearch").placeholder = "Missing fields"
  }
}
function selectactor(){
  document.getElementById("searchTypeP").innerHTML = "actors"
}
function selectwriter(){
  document.getElementById("searchTypeP").innerHTML = "writers"
}
function selectdirector(){
  document.getElementById("searchTypeP").innerHTML = "directors"
}
function selectname(){
  document.getElementById("searchfilter").innerHTML = "name"
}
function selectworks(){
  document.getElementById("searchfilter").innerHTML = "works"
}
function searchPeople(){
  let searchType = document.getElementById("searchTypeP").innerHTML;
  let searchFilter = document.getElementById("searchfilter").innerHTML;
  let searchContent = document.getElementById("peoplesearch").value

  if((searchType != "Type")&&(searchFilter != "Filter")){
    window.location.href="http://localhost:3000/"+searchType+"?"+searchFilter+"="+searchContent;
  }else{
    document.getElementById("peoplesearch").value = null;
    document.getElementById("peoplesearch").placeholder = "Missing fields"
  }
}