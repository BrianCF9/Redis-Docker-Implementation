
const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'Briancastro',
    database:'Items',
    port: '5432'


})

const searchitems=async (req,res)=>{
    const busqueda=req.params.name
    const response=await pool.query("SELECT * FROM Items where name like CONCAT('%', $1::text , '%')",[busqueda])
    res.status(200).json(response.rows)
}

const Getitems=async (req,res)=>{
    const response=await pool.query("SELECT * FROM Items")
    res.status(200).json(response.rows)
}




module.exports={
    Getitems,
 searchitems
}