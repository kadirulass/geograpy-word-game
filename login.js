document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Sayfanın yeniden yüklenmesini engeller

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3009/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        console.log('Status:', response.status);

        // Yanıt JSON formatında değilse bu kısım hata verebilir
        return response.json().catch(err => {
            console.error('Yanıt JSON formatında değil:', err);
            throw new Error('Sunucudan beklenmeyen bir yanıt alındı.');
        });
    })
    .then(data => {
        console.log('Gelen veri:', data);
        if (data.success) {
            window.location.href = 'admin.html'; // Giriş başarılı, admin sayfasına yönlendirme
        } else {
            document.getElementById('error-message').textContent = data.message; // Hata mesajını göster
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('error-message').textContent = 'Sunucuya bağlanırken hata oluştu.';
    });
});

    
