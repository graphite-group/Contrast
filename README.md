# Contrast.io

Contrast.io is a game-ified portfolio builder and network for creators and design professionals. Contrast.io hopes to take the usually tedius process of keeping your online portfolios up-to-date and make it a fun process you never have to think about again.

## Why?
** For too long creators have been left out of the mainstream as they've been forced to do tedius tasks s maintaining an online portfolio and find clients. Creators need a simple place they can upload their work and have fun doing it. **
By giving creators a simple drag-and-drop interface to upload images, and automatically pulling in their work from Dribbble, creators never have to do more ‘work’ than they want to. By being able to challenge each other and vote on challenges, creators can take part in some friendly rivalry and passively give each other feedback and help the whole community improve.

Moreover, with point incentives attached to challenges, creators have a reason to keep coming back, keep uploading their work, and even make new work just to win challenges.

** Clients and Businesses have a hard time finding talented professionals. The existing networks are little more than endless directories. **
Creators voting on each others’ works helps keep track of the relative worth of all the images in the system, and have a smart leaderboard of creators to easily find the best talent. And with large public portfolios clients always know who they are hiring before they make the final decision.

** Users want to look at great designs but don't want to filter through the cruft manually **
Using a smart graph database to keep images well categorised, and constantly improved through the wisdom of the community, Contrast is constantly improving the metrics of classification on images. Plus, by ranking images by their win-loss histories we can make sure that the users don't ever to filter through the cruft.


## Technologies

Contrast is built on the following technologies:

* Node.js
* Sails.js + Socket.io
* Neo4J
* MongoDb for scheduled tasks
* Redis for sessions and sockets
* Angular.js (+ UI.Router)
* Browserify (from front end modularity)
* Stylues + Nib (CSS Processor)
* Bluebird.js (for Promises)

## The short guide to using contrast
* Without ever signing up you can always browse a large collection of highly curated images
* When you decide to sign-up it's easy with just an email address. We get you started with 100 points
* Once logged in you can start participating and voting on existing challenges. You get a point for each vote.
* You can also upload your own images and get 50 points instantly
* You can browse and challenge any image on the site with one of your own, for more points.
* You may also get challenged on your images.
* You can choose to reject challenges but that will cost you 5 points
* Winning a challenge gets you 20 points from the loser.
* We are always making things betterm and you can look forward to badges, achievements, trophies, leaderboards etc.


#### A Project built at Hack Reactor By:

* Adam Deibert
* Harish Yeluri
* Naman Goel