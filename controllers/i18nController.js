var Registry = require(__dirname+'/../registry.js');
var app = require('express')();
var i18n = require(__dirname+'/../helpers/i18n.js');

app.get('/hash/:language', function (req, res) {
  res.json({"hash": i18n.getHashes()[req.params.language]});
});

app.get('/dict/:language', function (req, res) {
  res.json({
    hash: i18n.getHashes()[req.params.language],
    dict: i18n.getTranslations(req.params.language)
  });
});


module.exports = app;