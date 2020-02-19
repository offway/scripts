var mysql = require('mysql');
var async = require('async');
var phsr = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phsr'
});

var phweb = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phweb'
});

var MERGE_SQL = `
INSERT INTO \`phsr\`.\`ph_address_brand\`
(\`brand\`,
\`real_name\`,
\`phone\`,
\`province\`,
\`city\`,
\`county\`,
\`content\`,
\`is_default\`,
\`create_time\`,
\`remark\`)
VALUES(?,?,?,?,?,?,?,?,?,?);
`;

var brands = null;
async.series([function (callback) {
    phsr.connect();
    phweb.connect();
    callback();
}, function (callback) {
    phsr.query("SELECT * FROM ph_brand;", function (error, results, fields) {
        if (error) {
            console.log(error);
            callback(error);
        } else {
            brands = results;
            // console.log(results);
            callback();
        }
    });
}, function (callback) {
    async.eachSeries(brands, function (item, eCb) {
        // console.log(item);
        var matchedRow = null;
        var matchedMerchant = null;
        var matchedAddress = null;
        async.series([
            function (sCb) {
                phweb.query("SELECT * FROM ph_merchant_brand where merchant_name != 'OFFWAY' and brand_name = '" + item["name"] + "'", function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        sCb(error);
                    } else {
                        matchedRow = results;
                        // console.log(results);
                        // console.log(results.length);
                        sCb();
                    }
                });
            },
            function (sCb) {
                if (matchedRow.length == 1) {
                    console.log("匹配到唯一数据，继续。。。。");
                    phweb.query("SELECT * FROM ph_merchant where id = " + matchedRow[0]["merchant_id"], function (error, results, fields) {
                        if (error) {
                            console.log(error);
                            sCb(error);
                        } else {
                            matchedMerchant = results;
                            console.log(results[0]["name"]);
                            sCb();
                        }
                    });
                } else {
                    console.log("匹配到不是唯一，跳过。。。。");
                    sCb();
                }
            },
            function (sCb) {
                if (matchedRow.length == 1) {
                    phweb.query("SELECT * FROM ph_address where id = " + matchedMerchant[0]["return_addr_id"], function (error, results, fields) {
                        if (error) {
                            console.log(error);
                            sCb(error);
                        } else {
                            matchedAddress = results;
                            console.log(results[0]["remark"]);
                            sCb();
                        }
                    });
                } else {
                    sCb();
                }
            },
            function (sCb) {
                if (matchedRow.length == 1) {
                    phsr.query(MERGE_SQL, [
                        item["id"],
                        matchedAddress[0]["real_name"],
                        matchedAddress[0]["phone"],
                        matchedAddress[0]["province"],
                        matchedAddress[0]["city"],
                        matchedAddress[0]["county"],
                        matchedAddress[0]["content"],
                        matchedAddress[0]["is_default"],
                        matchedAddress[0]["create_time"],
                        matchedAddress[0]["remark"]
                    ], function (error, results, fields) {
                        if (error) {
                            console.log(error);
                            sCb(error);
                        } else {
                            console.log(results);
                            sCb();
                        }
                    });
                } else {
                    sCb();
                }
            },
            function (sCb) {
                if (matchedRow.length == 1) {
                    phsr.query('UPDATE `phsr`.`ph_brand` SET `return_addr_id` = last_insert_id() WHERE `id` = ?', [item["id"]], function (error, results, b) {
                        if (error) {
                            console.log(error);
                            sCb(error);
                        } else {
                            console.log(results);
                            sCb();
                        }
                    });
                } else {
                    sCb();
                }
            }
        ], eCb);
    }, callback);
}, function (callback) {
    callback();
}, function (callback) {
    callback();
}, function (callback) {
    phsr.end();
    phweb.end();
    callback();
}], function (err, res) {
    console.log("END");
});
