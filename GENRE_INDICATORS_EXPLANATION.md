# GenreExplorer - Indicator Explanations

## 🏆 **Popularity Indicators**

Setelah perbaikan, setiap genre sekarang memiliki label popularitas berdasarkan **ranking relatif** jumlah konten, bukan threshold absolut:

### 1. **👑 Trending Genre** (Kuning)
- **Kriteria**: Top 10% genre dengan konten terbanyak
- **Contoh**: Drama, Comedy, Action, Animation
- **Arti**: Genre paling populer dan memiliki konten paling banyak

### 2. **📈 Popular Genre** (Ungu) 
- **Kriteria**: Top 11-25% genre berdasarkan jumlah konten
- **Contoh**: Thriller, Crime, Family, Adventure
- **Arti**: Genre yang cukup populer dengan konten yang banyak

### 3. **⭐ Well-Known** (Biru)
- **Kriteria**: Top 26-50% genre berdasarkan jumlah konten  
- **Contoh**: Mystery, Romance, Science Fiction, Fantasy
- **Arti**: Genre yang dikenal luas dengan konten moderate

### 4. **🏅 Niche Genre** (Hijau)
- **Kriteria**: Bottom 50% genre berdasarkan jumlah konten
- **Contoh**: Western, Politics, News, Unknown
- **Arti**: Genre khusus/spesialis dengan konten terbatas

## 📊 **Content Distribution**

### Arti Visual
Progress bar menunjukkan **rasio Movies vs TV Shows** dalam genre tersebut:

```
[████████████░░░░] 75% Movies
Movies ←→ TV Shows
```

### Interpretasi
- **Bar penuh ke kiri**: Genre didominasi Movies (misal: Horror, Romance)
- **Bar di tengah**: Genre seimbang antara Movies dan TV Shows (misal: Drama, Comedy)
- **Bar kosong**: Genre didominasi TV Shows (misal: Reality, Talk)

### Tooltip Information
- **Hover pada "Content Distribution"**: Menjelaskan arti rasio
- **Hover pada progress bar**: Menampilkan jumlah exact movies dan TV shows

## 📈 **Example Rankings** (berdasarkan data aktual)

### Trending Genre (👑)
1. Drama: 14,769 total
2. Comedy: 9,105 total  
3. Action: 4,233 total

### Popular Genre (📈)
4. Animation: 4,069 total
5. Thriller: 3,769 total
6. Crime: 3,203 total

### Well-Known (⭐)
7. Family: 3,014 total
8. Adventure: 2,762 total
9. Mystery: 2,574 total

### Niche Genre (🏅)
- Western: 154 total
- Politics: 161 total
- News: 113 total

## 🎯 **Benefits of New System**

### Before (Masalah Lama)
- ❌ Semua genre > 100 konten = "Popular" 
- ❌ Tidak informatif, hampir semua genre "popular"
- ❌ Tidak ada gradasi tingkat popularitas

### After (Sistem Baru)
- ✅ Ranking relatif berdasarkan persentil
- ✅ 4 tingkat popularitas yang jelas
- ✅ Visual yang informatif dengan warna berbeda
- ✅ Tooltip untuk penjelasan tambahan

## 💡 **Usage Tips**

1. **Cari konten populer**: Fokus pada genre 👑 Trending dan 📈 Popular
2. **Eksplorasi niche**: Coba genre 🏅 Niche untuk konten unik
3. **Balance content**: Lihat Content Distribution untuk tahu dominasi Movies vs TV Shows
4. **Filter TV-only**: Gunakan toggle "Hide TV-only genres" untuk fokus pada genre dengan movies
