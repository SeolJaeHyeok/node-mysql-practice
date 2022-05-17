var qs = require("querystring");
var template = require("./template");
var db = require("./db");
var sanitizeHtml = require("sanitize-html");
var url = require("url");

exports.renderRootPage = (request, response) => {
  db.query(`SELECT * FROM topic`, (err, topics) => {
    if (err) throw err;

    var title = "Welcome";
    var description = "Hello, Node.js";
    var list = template.list(topics);
    var html = template.HTML(
      title,
      list,
      `
      <h2>${title}</h2>${description}
      `,
      `<a href="/create">create</a>`
    );
    response.writeHead(200);
    response.end(html);
  });
};

exports.renderDetailPage = (request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, function (error, topics) {
    if (error) {
      throw error;
    }
    db.query(
      `SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,
      [queryData.id],
      function (error2, topic) {
        if (error2) {
          throw error2;
        }
        var title = topic[0].title;
        var description = topic[0].description;
        var list = template.list(topics);
        var html = template.HTML(
          title,
          list,
          `
          <h2>${sanitizeHtml(title)}</h2>
          ${sanitizeHtml(description)}
          <p>Written By <b>${sanitizeHtml(topic[0].name)}, ${sanitizeHtml(
            topic[0].profile
          )}</b></p>
          `,
          ` <a href="/create">create</a>
            <a href="/update?id=${queryData.id}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" value="delete">
            </form>`
        );
        response.writeHead(200);
        response.end(html);
      }
    );
  });
};

exports.renderCreatePage = (request, response) => {
  db.query(`SELECT * FROM topic`, (err, topics) => {
    if (err) throw err;
    db.query(`SELECT * FROM author`, (err1, authors) => {
      if (err1) throw err1;

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
        ${template.selectAuthor(authors)}
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
    });
  });
};

exports.renderCreateProcessPage = (request, response) => {
  var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var post = qs.parse(body);
    db.query(
      "INSERT INTO topic (title, description, created, author_id) VALUES (? , ?, NOW(), ?)",
      [post.title, post.description, post.author],
      (err, result) => {
        if (err) throw err;

        response.writeHead(302, { Location: `/?id=${result.insertId}` });
        response.end();
      }
    );
  });
};

exports.renderUpdatePage = (request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, (err, topics) => {
    if (err) throw err;

    db.query(
      `SELECT * FROM topic WHERE id=?`,
      [queryData.id],
      (err1, topic) => {
        if (err1) throw err1;
        db.query(`SELECT * FROM author`, (err2, authors) => {
          var list = template.list(topics);
          var html = template.HTML(
            topic[0].title,
            list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${
                topic[0].title
              }"></p>
              <p>
                <textarea name="description" placeholder="description">${
                  topic[0].description
                }</textarea>
              </p>
              <p>
                ${template.selectAuthor(authors, topic[0].author_id)}
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
      }
    );
  });
};

exports.renderUpdateProcessPage = (request, response) => {
  var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var post = qs.parse(body);
    db.query(
      `UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
      [post.title, post.description, post.author, post.id],
      (err, result) => {
        if (err) throw err;
        response.writeHead(302, { Location: `/?id=${post.id}` });
        response.end();
      }
    );
  });
};

exports.renderDeleteProcessPage = (request, response) => {
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
