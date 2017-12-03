# tcberlin2017
TechCrunch Berlin Hackathon 2017 Project

Inspiration
When moving in to a new city, it's often difficult to decide in which neighbordhood to live. Children go to a school here, your office is there, your partner's work is somewhere else... How to identify the location that minimizes the travel time for everyone?

What it does
Upon application start we're displaying an ArcGIS map. The user picks points on that map that represent important places
for commuting. The application then displays a grid segmented by the time related accessibility of that place.

How we built it
We're using the ArcGIS API to display maps and overlays. The segmented time usage is computed by Google Maps Distance Matrix API

Challenges we ran into
Registering as a developer on ArcGIS turned out being quite a hard task :) Since we didn't have any clue how to utilize the transport speed services in ArcGIS for Germany we learnt that Google applies quite narrow quotas for the free usage of  Maps Distance Matrix API. We found it quite hard to read along the guides and reference docs.

Accomplishments that we're proud of
Mingling Python/Flask and Javascript: ArcGIS goes with AMD loading and we had quite some good time being remembered to the old times *nostalgism* +1. Besides nothing is more soothing than two major code reviews taken an 3am that lead to working code!

What we learned
There are gazillions of APIs on ArcGIS that you could utilize if you knew how to do that correctly.

What's next for FlatMap
Sell it to a large digital Berlin real estate company. Or not.

Built With 
Python Flask, Javascript/AMD
