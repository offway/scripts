var redis = require('redis');
var async = require('async');
var mysql = require('mysql');
var fs = require('fs');
var dateFormat = require('dateformat');

var connection = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phweb'
});

var client = redis.createClient();

client.on('connect', function () {
    console.log('connected');
});

client.on('error', function (err) {
    console.log('Error ' + err);
});

var keyList;
var csv = '';
async.series([function (callback) {
    client.auth('baidu@001');
    connection.connect();
    callback();
}, function (callback) {
    client.keys('DoubleZero_REWARD_LIST_*', function (err, res) {
        console.log(err);
        //console.log(res);
        keyList = res;
        callback();
    });
}, function (callback) {
    async.eachSeries(keyList, function (key, next) {
        console.log(key);
        var uid = key.split('_')[3];
        client.lrange(key, 0, 100, function (err, res) {
            console.log(err);
            //console.log(res);
            var index = 0;
            async.eachSeries(res, function (it, innerNext) {
                var voucher_infos;
                async.series([
                    function (cbb) {
                        connection.query('SELECT * FROM ph_voucher_info where user_id = ' + uid + ' and voucher_project_id in (143,144,145,146) and create_time > "2019-12-25 12:00:00" order by create_time asc', function (error, results, fields) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(results);
                                voucher_infos = results;
                            }
                            cbb(error);
                        });
                    },
                    function (cbb) {
                        connection.query('SELECT * FROM ph_address where user_id =' + uid + ' limit 1', function (error, results, fields) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(results);
                                var str = uid + ',';
                                if (results.length != 0) {
                                    str += results[0]['phone'] + ',';
                                    str += it + ",";
                                    // str += results[0]['province'] + results[0]['city'] + results[0]['county'] + results[0]['content'];
                                } else {
                                    str += '未知,';
                                    str += it + ",";
                                    // str += '未知';
                                    // str += '未知';
                                }
                                // console.log(index);
                                var date = Date.parse(voucher_infos[index]['create_time']);//.Format("yyyy-MM-dd hh:mm:ss");
                                str += dateFormat(date, "yyyy-mm-dd HH:MM:ss");
                                console.log(str);
                                csv += str + '\r\n';
                            }
                            index++;
                            cbb(error);
                        });
                    }
                ], innerNext);
            }, function (err, res) {
                next();
            });
        });
    }, function () {
        connection.end();
        callback();
    });
}], function (err, res) {
    // console.log(csv);
    fs.writeFile('1225.csv', csv, 'utf8', function (err, res) {
        console.log('END');
    });
});
