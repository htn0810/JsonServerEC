const jsonServer = require("json-server");
const queryString = require("query-string");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === "POST") {
    req.body.createdAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

router.render = (req, res) => {
  const headers = res.getHeaders();

  const totalCountHeader = headers["x-total-count"];
  if (req.method === "GET" && totalCountHeader) {
    const queryParams = queryString.parse(req._parsedUrl.query);
    console.log(queryParams);
    const result = {
      data: res.locals.data,
      pagination: {
        _page: Number.parseInt(queryParams._page) || 1,
        _limit: Number.parseInt(queryParams._limit) || 12,
        _totalRows: Number.parseInt(totalCountHeader),
        _totalPages:
          Number.parseInt(Math.ceil(totalCountHeader / queryParams._limit)) ||
          1,
      },
    };
    return res.jsonp(result);
  }
  res.jsonp(res.locals.data);
};

// Use default router
server.use(router);
server.listen(3000, () => {
  console.log("JSON Server is running");
});
