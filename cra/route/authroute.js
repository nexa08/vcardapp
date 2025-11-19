const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const geoip = require('geoip-lite');
const pool = require('../db');
const verifyToken = require('../middleware/authmiddleware');
const router = express.Router();
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createTable: createVcardTable } = require('../route/vcardmodel');
const  BASE_URL = 'https://backend-jcp9.onrender.com'; 
// const  BASE_URL = 'http://127.0.0.1:3000'; 
require('dotenv').config();

createVcardTable();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// server status
router.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Register
router.post('/register', async (req, res) => {
  const { username, email, password,agility} = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    return res.status(401).json({ message: 'Email already registered!, try another or login!' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Insert the new user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password,agility,created_at,bills) VALUES (?,?,?, ?,?,?)',
      [username, email, hashedPassword,agility,new Date(),'not paid']
    );

    const newUserId = result.insertId;

    // 2. Get all admin users
    const [admins] = await pool.query('SELECT id FROM users WHERE agility = "supa"');

    // 3. Insert notification for each admin
    for (const admin of admins) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?, ?,?, ?, ?, ?)',
        [
          admin.id,
          'New User Registered',
          `User "${username}" with email "${email}" has just signed up.`,
          newUserId,
          'user',
          '0',
          new Date(),
        ]
      );
    }

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to register, try again' });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id,profile:user.profile, email: user.email, bills: user.bills, agility: user.agility,username: user.username}, process.env.JWT_SECRET, { expiresIn: '2h' });
    delete user.password;
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Login error' });
  }
});

