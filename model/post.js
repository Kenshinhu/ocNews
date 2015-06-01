/**
 * Created by jianxinhu on 15/5/28.
 */
var m = require('mongoose');
var s = m.Schema;

var schema = new s({
    "title"    : String,
    "content"  : String,
    "createAt" : { type:Number , default: Date.now }
});

m.model('ocNewsPost',schema);