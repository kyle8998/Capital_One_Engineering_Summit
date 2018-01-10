'use strict';

//imports
const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library
const httpRequest = require("request-promise");  //http request helper for hitting APIs

require("string_score"); //string utils helper to fuzzy compare strings

/*
* Boilerplate code to handle request from DialogFlow
*/exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
  if (request.body.queryResult) {
    processRequest(request, response);
  } else {
    console.log('Invalid Request');
    return response.status(400).end('Invalid Webhook Request (expecting v2 webhook request)');
  }
});

/*
* Function to handle requests from Dialogflow
*/
function processRequest (request, response) {
  // An action is a string used to identify what needs to be done in fulfillment
  let action = (request.body.queryResult.action) ? request.body.queryResult.action : 'default';
  
  // Parameters are any entites that Dialogflow has extracted from the request.
  let parameters = request.body.queryResult.parameters || {}; // https://dialogflow.com/docs/actions-and-parameters
  
  // Create handlers for Dialogflow actions as well as a 'default' handler
  const actionHandlers = {
    // The default welcome intent has been matched, welcome the user (https://dialogflow.com/docs/events#default_welcome_intent)
    'input.welcome': () => {
      sendResponse('Hello, Welcome to my Dialogflow agent!'); // Send simple response to user
    },
    'coinToss': () => {
      const randomNum = Math.floor(Math.random() * Math.floor(2));
      const response = (randomNum == 0) ? "Heads!" : "Tails!";
      sendResponse(response); // Send simple response to user
    },
    'college': () => {
      const firstName = parameters.firstName;
      const lastName = parameters.lastName;
      
      // Debug statement
      console.log("firstName: " + firstName);
      
      const summiteer = findSummiteer(summiteers, firstName, lastName);
      if (summiteer) {
          sendResponse(firstName + " went to college at " + summiteer.college);
      }
      else {
          sendResponse("I don't know where " + firstName + " went to college :(");
      }
    },
    'place': () => {
       //sample URL: https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=38.886879,-77.094652&radius=500&types=food&key=INSERT_KEY_HERE
        
        //hard-code lat/long to simplify things (3030 Clarendon Blvd, Arlington, VA)
        const latitude = "38.886879";
        const longitude = "-77.094652";
        
        //place types: https://developers.google.com/places/supported_types
        const placeType = parameters.placeType;
        const placesAPIKey = "INSERT_KEY_HERE";
        
        const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + latitude + "," + longitude + "&radius=500&type=" + placeType + "&key=" + placesAPIKey;

        httpRequest({  
          method: "GET",
          uri: url,
          json: true
        }).then(function (json) {
           //TODO: Handle JSON response
        })
        .catch(function (err) {
           //TODO: Handle error
        });
    },
    // Default handler for unknown or undefined actions
    'default': () => {
      sendResponse("I don't know, please try again.");
    }
  };
  // If undefined or unknown action use the default handler
  if (!actionHandlers[action]) {
    action = 'default';
  }
  // Run the proper handler function to handle the request from Dialogflow
  actionHandlers[action]();
  
/*
* Helper function to send correctly formatted responses to Dialogflow which are then sent to the user
*/
  function sendResponse (responseToUser) {
      let responseJson = {fulfillmentText: responseToUser}; // displayed response
      response.json(responseJson); // Send response to Dialogflow
  }
}

