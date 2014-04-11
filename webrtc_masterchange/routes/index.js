
/*
 * GET home page.
 */

exports.index = function(req, res){
    console.log("SSSSS");
    console.log(req.host);
    console.log("SSSSS");
    
    res.render('index', 
        { 
            title: 'Express', 
            host: req.host
        }
    );
};
