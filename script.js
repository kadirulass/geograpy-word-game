let toplamPuan = 0;
let kelimeUzunlugu = 4;
let kelimeSayisi = 0;
let gizliKelime = "";
let kelimeGorunumu = [];
let harfler = [];
let sure = 240; // 4 dakika
let sureInterval;
let sorulmusKelimeler = [];
let soruSayisi = 0;
const toplamSoruSayisi = 12;
let kalanHarfSayisi = 0; // Kalan harf sayısını takip edeceğiz
let oyunBaslangicZamani; // Oyun başlangıç zamanı
let oyunBitisZamani; // Oyun bitiş zamanı

let kelimeler = {}; // JSON'dan gelecek veriyi tutmak için

// Veritabanından kelimeleri yükle
fetch('https://cografya-kelime-oyunu.onrender.com/get-questions')
    .then(response => response.json())
    .then(data => {
        // Gelen veriyi kontrol etmek için log ekliyoruz
        console.log("Kelimeler verisi: ", data);

        // Kelimeleri kategoriye göre ayırıyoruz
        kelimeler = data.reduce((acc, item) => {
            const { kelime, soru, kategori } = item;
            if (!acc[kategori]) acc[kategori] = [];
            acc[kategori].push({ kelime, soru });
            return acc;
        }, {});

        kelimeSec(); // Oyun başladığında ilk kelime seçimi yapılır
        sureyiBaslat(); // Zamanlayıcı başlatılır
        sureyiGuncelle();

        // Oyun başlama zamanını kaydediyoruz
        oyunBaslangicZamani = new Date();
    })
    .catch(error => {
        console.error('Kelimeler verisi yüklenirken hata oluştu:', error);
    });

function kelimeSec() {
    console.log("Kelime seçiliyor...");

    if (kelimeSayisi >= 2) {
        kelimeUzunlugu++;
        kelimeSayisi = 0;
    }

    // Eğer kelime uzunluğu maksimum sınırı geçtiyse oyun biter
    if (kelimeUzunlugu > 10) {
        alert(`Oyun Bitti! Toplam Puanınız: ${toplamPuan}`);
        oyunBitti();
        return;
    }

    // Seçilecek kelimeler kategorisini kontrol ediyoruz
    const kelimeListesi = kelimeler[kelimeUzunlugu];
    if (!kelimeListesi || kelimeListesi.length === 0) {
        alert(`Bu uzunlukta (${kelimeUzunlugu}) kelime bulunamadı!`);
        return;
    }

    let secilen;
    let denemeSayisi = 0;
    do {
        secilen = kelimeListesi[Math.floor(Math.random() * kelimeListesi.length)];
        denemeSayisi++;
        if (denemeSayisi > kelimeListesi.length) {
            alert("Tüm kelimeler soruldu, başka kelime kalmadı!");
            oyunBitti();
            return;
        }
    } while (sorulmusKelimeler.includes(secilen.kelime));

    // Seçilen kelimeyi sorulmuş kelimeler listesine ekliyoruz
    sorulmusKelimeler.push(secilen.kelime);
    gizliKelime = secilen.kelime;
    kelimeGorunumu = Array(gizliKelime.length).fill('_');
    harfler = [];
    kalanHarfSayisi = gizliKelime.length; // Başlangıçta tüm harfler gizli
    kelimeSayisi++;
    soruSayisi++;
    gosterKelime(secilen.soru);
    guncelleSoruSayisi();
}

function gosterKelime(soru) {
    const wordDisplay = document.getElementById("wordDisplay");

    if (soru) {
        wordDisplay.innerHTML = `<p>${soru}</p>`;
    }

    let hexContainer = document.querySelector(".hex-container");

    if (!hexContainer) {
        hexContainer = document.createElement("div");
        hexContainer.classList.add("hex-container");

        kelimeGorunumu.forEach((harf, i) => {
            const hex = document.createElement("div");
            hex.classList.add("hex", harf === '_' ? 'invisible' : '');
            hex.textContent = harf;
            hex.dataset.index = i; // Her kutucuğa indeks ekliyoruz
            hexContainer.appendChild(hex);
        });

        wordDisplay.appendChild(hexContainer);
    } else {
        kelimeGorunumu.forEach((harf, i) => {
            const hex = hexContainer.children[i];
            hex.textContent = harf;
            if (harf !== '_') {
                hex.classList.remove("invisible");
            }
        });
    }
}

