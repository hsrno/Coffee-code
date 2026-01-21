import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  port: 5544,
  user: "rino",
  password: "nothink",
  database: "mydb",
});

export default pool;
