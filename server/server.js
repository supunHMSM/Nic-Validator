import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import mysql from 'mysql2/promise';
import exceljs from 'exceljs';
import authRouter from "./auth.js";
import pdfkit from 'pdfkit';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000;

let db;

// Establishing MySQL connection
(async () => {
    try {
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'TestNic'
        });
        console.log('Connected to MySQL database');
    } catch (error) {
        console.error('Error connecting to MySQL:', error.message);
    }
})();


app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

//genarate Reports

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the reports directory if it doesn't exist
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
}

app.get('/download-report/pdf', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');

        const doc = new pdfkit();
        const fileName = `NIC-report-${Date.now()}.pdf`;
        const filePath = path.join(reportsDir, fileName);

        // Create a write stream for the PDF file
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add a title
        doc.fontSize(24).font('Helvetica-Bold').text('NIC Report', { align: 'center' });
        doc.moveDown(1);

        // Table headers
        const headerHeight = 30;
        const columnWidths = { NIC: 120, Birthday: 140, Age: 60, Gender: 120 };
        const startX = 50;
        const startY = doc.y;

        doc.fontSize(14).font('Helvetica-Bold').fillColor('#ffffff')
            .rect(startX, startY, Object.values(columnWidths).reduce((a, b) => a + b, 0), headerHeight)
            .fill('#1f4e78')
            .stroke();

        let xOffset = startX;
        doc.fillColor('#ffffff').text('NIC', xOffset, startY + 8, { width: columnWidths.NIC, align: 'left' });
        xOffset += columnWidths.NIC;
        doc.text('Birthday', xOffset, startY + 8, { width: columnWidths.Birthday, align: 'left' });
        xOffset += columnWidths.Birthday;
        doc.text('Age', xOffset, startY + 8, { width: columnWidths.Age, align: 'center' });
        xOffset += columnWidths.Age;
        doc.text('Gender', xOffset, startY + 8, { width: columnWidths.Gender, align: 'left' });
        doc.moveDown();

        // Table rows
        const rowHeight = 25;
        rows.forEach((item, index) => {
            const backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
            const rowY = doc.y;

            // Add row background
            doc.rect(startX, rowY, Object.values(columnWidths).reduce((a, b) => a + b, 0), rowHeight)
                .fill(backgroundColor)
                .stroke();

            let xOffset = startX;
            doc.fillColor('#000000').text(item.NIC, xOffset, rowY + 5, { width: columnWidths.NIC, align: 'left' });
            xOffset += columnWidths.NIC;
            doc.text(new Date(item.birthday).toISOString().split('T')[0], xOffset, rowY + 5, { width: columnWidths.Birthday, align: 'left' });
            xOffset += columnWidths.Birthday;
            doc.text(item.age.toString(), xOffset, rowY + 5, { width: columnWidths.Age, align: 'center' });
            xOffset += columnWidths.Age;
            doc.text(item.gender, xOffset, rowY + 5, { width: columnWidths.Gender, align: 'left' });
            doc.moveDown(0.5);
        });

        doc.end();

        // Handle file download
        writeStream.on('finish', () => {
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error("Error sending report:", err.message);
                }

                // Delete the file after sending
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error("Error deleting report file:", err.message);
                    }
                });
            });
        });

        writeStream.on('error', (error) => {
            console.error("Error writing PDF to file:", error.message);
            res.status(500).json({ message: 'Error generating PDF report' });
        });

    } catch (error) {
        console.error("Error generating PDF report:", error.message);
        res.status(500).json({ message: 'Error generating PDF report' });
    }
});


