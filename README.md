Movie Database Project Final Report
Eric Tran & Adrian Cheung

PURPOSE:
For our COMP2406 project we decided on doing the movie database. The
purpose of our website was to replicate something reminiscent of IMDB where users
would have accounts where they would be able to search, view, and review movies of
their choice.

FUNCTIONALITY:
Our movie database has provided most if not all of the basic functionality that was required of
the specifications with the exception of a database as that was omitted as an absolute
requirement and is now treated as an extension.
Our movie database firstly runs off of express and incorporates sessions into our database. We
have made the design decision to only allow only individuals who have created and logged into
our database to view / get / post data with the exception of post requests to logging in or
creating an account. Our authorization checks for each request the user makes and if the
session is not recognized, then the individual will not be allowed to access our database.

USERS:
We have created users in such a way such that individuals who register for our database must
have a unique username. In addition, usernames we have included another category of
accounts that we refer to as ‘People’. People accounts include the actors, writers, and directors
which our users will be able to follow/unfollow as well as view the person’s actor names are
completely separated and as a result, we have made the design decision to allow users for
example to name themselves Michael Bay or some other famous director. This is not a
hindrance however, as the database will be able to recognize the types of object that name is
and will not interfere with the creation or logging in functionality of our database.
In addition to creating an account. Users who created an account will also be given the option to
upload their personal profile picture if sending a proper post request to the database. The option
for a profile picture to be added will include sending an appropriate link to a photo that will then
be grabbed from the internet and used as their profile picture. Profile pictures as a result will
also be cropped to fit a circle in order to fit with the look and theme of our overall aesthetic of
our database. Profile pictures on default will be a generic black profile picture.
Users will have the option to access almost completely everything inside the database given
they are non-contributing users. This includes being able to view and follow individuals, receive
notifications whenever a new movie / review comes out depending if they are following a user
(reviews will be posted and new movies uploaded by them will be posted), actors and other
movie persons can also be followed, and you will receive notifications if they are added to a new
movie or existing movie. Users will also be notified if they are being followed (Similar to
applications like Instagram) users can then navigate through their account and as a result,
follow them back.

Users can also have the option to enable their account to be a contributing user. Contributing
users will have the ability to edit and create new movies as well as add actors into the existing
database. This like the specification says, only affects their ability during the time they are or not
a contributing user. Disabling the option later on will have no effect on their movies that have
added or edited beforehand.

Users will be given a dedicated page on the database, and as a result, you can publicly wish to
view any user by pressing their profile and or pressing the next and previous buttons on the
website. Like mentioned earlier, currently, all users are public, and anyone can see their
following and follower count as well as the movies that they have reviewed. We have had to
make a design decision in this section of the project. Since the specification did not mention any
possibility of viewing other users, we decided to not implement the ability for other users to view
the specific followers or following of another individual.

Users will also have the ability to generate an assortment of chosen recommended movies. The
algorithm that was chosen based on deciding if a movie is to be recommended was if they are in
the same genre as movies they have reviewed, or if the actors in that movie have been spotted
in other movies as well. There will be a limit as to which movies have been picked.
Users who are logged in will also have the ability to search movies by title and or genre and or
year of the release date. We have created a query parser that will take parameters from the
URL and use this information to go through the database and search for movies that have met
this criteria.

An example of searching for a movie could include:
localhost:3000/movies?title=toy&genre=family this will allow the individual to see the movie toy
story. In addition to searching movies by title and or genre, if you wish to view a specific page,
one can have the query ?page=2 this will send you to the second page of your search results.
Search results are read sequentially as a design decision in order to generate a consistent and
testable data. We have decided not to generate these results asynchronously although that
would be the obvious better alternative, but the specifications did not specify how movies were
to be searched.

In addition to searching movie titles, the user will also be able to navigate to the movie page for
any of the search results by simply clicking on their posters.
Users also have the ability to search for actors, directors, and writers in addition to searching for
a movie. However, one issue is that the people objects do not have a profile picture due to the
limited data provided to us in the .json file. The content inside what actors pertain and also what
movies will pertain will be included into the following respective statements.
Viewing movies

When a user views a specific movie. We have included the following content on that
movie page: Rating of the movie, release date, running time, genres it belongs to, director writer
and actors, awards and as well as the plot, title, picture of the movie poster if provided one, and
also a custom review section of the movie (this is where all of the user generated reviews will be
shown)

Users will be able to navigate through movie results using query parameters and can currently
search a movie by its minimum rating, maximum rating, title, genre qualities (please see min
and max specs for more details for design decisions). In addition to searching a movie based on
these parameters, if a user actually knows the id of a given movie, then the client can simply
copy and paste the URL of that specific movie into the search bar. This will then gather the
movie if it exists or if it does not exist. Due to the server generator that we have created, all ids
for movies will be uniquely identifiable and can be traced back to a specific movie if that given id
exist.

