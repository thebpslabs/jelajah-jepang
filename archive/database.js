// database.js placeholder structure for Kuis Bahasa Jepang

// Levels: 'Belum pernah ke Jepang', 'Pernah ke Jepang', 'Sering ke Jepang'
// Categories: 'Restoran', 'Minimarket', 'Rumah Sakit', 'Kereta'

const database = {
    'Belum pernah ke Jepang': {
        'Restoran': [
            {
                question: 'Apa arti kata "menu" dalam restoran?',
                picture: 'assets/restoran1.png', // optional
                options: ['Daftar makanan', 'Meja', 'Pelayan', 'Bayar'],
                answer: 0,
                feedback: 'Menu berarti daftar makanan di restoran.'
            },
            {
                question: 'Kalimat sopan saat memesan minuman?',
                picture: '',
                options: ['Saya mau kopi', 'Beri saya kopi', 'Kopi sekarang', 'Minum kopi'],
                answer: 0,
                feedback: 'Gunakan kalimat sopan: "Saya mau kopi, terima kasih".'
            }
            // Tambahkan 8 pertanyaan lagi untuk 10 pertanyaan total
        ],
        'Minimarket': [],
        'Rumah Sakit': [],
        'Kereta': []
    },
    'Pernah ke Jepang': {
        'Restoran': [],
        'Minimarket': [],
        'Rumah Sakit': [],
        'Kereta': []
    },
    'Sering ke Jepang': {
        'Restoran': [],
        'Minimarket': [],
        'Rumah Sakit': [],
        'Kereta': []
    }
};

// You can add 10 questions per category per level
// Each question object: {question: '', picture:'', options:['A','B','C','D'], answer: index, feedback: ''}
