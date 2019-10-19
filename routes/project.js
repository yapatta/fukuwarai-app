var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : '####',
  password : '####',
  database : 'twitter_fukuwarai'
});
var fs = require('fs');
fileBasePath = './public/images/';
function getUniqueStr(myStrong){
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
}

router.get('/', function(req, res, next) {
    res.render('project/index', { title: 'project' });
  });
  
router.post('/', function(req, res, next) {
    //maker_idをTwitter_Idから取得
    console.log(req.body);
    if(!(req.body['type']=== '' || req.body['explanation']=== '')) {
        var base64Data = req.body.image.split(',')[1];
        var binData = new Buffer.from(base64Data,'base64').toString("binary");
        var fileName = getUniqueStr() + '.png';
        var baseFileName = getUniqueStr() + '.png';

        fs.writeFile(fileBasePath + fileName, binData, "binary", function(err) {
            if(err) {
		console.log(err);
                next(err);
            } else {
                fs.writeFile(fileBasePath + baseFileName, binData, "binary", function(err) {
                    if(err) {
                        next(err);
                    } else {
                        connection.query('insert into project set ?', { picture: fileName, base_picture: baseFileName, type: req.body['type'],explanation: req.body['explanation']}, function (error, results, fields) {
                            if (error) throw error;
                            res.json({
                                url: '/project/' + results.insertId
                            });
                        });
                    }
                });
            }
        });
    }
});

router.get('/:project_id', function(req, res, next) {
    res.render('project/result', { title: 'project Result', project_id: req.params.project_id });
});

router.get('/:project_id/part', function(req, res, next) {
    connection.query('select `picture` from `project` where `id` = ?', [req.params.project_id], function (error, results, fields){
    var picturePath = '/public/images/' + results[0].picture;
    res.render('project/part', {title :"image", picturePath: picturePath})
    })
})

router.get('/:project_id/part', function(req, res, next) {
    res.render('project/part', { title: 'Part', project_id: req.params.project_id });
});

router.post('/:project_id/part', function(req, res, next) {
    // 完成画像保存
    connection.query('select `picture` from `part` where `project_id` = ?', [req.params.project_id], function (error, results, fields) {
        var fileNames = [];
        results.forEach(function(result) {
            fileNames.push(result.picture);
        });
    
        if (fileNames.length == 4) {
            res.json({
                url: '/project/' + req.params.project_id + '/complete'
            });
        } else {
            var base64Data = req.body.image.split(',')[1];
            var binData = new Buffer.from(base64Data,'base64').toString("binary");
            var fileName = getUniqueStr() + '.png';

            fs.writeFile(fileBasePath + fileName, binData, "binary", function(err) {
                if(err) {
                    next(err);
                } else {
                    connection.query('insert into part set ?', {name: req.body['name'], picture: fileName, project_id: req.params.project_id }, function (error, results, fields) {
                        if (error) throw error;
                    
                        connection.query('select `picture` from `project` where `id` = ?', [req.params.project_id], function (error, results, fields) {
                            composeImages(fileBasePath + results[0].picture, fileBasePath + fileName, fileBasePath + results[0].picture);
                        });

                        res.json({
                            url: '/project/part/' + results.insertId
                        });
                    });
                }
            });
        }
    });
});

router.get('/:project_id/complete', function(req, res, next) {
    connection.query('select `completed` from `project` where `id` = ?', [req.params.project_id], function (error, results, fields) {
        if (results[0].completed) {
            res.render('project/complete', { title: 'complete', path: '/public/images/' + completeFileName }); 
        } else {
            connection.query('update project set `completed` = ? where `project_id` = ?', [true, req.params.project_id], function (error, results, fields) {
                connection.query('select `picture`, `base_picture` from `project` where `id` = ?', [req.params.project_id], function (error, results, fields) {
                    var completeFileName = results[0].picture;
            
                    try {
                        fs.unlinkSync(fileBasePath + results[0].base_picture);
                    } catch (error) {
                        throw error;
                    }

                    connection.query('select `picture` from `part` where `project_id` = ?', [req.params.project_id], function (error, results, fields) {
                        results.forEach(function(result) {
                            try {
                                fs.unlinkSync(fileBasePath + result.picture);
                            } catch (error) {
                                throw error;
                            }
                        });
            
                        res.render('project/complete', { title: 'complete', path: '/public/images/' + completeFileName });
                    });
                });
            });
        }
    });
});

router.get('/part/:part_id', function(req, res, next) {
    connection.query('select `picture` from `part` where `id` = ?', [req.params.part_id], function (error, results, fields) {
        var filePath = '/public/images/' + results[0].picture;
        res.render('project/part-result', { title: 'Part Result', picturePath: filePath });
    });
});

async function composeImages(path1, path2, resultPath){
    // "lenna.png"を開く
    var Jimp = require("jimp");
    Jimp.read(path1)
    .then(image => {
        image.resize(500, 400);
        Jimp.read(path2)
        .then(image2 => {
            image2.resize(500, 400);
            image.composite(image2, 0, 0)
            .resize(500, 400)
            .write(resultPath);
        }).catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        console.error(err);
    });;
}

module.exports = router;
