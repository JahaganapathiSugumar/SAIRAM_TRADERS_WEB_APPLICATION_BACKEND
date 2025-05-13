import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import fs from 'fs';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 5000;
const DATA_FILE = './visitors.json';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://jaha:jaha123@cluster0.zsnfobc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Mongoose schema & model for contact form
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,      // Add phone if you want to store it
  message: String,
});
const Contact = mongoose.model('Contact', contactSchema);

// --- Visitor Counter (simple file-based, works for small projects) ---

// Helper functions
function getVisitorCount() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ count: 0 }));
  }
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data).count;
}
function setVisitorCount(count) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ count }));
}

// GET visitor count
app.get('/api/visitors', (req, res) => {
  const count = getVisitorCount();
  res.json({ count });
});

// POST increment visitor count
app.post('/api/visitors/increment', (req, res) => {
  let count = getVisitorCount();
  count += 1;
  setVisitorCount(count);
  res.json({ count });
});

// POST route to save contact form data and send email
app.post('/api/contact', async (req, res) => {
  try {
    const formData = new Contact(req.body);
    await formData.save();
    console.log('✅ Form saved:', formData);

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jahaganapathi1@gmail.com', // sender email
        pass: 'bkggefxqikzpbmke',        // Gmail App Password (not your Gmail password)
      },
    });

    const mailOptions = {
      from: 'jahaganapathi1@gmail.com',
      to: 'jahaganapathi1@gmail.com', // recipient email
      subject: `New Contact Form Submission from ${formData.name}`,
      text: `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Message: ${formData.message}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Form submitted and email sent successfully' });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
