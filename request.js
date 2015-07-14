/**
 * Created by jianxinhu on 15/6/1.
 */
var request = require('superagent');
var cheerio = require('cheerio');
var async = require("async");
var PostModel = require("./model").ocNewsPost;
var pages = 600;

var forum_ids = ['6','4','35','43'];

PostModel.remove({}).exec(function(){

    async.forEachSeries(forum_ids,function(forum_id,nextForum){

        async.timesSeries(pages, function(n, next){
            newsRequest(forum_id,n,function(err){
                next(err);
            });
        }, function(err, users) {
            if(err){
                console.log("forum_id : %s page:n  Error:%s",forum_id,n,JSON.stringify(err,'','\t'));
            }
            nextForum();
        });

    },function(err){

        console.log("complete");

    });
});


function newsRequest(forum_id,n,fn){
    var page = n;

    request
        .get('http://bbs.oncity.cc/forum-'+forum_id+'-'+n+'.html')
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
        .end(function(err, res){
            // Calling the end function will send the request

            if(err){
                fn(err);
            }

            var $ = cheerio.load(res.text,{
                normalizeWhitespace: true,
                xmlMode: true,
                decodeEntities: false
            });

            var tbody = $("tbody").find("tr");

            async.eachSeries(tbody,function(obj,next){

                if(obj.name === "tr") {
                    console.log("page:" + page);
                    console.log("title:" + $(obj).find(".xst").text());
                    console.log("url:" + $(obj).find(".xst").attr("href"));

                    var title = $(obj).find(".xst").text();
                    var url = $(obj).find(".xst").attr("href");
                    var postId = url.split('-')[1];

                    var createDate = $(obj).find(".by").find("em").find("span").attr("title");

                    if(createDate === undefined){
                        createDate = $(obj).find(".by").find("em").find("a").text();
                    }

                    console.log("postID:" + postId);
                    console.log("createDate:"+createDate);
                    console.log("unixtimeStamp:"+(new Date(createDate)).getTime()/1000);
                    //console.log("BYhtml:"+$(obj).find(".by").find("em"));
                    console.log("--------");


                    request
                            .get('http://oncity.cc/bbs/t/'+postId)
                            //.get(url)
                            .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
                            //.set('Referer','http://oncity.cc/login?from='+url)
                            .set('Connection',"keep-alive")
                            //.set('Cookies','B2uw_21bb_lastvisit=1433140980; B2uw_21bb_visitedfid=35; _gat=1; B2uw_21bb_auth=0ffe3wD3rSjkCukp%2F7oWxGAJDiEYuwX6dPuw%2Beeyrq3h0X53RLDuKdMWMnWnTrjZt4To0XB6u4nVt9wFfjv4Syeh%2FQ; B2uw_21bb_oldtopics=D1596815D1596804D; B2uw_21bb_fid35=1433144765; _oc_session=RC9paGhzL1RZOUlmQ2hNL1NrZ0pPVm1sRWVlSUtUWUVubEwrQmsrZ3ZIcUFpL28zRDBMUnhYYXFsVzNibGJmd2MxcVYzYW04S002T2hIeEh0NjB0czlaSzVxTWhTZ3MxRnFObTJlNDVMc3ZWOTRRZTlseEF1RkVoSnhKS29Tak9vMGV5amsrdzZ0NU1BQ0ZLQVNZOW82ZC9ZSi9hbm85TnV3eG1BUGFuc0hmcVNHSk1TaU1lV0V3eU9YNHFUVk1uUVBMUVRkL2tRT0l2NTRWMDBiK1dIbFJBcHdVUERjSXNpeTdrL0gwZFZHUVpwMVhqOXB2aXNXRW8wdEtoZ2VmVUoxbUl2MlpKaW5HWU1BOExna3VEczRpYVhTTW9GeWR3d2dtM1IzZVh5M0lHaE43UVEyWjJiUnR6c2lnV3FNZXBDV0lyWVJFZFVmN21pK0R0R01TTXRHYzFzaDBYanVqZlRHSEREcmtTU01uSFFDUU1ydW90OVp1SzNjRC9pWnJNbGJ3RHdGUnpMSTFLcm5RK29oZitnSERKM0R2K1Bna2RoMU9VR1liUFNjRjFFMzRnR0Zha0pwZUx5RTVubzZtRmRjVG01cWwrekdPeXVvNUEwVUVESjU2UzRzdGZ1ZzFVNk9MODIxMHRiZTVZOE5TYWtYQkpTcGlaQllmNyszd1BydUo1TlprVFZoUGszaElxRFlVa1V4V1hiMjFxOEdnQzQ4NlR5WjR5bGFHZXVackNndVZzY1crMTU3cUh6RmdGLS1hV0p2N2VqRzBuNnhTZmk0SHVzNjFnPT0%3D--2229beaddfa1dba078d0fb47f6055434279609e3; B2uw_21bb_sid=xH64I3; B2uw_21bb_lastact=1433144993%09home.php%09spacecp; B2uw_21bb_checkpm=1; B2uw_21bb_smile=4D1; _ga=GA1.2.1821348410.1433144582')
                            .end(function(err,res){

                                if(res==null){
                                    return next();
                                }

                                var _ = cheerio.load(res.text,{
                                    normalizeWhitespace: true,
                                    xmlMode: true,
                                    decodeEntities: false
                                });


                                var message = _(".message");

                                console.log(_(message).text());

                                var post = {
                                    "title":title,
                                    "forum_id":forum_id,
                                    "content":_(message).html(),
                                    "createAt":(new Date(createDate)).getTime()/1000
                                };


                                PostModel.create(post,function(err){
                                    console.log("next");
                                    next();
                                });
                            });

                }else{
                    next();
                }

            },function(err){
                fn();
            });

        });
}


