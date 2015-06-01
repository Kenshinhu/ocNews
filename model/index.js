/**
 * Created by jianxinhu on 15/5/6.
 */
'use strict';

var m = require("mongoose");
var config = require("../config.json");

//console.log(config);

m.connect(config.dbUrl,config.dbOption);

require('./post');

exports.ocNewsPost = m.model('ocNewsPost');
exports.mongoose = m;
