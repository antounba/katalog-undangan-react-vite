const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

// --- CONFIG FOLDER & FILE ---
const uploadDir = path.join(__dirname, 'uploads');
const usersFile = path.join(__dirname, 'users.json');
const catalogFile = path.join(__dirname, 'katalog.json');

// --- HELPER BACA/TULIS DATABASE ---
const readJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    try {
        const data = fs.readFileSync(file, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (err) { return []; }
};

const saveJSON = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Gagal Menulis File JSON:", err);
        return false;
    }
};

// --- INIT ---
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(usersFile)) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("admin123", salt);
    saveJSON(usersFile, [{ id: 1, name: "Super Admin", email: "admin@luxury.com", password: hash, role: "admin" }]);
}
if (!fs.existsSync(catalogFile)) saveJSON(catalogFile, []);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});

// FUNGSI FILTER
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.psd', '.zip', '.docx', '.cdr', '.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (file.fieldname === 'catalogFile') {
        const masterExts = ['.psd', '.zip', '.docx', '.cdr'];
        if (masterExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Format file master tidak didukung! Gunakan PSD, ZIP, DOCX, atau CDR.'), false);
        }
    } else {
        const imgExts = ['.jpg', '.jpeg', '.png', '.webp'];
        if (imgExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Format gambar tidak didukung!'), false);
        }
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
});

const cpUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'imageFront', maxCount: 1 },
    { name: 'imageBack', maxCount: 1 },
    { name: 'catalogFile', maxCount: 1 }
]);

const handleUpload = (req, res, next) => {
    cpUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Multer Error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

// ==========================================
// ROUTES: AUTH (LOGIN & SIGNUP) - PERBAIKAN DI SINI
// ==========================================

// 1. REGISTER / SIGNUP
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;

    // Baca database user
    const users = readJSON(usersFile);

    // Cek apakah email sudah ada
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    // Enkripsi Password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Buat User Baru
    const newUser = {
        id: Date.now(),
        name,
        email,
        password: hashedPassword,
        role: "member" // Default role user baru adalah member
    };

    users.push(newUser);

    if (saveJSON(usersFile, users)) {
        // Kirim data user tanpa password ke frontend
        const { password, ...userData } = newUser;
        res.status(201).json({ message: "Registrasi Berhasil", user: userData });
    } else {
        res.status(500).json({ message: "Gagal menyimpan data user." });
    }
});

// 2. LOGIN
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Baca database user
    const users = readJSON(usersFile);

    // Cari user berdasarkan email
    const user = users.find(u => u.email === email);

    // Jika user tidak ditemukan
    if (!user) {
        return res.status(400).json({ message: "Email tidak ditemukan!" });
    }

    // Cek Password
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: "Password salah!" });
    }

    // Login Sukses - Kirim data user tanpa password
    const { password: _, ...userData } = user;
    res.json({ message: "Login Berhasil", user: userData });
});


// ==========================================
// ROUTES: KATALOG
// ==========================================

// GET: Lihat Katalog
app.get('/api/katalog', (req, res) => {
    const catalog = readJSON(catalogFile);
    res.json(catalog);
});

// POST: Tambah Data
app.post('/api/katalog', handleUpload, (req, res) => {
    try {
        if (!req.files || !req.files['image']) {
            return res.status(400).json({ message: "Gambar sampul wajib diupload!" });
        }

        const catalog = readJSON(catalogFile);
        const newItem = {
            id: Date.now(),
            title: req.body.title || "Tanpa Judul",
            category: req.body.category || "Pernikahan",
            price: req.body.price || "0",
            desc: req.body.desc || "",
            imagePath: req.files['image'][0].filename,
            imageFront: req.files['imageFront'] ? req.files['imageFront'][0].filename : null,
            imageBack: req.files['imageBack'] ? req.files['imageBack'][0].filename : null,
            catalogFilePath: req.files['catalogFile'] ? req.files['catalogFile'][0].filename : null
        };

        catalog.push(newItem);
        saveJSON(catalogFile, catalog);
        res.status(201).json(newItem);
    } catch (err) {
        console.error("CRASH SERVER:", err);
        res.status(500).json({ message: "Internal Server Error: " + err.message });
    }
});

// PUT: Update Data
app.put('/api/katalog/:id', handleUpload, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const catalog = readJSON(catalogFile);
        const index = catalog.findIndex(item => item.id === id);

        if (index === -1) return res.status(404).json({ message: "Data tidak ditemukan" });

        const imagePath = req.files['image'] ? req.files['image'][0].filename : catalog[index].imagePath;
        const imageFront = req.files['imageFront'] ? req.files['imageFront'][0].filename : catalog[index].imageFront;
        const imageBack = req.files['imageBack'] ? req.files['imageBack'][0].filename : catalog[index].imageBack;
        const catalogFilePath = req.files['catalogFile'] ? req.files['catalogFile'][0].filename : catalog[index].catalogFilePath;

        catalog[index] = {
            ...catalog[index],
            title: req.body.title,
            category: req.body.category,
            price: req.body.price,
            desc: req.body.desc,
            imagePath,
            imageFront,
            imageBack,
            catalogFilePath
        };

        saveJSON(catalogFile, catalog);
        res.json({ message: "Update Berhasil", data: catalog[index] });
    } catch (err) {
        res.status(500).json({ message: "Gagal Update Data" });
    }
});

// DELETE: Hapus Data
app.delete('/api/katalog/:id', (req, res) => {
    let catalog = readJSON(catalogFile);
    const newCatalog = catalog.filter(i => i.id !== parseInt(req.params.id));
    saveJSON(catalogFile, newCatalog);
    res.json({ message: "Deleted" });
});

// --- JALANKAN SERVER ---
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ SERVER ONLINE DI PORT ${PORT}`);
});