'use strict';

const mysql = require('mysql2')

console.time(':::::::TIME:::')
// create a connection to pool server 

const pool = mysql.createPool({
    host: 'localhost',
    user: 'dinhpham',
    password: 'dinhpham',
    port: 8811,
    database: 'shopDEV'
})

const batchSize = 100000; // adjust batch size
const totalSize = 10000000;

let currentId = 1;
const insertBatch = async () => {
    const values = [];
    for (let i = 0; i < batchSize && currentId <= totalSize; i++) {
        const name = `name-${currentId}`
        const age = currentId
        const address = `address-${currentId}`
        values.push([currentId, name, age, address])
        currentId++;
    }

    if (!values.length) { // mảng rỗng khi đã insert hết dữ liệu
        console.timeEnd(':::::::TIME:::')
        pool.end(err => {
            if (err) throw err
            console.log('MySQL pool connection closed')
        })
        return;
    }

    const sql = 'INSERT INTO test_table (id, name, age, address) VALUES ?'
    pool.query(sql, [values], async (err, result) => {
        if (err) throw err;
        console.log(`Inserted ${result.affectedRows} records`)
        await insertBatch();
    })
}

insertBatch().catch(err => console.log(`Failed to insert ${err.message}`))



// perform a sample option
// 

