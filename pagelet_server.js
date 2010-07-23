var
  http = require('http'),
  url = require('url'),     // use to parse incoming url
  fs = require('fs'),       // use to read/write file system. 
  //io = require('./lib/socket.io'),
  sys = require('sys'),
  net = require('net');
  
var send404 = function(res){
	res.writeHead(404);
	res.write('404 Not Found');
	res.end();
};

var endPage = function(res) {
  res.write("</script></body></html>");
  res.end();
}

var responseHtml = function(res, msg, charset, type) {
  if (typeof(charset) === 'undefined') {
    charset = 'utf8';
  }
  res.writeHead(200, {'Content-Type': type});
  res.write(msg, charset);
  res.end();
};

// With new API, look in test 
var server = http.createServer(function (req, res) {
  // Nothing to do.
  var pathobj = url.parse(req.url, true);
  var path = pathobj.pathname;
  var count = 0;
  
  switch (path) {     
    case '/index.html':
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write("<html><head><title>Pagelet</title></head><body><div id=\"twitter\"></div><div id=\"flickr\"></div><script type=\"text/javascript\">");
      // Do pagelet request.
      var twitter = http.createClient(80, 'twitter.com');
      var tweets = '';
      var photos = '';
      var picasa_photos = '';
      var twt_output = '';
      var flickr_output = '';
      var request = twitter.request('GET', '/statuses/public_timeline.json', {'host': 'twitter.com'});
      //console.log(request);
      console.log('---');
      request.end();
      request.on('response', function (response) {
        count++;
        console.log('STATUS: ' + response.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(response.headers));
        response.setEncoding('utf8');
        twt_output = "document.getElementById(\"twitter\").innerHTML = \"";
        response.on('data', function (chunk) {
          //console.log('BODY: ' + chunk);
          tweets = tweets + chunk;
        });
        response.on('end', function () {
          tweets = JSON.parse(tweets);
          twt_output += '<ul>';
          for (i in tweets) {
            twt_output += '<li>';
            twt_output += '<span class=\\\"twt-text\\\">';
            msg = tweets[i].text
            msg = msg.replace(/"/g,"'");
            msg = msg.replace(/\n/g, "<br />");
            msg = msg.replace(/\r\n/g, "<br />");
            msg = msg.replace(/\r/g, "<br />");
            
            twt_output += msg;
            twt_output += '<span class=\\\"twt-name\\\"> --- By ... '+tweets[i].user.screen_name+'</span>';
            twt_output += '</li>';
          }
          res.write(twt_output + "</ul>\";");
          count--;
          if (count === 0) {
            endPage(res);
          }
        });
      });
      // Picasa
      //http://picasaweb.google.com
      var picasa = http.createClient(80, 'picasaweb.google.com');
      var picasa_request = picasa.request('GET', '/data/feed/base/user/documentingpicasa?category=album&alt=json', {'host': 'picasaweb.google.com'});
      picasa_request.end(); // send request
      
      picasa_request.on('response', function (response) { 
        count++;
        response.on('data', function (chunk) {
          picasa_photos = picasa_photos + chunk;
         // console.log('nazt');
        });
        response.on('end', function () { 
         //console.log(picasa_photos);
         picasa_photos = JSON.parse(picasa_photos);
         for (j in picasa_photos.feed.entry) {
            
           console.log('xxxx--- ' + picasa_photos.feed.entry[j]);
         }
         
         //console.log(picasa_parsed);
          console.log('nazt');
          count--;
          if (count === 0) {
            endPage(res);
          }
        });
      });
      
      // Flickr
      var flickr = http.createClient(80, 'api.flickr.com');
      var flickr_request = flickr.request('GET', '/services/feeds/photos_public.gne?count=1&tags=dog&tagmode=any&format=json', {'host': 'api.twitter.com'});
      //console.log(request);
      //console.log('---');
      flickr_request.end();
      flickr_request.on('response', function (response) {
        count++;
        console.log('STATUS: ' + response.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(response.headers));
        response.setEncoding('utf8');
        flickr_output = "document.getElementById(\"flickr\").innerHTML = \"";
        response.on('data', function (chunk) {
          //console.log('BODY: ' + chunk);
          //console.log(chunk);
          photos = photos + chunk;
        });
        response.on('end', function () {
          photos = photos.substr(photos.indexOf('(') + 1, photos.length - (photos.indexOf('(') + 1) - 1 );
          console.log('===========================');
          console.log(photos);
          console.log('===========================');
          
          photos = photos.replace(/\'/g, "\"");
          photos = JSON.parse(photos);
          flickr_output += '<ul>';
          for (i in photos.items) {
            flickr_output += '<li>';
            flickr_output += '<img class=\\\"flickr-img\\\" src=\\\"'+ photos.items[i].media.m+'\\\" />';
            flickr_output += '</li>';
          }
          res.write(flickr_output + "</ul>\";");
          count--;
          if (count === 0) {
            endPage(res);
          }
        });
      });
      break;
      
    default:
      send404(res);
      break;
  }
});

server.listen(8888);
sys.puts('Server running at http://127.0.0.1:8888');