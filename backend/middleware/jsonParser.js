function jsonBodyParser(req, body, done) {
    try {
        const json = JSON.parse(body);
        done(null, json);
    } catch (err) {
        err.statusCode = 400;
        done(err, undefined);
    }
}

module.exports = jsonBodyParser; 