function guncelleSoruSayisi() {
    document.getElementById("questionCounter").textContent = `Soru: ${soruSayisi} / ${toplamSoruSayisi}`;
}

function kelimeHarfAl() {
    let harf = '';
    let acilacakIndex = -1;
    do {
        acilacakIndex = Math.floor(Math.random() * gizliKelime.length);
        harf = gizliKelime[acilacakIndex];
    } while (kelimeGorunumu[acilacakIndex] !== '_');

    harfler.push(harf);
    kelimeGorunumu[acilacakIndex] = harf; // Rastgele kutucukta harf aç
    kalanHarfSayisi--; // Kalan harf sayısını bir azalt

    if (kalanHarfSayisi === 0) {
        gosterKelime();
        setTimeout(() => {
            kelimeSec(); // Diğer soruya geç
        }, 2000); // 2 saniye bekle
    } else {
        gosterKelime(""); // Harf eklendikten sonra kelimeyi tekrar göster
    }
}

function kelimeBulundu() {
    let yeniPuan = kalanHarfSayisi * 100;
    toplamPuan += yeniPuan;
    document.getElementById("scoreDisplay").textContent = `${toplamPuan}`;

    const dogruTahminSes = new Audio('sound/true.mp3');
    dogruTahminSes.play();

    kelimeGorunumu = gizliKelime.split('');
    gosterKelime(""); // Harfleri güncelle

    if (soruSayisi >= toplamSoruSayisi) {
        setTimeout(() => {
            oyunBitti();
        }, 2000); // 2 saniye bekle
    } else {
        setTimeout(() => {
            kelimeSec();
        }, 2000); // 2 saniye bekle
    }
}

function oyunBitti() {
    clearInterval(sureInterval);

    oyunBitisZamani = new Date(); // Şu anki tarih ve saati alır
    let oyunSuresiMs = oyunBitisZamani - oyunBaslangicZamani;

    const formatliSure = milisaniyeyiFormataCevir(oyunSuresiMs);

    const kullaniciAdi = prompt('Oyun bitti! Kullanıcı adınızı girin:');
    if (kullaniciAdi) {
        fetch('https://cografya-kelime-oyunu.onrender.com/add-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ kullanici_adi: kullaniciAdi, puan: toplamPuan, sure: formatliSure })
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            alert("Skor başarıyla kaydedildi!");
            window.location.href = 'index.html';
        })
        .catch(error => console.error('Hata:', error));
    }
    else {
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let oyunBitti = false;

    document.getElementById("buyLetterBtn").addEventListener("click", () => {
        const harfSatinAlSes = new Audio('sound/tingting.mp3');
        harfSatinAlSes.play();
        if (oyunBitti) return;
        kelimeHarfAl();
    });

    document.getElementById("guessWordBtn").addEventListener("click", () => {
        if (oyunBitti) return;
        clearInterval(sureInterval); // Süreyi durdur
        document.getElementById("guessSection").style.display = "block";
        document.getElementById("guessInput").focus();
    });

    document.getElementById("submitGuessBtn").addEventListener("click", () => {
        if (oyunBitti) return;
        let tahmin = document.getElementById("guessInput").value.toLowerCase().trim();
        document.getElementById("guessSection").style.display = "none";
        if (tahmin === gizliKelime.toLowerCase()) {
            kelimeBulundu();
        } else {
            alert("Yanlış tahmin!");
            sureyiBaslat(); // Süreyi yeniden başlat
        }
        document.getElementById("guessInput").value = ""; // Tahmin kutusunu temizle
    });
});

function sureyiBaslat() {
    sure = 240;
    clearInterval(sureInterval);
    sureInterval = setInterval(sureyiGuncelle, 1000);
}

function sureyiGuncelle() {
    const minutes = Math.floor(sure / 60);
    const seconds = sure % 60;
    document.getElementById("timer").textContent = `Kalan Süre: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    sure--;

    if (sure < 0) {
        clearInterval(sureInterval);
        alert('Süre doldu! Oyun bitti.');
        oyunBitti();
    }
}

function milisaniyeyiFormataCevir(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
