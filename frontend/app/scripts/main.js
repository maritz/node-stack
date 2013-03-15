require.config({
  baseUrl: "/scripts/",
  paths: {
    text: "../components/requirejs-text/text",
    jquery: [
      "//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min",
      "../components/jquery/jquery"
    ],
    bootstrap: "vendor/bootstrap",
    underscore: "../components/underscore/underscore",
    backbone: "../components/backbone/backbone",
    "jquery.cookie": "../components/jquery.cookie/jquery.cookie",
    jgrowl: "../components/jgrowl/jquery.jgrowl",
    jade: "../components/jade/jade",
    nohmValidations: "/nohmValidations"
  },
  shim: {
    underscore: {
      exports: "_"
    },
    backbone: {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },
    jgrowl: {
      deps: ["jquery"],
      exports: "jQuery"
    },
    "jquery.cookie": {
      deps: ["jquery"],
      exports: "jQuery"
    },
    jade: {
      exports: "jade"
    },
    nohmValidations: {
      exports: "nohmValidations"
    },
    "libs/bootstrap/modal": {
      deps: ["jquery"],
      exports: "jQuery"
    },
    "libs/jquery.jsperanto": {
      deps: ["jquery"],
      exports: "jQuery"
    },
  }
});

require(["app", "jquery"], function(app, $) {
  "use strict";
  // use app here
  console.log("App started");
});