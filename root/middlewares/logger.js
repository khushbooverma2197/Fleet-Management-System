const fs = require("fs");
module.exports = (req, res, next) => {
 const log = `${req.method} ${req.url} ${new Date().toISOString()}\n`;
 fs.appendFileSync("log.txt", log);
 next();
};
