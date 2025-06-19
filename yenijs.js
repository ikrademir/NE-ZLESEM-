// API Anahtarı ve Temel URL'ler
// TMDb API'si için gerekli olan anahtar ve temel URL'ler tanımlanıyor
import { API_KEY, BASE_URL } from './config.js';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Film posterleri için temel URL

// DOM Elementleri
// HTML'deki önemli elementler seçiliyor ve değişkenlere atanıyor
const filmTuruSelect = document.getElementById('filmTuru'); // Film türü seçim kutusu
const siralamaSelect = document.getElementById('sıralamar'); // Sıralama seçim kutusu
const aramaInput = document.querySelector('.aramaamotoru'); // Arama input alanı
const aramaButton = document.querySelector('.butonn'); // Arama butonu
const gundemdekilerDiv = document.querySelector('.gündemdekiler'); // Popüler filmlerin gösterileceği div
const filmSonuclariDiv = document.getElementById('filmSonuclari'); // Arama sonuçlarının gösterileceği div
const modal = document.getElementById('filmModal'); // Film detayları için modal
const modalContent = document.getElementById('modalContent'); // Modal içeriği
const closeModal = document.querySelector('.close'); // Modal kapatma butonu

// Global film listesi
// Popüler filmler bu dizide saklanacak
let popularMovies = [];

// Sayfa yüklendiğinde popüler filmleri getir
// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', () => {
    fetchPopularMovies(); // Popüler filmleri getir
    setupEventListeners(); // Event listener'ları kur
});

// Event listener'ları kur
// Tüm etkileşimler için event listener'lar ekleniyor
function setupEventListeners() {
    // Arama butonu
    aramaButton.addEventListener('click', handleSearch);
    
    // Enter tuşu ile arama
    aramaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Film türü filtreleme
    filmTuruSelect.addEventListener('change', handleGenreFilter);
    
    // Sıralama seçeneği
    siralamaSelect.addEventListener('change', handleSorting);
    
    // Modal kapatma
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Dışarı tıklayarak modal kapatma
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Popüler filmleri getir
// TMDb API'sinden popüler filmleri alan fonksiyon
async function fetchPopularMovies() {
    try {
        // API'den popüler filmleri getir
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=tr-TR`);
        const data = await response.json();
        popularMovies = data.results.slice(0, 6); // İlk 6 filmi al
        
        // Her film için detayları al (Promise.all ile paralel olarak)
        const detailedMovies = await Promise.all(
            popularMovies.map(async movie => {
                const details = await fetchMovieDetails(movie.id);
                return {...movie, ...details}; // Orijinal film bilgileriyle detayları birleştir
            })
        );
        
        // Filmleri ekranda göster
        displayMovies(detailedMovies, gundemdekilerDiv);
    } catch (error) {
        console.error('Popüler filmler alınırken hata:', error);
        alert('Popüler filmler yüklenirken bir hata oluştu.');
    }
}

// Film detaylarını getir
// Belirli bir filmin detaylarını alan fonksiyon
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=tr-TR`);
        return await response.json();
    } catch (error) {
        console.error('Film detayları alınırken hata:', error);
        return null;
    }
}

// Filmleri ekranda göster
// Verilen film listesini belirtilen container'da görüntüleyen fonksiyon
function displayMovies(movies, container) {
    container.innerHTML = ''; // Container'ı temizle
    
    movies.forEach((movie, index) => {
        const movieElement = document.createElement('div');
        movieElement.className = 'gündem';
        movieElement.addEventListener('click', () => showMovieDetails(movie)); // Tıklandığında detayları göster
        
        // Poster URL'sini oluştur (yoksa placeholder kullan)
        const posterPath = movie.poster_path 
            ? `${IMG_BASE_URL}${movie.poster_path}` 
            : 'https://via.placeholder.com/200x300?text=Poster+Yok';
        
        // Film elementinin HTML içeriğini oluştur
        movieElement.innerHTML = `
            <img src="${posterPath}" alt="${movie.title}" loading="lazy">
            <div class="rank">${index + 1}</div>
            <div class="movie-overview">
                <h3>${movie.title}</h3>
                <p>${movie.overview ? movie.overview.substring(0, 100) + '...' : 'Açıklama bulunamadı.'}</p>
                <p><small>${movie.release_date || 'Yıl bilgisi yok'}</small></p>
            </div>
        `;
        
        container.appendChild(movieElement); // Container'a ekle
    });
}

