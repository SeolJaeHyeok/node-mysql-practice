module.exports = {
  HTML: function (title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      <a href="/author">Author</a>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },
  list: function (topics) {
    var list = "<ul>";
    var i = 0;
    while (i < topics.length) {
      list =
        list + `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
      i = i + 1;
    }
    list = list + "</ul>";
    return list;
  },
  selectAuthor: function (authors, authorId) {
    var tag = "";
    i = 0;

    while (i < authors.length) {
      let selected = "";
      if (authorId === authors[i].id) {
        selected = " selected";
      }
      tag += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
      i += 1;
    }
    return `
      <select name='author'>
        ${tag}
      </select>
    `;
  },
  getAuthorTable: function (authors) {
    var tag = "<table>";
    var i = 0;
    while (i < authors.length) {
      tag += `
            <tr>
                <td>${authors[i].name}</td>
                <td>${authors[i].profile}</td>
                <td><a href="/author/update?id=${authors[i].id}">update</a></td>
                <td>
                  <form action="/author/delete_process" method="post">
                    <input type="hidden" name="id" value="${authors[i].id}" />
                    <input type="submit" value="Delete" />
                  </form>
                </td>
            </tr>
            `;
      i++;
    }
    tag += "</table>";
    return tag;
  },
};
