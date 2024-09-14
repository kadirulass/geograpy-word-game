document.addEventListener('DOMContentLoaded', () => {
    fetch('https://cografya-kelime-oyunu.onrender.com/get-scores')
        .then(response => response.json())
        .then(data => {
            const scoreList = document.querySelector('#scoreTable tbody');
            scoreList.innerHTML = ''; // Önceki verileri temizle

            data.forEach((score, index) => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${score.kullanici_adi}</td>
                    <td>${score.puan}</td>
                    <td>${score.sure}</td>
                `;

                scoreList.appendChild(row);
            });
        })
        .catch(error => console.error('Hata:', error));
});