// Film detaylarını modalda göster
// Seçilen filmin detaylarını modalda görüntüleyen fonksiyon
function showMovieDetails(movie) {
    // Poster ve arkaplan resimlerini oluştur (yoksa placeholder kullan)
    const posterPath = movie.poster_path 
        ? `${IMG_BASE_URL}${movie.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=Poster+Yok';
    
    const backdropPath = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : '';
    
    // Modal içeriğini oluştur
    modalContent.innerHTML = `
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <img src="${posterPath}" alt="${movie.title}" style="width: 300px; border-radius: 8px;">
            <div style="font-family:fantasy;font-size:14">
                <h2 style="color:#e50914;">${movie.title} (${movie.release_date ? movie.release_date.substring(0, 4) : ''})</h2>
                <p><strong>Türler:</strong> ${movie.genres ? movie.genres.map(g => g.name).join(', ') : 'Bilgi yok'}</p>
                <p><strong>Süre:</strong> ${movie.runtime ? movie.runtime + ' dakika' : 'Bilgi yok'}</p>
                <p><strong>IMDb:</strong> ${movie.vote_average ? movie.vote_average.toFixed(1) + '/10' : 'Puan yok'}</p>

                <h3 style="color:#e50914;">Filmin Konusu</h3>
                <p>${movie.overview || 'Açıklama bulunamadı.'}</p>
            </div>
        </div>
   `;
    
    modalContent.style.color = "#1a1a1a"; // Metin rengini ayarla
    modal.style.display = 'block'; // Modalı göster
}

// Arama işlemi
// Kullanıcının arama sorgusunu işleyen fonksiyon
async function handleSearch() {
    const query = aramaInput.value.trim(); // Arama sorgusunu al ve boşlukları temizle
    if (!query) {
        alert('Lütfen bir film adı girin.');
        return;
    }
    
    try {
        // API'de arama yap
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=tr-TR`);
        const data = await response.json();
        
        if (data.results.length > 0) {
            // Bulunan filmlerin detaylarını al
            const detailedMovies = await Promise.all(
                data.results.slice(0, 6).map(async movie => {
                    const details = await fetchMovieDetails(movie.id);
                    return {...movie, ...details};
                })
            );
            
            // Filmleri göster ve sonuçlara kaydır
            displayMovies(detailedMovies, filmSonuclariDiv);
            filmSonuclariDiv.scrollIntoView({ behavior: 'smooth' });
        } else {
            filmSonuclariDiv.innerHTML = '<p>Aradığınız film bulunamadı.</p>';
        }
    } catch (error) {
        console.error('Arama sırasında hata:', error);
        alert('Arama yapılırken bir hata oluştu.');
    }
}

