import express from "express";
import mysql from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const salt = 10;

const router = express.Router();

router.use(express.json());
router.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["POST", "GET"],
  credentials: true
}));
router.use(cookieParser());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "TestNic",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);  
  } else {
    console.log("MySQL connected...");
    
  }
});

router.post("/register", (req, res) => {
  const sql = "INSERT INTO login(name,email,password) VALUES(?)";
  bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    if (err) return res.json({ Error: "Error for hashing password" });

    const values = [req.body.name, req.body.email, hash];
    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error("Inserting data Error in server:", err);
        return res.json({ Error: "Inserting data Error in server" });
      }
      return res.json({ status: "Success" });
    });
  });
});

router.post("/login", (req, res) => {
  const sql = "SELECT * FROM login WHERE email = ?";

  db.query(sql, [req.body.email], (err, data) => {
    if (err) {
      console.error("Login Error in server:", err);
      return res.json({ Error: "Login Error in server" });
    }

    if (data.length > 0) {
      bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
        if (err) {
          console.error("Password compare Error:", err);
          return res.json({ Error: "password compare Error" });
        }
        if (response) {
          const name = data[0].name;
          const token = jwt.sign({ name }, "jwt-secret-key", { expiresIn: '1d' });
          res.cookie('token', token);
          return res.json({ status: "Success" });
        } else {
          return res.json({ Error: "password not matched" });
        }
      });
    } else {
      return res.json({ Error: "No email existed" });
    }
  });
});


router.post('/forgot-password', (req, res) => {
  const sql = "SELECT * FROM login WHERE email = ?";
  
  db.query(sql, [req.body.email], (err, data) => {
    if (err) {
      console.error("Error in forgot password:", err);
      return res.json({ Error: "Error in forgot password" });
    }

    if (data.length > 0) {
      // Generate a token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = Date.now() + 3600000; // 1 hour expiry time

      // Store the token in the database
      const updateSql = "UPDATE login SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?";
      db.query(updateSql, [token, expires, req.body.email], (err, result) => {
        if (err) {
          console.error("Error updating token in server:", err);
          return res.json({ Error: "Error updating token in server" });
        }

        // Send the email
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'supunmaduwantha400@gmail.com',
            pass: 'pwog cmjw dccy nhwc',
          },
        });

        const mailOptions = {
          to: req.body.email,
          from: 'supunmaduwantha400@gmail.com',
          subject: 'Password Reset',
          text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                 Please click on the following link, or paste this into your browser to complete the process:\n\n
                 http://localhost:3000/reset-password/${token}\n\n
                 If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        transporter.sendMail(mailOptions, (err, response) => {
          if (err) {
            console.error("Error sending email:", err);
            return res.json({ Error: "Error sending email" });
          }
          return res.json({ status: "Success", message: "Password reset email sent successfully" });
        });
      });
    } else {
      return res.json({ Error: "No email found" });
    }
  });
});


router.post('/reset-password/:token', (req, res) => {
  const sql = "SELECT * FROM login WHERE resetPasswordToken = ? AND resetPasswordExpires > ?";
  
  db.query(sql, [req.params.token, Date.now()], (err, data) => {
    if (err) {
      console.error("Error finding token in server:", err);
      return res.json({ Error: "Error finding token in server" });
    }

    if (data.length > 0) {
      // Token is valid, update the password
      bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
        if (err) return res.json({ Error: "Error hashing password" });

        const updateSql = "UPDATE login SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE resetPasswordToken = ?";
        db.query(updateSql, [hash, req.params.token], (err, result) => {
          if (err) {
            console.error("Error updating password in server:", err);
            return res.json({ Error: "Error updating password in server" });
          }
          return res.json({ status: "Success", message: "Password has been reset successfully" });
        });
      });
    } else {
      return res.json({ Error: "Password reset token is invalid or has expired." });
    }
  });
});




export default router;
