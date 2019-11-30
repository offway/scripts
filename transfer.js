var mysql = require('mysql');
var async = require('async');
var connectionOld = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phsr'
});

var connectionNew = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phfsr'
});

var GOODS_SQL = `
INSERT INTO \`phfsr\`.\`ph_goods\`
(\`id\`,
\`name\`,
\`image\`,
\`brand_id\`,
\`brand_name\`,
\`brand_logo\`,
\`is_offway\`,
\`type\`,
\`category\`,
\`is_release\`,
\`status\`,
\`create_time\`,
\`remark\`)
SELECT * FROM phsr.ph_goods where brand_id = 18;
`;

var IMAGE_SQL = `
INSERT INTO \`phfsr\`.\`ph_goods_image\`
(\`id\`,
\`goods_id\`,
\`goods_name\`,
\`image_url\`,
\`type\`,
\`sort\`,
\`create_time\`,
\`remark\`)
SELECT * FROM phsr.ph_goods_image;
`;

var STOCK_SQL = `
INSERT INTO \`phfsr\`.\`ph_goods_stock\`
(\`id\`,
\`goods_id\`,
\`goods_name\`,
\`goods_image\`,
\`image\`,
\`brand_id\`,
\`brand_name\`,
\`brand_logo\`,
\`is_offway\`,
\`type\`,
\`category\`,
\`size\`,
\`color\`,
\`stock\`,
\`sku\`,
\`create_time\`,
\`remark\`)
SELECT * FROM phsr.ph_goods_stock where brand_id = 18;
`;

async.series([function (callback) {
    connectionOld.connect();
    connectionNew.connect();
    callback();
}, function (callback) {
    connectionOld.query(GOODS_SQL, function (error, results, fields) {
        if (error) {
            console.log(error);
            callback(error);
        } else {
            callback();
        }
    });
}, function (callback) {
    connectionOld.query(IMAGE_SQL, function (error, results, fields) {
        if (error) {
            console.log(error);
            callback(error);
        } else {
            callback();
        }
    });
}, function (callback) {
    connectionOld.query(STOCK_SQL, function (error, results, fields) {
        if (error) {
            console.log(error);
            callback(error);
        } else {
            callback();
        }
    });
}, function (callback) {
    //remove other images
    connectionOld.query("delete FROM phfsr.ph_goods_image where goods_id not in (SELECT id FROM phfsr.ph_goods)", function (error, results, fields) {
        if (error) {
            console.log(error);
            callback(error);
        } else {
            callback();
        }
    });
}, function (callback) {
    connectionOld.end();
    connectionNew.end();
    callback();
}], function (err, res) {
    console.log("END");
});
