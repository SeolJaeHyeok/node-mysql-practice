var http = require("http");
var url = require("url");
var db = require("./lib/db");
var topic = require("./lib/topic");

db.connect();

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (queryData.id === undefined) {
      topic.renderRootPage(request, response);
    } else {
      topic.renderDetailPage(request, response);
    }
  } else if (pathname === "/create") {
    topic.renderCreatePage(request, response);
  } else if (pathname === "/create_process") {
    topic.renderCreateProcessPage(request, response);
  } else if (pathname === "/update") {
    topic.renderUpdatePage(request, response);
  } else if (pathname === "/update_process") {
    topic.renderUpdateProcessPage(request, response);
  } else if (pathname === "/delete_process") {
    topic.renderDeleteProcessPage(request, response);
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