// send OTP to email
router.post('/sendOTP', async (req, res) => {
  const { email } = req.body;
  const db = pool;
    try {
  const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) return res.status(404).json({ message: 'User not found' });
  const otp = Math.floor(10000000 + Math.random() * 90000000).toString(); //8 digit OTP
  const expiration = new Date().toISOString().slice(0, 19).replace('T', ' '); 
    await db.query('UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?', [otp, expiration, email]);
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
  },
});
    await transporter.sendMail({
      from: `"V-card App" <${process.env.EMAIL}>`,
      to: email,
      subject: 'OTP Verification',
      html: `<p>Your OTP is: <strong>${otp}</strong>. Valid For 1 hour only.</p>`
    });

    res.json({ message: 'OTP sent via email ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
 
//verifyOTP if valid and correct
router.post('/verifyOTP', async (req, res) => {
  const {otp,email} = req.body;
  const db = pool;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    const OTPSentTime = new Date(user.reset_expires); // time otp sent in database
    const OTPVerificationTime = new Date(); //verification time of otp in timestamp format
    const anHour = 60 * 60 * 1000;
    const OTPStored = user.reset_token;

    if ((OTPVerificationTime.getTime() - OTPSentTime.getTime()) > anHour || OTPStored !== otp ) {
      return res.status(401).json({ message: 'OTP Expired or incorrect OTP'});
    }
    if (OTPStored === otp) {
      return res.status(201).json({message: 'OTP Verified!✅'});
    }
    res.status(400).json({ message: 'Invalid request' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
}
});

//enter new password/reset
router.post('/newPassword', async (req, res) => {
  const {password } = req.body;
  const id = req.user.id;
  const db =pool;
  try {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }
  const newSecure = await bcrypt.hash(password,10);
   await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',[newSecure,id]);
   res.status(201).json({message: 'Password Updated!'});
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//Update password
router.post('/UpdatePassword',verifyToken,async (req, res) => {
  const {password}  = req.body;
  const id = req.user.id;
  const db =pool;
  try {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }
  const newSecure = await bcrypt.hash(password,10);
   await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',[newSecure,id]);
   res.status(201).json({message: 'Password Updated!'});
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//Profile update
router.put('/UpdateProfile', verifyToken, async (req, res) => {
  const db = pool;
  const { username, email } = req.body;
  const userID = req.user.id;  

  try {
    const query = await db.query(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, userID] 
    );
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update, try again' });
  }
});

//update payments
router.put('/bills/:id', verifyToken, async (req, res) => {
 const id = req.params.id;
  const db = pool;
  const  status  = req.body;
 const bills = status.bills;

  try {
    const query = await db.query(
      'UPDATE users SET bills = ? WHERE id = ?',
      [bills,id] 
    );


    const newUserId = query.insertId;

    // 2. Get all admin users
    const [admins] = await pool.query('SELECT id FROM users WHERE agility = "supa"');
     const [yuza] = await pool.query('SELECT * from users WHERE id =?',[id]);
    // 3. Insert notification for each admin
    for (const admin of admins) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?, ?,?, ?, ?, ?)',
        [
          admin.id,
          'billing Update',
          `User:"${yuza[0].username}" with Email:"${yuza[0].email}" Billings are Updated to "${yuza[0].bills}".`,
          newUserId,
          'user',
          '0',
          new Date(),
        ]
      );
    }
    // 4,Insert notification for user on their update
    await pool.query('INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?, ?,?, ?, ?, ?)',
       [
          id,
          'Billing Update',
          `Your Billing Status is Now  "${yuza[0].bills}". Any consult, kindly communicate with Admin. THANK YOU `,
          newUserId,
          'user',
          '0',
          new Date(),
        ]
    );

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update, try again' });
  }
});

// profile fetch
router.get('/me',verifyToken, async (req, res) => {
  try {
      const db = pool;
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// profile fetch
router.get('/mee/:id',verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
      const db = pool;
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows);
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// profile fetch
router.get('/checkBills',verifyToken, async (req, res) => {
  try {
    const id = req.user.id;
      const db = pool;
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows);

  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//fetch all staffs
router.get('/getStaffs', verifyToken, async (req, res) => {
  try {
    const db = pool;
    const [rows] = await db.query("SELECT * FROM users WHERE agility = 'staff' OR agility = 'supa'");

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No staff found' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching staff info:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//fetch all users
router.get('/getUsers', verifyToken, async (req, res) => {
  try {
    const db = pool;
    const [rows] = await db.query("SELECT * FROM users WHERE agility = 'yuza'");

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching users info:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//------------------
// vCard Endpoints
//------------------
//  Create a new vCard
router.post('/saveCard', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, title } = req.body;
    const phones = JSON.parse(req.body.phones || '[]');
    const emails = JSON.parse(req.body.emails || '[]');
    const socials = JSON.parse(req.body.socials || '{}');
    const otherLinks = JSON.parse(req.body.otherLinks || '[]');

    // ✅ Now file is correctly read
    const file = req.file;

    let filePath = null;
    if (file) {
      filePath = `/uploads/${file.filename}`;
     
    }
    const [result] =await pool.query(`INSERT INTO vcards (user_id, name, title, phones, emails, socials, otherLinks, photoUri) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId,name || '',title || '',JSON.stringify(phones),JSON.stringify(emails),JSON.stringify(socials),JSON.stringify(otherLinks),filePath ] );

          const newUserId = result.insertId;
      
          // 2. Get all admin users
          const [admins] = await pool.query('SELECT id FROM users WHERE agility = "supa"');
      
          // 3. Insert notification for each admin
          for (const admin of admins) {
            await pool.query(
              'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?, ?, ?, ?,?, ?)',
              [
                admin.id,
                'New Card Created!',
                `User "${req.user.username}" with email "${req.user.email}" Created a new vcard ${name}.`,
                newUserId,
                'user',
                '0',
                new Date(),
              ]
            );
          }
    res.status(201).json({ message: 'vCard saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save vCard' });
  }
});


// PUT /updateCard/:id - Update a specific vCard
router.put('/updateCard/:id', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, title, phones, emails, socials, otherLinks } = req.body;
    const userId = req.user.id;

    // Parse arrays/objects if sent as JSON strings
    const parsedPhones = Array.isArray(phones) ? phones : JSON.parse(phones || '[]');
    const parsedEmails = Array.isArray(emails) ? emails : JSON.parse(emails || '[]');
    const parsedSocials = typeof socials === 'object' ? socials : JSON.parse(socials || '{}');
    const parsedOtherLinks = Array.isArray(otherLinks) ? otherLinks : JSON.parse(otherLinks || '[]');

    const file = req.file;
    let filePath = null;
    if (file) filePath = `/uploads/${file.filename}`;

    const [result] = await pool.query(
      'UPDATE vcards SET name = ?, title = ?, phones = ?, emails = ?, socials = ?, otherLinks = ?, photoUri = COALESCE(?, photoUri) WHERE id = ? AND user_id = ?',
      [name, title, JSON.stringify(parsedPhones), JSON.stringify(parsedEmails), JSON.stringify(parsedSocials), JSON.stringify(parsedOtherLinks), filePath, id, userId]
    );

     // 2.save notification on card update     
          // 3. Insert notification for each admin
            await pool.query(
              'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?,?, ?, ?, ?, ?)',
              [
                userId,
                'Card Updated!',
                `You Successfully Updated Your Card ("${name}") with id number "${id}" at ${new Date()}.`,
                userId,
                'user',
                '0',
                new Date(),
              ]
            );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'vCard not found or you do not have permission to update it.' });

    // Fetch and return the updated vCard
    const [updatedRows] = await pool.query('SELECT * FROM vcards WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(200).json(updatedRows[0]);
  } catch (err) {
    console.error('Error updating vCard:', err);
    res.status(500).json({ message: 'Failed to update vCard.' });
  }
});

// GET single user cards 
router.get('/savedCard', verifyToken, upload.single('file'), async (req, res) => {
    const userId = req.user.id;
    const profile =req.user.profile;
    try {
        const [vcards] = await pool.query('SELECT * FROM vcards WHERE user_id = ?', [userId]);
        const parsedVcards = vcards.map(vcard => ({
            ...vcard,
            phones: JSON.parse(vcard.phones),
            emails: JSON.parse(vcard.emails),
            socials: JSON.parse(vcard.socials),
            otherLinks: JSON.parse(vcard.otherLinks),
            file: vcard.file ? `${BASE_URL}/uploads/${vcard.file}` : null, 
        }));
        res.status(200).json({ vcards: parsedVcards });
    } catch (err) {
        console.error('Error fetching vCards:', err);
        res.status(500).json({ message: 'Failed to fetch vCards.' });
    }
});

// GET single user cards  to populate data
router.get('/savedCards/:id', verifyToken, async (req, res) => {
    const Id = req.params.id;
    try {
        const [vcards] = await pool.query('SELECT * FROM vcards WHERE id = ?', [Id]);
        const parsedVcards = vcards.map(vcard => ({
            ...vcard,
            phones: JSON.parse(vcard.phones),
            emails: JSON.parse(vcard.emails),
            socials: JSON.parse(vcard.socials),
            otherLinks: JSON.parse(vcard.otherLinks),
            file: vcard.file ? `${BASE_URL}/uploads/${vcard.file}` : null, // full path
        }));
        res.status(200).json({ vcards: parsedVcards });
    } catch (err) {
        console.error('Error fetching vCards:', err);
        res.status(500).json({ message: 'Failed to fetch vCards.' });
    }
});
//Get all card by single user
router.get('/pickCards/:id', verifyToken, async (req, res) => {
    const Id = req.params.id;
    try {
        const [vcards] = await pool.query('SELECT * FROM vcards WHERE user_id = ?', [Id]);
        const parsedVcards = vcards.map(vcard => ({
            ...vcard,
            phones: JSON.parse(vcard.phones),
            emails: JSON.parse(vcard.emails),
            socials: JSON.parse(vcard.socials),
            otherLinks: JSON.parse(vcard.otherLinks),
            file: vcard.file ? `${BASE_URL}/uploads/${vcard.file}` : null, // full path
        }));
        res.status(200).json({ vcards: parsedVcards });
    } catch (err) {
        console.error('Error fetching vCards:', err);
        res.status(500).json({ message: 'Failed to fetch vCards.' });
    }
});



// GET  all vCards for the authenticated user
router.get('/AllCards', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const [vcards] = await pool.query('SELECT * FROM vcards');
        const parsedVcards = vcards.map(vcard => ({
            ...vcard,
            phones: JSON.parse(vcard.phones),
            emails: JSON.parse(vcard.emails),
            socials: JSON.parse(vcard.socials),
            otherLinks: JSON.parse(vcard.otherLinks),
            file: vcard.file ? `${BASE_URL}/uploads/${vcard.file}` : null, 
        }));
        res.status(200).json({ vcards: parsedVcards });
    } catch (err) {
        console.error('Error fetching vCards:', err);
        res.status(500).json({ message: 'Failed to fetch vCards.' });
    }
});

// DELETE /api/vcards/:id - Delete a specific vCard
router.delete('/deleteCard/:id', verifyToken, async (req, res) => {
    const  id  = req.params.id;
    const userId = req.user.id;

    try {
        const [result] = await pool.query('DELETE FROM vcards WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'vCard not found or you do not have permission to delete it.' });
        }
            const newUserId = result.insertId;
        
            // 2. Get all admin users
            const [admins] = await pool.query('SELECT id FROM users WHERE agility = "supa"');
        
            // 3. Insert notification for each admin
            for (const admin of admins) {
              await pool.query(
                'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?, ?, ?, ?,?,?)',
                [
                  admin.id,
                  'Card Deleted!',
                  `User "${req.user.username}" with email "${req.user.email}" has deleted card ${id}.`,
                  newUserId, 
                  'user',
                  '0',
                  new Date(),
                ]
              );
            }

            //insert notification for specific user who deleted the card
                          await pool.query(
                'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?,?, ?, ?, ?, ?)',
                [
                  userId,
                  'Card Deleted!',
                  `You Successfully Deleted Card Number "${id}"`,
                  userId, 
                  'user',
                  '0',
                  new Date(),
                ]
              );
        res.status(200).json({ message: 'vCard deleted successfully.' });
    } catch (err) {
        console.error('Error deleting vCard:', err);
        res.status(500).json({ message: 'Failed to delete vCard.' });
    }
});

// DELETE Account
router.delete('/DeleteAccount', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ? ', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Account not found or you do not have permission to delete it.' });
        }
            const newUserId = result.insertId;
        
            // 2. Get all admin users
            const [admins] = await pool.query('SELECT id FROM users WHERE agility = "supa"');
        
            // 3. Insert notification for each admin
            for (const admin of admins) {
              await pool.query(
                'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?,?, ?, ?, ?, ?)',
                [
                  admin.id,
                  'Account Deleted!',
                  `User "${req.user.username}" with email "${req.user.email}" has deleted account.`,
                  newUserId,
                  'user',
                  '0',
                  new Date(),
                ]
              );
            }
        res.status(200).json({ message: 'Account Deleted Successfully.' });
    } catch (err) {
        console.error('Error Deleting Account:', err);
        res.status(500).json({ message: 'Failed to Delete Account.' });
    }
});

// DELETE Staff
router.delete('/deletestaff/:id', verifyToken, async (req, res) => {
    const userId = req.params.id;

    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ? ', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }
            const newUserId = result.insertId;
        
            // 2. Get all admin users
            const [admins] = await pool.query('SELECT id FROM users WHERE agility = "supa"');
        
            // 3. Insert notification for each admin
            for (const admin of admins) {
              await pool.query(
                'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?,?, ?, ?, ?, ?)',
                [
                  admin.id,
                  'Staff DELETED!',
                  `You Deleted staff "${userId}"`,
                  newUserId,
                  'user',
                  '0',new Date(),
                ]
              );
            }
        res.status(200).json({ message: 'Staff Deleted Successfully.' });
    } catch (err) {
        console.error('Error Deleting Staff Account:', err);
        res.status(500).json({ message: 'Failed to Delete Staff Account.' });
    }
});

// DELETE USER
router.delete('/deleteUser/:id', verifyToken, async (req, res) => {
    const userId = req.params.id;

    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ? ', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }
            const newUserId = result.insertId;
        
            // 2. Get all admin users
            const [admins] = await pool.query('SELECT id FROM users WHERE agility = "supa"');
        
            // 3. Insert notification for each admin
            for (const admin of admins) {
              await pool.query(
                'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?, ?, ?, ?, ?,?)',
                [
                  admin.id,
                  'User DELETED!',
                  `You Deleted User  wih ID:-"${userId}"`,
                  newUserId,
                  'user',
                  '0',new Date(),
                ]
              );
            }
        res.status(200).json({ message: 'User Deleted Successfully.' });
    } catch (err) {
        console.error('Error Deleting Account:', err);
        res.status(500).json({ message: 'Failed to Delete User Account.' });
    }
});

// track location & device type (frontend sends city & country)
router.post("/track/:id", async (req, res) => {
  const cardId = req.params.id;
  const user_agent = req.headers["user-agent"];
  const platform = req.headers["platform"] || "unknown";
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    req.ip;

  try {
    const { location, city, country } = req.body;

    const latitude = location?.latitude || null;
    const longitude = location?.longitude || null;

    // Get user_id from card
    const [result] = await pool.query("SELECT user_id FROM vcards WHERE id = ?", [cardId]);
    if (!result.length) return res.status(404).send("vCard not found");

    const userId = result[0].user_id;

    // Insert scan log
    await pool.query(
      `INSERT INTO scan_logs 
       (card_id, user_id, ip, latitude, longitude, city, country, user_agent, platform, scanned_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cardId, userId, ip, latitude, longitude, city , country , user_agent, platform, new Date()]
    );

    // Fetch vCard
    const [rows] = await pool.query("SELECT * FROM vcards WHERE id = ?", [cardId]);
    if (!rows.length) return res.status(404).send("vCard not found");

    const card = rows[0];
    let vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:${card.name}\n`;
    if (card.title) vcf += `TITLE:${card.title}\n`;
    JSON.parse(card.phones || "[]").forEach((p) => p && (vcf += `TEL;TYPE=CELL:${p}\n`));
    JSON.parse(card.emails || "[]").forEach((e) => e && (vcf += `EMAIL;TYPE=INTERNET:${e}\n`));
    vcf += "END:VCARD";

            // 2. Get all admin users
            const [admins] = await pool.query('SELECT id FROM users WHERE agility = "supa"');
        
            // 3. Insert notification for each admin
            for (const admin of admins) {
              await pool.query(
                'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?,?, ?, ?, ?, ?)',
                [
                  admin.id,
                  'New Scan!',
                  `Card with ID:-"${cardId}" has been scanned from ${city} in ${country} at ${new Date()}`,
                  userId,
                  'user',
                  '0',
                  new Date(),
                ]
              );
            }

   //insert notification for specific user there card scanned
          await pool.query(
                'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?,?, ?, ?, ?, ?)',
                [
                  userId,
                  'New Scan!',
                  `Your Card with ID:-"${cardId}" has been scanned  at ${new Date()}`,
                  userId,
                  'user',
                  '0',
                  new Date(),
                ]
              );

    // Send vCard
    res.setHeader("Content-Type", "text/vcard");
    res.setHeader("Content-Disposition", `attachment; filename="${card.name}.vcf"`);
    res.send(vcf);
  } catch (err) {
    console.error("Error tracking scan:", err);
    res.status(500).send("Server error");
  }
});

//get all scans to display total scans from all individual cards
router.get('/scan_logs',verifyToken, async (req, res) => {
  const id = req.user.id;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM scan_logs WHERE user_id = ? ORDER BY scanned_at DESC',[id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching scan logs:', err);
    res.status(500).send('Server error');
  }
});

//get all scans for specified  card, one card with it's all scans to display total scans per card
router.get('/scanLogs/:id',verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM scan_logs WHERE card_id = ? ORDER BY scanned_at DESC',[id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching scan logs:', err);
    res.status(500).send('Server error');
  }
});
//get specific scans per individuaal to show logs
router.get('/singleScanLog/:id',verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM scan_logs WHERE card_id = ? ORDER BY scanned_at DESC',[id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching scan logs:', err);
    res.status(500).send('Server error');
  }
});

//get scans for admin purposes
router.get('/scan_logzs',verifyToken, async (req, res) => {
  const id = req.user.id;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM scan_logs ORDER BY scanned_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching scan logs:', err);
    res.status(500).send('Server error');
  }
});

   //admin consulty
router.post('/contactUs', verifyToken, upload.single('file'), async (req, res) => {
  const db= pool;
  const agility = req.user.agility;
  const userId = req.user.id; 
  const {title, description} = req.body;

    const [result] = await db.execute(
      'INSERT INTO complain (user_id, title, description,agility) VALUES (?, ?, ?, ?)',
      [userId, title, description,agility]
    );
    const complaintId = result.insertId;
    const [admins] = await db.query('SELECT id FROM users WHERE agility = "supa"');
    const notifQuery = `INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?,?, ?, ?, ?, ?)`;

    for (const admin of admins) {
      await db.execute(notifQuery, [
        admin.id,
        'New Complaint Submitted',
        `Complaint #${complaintId} has been submitted.`,
        complaintId,
        'complaint',
        '0',
        new Date(),
      ]);
    }
    res.status(201).json({ message: 'Complain submitted successfully.' });
   });

   router.post('/feedbackk', async (req, res) => {
  const db= pool;
  const {username, message,email} = req.body;
    const [result] = await db.execute(
      'INSERT INTO feedback (username, email,message) VALUES (?, ?, ?)',
      [username, email,message]
    );
    
    const complaintId = result.insertId;
    const [admins] = await db.query('SELECT id FROM users WHERE agility = "supa"');
    const notifQuery = `INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?,?, ?, ?, ?, ?)`;

    for (const admin of admins) {
      await db.execute(notifQuery, [
        admin.id,
        'New Complaint Submitted',
        `Complaint #${complaintId} has been submitted.`,
        complaintId,
        'complaint',
        '0',
        new Date(),
      ]);
    }
    res.status(201).json({ message: 'Complain submitted successfully.' });
   });

router.post('/Avatar', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const id = req.user.id;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = `/uploads/${file.filename}`;

    // Save to avatar column
    const [result] = await pool.query('UPDATE users SET profile = ? WHERE id = ?', [filePath, id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'User not found' });

    // Return updated avatar
    res.status(200).json({ avatar: filePath });
  } catch (err) {
    console.error('Error updating Avatar:', err);
    res.status(500).json({ message: 'Failed to update Avatar.' });
  }
});

// DELETE /api/charm/remove-avatar
router.delete('/removeAvatar', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear the profile column
    const [result] = await pool.query(
      'UPDATE users SET profile = NULL WHERE id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or permission denied.' });
    }

    res.status(200).json({ message: 'Avatar removed successfully.', avatar: null });
  } catch (err) {
    console.error('Error removing avatar:', err);
    res.status(500).json({ message: 'Failed to remove avatar.' });
  }
});



 //delete notification
router.delete('/deleteNotification/:id', verifyToken, async (req, res) => {
  const db = pool;
  const notifId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.execute(
      'DELETE FROM notifications WHERE id = ?',
      [notifId]
    );
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

 //delete Scan Log
router.delete('/deleteScanLog/:id', verifyToken, async (req, res) => {
  const db = pool;
  const logId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.execute(
      'DELETE FROM scan_logs WHERE id = ?',
      [logId]
    );
    res.json({ message: 'scanned log deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/notification', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const db = pool;
  try {
       const [unreadCountResult] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? AND is_read = '0'",
      [userId]
    );
    res.json(unreadCountResult.length);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// PUT /charm/notifications/read/:id
router.put('/notifications/read/:id',verifyToken, async (req, res) => {
  const notifId = req.params.id;
   const db = pool;
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [notifId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// PUT /charm/notifications/readAll
router.put('/notifications/readAll',verifyToken, async (req, res) => {
  const userId = req.user.id; 
   const db = pool;
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});


//Staff Registration
router.post('/staff', async (req, res) => {
  const { username, email,agility} = req.body;
  if (!username || !email || !agility) {
    return res.status(400).json({ message: 'All fields required' });
  }
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    return res.status(401).json({ message: 'Email already registered!, try another' });
  }
   const password = Math.floor(100000 + Math.random() * 999999).toString(); 
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Insert the new user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password,agility) VALUES (?,?, ?, ?)',
      [username, email, hashedPassword,agility]
    );

    const newUserId = result.insertId;

   const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
  },
});
    await transporter.sendMail({
      from: `"V-card App" <${process.env.EMAIL}>`,
      to: email,
      subject: `Account Created!`,
      html: `You now Assistant Admin(staff),<p>${username}, Login credential's <br> Username:<strong>${email}</strong> Password:<strong> ${password}</strong>.<strong>THANK YOU. </strong>  </p>`
    });
    // 2. Get all admin users
    const [admins] = await pool.query('SELECT id FROM users WHERE agility = "supa"');

    // 3. Insert notification for each admin
    for (const admin of admins) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, related_id, related_type,is_read,created_at) VALUES (?,?, ?, ?, ?,?, ?)',
        [
          admin.id,
          'New Staff Register',
          `Staff with username: "${username}" and email: "${email}" is now Registered!.`,
          newUserId,
          'user',
          '0',
          new Date(),
          
        ]
      );
    }

    res.status(201).json({ message: 'staff successfully added' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add staff, try again' });
  }
});


module.exports = router;