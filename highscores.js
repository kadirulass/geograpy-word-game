document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3009/get-scores')
        .then(response => response.json())
        .then(data => {
            const scoreList = document.getElementById('scoreList');
            scoreList.innerHTML = ''; // Önceki verileri temizle

            data.forEach(score => {
                const listItem = document.createElement('li');
                listItem.textContent = `${score.kullanici_adi} - ${score.puan} puan`;
                scoreList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Hata:', error));
});
