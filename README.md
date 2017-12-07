# Flat-Map
TechCrunch Berlin Hackathon 2017 Project

## Inspiration
When moving in to a new city, it's often difficult to decide in which neighbordhood to live. Children go to a school here, your office is there, your partner's work is somewhere else... How to identify the location that minimizes the travel time for everyone?

## What it does
Upon application start we're displaying an ArcGIS map. The user picks points on that map that represent important places for commuting. The application then displays a grid segmented by the time related accessibility of that place.

## How we built it
We're using the ArcGIS API to display maps and overlays. The segmented time usage is computed by Google Maps Distance Matrix API. 

## Challenges we ran into
Registering as a developer on ArcGIS turned out being quite a hard task :) Since we didn't have any clue how to utilize the transport speed services in ArcGIS for Germany, we decided to use Google to query the travel times but we quickly learnt that Google applies quite narrow quotas for the free usage of  Maps Distance Matrix API. We found it quite hard to read along the guides and reference docs.

## Accomplishments that we're proud of
Mingling Python/Flask and JavaScript: ArcGIS goes with AMD loading and we had quite some good time being remembered to the old times *nostalgism* +1. Besides nothing is more soothing than two major code reviews taken a 3AM that lead to working code! Also, great team spirit, proper Git versioning from the beginning and a code of pretty decent quality.

## What we learned
There are gazillions of APIs on ArcGIS that you could utilize if you knew how to do that correctly.

## What's next for Flat-Map
Flat-Map provides a service that can be used not only for families looking for well-located housing, but also real estate agency can merge it with housing prices to identify zones where to invest. Finally, urban planners can get insights on neighborhoods that are not well serviced in terms of public transport. We plan to Open Source the code and let those users continue exploring this approach.

## Built With 
Python Flask, Javascript/AMD