// Route to download CSV report
app.get('/download-report/csv', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');

        const fileName = `NIC-report-${Date.now()}.csv`;
        const filePath = path.join(reportsDir, fileName);

        const writeStream = fs.createWriteStream(filePath);
        writeStream.write('NIC,Birthday,Age,Gender\n');

        rows.forEach(item => {
            const formattedBirthday = new Date(item.birthday).toISOString().split('T')[0];
            writeStream.write(`${item.NIC},${formattedBirthday},${item.age},${item.gender}\n`);
        });

        writeStream.end();

        writeStream.on('finish', () => {
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error("Error sending report:", err.message);
                }
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error("Error deleting report file:", err.message);
                    }
                });
            });
        });

        writeStream.on('error', (error) => {
            console.error("Error writing CSV to file:", error.message);
            res.status(500).json({ message: 'Error generating CSV report' });
        });

    } catch (error) {
        console.error("Error generating CSV report:", error.message);
        res.status(500).json({ message: 'Error generating CSV report' });
    }
});

// Route to download Excel report
app.get('/download-report/excel', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('NIC Report');

        worksheet.columns = [
            { header: 'NIC', key: 'NIC', width: 30 },
            { header: 'Birthday', key: 'birthday', width: 15 },
            { header: 'Age', key: 'age', width: 10 },
            { header: 'Gender', key: 'gender', width: 10 }
        ];

        rows.forEach(item => {
            const formattedBirthday = new Date(item.birthday).toISOString().split('T')[0];
            worksheet.addRow({
                NIC: item.NIC,
                birthday: formattedBirthday,
                age: item.age,
                gender: item.gender
            });
        });

        const fileName = `NIC-report-${Date.now()}.xlsx`;
        const filePath = path.join(reportsDir, fileName);

        await workbook.xlsx.writeFile(filePath);

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error("Error sending report:", err.message);
            }
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("Error deleting report file:", err.message);
                }
            });
        });

    } catch (error) {
        console.error("Error generating Excel report:", error.message);
        res.status(500).json({ message: 'Error generating Excel report' });
    }
});



// //End Genarate Report

// app.get('/summary', async (req, res) => {
//     try {
//         const [totalRecords] = await db.query('SELECT COUNT(*) AS count FROM users');
//         const [maleUsers] = await db.query("SELECT COUNT(*) AS count FROM users WHERE gender='Male'");
//         const [femaleUsers] = await db.query("SELECT COUNT(*) AS count FROM users WHERE gender='Female'");
//        // const [rejectUsers] = await db.query("SELECT COUNT(*) AS count FROM users WHERE rejected = TRUE");

//         res.json({
//             totalRecords: totalRecords[0].count,
//             maleUsers: maleUsers[0].count,
//             femaleUsers: femaleUsers[0].count,
//             //rejectUsers: rejectedUsers[0].count
//         });
//     } catch (error) {
//         console.error("Error fetching summary data:", error.message);
//         res.status(500).json({ message: 'Error fetching summary data' });
//     }
// });



