var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var template = require("./lib/template.js");
var path = require("path");
var sanitizeHtml = require("sanitize-html");
var mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "2wndeo1357!",
  database: "node_practice",
});

db.connect();

const renderRootPage = (response, err, topics) => {
  if (err) throw err;

  var title = "Welcome";
  var description = "Hello, Node.js";
  var list = template.list(topics);
  var html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}`,
    `<a href="/create">create</a>`
  );
  response.writeHead(200);
  response.end(html);
};

const renderDetailPage = (response, err, topics, topicId) => {
  if (err) throw err;

  db.query(`SELECT * FROM topic WHERE id=?`, [topicId], (err1, topic) => {
    if (err1) throw err1;
    var title = topic[0].title;
    var description = topic[0].description;
    var list = template.list(topics);
    var html = template.HTML(
      title,
      list,
      `<h2>${title}</h2>${description}`,
      ` <a href="/create">create</a>
        <a href="/update?id=${topicId}">update</a>
          <form action="delete_process" method="post">
            <input type="hidden" name="id" value="${topicId}">
            <input type="submit" value="delete">
          </form>`
    );
    response.writeHead(200);
    response.end(html);
  });
};

const renderCreatePage = (response, err, topics) => {
  if (err) throw err;

  var title = "Create";
  var list = template.list(topics);
  var html = template.HTML(
    title,
    list,
    `
    <form action="/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
    `,
    `<a href="/create">create</a>`
  );
  response.writeHead(200);
  response.end(html);
};

const renderCreateProcessPage = (request, response) => {
  var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var post = qs.parse(body);
    db.query(
      "INSERT INTO topic (title, description, created, author_id) VALUES (? , ?, NOW(), ?)",
      [post.title, post.description, 1],
      (err, result) => {
        if (err) throw err;

        response.writeHead(302, { Location: `/?id=${result.insertId}` });
        response.end();
      }
    );
  });
};

const renderUpdatePage = (response, err, topics, topicId) => {
  if (err) throw err;

  db.query(`SELECT * FROM topic WHERE id=?`, [topicId], (err1, topic) => {
    if (err1) throw err1;

    var list = template.list(topics);
    var html = template.HTML(
      topic[0].title,
      list,
      `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${topic[0].id}">
          <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
          <p>
            <textarea name="description" placeholder="description">${topic[0].description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
      `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
    );
    response.writeHead(200);
    response.end(html);
  });
};

const renderUpdateProcessPage = (request, response) => {
  var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var post = qs.parse(body);
    db.query(
      `UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
      [post.title, post.description, 1, post.id],
      (err, result) => {
        if (err) throw err;
        response.writeHead(302, { Location: `/?id=${post.id}` });
        response.end();
      }
    );
  });
};

const renderDeleteProcessPage = (request, response) => {
  var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var post = qs.parse(body);
    db.query(`DELETE FROM topic WHERE id = ?`, [post.id], (err, result) => {
      if (err) throw err;
      response.writeHead(302, { Location: `/` });
      response.end();
    });
  });
};

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (queryData.id === undefined) {
      db.query(`SELECT * FROM topic`, (err, topics) =>
        renderRootPage(response, err, topics)
      );
    } else {
      db.query(`SELECT * FROM topic`, (err, topics) => {
        renderDetailPage(response, err, topics, queryData.id);
      });
    }
  } else if (pathname === "/create") {
    db.query(`SELECT * FROM topic`, (err, topics) =>
      renderCreatePage(response, err, topics)
    );
  } else if (pathname === "/create_process") {
    renderCreateProcessPage(request, response);
  } else if (pathname === "/update") {
    db.query(`SELECT * FROM topic`, (err, topics) =>
      renderUpdatePage(response, err, topics, queryData.id)
    );
  } else if (pathname === "/update_process") {
    renderUpdateProcessPage(request, response);
  } else if (pathname === "/delete_process") {
    renderDeleteProcessPage(request, response);
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
