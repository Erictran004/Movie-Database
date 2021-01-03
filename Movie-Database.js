let PictureObject = require("./profilepic.json");
let UserObject = require("./users.json");
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
    console.log(generateAvatar());
}
console.dir(UsedPictures, {'maxArrayLength': null});