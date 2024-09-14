document.addEventListener('DOMContentLoaded', () => {
    fetch('https://cografya-kelime-oyunu.onrender.com/get-scores')
        .then(response => response.json())
        .then(data => {
            const scoreList = document.getElementById('scoreList');
            scoreList.innerHTML = ''; // Önceki verileri temizle

            data.forEach((score, index) => {
                const listItem = document.createElement('li');
                // Sıralama numarasını eklemek için index + 1 kullanıyoruz
                listItem.textContent = `${index + 1}. ${score.kullanici_adi} - ${score.puan} puan ${score.sure} saniye`;

                if (index === 0) {
                    listItem.style.backgroundColor = 'yellow';  // Arka planı sarı yap
                    listItem.style.color = 'black';  // Yazı rengini siyah yap
                }
                scoreList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Hata:', error));
});
