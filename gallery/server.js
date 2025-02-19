const express = require('express');
const multer  = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

// Data file to store custom names + filenames
const DATA_FILE = 'data.json';
let fileData = [];

// Load metadata from DATA_FILE if it exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    fileData = JSON.parse(data);
    console.log("Loaded existing file data:", fileData);
  } catch(err) {
    console.error("Error reading data file:", err);
  }
}

// Helper function to save fileData to disk
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(fileData, null, 2));
}

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer storage to save files in public/uploads/
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    // Prepend a timestamp to avoid collisions
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Upload endpoint: saves file + custom name
app.post('/upload', upload.array('files'), (req, res) => {
  console.log("Upload endpoint hit!");
  console.log("Form data:", req.body);
  console.log("Uploaded files:", req.files);

  const customName = req.body.customName || "";
  req.files.forEach(file => {
    fileData.push({ filename: file.filename, customName: customName });
  });
  saveData();
  res.redirect('/');
});

// Delete endpoint with password check
app.post('/delete', (req, res) => {
  const { filename, password } = req.body;
  if (password !== "ILOVESARAH") {
    return res.status(401).send("Invalid password. ❌");
  }
  const filePath = path.join(__dirname, 'public', 'uploads', filename);
  fs.unlink(filePath, (err) => {
    if(err) {
      console.error("Error deleting file:", err);
      return res.status(500).send("Error deleting file. ⚠️");
    }
    // Remove metadata for the deleted file
    fileData = fileData.filter(item => item.filename !== filename);
    saveData();
    res.redirect('/');
  });
});

// Endpoint to list uploaded files with metadata
app.get('/files', (req, res) => {
  console.log("Sending file data:", fileData);
  res.json(fileData);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port} 🚀`);
});