app.use("/auth", authRouter);

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Route to retrieve data from the database
app.get('/get-data', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching data from database:', error.message);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

// Handle CSV file uploads
app.post('/upload-csv', upload.array("files", 4), async (req, res) => {
    const allData = [];
    const errors = [];

    for (const file of req.files) {
        const results = [];

        await new Promise((resolve, reject) => {
            fs.createReadStream(file.path)
                .pipe(csv({headers: false}))
                // .on('headers', (headers) => {
                //     console.log('Headers:', headers);
                // })
                .on('data', (data) => {
                    console.log('Row Data:', data);
                    const nic = (data[0] || '').trim();

                    if (!nic) {
                        const errorMsg = `NIC is missing in row: ${JSON.stringify(data)}`;
                        console.error(errorMsg);
                        errors.push(errorMsg);
                    } else {
                        try {
                            const processedData = {
                                NIC: nic,
                                age: calculateAgeFromNIC(nic),
                                birthday: extractBirthdayFromNIC(nic),
                                gender: extractGenderFromNIC(nic)
                            };
                            results.push(processedData);
                        } catch (error) {
                            const errorMsg = `Error processing NIC ${nic}: ${error.message}`;
                            console.error(errorMsg);
                            errors.push(errorMsg);
                            saveRejectedNIC(nic, error.message);
                        }
                    }
                })
                .on('end', () => {
                    allData.push(...results);
                    resolve();
                })
                .on('error', (error) => {
                    reject(error);
                });
        });

        for (const row of results) {
            try {
                await db.query(
                    'INSERT INTO users (NIC, age, birthday, gender) VALUES (?, ?, ?, ?)',
                    [row.NIC, row.age, row.birthday, row.gender]
                );
            } catch (error) {
                const errorMsg = `Error saving data to the database: ${error.message}`;
                console.error(errorMsg);
                errors.push(errorMsg);
                saveRejectedNIC(row.NIC, "Database Insertion Error");
            }
        }

        // fs.unlink(file.path, (err) => {
        //     if (err) {
        //         console.error(`Error deleting file ${file.path}: ${err.message}`);
        //     }
        // });
    }

    res.json({ data: allData, errors});
});

// Function to save rejected NICs
const saveRejectedNIC = async (nic, reason) => {
    try {
        await db.query(
            'INSERT INTO rejected_nics (NIC, reason) VALUES (?, ?)',
            [nic, reason]
        );
    } catch (error) {
        console.error(`Error saving rejected NIC ${nic}: ${error.message}`);
    }
};

// Route to retrieve rejected NICs
app.get('/get-rejected-nics', async (req, res) => {
    try {
        const [rejectedNICs] = await db.query('SELECT * FROM rejected_nics ORDER BY created_at DESC');
        res.json(rejectedNICs);
    } catch (error) {
        console.error('Error fetching rejected NICs:', error.message);
        res.status(500).json({ message: 'Error fetching rejected NICs' });
    }
});

app.get('/summary', async (req, res) => {
    try {
        const [totalRecords] = await db.query('SELECT COUNT(*) AS count FROM users');
        const [maleUsers] = await db.query("SELECT COUNT(*) AS count FROM users WHERE gender='Male'");
        const [femaleUsers] = await db.query("SELECT COUNT(*) AS count FROM users WHERE gender='Female'");
        const [rejectedUsers] = await db.query("SELECT COUNT(*) AS count FROM rejected_nics");

        res.json({
            totalRecords: totalRecords[0].count,
            maleUsers: maleUsers[0].count,
            femaleUsers: femaleUsers[0].count,
            rejectedUsers: rejectedUsers[0].count
        });
    } catch (error) {
        console.error("Error fetching summary data:", error.message);
        res.status(500).json({ message: 'Error fetching summary data' });
    }
});


// Calculate age from NIC
const calculateAgeFromNIC = (nic) => {
    const birthday = extractBirthdayFromNIC(nic);
    const birthDate = new Date(birthday);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

// Extract birthday from NIC
const extractBirthdayFromNIC = (nic) => {
    let yearPart;
    let days;

    if (nic.length === 10) {
        const lastChar = nic.charAt(9).toUpperCase();
        if(!['V', 'X'].includes(lastChar)){
            throw new Error("Invalid 10-digit NIC. It must end with 'V', 'v', 'X', or 'x'.");
        }
        yearPart = "19" + nic.substring(0, 2);
        days = parseInt(nic.substring(2, 5), 10);
    } else if (nic.length === 12) {
        yearPart = nic.substring(0, 4);
        days = parseInt(nic.substring(4, 7), 10);
    } else {
        throw new Error("Invalid NIC length.");
    }

    if (days > 500) {
        days -= 500;
    }

    if (days < 1 || days > 366) {
        throw new Error("Invalid day value extracted from NIC: " + days);
    }

    const birthday = new Date(yearPart);
    birthday.setMonth(0);
    birthday.setDate(days);

    return birthday.toISOString().split('T')[0];
};

// Extract gender from NIC
const extractGenderFromNIC = (nic) => {
    const days = nic.length === 10 ? parseInt(nic.substring(2, 5), 10) : parseInt(nic.substring(4, 7), 10);
    return days > 500 ? "Female" : "Male";
};

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
