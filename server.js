const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors'); // CORS ayarları için
const path = require('path');

const app = express();

app.use(cors()); // CORS'u ekleyin
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Statik dosyaların bulunduğu dizini belirtin
app.use(express.static(path.join(__dirname,)));

// Eğer index.html'yi doğrudan ana sayfa olarak sunmak istiyorsanız:
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MySQL bağlantısı
const db = mysql.createConnection({
    host: 'sql7.freesqldatabase.com',
    user: 'sql7730890',
    password: '8D3wwHwmjv', // Kendi MySQL şifrenizi buraya girin
    database: 'sql7730890',
    port: 3306,
    reconnect:true
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL bağlantısı başarılı');
});

// Soru ekleme
app.post('/add-question', (req, res) => {
    const { category, word, question } = req.body;
    const sql = 'INSERT INTO sorular (kelime, soru, kategori) VALUES (?, ?, ?)';
    db.query(sql, [word, question, category], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Soru eklenirken bir hata oluştu');
        } else {
            res.send('Soru başarıyla eklendi');
        }
    });
});

// Kelimeleri çekme
app.get('/get-questions', (req, res) => {
    const sql = 'SELECT * FROM sorular';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('SQL Error:', err);
            res.status(500).send('Sunucu hatası');
        } else {
            res.json(results);
        }
    });
});


// Soru silme
app.post('/remove-question', (req, res) => {
    const { id } = req.body;
    const sql = 'DELETE FROM sorular WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.send('Soru başarıyla silindi');
    });
});

//admin giriş
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM admin WHERE kullanici_adi = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).json({ success: false, message: 'Veritabanı hatası' });
        }
        if (results.length > 0) {
            // Düz metin şifre karşılaştırması
            if (results[0].sifre === password) {
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Yanlış kullanıcı adı veya şifre' });
            }
        } else {
            res.json({ success: false, message: 'Yanlış kullanıcı adı veya şifre' });
        }
    });
});

// Soru çekme
app.get('/get-questions/:category', (req, res) => {
    const category = req.params.category;
    const sql = 'SELECT * FROM sorular WHERE kategori = ?';
    db.query(sql, [category], (err, results) => {
        if (err) {
            console.error('SQL Error:', err);
            res.status(500).send('Sunucu hatası');
        } else {
            res.json(results);
        }
    });
});

// Skorları ekleme
app.post('/add-score', (req, res) => {
    const { kullanici_adi, puan } = req.body;

    if (!kullanici_adi || !puan) {
        return res.status(400).send('Kullanıcı adı ve puan gerekli');
    }

    const sql = 'INSERT INTO skorlar (kullanici_adi, puan) VALUES (?, ?)';
    db.query(sql, [kullanici_adi, puan], (err, result) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).send('Sunucu hatası');
        }
        res.send('Skor başarıyla eklendi');
    });
});

// Skorları listeleme
app.get('/get-scores', (req, res) => {
    const sql = 'SELECT * FROM skorlar ORDER BY puan DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('SQL Error:', err);
            res.status(500).send('Sunucu hatası');
        } else {
            res.json(results);
        }
    });
});




// Sunucu portu
const PORT =process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
