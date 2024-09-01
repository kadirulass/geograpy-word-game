document.addEventListener('DOMContentLoaded', function() {
    let toplamPuan = 0;
    let kelimeUzunlugu = 4;
    let kelimeSayisi = 0;
    let gizliKelime = "";
    let kelimeGorunumu = [];
    let harfler = [];
    let sure = 240; // 30 saniye
    let sureInterval;
    let oyunBitti = false; // Oyun durumunu takip etmek için
    let kelimeler = {}; // JSON'dan gelecek veriyi tutmak için

    // Veritabanından kelimeleri yükle
    fetch('http://localhost:3008/get-questions')
        .then(response => response.json())
        .then(data => {
            // Verileri kelimeler objesine dönüştürme
            kelimeler = data.reduce((acc, item) => {
                const { kelime, soru, kategori } = item;
                if (!acc[kategori]) acc[kategori] = [];
                acc[kategori].push({ kelime, soru });
                return acc;
            }, {});

            kelimeSec(); // İlk kelime seçimini yap
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
            oyunBittiDurum();
            return;
        }

        const kelimeListesi = kelimeler[kelimeUzunlugu];
        if (!kelimeListesi || kelimeListesi.length === 0) {
            alert("Bu uzunlukta kelime bulunamadı!");
            return;
        }

        const secilen = kelimeListesi[Math.floor(Math.random() * kelimeListesi.length)];
        gizliKelime = secilen.kelime;
        kelimeGorunumu = Array(gizliKelime.length).fill('_');
        harfler = [];
        kelimeSayisi++;
        gosterKelime(secilen.soru);
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
        gosterKelime(""); // Harf eklendikten sonra kelimeyi tekrar göster
    }
    

    function kelimeBulundu() {
        // Kelimenin tamamını göster
        kelimeGorunumu = gizliKelime.split('');
        gosterKelime(""); // Harfleri güncelle
    
        // Kalan harf sayısını hesapla
        let kalanHarfSayisi = kelimeGorunumu.filter(harf => harf === '_').length;
        let yeniPuan = kalanHarfSayisi * 100; // Kalan harf sayısı x 100 puan
        toplamPuan += yeniPuan;
        document.getElementById("scoreDisplay").textContent = `Puan: ${toplamPuan}`;
    
        // Geçerli soru sayısını güncelle
        soruSayisi++;
    
        // Oyun bitip bitmediğini kontrol et
        if (soruSayisi >= toplamSoruSayisi) {
            setTimeout(() => {
                oyunBitti(); // Oyun bitiş işlemini başlat
            }, 2000); // 2 saniye bekle
        } else {
            setTimeout(() => {
                kelimeSec(); // Bir sonraki kelimeye geçiş
            }, 2000); // 2 saniye bekle
        }
    }
    

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
                oyunBittiDurum();
            }
        }, 1000);
    }

    function oyunBittiDurum() {
        clearInterval(sureInterval);
        alert(`Oyun Bitti! Toplam Puanınız: ${toplamPuan}`);
        oyunBitti = true;

        // Skoru veritabanına gönder
        const kullaniciAdi = prompt('Kullanıcı adınızı girin:');
        if (kullaniciAdi) {
            fetch('http://localhost:3008/add-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ kullanici_adi: kullaniciAdi, puan: toplamPuan })
            })
            .then(response => response.text())
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error('Hata:', error));
        }
    }

    const buyLetterBtn = document.getElementById('buyLetterBtn');
    const guessWordBtn = document.getElementById('guessWordBtn');
    const submitGuessBtn = document.getElementById('submitGuessBtn');
    const submitQuestionBtn = document.getElementById('submitQuestionBtn');

    if (buyLetterBtn) {
        buyLetterBtn.addEventListener("click", () => {
            if (oyunBitti) return;
            kelimeHarfAl();
        });
    } else {
        console.error('buyLetterBtn id\'li öğe bulunamadı.');
    }

    if (guessWordBtn) {
        guessWordBtn.addEventListener("click", () => {
            if (oyunBitti) return;
            clearInterval(sureInterval); // Süreyi durdur
            document.getElementById("guessSection").style.display = "block";
        });
    } else {
        console.error('guessWordBtn id\'li öğe bulunamadı.');
    }

    if (submitGuessBtn) {
        submitGuessBtn.addEventListener("click", () => {
            if (oyunBitti) return;
            let tahmin = document.getElementById("guessInput").value.toLowerCase();
            document.getElementById("guessSection").style.display = "none";
            sureyiBaslat(); // Süreyi tekrar başlat
            if (tahmin === gizliKelime) {
                kelimeBulundu();
            } else {
                let puanKaybi = kelimeGorunumu.filter(harf => harf === '_').length * 10;
                toplamPuan -= puanKaybi;
                alert(`Yanlış tahmin! ${puanKaybi} puan kaybettiniz.`);
                document.getElementById("scoreDisplay").textContent = `Puan: ${toplamPuan}`;
            }
        });
    } else {
        console.error('submitGuessBtn id\'li öğe bulunamadı.');
    }

    if (submitQuestionBtn) {
        submitQuestionBtn.addEventListener('click', function () {
            const kelime = document.getElementById('kelime').value;
            const soru = document.getElementById('soru').value;

            fetch('http://localhost:3008/add-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ kelime, soru })
            })
            .then(response => response.text())
            .then(data => {
                alert(data);
                document.getElementById('word').value = '';
                document.getElementById('question').value = '';
            })
            .catch(error => console.error('Hata:', error));
        });
    } else {
        console.error('submitQuestionBtn id\'li öğe bulunamadı.');
    }
});