Directors, writers, actors are also given each their own unique hyperlink when shown on a
movie page. When pressing on these links, it will guide you to the specific person. There you
can see the works that the actor or person has created, and you will also be given the option to
follow that individual.

Movie reviews that have been added to a movie are publicly available and shared on a page.
This will include its star rating, the string of the long movie review, and also the user who
created the movie review. Users will be able to score movies out of 10 stars and also be able to
create a long review as well. In order to populate out site we used faker.js to generate our
review and a star rating generator that created a large number of reviews for movies.

VIEWING PEOPLE OBJECTS:
This section is somewhat mentioned above, due to the page limit of this final write up, I
may fail to include some of the information above as it has been already mentioned.

Viewing people (i.e. non users) will be shown on a dedicated page of the respective person.
Each person is given a unique id and cannot be mixed up with another individual. For the
purposes of this project, we have assumed that an individual’s name is completely unique, and
as a result, no duplicates can be found in our database. Each movie that they have worked with
will be included in their works section and a recommended actors / frequent collaborators can
be shown. This is simply an algorithm that goes through the list of movies and if another
individual has starred in the same movie as them, then they will be added and featured. Users
will also have the ability to follow this user and receive notifications upon this as well.

CONTRIBUTING USERS:
Contributing users are a bit different compared to a regular user. A boolean value is
used to determine whether or not a user is contributing or not. Contributing users will have the
ability to create their own movies or edit a movie and also add additional people into the
database provided that the name is unique and does not exist already. We will talk about
creating a movie later below. Contributing users’ movies and reviews will not be affected if they
are revoked of that status like mentioned before. A user can be chosen to be contributing if they
simply press a button which switches their boolean value from false to true.

REST API:
In addition to creating a website that users can view, we can also provide the data for
certain objects inside our database if requested.

Get/movies will return the array of movies that matches the query parameters, due to having
pages, we have implemented this design feature as not to give out all 300 movies at once, I
believe the current implementation we have gave the user 21 movies to look at. All the
information of the movie will be shown including information not shown on the website. This
information is directly drawn from the JSON data we are provided with at the beginning of the
term. Like mentioned above with our query parameters, movies can accept certain query
parameters as well as have pages, and also a unique identifier to tell people apart
Post/movies will send data to the database, if all of the constraints for a movie is found and the
movie is unique (we are assuming unique titles only), then the movie will be added to the
database, please see above for more information

Getting users and people, just like mentioned above the information that goes further in depth
can be found in their respective sections. For keeping this write up brief as possible, some
important key points is that we are able to search for individuals with a query parameter, not
query parameter, and with certain pages. Currently, users can be searched via their name and
nonusers can be searched via their name and also the works that they have done. All users and
people are given a unique id, no mix-up can be possible.

EXTENSIONS:

Flexbox is an addition to CSS where everything scales nicely in order to fit the screen of
whatever you are viewing the database from. You can find that from a variety of screen sizes
(not just 720p), that the application works nicely and will fit on the display that you are viewing
from. This is because of the flexbox model and scaling everything relative to the screen. This
works really well for anything until up to a ridiculously small screen size as then it will have
some resolution issues. Try it!

Some smaller additional extensions that we have included are visually impressive CSS. We
have spent a lot of time perfecting the look of the website and we feel like it should be
appreciated in its entirety. We have imported some themes from outside of our project and in
addition, we have implemented this “circular” theme of the website where profile pictures and
even parts of the main menu are circled off. We think that by doing this, we can have a more
modern look on our website and imitate the look of some modern social media such as
Facebook. We have also implemented some extra features that were not required a profile
picture for each user with an option to change it. Buttons in addition “glow” when they are
hovered over, and the navigation bar shoes exactly which part of the website you are on. For
example, if I am in the section users, the user’s section of the navigation bar will be a different
color.

DESIGN DECISIONS:

Although this project was very freely designed and lots of interpretations were allowed at
certain points throughout the project, we have decided to mention or reinforce certain design
decisions that we have made for the project that one should be aware of if using the database.
Firstly, we have created this database on the assumption that users with an account are able to
access the database. We have made this design decision as the specifications specify that
individuals with an account can access the database.

We have also made the design decision to not include a database into our “database” although
this used to be a strict requirement, it was removed following modifications of the project
specifications. All data is currently locally stored in RAM, which can lead to some scalability
issues, we will talk about this more in the section below about improvements.

In my opinion, the design decisions we have made to create a more user-friendly experience
has been a positive. We have chosen a nice darker theme that is more friendly to the eyes as
well as creating some not so sharp looking pages by rounding off the corners and making the
page visually appealing to the eyes. By having a better-looking website, then users would be
more likely to return to the website and stay longer. The addition of also showing followers and
following like Instagram may also be a benefit for younger demographics. The idea of a movie
database looking like social media will allow people to familiarize themselves easier with the
database and encourage more use out of it.