/*
* Helper function to return a summiteer given an array of summiteer JSON data, first name, and (optional) last name
*/
  function findSummiteer(summiteers, firstName, lastName) {
        let nameQuery = firstName;
        if(lastName){
            nameQuery += " " + lastName;
        }

        let topScore = 0.0;
        let matchingIndex = 0;
        for(let i = 0; i < summiteers.length; i++) {
            const nameToCompare = (summiteers[i].firstName + " " + (lastName ? summiteers[i].lastName : "")).trim();
            const score = nameToCompare.score(nameQuery);
            if(score > topScore){
                matchingIndex = i;
                topScore = score;
            }
        }

        if(topScore > 0.4){
            return summiteers[matchingIndex];
        }
        else{
            return null;
        }
  }
  
  /*
* Summiteer JSON Data from Bio Book
*/
const summiteers = [
  {
    "firstName": "Jonson",
    "lastName": "Jin",
    "college": "University of Michigan",
    "hometown": "Flushing",
    "hobbies": "Reading  Building computers",
    "languages": "C++",
    "interestingPlace": "New York",
    "funFact": "I can blow bubble inside of bubbles using bubble gum.",
    "github": "jonsonj"
  },
  {
    "firstName": "Ryan",
    "lastName": "Lauderback",
    "college": "Colby College",
    "hometown": "Barrington",
    "hobbies": "Fly fishing, punk rock, Film Photography, English Premier League",
    "languages": "Java, Python",
    "interestingPlace": "Yosemite National Park",
    "funFact": "I play soccer for Colby",
    "github": "https://github.com/RyanLauderback"
  },
  {
    "firstName": "Matt",
    "lastName": "Isaac",
    "college": "University of Wisconsin - Madison",
    "hometown": "Glen Rock, New Jersey",
    "hobbies": "Football  Hockey  Basketball  Movies  Music",
    "languages": "Java  Python  JavaScript",
    "interestingPlace": "Sydney, Australia",
    "funFact": "I have been snorkeling in the Great Barrier Reef.",
    "github": "misaac3"
  },
  {
    "firstName": "Michael",
    "lastName": "Mendiola",
    "college": "Ohio State University",
    "hometown": "Hudson, Ohio",
    "hobbies": "Video Editing, graphic design, business",
    "languages": "Java, Javascript, HTML, css",
    "interestingPlace": "Paris",
    "funFact": "I've been parasailing in the Swiss Alps",
    "github": "MichaelMendiola"
  },
  {
    "firstName": "Salil",
    "lastName": "Desai",
    "college": "Cornell University",
    "hometown": "Plainsboro, NJ",
    "hobbies": "Volleyball, Piano, Ultimate Frisbee",
    "languages": "Java",
    "interestingPlace": "Machu Picchu",
    "funFact": "I have the same birthday as my brother who is two years old than me",
    "github": "salilsdesai"
  },
  {
    "firstName": "Jeffrey",
    "lastName": "Huang",
    "college": "Carnegie Mellon University",
    "hometown": "Green Brook",
    "hobbies": "Puzzles and Pokemon",
    "languages": "Python and C",
    "interestingPlace": "Dubrovnik, Croatia",
    "funFact": "I have never eaten a PB&J",
    "github": "jeffshuang"
  },
  {
    "firstName": "Daniel",
    "lastName": "Encarnacion",
    "college": "Lehman College",
    "hometown": "Bronx, New York",
    "hobbies": "Comics, Current Events, Traveling",
    "languages": "Java, JavaScript",
    "interestingPlace": "Acoma Pueblo, NM",
    "funFact": "I took a year of ballet in elementary school. haha",
    "github": "danny2590"
  },
  {
    "firstName": "Melida",
    "lastName": "Grullon",
    "college": "Lehman College",
    "hometown": "Bronx",
    "hobbies": "Digital drawing, biking, walking and animals",
    "languages": "Java and PHP",
    "interestingPlace": "Mount Isabel de Torres",
    "funFact": "I have never watched The walking Dead or Game of Thrones",
    "github": "https://github.com/melidagrullon"
  },
  {
    "firstName": "Trishul",
    "lastName": "Nagenalli",
    "college": "Duke University",
    "hometown": "Clarksburg, MD",
    "hobbies": "I love playing football (go Redskins!) and practicing martial arts (Karate and Taekwondo). I am also a big fan of NF, Game of Thrones, and Avatar the Last Airbender!",
    "languages": "It depends on what I'm writing. For web development, I use almost exclusively HTML/CSS/Javascript. For most general work, I use Python and sometimes Java. Recently, I've developed an appreciation for C for use in embedded systems.",
    "interestingPlace": "The ruins of a medieval Indian city in Hampi, India.",
    "funFact": "I like learning about history and have always wanted to visit Istanbul.",
    "github": "tn74"
  },
  {
    "firstName": "Aditi",
    "lastName": "Hebbar",
    "college": "Carnegie Mellon",
    "hometown": "Bangalore, India",
    "hobbies": "Badminton, Tetris",
    "languages": "C, Python",
    "interestingPlace": "Barcelona, Spain",
    "funFact": "Im a vegetarian turned non vegetarian because it was more convenient",
    "github": "Adhebbar"
  },
  {
    "firstName": "Julian",
    "lastName": "Londono",
    "college": "Cornell University",
    "hometown": "Bloomfield, New Jersey",
    "hobbies": "In addition to coding, I love mountain biking, photography, playing ultimate frisbee, playing/watching soccer, hiking, and playing guitar.  I always like to be learning more about something; most recently that's been cryptocurrencies and the stock market.",
    "languages": "I have a good amount of experience in Java.  I like programming in JavaScript.  I have some working knowledge of Python and I like how clean it looks.",
    "interestingPlace": "Coming from New Jersey, Los Angeles, California was one of the most exciting places I've been in (even though I was only there for 3 days).  I hope to be back in California after I graduate.",
    "funFact": "I was born in Bogotá, Colombia and speak fluent spanish.",
    "github": "julian-londono"
  },
  {
    "firstName": "Ali",
    "lastName": "Chaudhry",
    "college": "NC State University",
    "hometown": "High Point",
    "hobbies": "Programming ( Scripting / Web Development )    Video Games    Academics",
    "languages": "Python, Web Languages (JS, HTML, CSS)",
    "interestingPlace": "Visiting my older brother in LA when PokemonGO was released. Being able to explore LA, and connect with other people during the initial mass hysteria was my most fun and interesting experiences.",
    "funFact": "Whenever I program for fun, my goal is to eliminate tedious or redundant actions by automating tasks. Windows, browsers, or video games, I've created scripts to automate tasks in each of those platforms.    Not related, but I also play Tennis.",
    "github": "chadali - https://github.com/chadali"
  },
  {
    "firstName": "Henry",
    "lastName": "Chen",
    "college": "University of Maryland, College Park",
    "hometown": "Rockville",
    "hobbies": "Video games, graphic design",
    "languages": "Java, JavaScript, and C, but I'm trying to learn and make Python my primary language",
    "interestingPlace": "Venice",
    "funFact": "I like cats",
    "github": "henryyc"
  },
  {
    "firstName": "Yiling",
    "lastName": "Kao",
    "college": "University of California, Berkeley",
    "hometown": "Irvine",
    "hobbies": "Swimming, photography, reading, walking dogs,",
    "languages": "Java, Python, PHP",
    "interestingPlace": "Madrid, Spain -- I studied abroad there this past summmer!",
    "funFact": "Most people call the act of drinking someone else's beverage without touching the rim of the container a \"waterfall\". People from my hometown and I call it a \"birdie.",
    "github": "ylkao"
  },
  {
    "firstName": "Jenny",
    "lastName": "Zhu",
    "college": "Carnegie Mellon University",
    "hometown": "Mclean",
    "hobbies": "Karaoke, kayaking, design, puzzles",
    "languages": "Python, C",
    "interestingPlace": "London",
    "funFact": "I'm fine with spiders but terrified of caterpillars!",
    "github": "jennywzhu"
  },
  {
    "firstName": "Andrew",
    "lastName": "Chen",
    "college": "University of North Carolina At Chapel Hill",
    "hometown": "Charlotte",
    "hobbies": "Board Games, history books, good novels, philosophy, league, basketball",
    "languages": "Java, Javascript",
    "interestingPlace": "Florence, Italy",
    "funFact": "I still don't know how to pronounce 'summit' correctly",
    "github": "Ac112264"
  },
  {
    "firstName": "Evan",
    "lastName": "McIntire",
    "college": "University of Maryland",
    "hometown": "Montgomery Village",
    "hobbies": "Hiking, Biking, Video games, Board games, reading",
    "languages": "Javascript, C, Haskell",
    "interestingPlace": "Normandy",
    "funFact": "I like biking long distances - my longest ride was 40 miles",
    "github": "mcintireevan"
  },
  {
    "firstName": "Charles",
    "lastName": "Zhao",
    "college": "Princeton University",
    "hometown": "Fairfax Station",
    "hobbies": "Running, ping pong, piano, music, pretty much anything related to computers, economics",
    "languages": "Python, Javascript",
    "interestingPlace": "Denali National Park",
    "funFact": "I first got into computer science from programming my TI-84 in middle school.",
    "github": "czhao39"
  },
  {
    "firstName": "Richard",
    "lastName": "Wang",
    "college": "University of Maryland - College Park",
    "hometown": "Clarksburg, Maryland",
    "hobbies": "Guitar, music, F1 racing, cars, biking",
    "languages": "Java, Python",
    "interestingPlace": "Hong Kong",
    "funFact": "I love exploring cities and taking in their unique atmospheres.",
    "github": "rwang99"
  },
  {
    "firstName": "Rehan",
    "lastName": "Madhugiri",
    "college": "University of Madison-Wisconsin",
    "hometown": "Herndon",
    "hobbies": "Playing and watching different sports, reading",
    "languages": "Java, Python, HTML/CSS/JS",
    "interestingPlace": "London",
    "funFact": "I am a twin",
    "github": "RehanMadhugiri"
  },
  {
    "firstName": "David",
    "lastName": "Liu",
    "college": "Carnegie Mellon University",
    "hometown": "Shanghai",
    "hobbies": "Basketball, Go (or Weiqi, the board game AlphaGo plays), Soccer",
    "languages": "Python, C",
    "interestingPlace": "Statesboro, Georgia",
    "funFact": "My moving experience is pretty unique. I was born in Minnesota, moved to Taiwan and lived on a mountain for eight years, moved to Shanghai and lived there for seven years, and then went to high school in a very rural area of Georgia.",
    "github": "dmliu16"
  },
  {
    "firstName": "Therese",
    "lastName": "Mendoza",
    "college": "University of North Carolina at Chapel Hill",
    "hometown": "Charlotte, NC",
    "hobbies": "music, art, and cooking",
    "languages": "Java, JavaScript",
    "interestingPlace": "Philippines",
    "funFact": "My favorite order (and only order I get) at Ben and Jerry's is Chocolate Fudge Brownie on top of Chocolate Cherry Garcia on top of Cherry Garcia. My favorite orders at Cold Stone are Mint Mint Chocolate Chocolate Chip and Apple Pie a La Cold Stone.",
    "github": "he135"
  },
  {
    "firstName": "Daniel",
    "lastName": "Zhou",
    "college": "Duke University",
    "hometown": "Edison",
    "hobbies": "Ping pong, tennis, origami,  listening to music, watching movies/tv shows",
    "languages": "java, python",
    "interestingPlace": "my dad's farm in china",
    "funFact": "I look like Wes from Wong Fu Productions",
    "github": "danosaur98"
  },
  {
    "firstName": "Rashid",
    "lastName": "Lasker",
    "college": "University of Virginia",
    "hometown": "Alexandria, VA",
    "hobbies": "I love cooking and exploring new kinds of food.",
    "languages": "Java, Javascript, Python, Whitespace",
    "interestingPlace": "The Oculus in NYC",
    "funFact": "You can spell radish if you rearrange the letters of my name.",
    "github": "rashidlasker"
  },
  {
    "firstName": "Justin",
    "lastName": "Wei",
    "college": "Duke University",
    "hometown": "Burlingame, CA",
    "hobbies": "Soccer, graphic design, education/tutor/mentoring, food, Spanish, beaches/outdoors",
    "languages": "Java and Python",
    "interestingPlace": "Camp Nou in Barcelona!",
    "funFact": "I taught English and programming at a school in Cusco, Peru this past summer!",
    "github": "jwei98"
  },
  {
    "firstName": "Hermish",
    "lastName": "Mehta",
    "college": "University of California, Berkeley",
    "hometown": "Toronto",
    "hobbies": "I really enjoy running and listening to podcasts in my free time. I'm also really into coffee, so I go to SF often to just try out new places!",
    "languages": "Python, R, Java",
    "interestingPlace": "Thailand",
    "funFact": "I've lived in 6 different cities in my life!",
    "github": "hermish"
  },
  {
    "firstName": "Benyam",
    "lastName": "Ephrem",
    "college": "University of Maryland College Park",
    "hometown": "Salisbury",
    "hobbies": "Basketball, Jazz",
    "languages": "#1 Java (learned this first)  #2 JavaScript (learned next)  #3 Python (currently proficient, still learning)",
    "interestingPlace": "Santorini, Greece",
    "funFact": "I trained legs for 1 1/2 years to be able to dunk a basketball (went from not touching net to flying)",
    "github": "bephrem1"
  },
  {
    "firstName": "Omkar",
    "lastName": "Konaraddi",
    "college": "University of Maryland - College Park",
    "hometown": "Frederick",
    "hobbies": "Folding boats out of paper, lurking on Reddit, sweating on a treadmill, watching movies",
    "languages": "JavaScript, Python",
    "interestingPlace": "Foot hills of Himalayas",
    "funFact": "In 5th grade, there was a great demand for my origami. But the demand exceeded the supply. I tried to make an economy with paper coins, but the 5th grade market was quickly flooded with counterfeits. So I \"trained\" a few people who were interested in learning origami; this increased the daily supply to match the demand.",
    "github": "konaraddio"
  },
  {
    "firstName": "Amy",
    "lastName": "Zhao",
    "college": "University of Maryland",
    "hometown": "Waterloo, IL",
    "hobbies": "Art",
    "languages": "Java  C++  Python",
    "interestingPlace": "China",
    "funFact": "I have lived in 3 different places since last year.",
    "github": "zhaoamy"
  },
  {
    "firstName": "Nick",
    "lastName": "Buitrago",
    "college": "Cornell University",
    "hometown": "Weston, FL",
    "hobbies": "Robotics, Intramural sports, startups",
    "languages": "Java, Python, C++",
    "interestingPlace": "Cartagena, Colombia",
    "funFact": "I was born in Colombia",
    "github": "nicolasbq1"
  },
  {
    "firstName": "Marc",
    "lastName": "Harvey",
    "college": "University of Illinois at Urbana-Champaign",
    "hometown": "Chicago",
    "hobbies": "Outside the realm of computer science, I love long distance running, swimming, and biking.",
    "languages": "Python,  C,  Java",
    "interestingPlace": "Hangzhou in China",
    "funFact": "I eat the entire kiwi. Everyone I know either scoops the insides out, or cuts the skin off, but I eat the whole thing kind of like you would eat an apple.",
    "github": "mharvy"
  },
  {
    "firstName": "Glenn",
    "lastName": "Ren",
    "college": "University of Maryland, Baltimore County",
    "hometown": "Gaithersburg",
    "hobbies": "I enjoy reading, visiting coffee shops, and cheering on the Celtics and Patriots.",
    "languages": "Python, JavaScript & C",
    "interestingPlace": "George Town, Cayman Islands",
    "funFact": "I know almost every single line of The Social Network movie by heart.",
    "github": "glennren"
  },
  {
    "firstName": "Chris",
    "lastName": "Fischer",
    "college": "University of Pennslyvania",
    "hometown": "New York",
    "hobbies": "Ultimate Frisbee, 3D printing",
    "languages": "Python, C",
    "interestingPlace": "Bermuda",
    "funFact": "I once broke my hand playing kickball",
    "github": "chrisfischer"
  },
  {
    "firstName": "Josh",
    "lastName": "Seides",
    "college": "Harvard University",
    "hometown": "Alpharetta, GA",
    "hobbies": "Tennis, Ping Pong, Squash",
    "languages": "JavaScript, Node, React, Python",
    "interestingPlace": "Italy",
    "funFact": "I am ambidextrous (I write/use utensils with my left hand, play sports right-handed).",
    "github": "joshseides"
  },
  {
    "firstName": "Kyle",
    "lastName": "Lim",
    "college": "University of Maryland College Park",
    "hometown": "Frederick, MD",
    "hobbies": "Tech, learning, software development, running, gaming, etc.",
    "languages": "Python, Java",
    "interestingPlace": "The Bahamas",
    "funFact": "I ran cross country and track for four years.",
    "github": "kyle8998"
  },
  {
    "firstName": "Max",
    "lastName": "Newman",
    "college": "University of Maryland",
    "hometown": "Frederick Md",
    "hobbies": "Working out, Dieting, Video Games, Spikeball,",
    "languages": "Java, Python",
    "interestingPlace": "Virgin Gorda",
    "funFact": "Despite having prior experience, I switched my major 3 times before deciding on CS",
    "github": "Maxwhoppa"
  },
  {
    "firstName": "Avery",
    "lastName": "Yip",
    "college": "University of California, Berkeley",
    "hometown": "Alameda",
    "hobbies": "Traveling,  Snowboarding, Sleeping, CSGO & League of Legends",
    "languages": "Python, Java",
    "interestingPlace": "India",
    "funFact": "I worked in India this past summer and by the end of this year I will have traveled over 9 different countries!",
    "github": "averyyip"
  },
  {
    "firstName": "Serena",
    "lastName": "Davis",
    "college": "Cornell University",
    "hometown": "Los Angeles, CA",
    "hobbies": "Hiking, cooking, aerial arts, technical theater",
    "languages": "Java",
    "interestingPlace": "Saint Kitts",
    "funFact": "I am the youngest of five siblings.",
    "github": "serenadavis"
  },
  {
    "firstName": "Nick",
    "lastName": "Paris",
    "college": "University of Michigan",
    "hometown": "Clarkston",
    "hobbies": "Running, Spanish conversation & culture, investing, Rick and Morty",
    "languages": "C++, javascript",
    "interestingPlace": "San Sebastián, Spain",
    "funFact": "My family has 13 chickens!",
    "github": "nlparis"
  },
  {
    "firstName": "John",
    "lastName": "Yang",
    "college": "University of California, Berkeley",
    "hometown": "Sunnyvale",
    "hobbies": "Basketball, Movie Trivia, Marvel Comics",
    "languages": "Java, Python, Objective C",
    "interestingPlace": "Okayama, Japan",
    "funFact": "I can do a pretty good voice impression of Elmo.",
    "github": "john-b-yang"
  }
]