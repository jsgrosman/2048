$(document).ready(function() {

    console.debug("cookie: " + $.cookie('nprone_token'));
    if (typeof($.cookie('nprone_token')) !== 'undefined') {
        $.getJSON('proxy/user.php', null, function (data) {
            $('.login').html('Welcome ' + data.attributes.firstName + ' ' +  data.attributes.lastName);
            makeFirstRecommendation();
        }).fail(function(response, textStatus, error ) {
            console.debug(textStatus + ", " + error);
            console.debug(response);
        });


    }
    else {
        var uri = new URI();
        var queryArgs= uri.search(true);
        if (typeof (queryArgs['code']) !== 'undefined') {
            console.debug("making request");
            $.getJSON('proxy/token.php?code=' + queryArgs['code'], null, function (data) {
                $.cookie('nprone_token', data.access_token)

                $.getJSON('proxy/user.php', null, function (data) {
                    $('.login').html('Welcome ' + data.attributes.firstName + ' ' +  data.attributes.lastName);
                    makeFirstRecommendation();
                }).fail(function(response, textStatus, error ) {
                    console.debug(textStatus + ", " + error);
                    console.debug(response);
                });

            }).fail(function(response, textStatus, error ) {
                console.debug(textStatus + ", " + error);
                console.debug(response);
            });



        }
    }


    $('.skip').on('click', function(event) {
        event.preventDefault();
        skipAudio();
        return false;
    });

    $('.jp-interesting').on('click', function(event) {
        event.preventDefault();
        sendInteresting();
        return false;
    });
});


var audioItems = [];
var currentItem = null;
var ratingsQueue = [];

makeFirstRecommendation = function() {
    $.getJSON('proxy/recommendations.php', null, function (data) {
        console.debug(data);

        audioItems = data.items;

        currentItem = audioItems.shift();
        var firstAudio = currentItem.links.audio[0].href;
        console.debug(firstAudio);

        ratingsQueue.push(currentItem.attributes.rating);
        sendRatings(currentItem.links.recommendations[0].href);

        $("#jquery_jplayer_1").jPlayer({
            ready: function () {
                $(this).jPlayer("setMedia", {
                    m4a: firstAudio
                }).jPlayer("play");
            },
            ended: function() {
                ratingsQueue[0].rating = 'COMPLETED';
                playNext();
            },
            swfPath: "js/lib/jPlayer-2.9.2/dist/jplayer",
            supplied: "m4a"
        });

    }).fail(function(response, textStatus, error ) {
        console.debug(textStatus + ", " + error);
        console.debug(response);
    });
};

skipAudio = function() {
    ratingsQueue[0].rating = 'SKIP';
    playNext();
};

playNext = function() {

    console.debug(audioItems);
    if (audioItems.length > 0) {

        currentItem = audioItems.shift();
        var nextAudio = currentItem.links.audio[0].href;
        console.debug(nextAudio);

        ratingsQueue.push(currentItem.attributes.rating);
        sendRatings(currentItem.links.recommendations[0].href);

        $("#jquery_jplayer_1").jPlayer("setMedia", {
            m4a: nextAudio
        }).jPlayer("play");
    }
    else {
        console.debug("out of audio");
    }
};

sendRatings = function(ratingsUrl) {
    var proxyUrl = getRatingsUrl(ratingsUrl);

    console.debug(JSON.stringify(ratingsQueue));
    $.post(proxyUrl, JSON.stringify(ratingsQueue), function(data) {
        console.debug(data);

        // refresh queue
        audioItems = data.items;

        // we're done sending rating for the earlier audio, remove it
        if (ratingsQueue.length > 1) {
            ratingsQueue.shift();
        }
    }, 'json');
};

sendInteresting = function() {

    var ratingsObject = currentItem.attributes.rating;
    ratingsObject.rating = 'THUMBUP';
    var ratingsArray = [ratingsObject];

    $.post('proxy/ratings.php', JSON.stringify(ratingsArray), function(data) {
        console.debug(data);
    }, 'json');

}

/**
 * Parse out the query string and return the proxy url
 * @param url
 * @returns {string}
 */
getRatingsUrl = function(url) {
    var uri = new URI(url);
    var queryString = uri.query();

    return 'proxy/ratings.php?' + queryString;
};