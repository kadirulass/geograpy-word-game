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

let kelimeler = {}; // JSON'dan gelecek veriyi tutmak için

// Veritabanından kelimeleri yükle
fetch('https://cografya-kelime-oyunu.onrender.com/get-questions')
    .then(response => response.json())
    .then(data => {
        kelimeler = data.reduce((acc, item) => {
            const { kelime, soru, kategori } = item;
            if (!acc[kategori]) acc[kategori] = [];
            acc[kategori].push({ kelime, soru });
            return acc;
        }, {});

        kelimeSec();
        sureyiBaslat();
        sureyiGuncelle();
    })
    .catch(error => {
        console.error('Kelimeler verisi yüklenirken hata oluştu:', error);
    });

function kelimeSec() {
    if (kelimeSayisi >= 2) {
        kelimeUzunlugu++;
        kelimeSayisi = 0;
    }

    if (kelimeUzunlugu > 10) {
        alert(`Oyun Bitti! Toplam Puanınız: ${toplamPuan}`);
        oyunBitti();
        return;
    }

    const kelimeListesi = kelimeler[kelimeUzunlugu];
    if (!kelimeListesi || kelimeListesi.length === 0) {
        alert("Bu uzunlukta kelime bulunamadı!");
        return;
    }

    let secilen;
    let denemeSayisi = 0;
    do {
        secilen = kelimeListesi[Math.floor(Math.random() * kelimeListesi.length)];
        denemeSayisi++;
        if (denemeSayisi > kelimeListesi.length) {
            alert("Tüm kelimeler soruldu, başka kelime kalmadı!");
            return;
        }
    } while (sorulmusKelimeler.includes(secilen.kelime));

    // Seçilen kelimeyi sorulmuş kelimeler listesine ekle
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
            hex.dataset.index = i; // Her kutucuğa indeks ekleyelim
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
    let mevcutHarfler = kelimeGorunumu.join('');
    let harf = '';
    let acilacakIndex = -1;
    do {
        acilacakIndex = Math.floor(Math.random() * gizliKelime.length);
        harf = gizliKelime[acilacakIndex];
    } while (kelimeGorunumu[acilacakIndex] !== '_');

    harfler.push(harf);
    kelimeGorunumu[acilacakIndex] = harf; // Rastgele kutucukta harf aç
    kalanHarfSayisi--; // Kalan harf sayısını bir azalt
    if(kalanHarfSayisi==0)
        gosterKelime();
    gosterKelime(""); // Harf eklendikten sonra kelimeyi tekrar göster
}

function kelimeBulundu() {
    // Kalan harf sayısına göre puan hesapla
    let yeniPuan = kalanHarfSayisi * 100;
    toplamPuan += yeniPuan;
    document.getElementById("scoreDisplay").textContent = `${toplamPuan}`;

    const dogruTahminSes = new Audio('sound/true.mp3');
    dogruTahminSes.play();

    // Kelimenin tamamını göster
    kelimeGorunumu = gizliKelime.split('');
    gosterKelime(""); // Harfleri güncelle

    if (soruSayisi >= toplamSoruSayisi) {
        // Oyun bitti ise
        setTimeout(() => {
            oyunBitti();
        }, 2000); // 2 saniye bekle
    } else {
        // Bir sonraki kelimeye geçiş
        setTimeout(() => {
            kelimeSec();
        }, 2000); // 2 saniye bekle
    }
}

function oyunBitti() {
    clearInterval(sureInterval);
    const kullaniciAdi = prompt('Oyun bitti! Kullanıcı adınızı girin:');
    if (kullaniciAdi) {
        fetch('https://cografya-kelime-oyunu.onrender.com/add-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ kullanici_adi: kullaniciAdi, puan: toplamPuan })
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            alert("Skor başarıyla kaydedildi!");
            window.location.href = 'start.html'; // Hata durumunda da yönlendirme yap
        })
        .catch(error => console.error('Hata:', error));
    }
    else{
        window.location.href = 'start.html'; // Hata durumunda da yönlendirme yap
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Oyun bitiş durumu
    let oyunBitti = false;

    // Butonlara tıklama olaylarını ekle
    document.getElementById("buyLetterBtn").addEventListener("click", () => {
        const harfSatinAlSes=new Audio('sound/tingting.mp3');
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
        sureyiBaslat(); // Süreyi tekrar başlat
        if (tahmin === gizliKelime.toLowerCase().trim()) {
            kelimeBulundu();
            document.getElementById("guessInput").value="";
        } else {
            const hataliSes=new Audio('sound/wrong.mp3');
            hataliSes.play();
            //alert(`Yanlış tahmin!`);
            
            document.getElementById("guessInput").value="";
        }
    });
});

function sureyiGuncelle() {
    const minutes = String(Math.floor(sure / 60)).padStart(2, '0');
    const seconds = String(sure % 60).padStart(2, '0');
    document.getElementById("timeDisplay").textContent = `Kalan Süre: ${minutes}:${seconds}`;
}

function sureyiBaslat() {
    sureInterval = setInterval(() => {
        if (sure > 0) {
            sure--;
            sureyiGuncelle();
        } else {
            clearInterval(sureInterval);
            alert("Süre doldu! Oyun bitti.");
            oyunBitti();
        }
    }, 1000);
}
