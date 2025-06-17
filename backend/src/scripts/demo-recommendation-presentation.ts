/**
 * SCRIPT DEMO PRESENTASI SISTEM REKOMENDASI
 * Untuk menjelaskan kepada dosen cara kerja algoritma rekomendasi
 * 
 * Konsep yang dijelaskan:
 * 1. Content-Based Filtering
 * 2. One-Hot Encoding untuk Genre
 * 3. Cosine Similarity Calculation
 * 4. Caching dengan MongoDB
 */

import { pgPool } from '../config/database';
import { recommendationEngine } from '../services/recommendationEngine';

class RecommendationPresentationDemo {
  
  /**
   * DEMO 1: Menjelaskan One-Hot Encoding
   * Bagaimana genre diubah menjadi vector numerik
   */
  async demoOneHotEncoding() {
    console.log('\n🎯 DEMO 1: ONE-HOT ENCODING');
    console.log('=' .repeat(50));
    
    // Ambil sample data
    const allGenres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi'];
    
    console.log('📝 Semua Genre yang tersedia:', allGenres);
    console.log('\n🎬 Contoh Film:');
    
    const films = [
      { title: 'Avengers', genres: ['Action', 'Sci-Fi'] },
      { title: 'The Notebook', genres: ['Drama', 'Romance'] },
      { title: 'Scary Movie', genres: ['Comedy', 'Horror'] }
    ];
    
    films.forEach(film => {
      const vector = this.createOneHotVector(film.genres, allGenres);
      console.log(`\n🎭 ${film.title}`);
      console.log(`   Genre: [${film.genres.join(', ')}]`);
      console.log(`   Vector: [${vector.join(', ')}]`);
      console.log(`   Penjelasan: ${this.explainVector(vector, allGenres)}`);
    });
  }

  /**
   * DEMO 2: Menjelaskan Cosine Similarity
   * Bagaimana mengukur kemiripan antar film
   */
  async demoCosineSimilarity() {
    console.log('\n\n🔍 DEMO 2: COSINE SIMILARITY');
    console.log('=' .repeat(50));
    
    const allGenres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi'];
    
    const film1 = { title: 'Iron Man', genres: ['Action', 'Sci-Fi'] };
    const film2 = { title: 'Avengers', genres: ['Action', 'Sci-Fi'] };
    const film3 = { title: 'The Notebook', genres: ['Drama', 'Romance'] };
    
    const vector1 = this.createOneHotVector(film1.genres, allGenres);
    const vector2 = this.createOneHotVector(film2.genres, allGenres);
    const vector3 = this.createOneHotVector(film3.genres, allGenres);
    
    console.log(`🎬 Film 1: ${film1.title} -> [${vector1.join(', ')}]`);
    console.log(`🎬 Film 2: ${film2.title} -> [${vector2.join(', ')}]`);
    console.log(`🎬 Film 3: ${film3.title} -> [${vector3.join(', ')}]`);
    
    const similarity1_2 = this.calculateCosineSimilarity(vector1, vector2);
    const similarity1_3 = this.calculateCosineSimilarity(vector1, vector3);
    
    console.log(`\n📊 Hasil Perhitungan Similarity:`);
    console.log(`   ${film1.title} vs ${film2.title}: ${similarity1_2.toFixed(3)} (${this.interpretSimilarity(similarity1_2)})`);
    console.log(`   ${film1.title} vs ${film3.title}: ${similarity1_3.toFixed(3)} (${this.interpretSimilarity(similarity1_3)})`);
    
    console.log(`\n💡 Kesimpulan:`);
    console.log(`   - Film dengan genre sama memiliki similarity tinggi (${similarity1_2.toFixed(3)})`);
    console.log(`   - Film dengan genre berbeda memiliki similarity rendah (${similarity1_3.toFixed(3)})`);
  }

