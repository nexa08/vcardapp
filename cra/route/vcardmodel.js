const pool = require('../db');

exports.createTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS vcards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        phones JSON,
        emails JSON,
        socials JSON,
        otherLinks JSON,
        photoUri VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `;
       const query2 = `
  CREATE TABLE IF NOT EXISTS scan_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT,
  user_agent TEXT,
  ip VARCHAR(100),
  location JSON,
  scanned_at DATETIME
);
    `;

    try {
        await pool.query(query);
        await pool.query(query2);
        // console.log(' tables created or already exists.');
    } catch (err) {
        console.error('Error creating vCards table:', err);
    }
};