The scalability of the server is pretty impressive as well. It was tested and asked that our
database can handle from 10 movies being in the database or 9000. We have done this by
allowing the reading and writing of json data from a external source. By modifying the json data
and its length, we can have incredible base levels of information that is available to generate
and be shown on the website. Although databases are more efficient, the sole ease of having
json data simply being set up correctly and fed into the server as a generator is a major benefit.
AJAX requests are being used to send and receive data without loading the page again. This
will enhance user experience as it will simply just grab and retrieve whatever data they are
requesting without the downsides of refreshing the page. This allows for smarter programming
and also a better experience overall.

Pages were implemented in our database, in order to cut down on the data being sent and
retrieved and the possibility of data being lost or corrupted in a real-life scenario, we have
decided to have a limit on the amount of data being sent. This however is still scalable as simply
changing the page number will allow you to navigate through and to a specific page using query
parameters if one allows it.

Some conflicting information has been found in the specifications of the movie database. There
was a mention of if you are creating a movie and the actor did not exist in the database, then
that movie should not be added. However, in another section, it mentioned that if a movie is to
be created, then if that actor should not be created. For simplicity sake, we have just interpreted
that as not allowing an invalid movie to be created if that actor does not exist in the database.

IMPROVEMENTS TO THE SYSTEM:

Database:
The obvious answer to our project being improved upon is the inclusion of a database and not
storing all of our data into ram. Databases are a great addition to any project and make
accessing as well as finding information much easier than arrays. Databases such as mongoDB
come included with unique identifiers as well as some great functionality such as finding very
specific data within the database. In addition to Mongo, we had pondered with the idea of
including Mongoose to our database, an extension of mongo as well. But however, due to time,
we were not able to implement all of it within 1 week and we were forced to use what we have
proven to work so far. Databases are almost pretty much superior in terms of ability compared
to what we have done with our project so far. As well as the advantages above mentioned,
databases work with a variety of other different languages. If were to switch something
fundamental in our project, assuming the database has not been touched, the information inside
the database will be exactly the same and safe. Databases are meant for storing large amounts
of data and it does it very well. As I’m sure you know, ram is a very limited resource in a
computer, and storing 9000 movies on it is not a very particular elegant solution, if the project
were any larger, we may run out of memory. Databases access data from inside the STORAGE
of your computer, so this concern does not exist.

CSS:
We have wished that we have implemented a better-looking CSS into our project. Although I
believe that the CSS in our project is impressive, we are still missing some aspects that allow
for truly amazing CSS. things such as 3D looking backgrounds that change as you scroll or
animations of certain kinds or a light and dark mode feature are one that we have wished to
implement in our project but was unable to due to time constraints. Due to both of the partners
in this project never having done web development before, we wished we looked further into
CSS and HTML in this course.

REACT:
In order to make our frontend look even better and have more modular and reusable code, we
regret not having implemented REACT into our work. React is a front end-based
software/program that allows for the creation of user interfaces. It allows for more code to be
written in less time essentially and allows for the creation of some truly impressive web
applications on the front end. We did not dive deep into looking at react due to time constraints,
but we wish to have implemented something that will allow our front end to be even better than
now.

MODULES:

Modules that are required for this project include express, sessions, unique ids, faker, and pug.

BONUS FUNCTIONALITIES:

The Genres page accept multiple queries of genres and parse them together allowing for a user
to generate a list of movies containing multiple genres. If we had for example want to filter
movies that contained both horror and comedy, then it would do exactly that.

An additional file called moviedatabase-generator.js was created to initially set up roughly 600
accounts with unique profile pictures, names, passwords, and reviews. This was done thanks to
a custom function that took pictures from a .json file curtesy of picsum which gave each account
a completely unique avatar. The faker.js module was used to generate the names and
passwords and with the custom review generator mentioned previously the accounts were given
life. We decided on this as we believed with the added accounts it would make the website
seem more lively instead of an empty site with only 2-3 testing accounts

What do we like most about the project?

I think the most enjoyment we had was seeing how slowly over time the frontend and
backend became connected. Seeing our website slowly develop from static HTML
pages to the (almost completed) final product was very satisfying. Another thing that we
enjoyed was how the project held your hand throughout the whole ordeal. We were not
immediately thrown into the deep end and expected to use advanced techniques but
instead slowly built up our knowledge base.

Our best feature of our project is our CSS and overall design. We tried to make it
so that everything on our website was easily accessible to make it user friendly. We
also included a lot of minor details like having our navigation bar be selected at relevant
pages. Ex: searching for a user would make the navigation bar select the “User” tab.
We believe our website is very cohesive and the transition between pages is very
smooth visually.
