/**
 * QUICK DEMO RUNNER
 * Untuk menjalankan presentasi sistem rekomendasi dengan mudah
 */

import { presentationDemo } from './demo-recommendation-presentation';

async function runQuickDemo() {
  console.log('🚀 Starting Recommendation System Demo...\n');
  
  try {
    await presentationDemo.runFullPresentation();
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

runQuickDemo();