// Tür filtreleme
// Seçilen türe göre filmleri filtreleyen fonksiyon
async function handleGenreFilter(e) {
    const genre = e.target.value; // Seçilen türü al
    if (!genre) return; // Eğer boşsa işlem yapma
    
    try {
        // Tür adlarını TMDb ID'lerine eşleyen nesne
        const genreMap = {
            'aksiyon': 28,
            'komedi': 35,
            'dram': 18,
            'korku': 27,
            'bilimkurgu': 878
        };
        
        const genreId = genreMap[genre]; // Seçilen türün ID'sini al
        // API'den türe göre filmleri getir
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=tr-TR`);
        const data = await response.json();
        
        // Film detaylarını al
        const detailedMovies = await Promise.all(
            data.results.slice(0, 6).map(async movie => {
                const details = await fetchMovieDetails(movie.id);
                return {...movie, ...details};
            })
        );
        
        // Filmleri göster ve sonuçlara kaydır
        displayMovies(detailedMovies, filmSonuclariDiv);
        filmSonuclariDiv.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Türe göre filtreleme hatası:', error);
    }
}

// Sıralama işlemi
// Seçilen sıralama kriterine göre filmleri sıralayan fonksiyon
async function handleSorting(e) {
    const sortBy = e.target.value; // Seçilen sıralama kriterini al
    if (!sortBy) return; // Eğer boşsa işlem yapma
    
    try {
        // Kullanıcı dostu isimleri API parametrelerine eşleyen nesne
        const sortMap = {
            'süre': 'runtime.desc',
            'imbd': 'vote_average.desc',
            'yıl': 'primary_release_date.desc'
        };
        
        const sortValue = sortMap[sortBy]; // API parametresini al
        // API'den sıralanmış filmleri getir
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${sortValue}&language=tr-TR`);
        const data = await response.json();
        
        // Film detaylarını al
        const detailedMovies = await Promise.all(
            data.results.slice(0, 6).map(async movie => {
                const details = await fetchMovieDetails(movie.id);
                return {...movie, ...details};
            })
        );
        
        // Filmleri göster ve sonuçlara kaydır
        displayMovies(detailedMovies, filmSonuclariDiv);
        filmSonuclariDiv.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Sıralama hatası:', error);
    }
}

//////////

