import { Pool } from 'pg';



const pool = new Pool({

    connectionString: process.env.DATABASE_URL,

    ssl: true

});



async function getData() {

    const client = await pool.connect();



    try {

        const response = await client.query('SELECT version()');

        console.log(response.rows[0]);

        return response.rows[0];

    } finally {

        client.release();

    }

}



export default async function Page() {

    const data = await getData();

}