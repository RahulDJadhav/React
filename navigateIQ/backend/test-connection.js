import fs from "fs";
import crypto from "crypto";
import snowflake from "snowflake-sdk";
import dotenv from "dotenv";
dotenv.config();

// Read the encrypted private key file
const privateKeyData = fs.readFileSync(process.env.SNOWFLAKE_PRIVATE_KEY_PATH, "utf8");

// Decrypt the private key using the passphrase
let privateKey;
try {
  const keyObject = crypto.createPrivateKey({
    key: privateKeyData,
    passphrase: process.env.SNOWFLAKE_PRIVATE_KEY_PASSPHRASE
  });
  
  // Convert to unencrypted PEM format
  privateKey = keyObject.export({
    type: 'pkcs8',
    format: 'pem'
  });
  
  console.log("Successfully decrypted private key");
} catch (error) {
  console.error("Failed to decrypt private key:", error.message);
  process.exit(1);
}

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  role: process.env.SNOWFLAKE_ROLE,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
  authenticator: 'SNOWFLAKE_JWT',
  privateKey: privateKey
});

connection.connect((err, conn) => {
  if (err) {
    console.error("Connection failed:", err);
  } else {
    console.log("Connected to Snowflake!");

    connection.execute({
      sqlText: `SELECT CURRENT_USER(), CURRENT_ROLE(), CURRENT_WAREHOUSE();`,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error("Query failed:", err);
        } else {
          console.log("Query Result:", rows);
        }
        connection.destroy((err) => {
          if (err) {
            console.error("Error closing connection:", err);
          } else {
            console.log("Connection closed successfully");
          }
        });
      }
    });
  }
});