document.addEventListener("DOMContentLoaded", function () {

    // "Hemen Başla" butonu tıklanınca ilk soru section'ını seç
    const baslaButonu = document.querySelector('.buton');
    const ilkSoru = document.querySelectorAll('.section')[0];

    baslaButonu.addEventListener('click', function (e) {   // "Hemen Başla" butonuna tıklama olayı ekle
        e.preventDefault();       // Sayfanın yeniden yüklenmesini engelle
        ilkSoru.style.display = 'block';
        ilkSoru.scrollIntoView({ behavior: 'smooth' });
    });

    // Diğer tüm .section'ları ilk başta gizliyoruz (güvenlik amaçlı)
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');


    const sections = document.querySelectorAll('.section');
    const nextButtons = document.querySelectorAll('.btn.btn-primary.btn-lg');

    const userAnswers = {   // Kullanıcı cevaplarını saklamak için obje
       mood: null,       // Mod bilgisi
        situation: null,  // Durum bilgisi
        genre: null,      // Tür bilgisi
        year: null        // Yıl aralığı bilgisi
    };


    const genreMap = {     // Tür isimlerini TMDb genre ID'lerine eşleyen obje
        "romantik": 10749,
        "komedi": 35,
        "aksiyon": 28,
        "gerilim": 53,
        "bilim kurgu": 878,
        "animasyon": 16
    };

   
    // 1. Soru (Mod Seçimi)
    document.querySelectorAll('.secim td').forEach(td => {
        td.addEventListener('click', function () {
            const moodText = this.querySelector('h5').textContent;
            userAnswers.mood = moodText.trim().toLowerCase();    // Seçilen modun metnini küçük harfe çevir

            document.querySelectorAll('.secim td').forEach(item => {
                item.style.backgroundColor = '';
            });
            // Seçilen seçeneğin arkaplan rengini değiştir
            this.style.backgroundColor = 'rgba(248, 179, 25, 0.3)';
        });
    });

    // 2. Soru (Durum Seçimi)
    document.querySelectorAll('.container .option').forEach(option => {
        option.addEventListener('click', function () {
            // Seçilen durumu kaydet
            userAnswers.situation = this.textContent.trim();
            document.querySelectorAll('.container .option input').forEach(input => {
                input.checked = false;
            });
            // Sadece seçilenin radio butonunu işaretle
            this.querySelector('input').checked = true;
        });
    });

// 3. SORU - Tür Seçimi
document.querySelectorAll('.grid .box').forEach(box => {
    box.addEventListener('click', function () {
        userAnswers.genre = this.textContent
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");  // Türkçe karakter düzeltmesi

        console.log("DÜZENLENMİŞ Tür:", userAnswers.genre);

          // Tüm radio butonlarını temizle
        document.querySelectorAll('.grid .box input').forEach(input => {
            input.checked = false;
        });
        this.querySelector('input').checked = true;
    });
});

    // 4. Soru (Yıl)
    document.querySelectorAll('.years .aralik').forEach(item => {
        item.addEventListener('click', function () {
            userAnswers.year = this.textContent.trim(); // Seçilen yıl aralığını kaydet 
            document.querySelectorAll('.years .aralik input').forEach(input => {
                input.checked = false;
            });
            this.querySelector('input').checked = true;
        });
    });

    // N E X T butonları
    nextButtons.forEach((button, index) => {
        button.addEventListener('click', ()=> {
             const currentSection = sections[index];
            if (!validateSelection(index)) {      // Seçim yapılıp yapılmadığını kontrol et
                alert("Lütfen bir seçim yapınız.");
                return;
            }

            sections[index].style.display = 'none';    // Mevcut section'ı gizle

            if (index + 1 < sections.length) {         // Sonraki section varsa göster
                sections[index + 1].style.display = 'block';
                sections[index + 1].scrollIntoView({ behavior: 'smooth' });
            } else {
                 //alert("SON NEXT butonu tıklandı, önerilenFilmiGetir çağrılacak");
                önerilenFilmiGetir();
            }
        });
    });
  
// Seçim yapılıp yapılmadığını kontrol eden fonksiyon
    function validateSelection(index) {    
        switch (index) {
            case 0: return userAnswers.mood !== null;      // Mod seçildi mi?
            case 1: return userAnswers.situation !== null;  // Durum seçildi mi?
            case 2: return userAnswers.genre !== null;     // Tür seçildi mi?
            case 3: return userAnswers.year !== null;     // Yıl aralığı seçildi mi?
            default: return false;
        }
    }

     // TMDb API'sinden film önerisi alan fonksiyon
function önerilenFilmiGetir() {
    const genreId = genreMap[userAnswers.genre];
    if (!genreId) {
        alert("Tür eşleştirilemedi.");
        return;
    }

    // Yıl sıralamasını düzelt
    let [y1, y2] = userAnswers.year.split('-').map(y => parseInt(y.trim()));
    const yearStart = Math.min(y1, y2);   // Küçük yılı al
    const yearEnd = Math.max(y1, y2);      // Büyük yılı al

    console.log("Yıl aralığı:", yearStart, "-", yearEnd);


    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=tr-TR&sort_by=popularity.desc&with_genres=${genreId}&primary_release_date.gte=${yearStart}-01-01&primary_release_date.lte=${yearEnd}-12-31`;
        // API'den veri çek
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("API'den gelen veri:", data); // DEBUG için

            if (data.results && data.results.length > 0) {
                const film = data.results[0];
                const title = film.title;           // Film başlığı
                const overview = film.overview;    // Film açıklaması
                 // Poster URL'si
                const poster = `https://image.tmdb.org/t/p/w500${film.poster_path}`;
             
                // Sayfayı film bilgileriyle güncelle
                document.body.innerHTML = `
                    <div style="text-align:center; padding-top:20px; font-family:sans-serif">
                        <h2 style="color:#f8b319; font-size:40px;">🎬 Size Önerilen Film:</h2>
                        <h3 style="color:#ffffff; font-size:30px;">${title}</h3>
                        <img src="${poster}" alt="${title}" style="max-width:300px; border-radius:10px;"><br><br>
                        <p style="max-width:600px; font-size:20px; margin:auto; color:#e0e0e0;">${overview}</p>
                    </div>
                `;
            } else {
                alert("Uygun film bulunamadı.");
            }
        })
        .catch(err => {
            console.error("API Hatası:", err);
            alert("Film önerisi alınırken hata oluştu.");
        });
}
});

