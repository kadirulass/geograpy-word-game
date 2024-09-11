document.getElementById('addQuestionForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const category = document.getElementById('category').value;
    const word = document.getElementById('word').value;
    const question = document.getElementById('question').value;

    fetch('http://localhost:3306/add-question', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, word, question })
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
});

document.getElementById('removeQuestionForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const id = document.getElementById('removeQuestion').value;

    fetch('http://localhost:3306/remove-question', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
});

document.getElementById('removeCategory').addEventListener('change', function() {
    const category = this.value;

    fetch(`http://localhost:3306/get-questions/${category}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const removeQuestionSelect = document.getElementById('removeQuestion');
            removeQuestionSelect.innerHTML = ''; // Önceki seçenekleri temizle

            data.forEach(question => {
                const option = document.createElement('option');
                option.value = question.id; // ID ile seçim yapmak için
                option.textContent = question.soru;
                removeQuestionSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error:', error));
});


