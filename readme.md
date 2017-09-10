# [MapIt](https://map-it-app.herokuapp.com)

## About

With [MapIt](https://map-it-app.herokuapp.com), users can search for locations using Google Maps and get the current weather and time for that specific location. Users are also able to favorite locations and access them through their favorites page. Users can easily map a specific favorited location with the current weather and time for that location without searching for it again.

## Getting Started

Follow these instructions to get a copy of this application up and running on your local machine. 

### Prerequisites

All dependencies for this application are listed in `requirements.txt`. 

### Installing

* Fork this repo and clone it to your local machine.
* Make a virtual environment: `mkvirtualenv <NAME>`.
* Make a local PostgresSQL database called `map-it` for this project: `createdb map-it`.
* Install the requirements: `pip install -r requirements.txt`.
* Upgrade the database to set up the tables: `python manage.py db upgrade`.

## Built With

* HTML
* CSS
* [JavaScript](https://www.javascript.com/) - Used for client-side development
* [jQuery](http://jquery.com/) - Used to manipulate the DOM and make AJAX calls
* [Bootstrap](http://getbootstrap.com/2.3.2/) - Used for page layout and responsive design
* [Modernizr](https://modernizr.com/) - Used to make sure home page slideshow works for older browsers
* [Google Maps API](https://developers.google.com/maps/) - Used to create maps and search for locations
* [OpenWeatherMap API](https://openweathermap.org/api) - Used to retrieve current weather data
* [Python](https://www.python.org/) - Used for server-side development
* [Flask](http://flask.pocoo.org/) - Python microframework
* [SQLAlchemy](https://www.sqlalchemy.org/) - Used for database manipulation


