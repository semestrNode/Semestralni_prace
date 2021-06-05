const mysql = require('mysql');

const pool = mysql.createPool({
    host: "160.217.213.13",
    user: "student",
    password: "op18",
    port: "33306",
    database: "test"
})

let task_db = {};

task_db.insertion = (name, password, date) =>{
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO tz_adresar (name, password, date) VALUES (?, ?, ?)`, [name, password, date], (err, results)=>{
            if(err){
                return reject(err);
            }
            return resolve(results);
        })
    })
}

task_db.checkUserIfExists = (name) =>{
    return new Promise((resolve, reject) => {
        pool.query(`SELECT name from tz_adresar WHERE name = (?)`, [name], (err, results)=>{
            if(err){
                return reject(err);
            }
            return resolve(results[0]);
        })
    })
}

task_db.loginCompare = (name) =>{
    return new Promise((resolve, reject) => {
        pool.query(`SELECT name, password from tz_adresar WHERE name = (?)`, [name], (err, results)=>{
            if(err){
                return reject(err);
            }
            return resolve(results[0]);
        })
    })
}




module.exports = task_db;

/*
const db = require('./db');
var result;

async function getData(){
    try{
        result = await db.selection();
        console.log(result);
        return
    } catch(e){
        console.log(e)
    }
}

getData();

*/

/**
 * 
 * SELECT COUNT(column_name)
FROM table_name
WHERE condition;

SELECT COUNT(name) from tz_adresar WHERE name = 'Tomas'
 */