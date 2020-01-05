var mysql = require('mysql');
var async = require('async');
var connectionNew = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phsr'
});

var connectionOld = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phfsr'
});

var GOODS_SQL = `
INSERT INTO \`phsr\`.\`ph_goods\`
(\`name\`,
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
SELECT name,image,brand_id,brand_name,brand_logo,is_offway,type,category,is_release,status,create_time,id as remark FROM phfsr.ph_goods where brand_id in (18,20);
`;

var IMAGE_SQL = `
INSERT INTO \`phsr\`.\`ph_goods_image\`
(\`goods_id\`,
\`goods_name\`,
\`image_url\`,
\`type\`,
\`sort\`,
\`create_time\`,
\`remark\`)
SELECT goods_id,goods_name,image_url,type,sort,create_time,id as remark FROM phfsr.ph_goods_image;
`;

var STOCK_SQL = `
INSERT INTO \`phsr\`.\`ph_goods_stock\`
(\`goods_id\`,
\`goods_name\`,
\`goods_image\`,
\`image\`,
\`brand_id\`,
\`brand_name\`,
\`brand_logo\`,
\`is_offway\`,
\`type\`,
\`category\`,
\`color\`,
\`size\`,
\`stock\`,
\`sku\`,
\`create_time\`,
\`remark\`)
SELECT goods_id,goods_name,goods_image,image,brand_id,brand_name,brand_logo,is_offway,type,category,SUBSTRING_INDEX(remark,"_",1) as color,SUBSTRING_INDEX(SUBSTRING_INDEX(remark,"_",2),"_",-1) as size,stock,sku,create_time,remark FROM phfsr.ph_goods_stock where brand_id in (18,20);
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
    // update ph_goods_image
    connectionNew.query("update phsr.ph_goods_image as a set goods_id = (select id from phsr.ph_goods as b where b.remark = a.goods_id) where remark is not null", function (error, results, fields) {
        if (error) {
            console.log(error);
            callback(error);
        } else {
            callback();
        }
    });
}, function (callback) {
    //update ph_goods_stock
    connectionNew.query("update phsr.ph_goods_stock as a set goods_id = (select id from phsr.ph_goods as b where b.remark = a.goods_id) where remark is not null", function (error, results, fields) {
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
