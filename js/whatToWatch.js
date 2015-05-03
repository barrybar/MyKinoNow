
        var geocoder, apikey, baseUrl, showTimeUrl1, showTimeUrl2, nearLocation, movies, moviesSearchUrl, query, cinemaName, movieResult;
        showTimeUrl1 = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D'http%3A%2F%2Fgoogle.com%2Fmovies%3Fnear%3D";
        showTimeUrl2 = "'%20&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
        namesArray = [];
        movies = [];
        moviesArray = [];
        movieNamesArray = []
        movieResult = {};
        // construct the url with our apikey

        $(document).ready(function() {
            geocoder = new google.maps.Geocoder();
            getLocation();
            $('#rated').hide();
            /*
             * Add event listeners to buttons
             */
            $('#button1').click(function() {
              outputToScreen(moviesArray[movieNamesArray.length-1]);
              changeClass('1');
            });
            $('#button2').click(function() {
              outputToScreen(moviesArray[movieNamesArray.length-2]);
              changeClass('2');
            });
            $('#button3').click(function() {
              outputToScreen(moviesArray[movieNamesArray.length-3]);
              changeClass('3');
            });

        });

        /*
         * Change the class of the buttons
         */
        function changeClass(val) {
          $('.hierarchyBtn').removeClass('selected');
          $('#button'+val).addClass('selected');

        }

        //get Users Location
        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                $(document.body).append('<h1> The Website will only work if you show your location!</h1>');
            }
        }

        function showPosition(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            codeLatLng(lat, lng)
        }

        /* 
         * This function will send the ajax call to get the json for a movies
         */
        function getMovies(loc) {
            /*
             * Make the url compatible
             */
            nearLocation = loc.replace(/ /g, '%2B');
            nearLocation = nearLocation.replace(/'/g, '%2527');
            nearLocation = nearLocation.replace(/,/g, '%252C');
            /*
             * Ajax call yo get the location of the user
             */
            $.ajax({
                url: showTimeUrl1 + nearLocation + showTimeUrl2,
                dataType: "jsonp",
                success: buildMovieObject
            });


        }

        function codeLatLng(lat, lng) {
            var latlng = new google.maps.LatLng(lat, lng);
            geocoder.geocode({
                'latLng': latlng
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        //formatted address
                        getMovies(results[0].formatted_address);
                    } else {
                        alert("No results found");
                    }
                } else {
                    alert("Geocoder failed due to: " + status);
                }
            });
        }


        // Build up movie object
        function buildMovieObject(data) {
            var divs, movieResults, movieObj, movieObjLeft, movieObjRight;
            divs = data.query.results.body.div;
            /*
             * Looping through the google.com/movies website, and build up an object
             */
            $.each(divs, function(index, div) {
                if (div.id && div.id === "results") {
                    movieResults = div.div.div.div;
                    cinemaName = movieResults[0].div[0].div.content;
                    movieObj = movieResults[0].div[1];
                    movieObjLeft = movieObj.div[0].div;
                    movieObjRight = movieObj.div[1].div;
                    $.each(movieObjLeft, function(index, movie) {
                        movieNamesArray.push(movie.div[0].a.content)
                    });
                    $.each(movieObjRight, function(index, movie) {
                        movieNamesArray.push(movie.div[0].a.content)
                    });
                    getRatings(movieNamesArray);
                }
            });

        }

        function getRatings(moviesArr) {
            var year, today;
            $.each(moviesArr, function(index, movie) {
                today = new Date();
                year = today.getFullYear();
                $.ajax({
                    url:  'http://www.omdbapi.com/?t='+ movie +'&y= ' + year +'&r=json&tomatoes=true',
                    dataType: "jsonp",
                    success: searchCallback
                });
            });

        }
        /*
         * Create a compare function which orders the array
         */
         function compare(a,b) {
            if (a.imdbRating < b.imdbRating || isNaN(a.imdbRating))
               return -1;
            if (a.imdbRating > b.imdbRating)
              return 1;
            return 0;
          }

        /*
         * function to get the highest rated film and next highest rated depending on the parameters passed in.
         */

         function getHighestRated(rating) {
            var largest, rating;
            largest = 0;
            moviesArray.sort(compare);
            if (moviesArray.length === movieNamesArray.length) {
              outputToScreen(moviesArray[movieNamesArray.length-1]);
            }
         }

        /*
         * callback for when we get back the results
         */ 
        
        function searchCallback(data) {
                moviesArray.push(data);
                /*
                 * When the MoviesNamesArray has filled up find out which has the highest IMDB rating
                 */
             getHighestRated();    
                
            }

        function outputToScreen(p_movieResult) {
        var m, image, time; 
        m = p_movieResult;
        image = m.Poster;
        time = '20:30';
             $('#left').empty();
             $('#right').empty();
             $('#left').append('<h2> What? </h2>');
             $('#left').append('<h3>' + m.Title + '</h3>');
             $('#left').append('<h2> Where? </h2>');
             $('#left').append('<h3>' +  cinemaName + '</h3>');
             $('#left').append('<h2> Rating? </h2>');
             $('#left').append('<h3>' + m.imdbRating + '</h3>');
             $('#right').append('<img src = "' + image + '">');
             $('#rated').show();
             changeClass('1');

        }    