//arama motoru

document.addEventListener("DOMContentLoaded", function () {
    const aramaInput = document.querySelector('.aramaamotoru');
    const aramaButton = document.querySelector('.butonn');
    const filmSonuclariDiv = document.getElementById('filmSonuclari');

    aramaButton.addEventListener('click', async function () {
        const query = aramaInput.value.trim();
        if (!query) {
            alert("Lütfen bir film adı girin.");
            return;
        }

        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=tr-TR&query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.results.length === 0) {
            filmSonuclariDiv.innerHTML = "<p style='color:white;'>Film bulunamadı.</p>";
            return;
        }

        const film = data.results[0]; // ilk sonucu al
        const poster = film.poster_path ? `https://image.tmdb.org/t/p/w500${film.poster_path}` : '';
        const title = film.title || 'Başlık yok';
        const overview = film.overview || 'Açıklama yok';
        const releaseDate = film.release_date || 'Tarih yok';

        filmSonuclariDiv.innerHTML = `
            <div style="background-color:#222; color:white; padding:20px; border-radius:10px; max-width:600px; margin:auto;">
                <h3>${title} (${releaseDate.substring(0, 4)})</h3>
                <img src="${poster}" alt="${title}" style="max-width:200px; border-radius:5px;"><br><br>
                <p>${overview}</p>
            </div>
        `;
    });
});

// türe göre 6 film önerir

filmTuruSelect.addEventListener("change", async function () {
    const selectedGenre = this.value;

    const genreMap = {
        'aksiyon': 28,
        'komedi': 35,
        'dram': 18,
        'korku': 27,
        'bilimkurgu': 878
    };

    const genreId = genreMap[selectedGenre];
    if (!genreId) return;

    try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=tr-TR&with_genres=${genreId}&sort_by=popularity.desc`);
        const data = await response.json();

        if (data.results.length === 0) {
            filmSonuclariDiv.innerHTML = "<p style='color:white;'>Bu türe ait film bulunamadı.</p>";
            return;
        }

        filmSonuclariDiv.innerHTML = ""; // Önceki sonuçları temizle
        data.results.slice(0, 6).forEach(film => {
            const poster = film.poster_path ? `https://image.tmdb.org/t/p/w500${film.poster_path}` : '';
            const title = film.title || 'Başlık yok';
            const overview = film.overview || 'Açıklama yok';
            const releaseDate = film.release_date || 'Tarih yok';

            filmSonuclariDiv.innerHTML += `
                <div style="background-color:#222; color:white; padding:20px; border-radius:10px; margin:20px 0;">
                    <h3>${title} (${releaseDate.substring(0, 4)})</h3>
                    <img src="${poster}" alt="${title}" style="max-width:200px; border-radius:5px;"><br><br>
                    <p>${overview}</p>
                </div>
            `;
        });
    } catch (err) {
        console.error("Tür seçimine göre film getirme hatası:", err);
        alert("Film türü yüklenemedi.");
    }
});



// Ana Sayfa linkine tıklanınca sayfayı yenile
document.querySelector('header nav a[href="#"]').addEventListener('click', function (e) {
    e.preventDefault(); // Sayfanın yeniden yüklenmesini engelle
    location.reload(); // Sayfayı yeniden yükle
});


// Ana sayfadaki blog linki için 
document.querySelector('nav a[href="blog.html"]').addEventListener('click', function(e) {
    // Normal link davranışı devam edecek (yeni sayfaya yönlendirme)
    // Ekstra bir JavaScript gerekmiyor
});

// Eğer tek sayfa uygulaması istiyorsanız:
/*
document.querySelector('nav a[href="blog.html"]').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = "blog.html";
});
*/