  /**
   * DEMO 3: Live Recommendation dari Database
   * Menunjukkan sistem rekomendasi yang sebenarnya
   */
  async demoLiveRecommendation() {
    console.log('\n\n🚀 DEMO 3: LIVE RECOMMENDATION SYSTEM');
    console.log('=' .repeat(50));
    
    try {
      // Ambil sample movie dari database
      const sampleQuery = `
        SELECT m.show_id, m.title, ARRAY_AGG(g.name) as genres
        FROM movies m
        JOIN movie_genres mg ON m.show_id = mg.movie_id
        JOIN genres g ON mg.genre_id = g.id
        WHERE m.vote_average > 7.0
        GROUP BY m.show_id, m.title
        ORDER BY m.popularity DESC
        LIMIT 1
      `;
      
      const result = await pgPool.query(sampleQuery);
      
      if (result.rows.length === 0) {
        console.log('❌ Tidak ada data film di database');
        return;
      }
      
      const sourceMovie = result.rows[0];
      console.log(`🎬 Film Sumber: "${sourceMovie.title}"`);
      console.log(`🏷️  Genre: [${sourceMovie.genres.join(', ')}]`);
      
      console.log('\n⏳ Mencari rekomendasi...');
      
      // Dapatkan rekomendasi
      const recommendations = await recommendationEngine.getRecommendationsForItem(
        sourceMovie.show_id,
        'movie',
        5
      );
      
      console.log(`\n✅ Ditemukan ${recommendations.length} rekomendasi:\n`);
      
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. 🎭 ${rec.title}`);
        console.log(`   📊 Similarity Score: ${rec.similarity_score}`);
        console.log(`   ⭐ Rating: ${rec.vote_average}/10`);
        console.log(`   🏷️  Genre: [${rec.genres.join(', ')}]`);
        console.log(`   💭 Alasan: ${rec.match_reasons.join(', ')}`);
        console.log(`   🎯 Confidence: ${rec.confidence_level}\n`);
      });
      
    } catch (error) {
      console.error('❌ Error dalam demo live recommendation:', error);
    }
  }

  /**
   * DEMO 4: Performance Comparison (With vs Without Cache)
   * Menunjukkan manfaat caching MongoDB
   */
  async demoCachePerformance() {
    console.log('\n\n⚡ DEMO 4: CACHE PERFORMANCE');
    console.log('=' .repeat(50));
    
    try {
      // Ambil sample movie
      const sampleQuery = `
        SELECT show_id, title FROM movies 
        ORDER BY popularity DESC LIMIT 1
      `;
      const result = await pgPool.query(sampleQuery);
      
      if (result.rows.length === 0) {
        console.log('❌ Tidak ada data film');
        return;
      }
      
      const movie = result.rows[0];
      console.log(`🎬 Testing dengan film: "${movie.title}"`);
      
      // Test tanpa cache (first run)
      console.log('\n🔄 Pertama kali (tanpa cache):');
      const start1 = Date.now();
      const recommendations1 = await recommendationEngine.getRecommendationsForItem(
        movie.show_id,
        'movie',
        5
      );
      const time1 = Date.now() - start1;
      console.log(`   ⏱️  Waktu: ${time1}ms`);
      console.log(`   📊 Hasil: ${recommendations1.length} rekomendasi`);
      
      // Test dengan cache (second run)
      console.log('\n💾 Kedua kali (dengan cache):');
      const start2 = Date.now();
      const recommendations2 = await recommendationEngine.getRecommendationsForItem(
        movie.show_id,
        'movie',
        5
      );
      const time2 = Date.now() - start2;
      console.log(`   ⏱️  Waktu: ${time2}ms`);
      console.log(`   📊 Hasil: ${recommendations2.length} rekomendasi`);
      
      const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
      console.log(`\n🚀 Cache Performance:`);
      console.log(`   📈 Peningkatan kecepatan: ${improvement}%`);
      console.log(`   💡 Cache berhasil mengoptimalkan performa!`);
      
    } catch (error) {
      console.error('❌ Error dalam demo cache:', error);
    }
  }

  /**
   * DEMO 5: Menjelaskan Algoritma Step by Step
   */
  async demoAlgorithmSteps() {
    console.log('\n\n🔬 DEMO 5: LANGKAH-LANGKAH ALGORITMA');
    console.log('=' .repeat(50));
    
    console.log('📋 Tahapan Sistem Rekomendasi:');
    console.log('\n1️⃣  INPUT: User memilih film/TV show');
    console.log('   - Sistem menerima ID film yang disukai');
    console.log('   - Mengambil data genre dari database');
    
    console.log('\n2️⃣  PREPROCESSING: One-Hot Encoding');
    console.log('   - Mengubah genre menjadi vector numerik');
    console.log('   - Contoh: [Action, Drama] → [1,0,1,0,0,0]');
    
    console.log('\n3️⃣  SIMILARITY CALCULATION: Cosine Similarity');
    console.log('   - Bandingkan vector film sumber dengan semua film lain');
    console.log('   - Formula: cos(θ) = (A·B) / (|A|×|B|)');
    
    console.log('\n4️⃣  FILTERING & RANKING:');
    console.log('   - Filter berdasarkan threshold similarity (>0.1)');
    console.log('   - Urutkan berdasarkan similarity score');
    console.log('   - Tambahkan metadata (confidence, match_reasons)');
    
    console.log('\n5️⃣  CACHING: MongoDB Storage');
    console.log('   - Simpan hasil ke MongoDB dengan TTL');
    console.log('   - Untuk request selanjutnya, langsung ambil dari cache');
    
    console.log('\n6️⃣  OUTPUT: Daftar Rekomendasi');
    console.log('   - Return top-N rekomendasi dengan metadata lengkap');
  }

  /**
   * Utility functions untuk demo
   */
  private createOneHotVector(itemGenres: string[], allGenres: string[]): number[] {
    return allGenres.map(genre => itemGenres.includes(genre) ? 1 : 0);
  }

  private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private explainVector(vector: number[], allGenres: string[]): string {
    const activeGenres = allGenres.filter((_, index) => vector[index] === 1);
    return `1 untuk genre [${activeGenres.join(', ')}], 0 untuk lainnya`;
  }

  private interpretSimilarity(similarity: number): string {
    if (similarity >= 0.8) return 'Sangat Mirip';
    if (similarity >= 0.6) return 'Mirip';
    if (similarity >= 0.4) return 'Cukup Mirip';
    if (similarity >= 0.2) return 'Sedikit Mirip';
    return 'Tidak Mirip';
  }

  /**
   * Main function untuk menjalankan semua demo
   */
  async runFullPresentation() {
    console.log('🎓 PRESENTASI SISTEM REKOMENDASI');
    console.log('🎯 Menjelaskan Content-Based Filtering dengan Cosine Similarity');
    console.log('👨‍🏫 Untuk Dosen Pembimbing');
    console.log('=' .repeat(60));

    await this.demoAlgorithmSteps();
    await this.demoOneHotEncoding();
    await this.demoCosineSimilarity();
    await this.demoLiveRecommendation();
    await this.demoCachePerformance();

    console.log('\n\n🎉 KESIMPULAN PRESENTASI');
    console.log('=' .repeat(50));
    console.log('✅ Sistem menggunakan Content-Based Filtering');
    console.log('✅ Algoritma Cosine Similarity untuk mengukur kemiripan');
    console.log('✅ One-Hot Encoding untuk representasi genre');
    console.log('✅ MongoDB caching untuk optimasi performa');
    console.log('✅ Metadata lengkap untuk transparency (similarity score, confidence, reasons)');
    console.log('\n💡 Sistem ini efektif untuk rekomendasi berdasarkan genre preferences!');
  }
}

// Export untuk digunakan
export const presentationDemo = new RecommendationPresentationDemo();

// Main execution jika file dijalankan langsung
if (require.main === module) {
  presentationDemo.runFullPresentation()
    .then(() => {
      console.log('\n✨ Presentasi selesai!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error dalam presentasi:', error);
      process.exit(1);
    });
}
