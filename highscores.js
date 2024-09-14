document.addEventListener('DOMContentLoaded', () => {
    fetch('https://cografya-kelime-oyunu.onrender.com/get-scores')
        .then(response => response.json())
        .then(data => {
            const scoreList = document.querySelector('#scoreTable tbody');
            scoreList.innerHTML = ''; // Önceki verileri temizle

            // Veriyi kontrol et
            console.log(data);

            if (Array.isArray(data)) {
                data.forEach((score, index) => {
                    const row = document.createElement('tr');

                    // Satırın arka plan rengini ayarla
                    if (index === 0) {
                        row.classList.add('first-place');
                    } else if (index === 1) {
                        row.classList.add('second-place');
                    }

                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${score.kullanici_adi}</td>
                        <td>${score.puan} puan</td>
                        <td>${score.sure}</td>
                    `;

                    scoreList.appendChild(row);
                });
            } else {
                console.error('Gelen veri bir dizi değil:', data);
            }
        })
        .catch(error => console.error('Hata:', error));
});
