// Mapping ID MobileNet V2 ke Nama & Nutrisi
const FOOD_DATABASE: Record<number, any> = {
  // --- BUAH-BUAHAN ---
  564: { name: 'Pisang (Banana)', calories: 105, protein: '1.3g', carbs: '27g', fat: '0.3g' }, // ID dari hasil scan Anda
  954: { name: 'Pisang (V1)', calories: 105, protein: '1.3g', carbs: '27g', fat: '0.3g' }, // Backup
  948: { name: 'Apel (Granny Smith)', calories: 52, protein: '0.3g', carbs: '14g', fat: '0.2g' },
  950: { name: 'Jeruk', calories: 47, protein: '0.9g', carbs: '12g', fat: '0.1g' },
  953: { name: 'Pisang', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  955: { name: 'Pisang', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  
  // --- MAKANAN ---
  963: { name: 'Pizza', calories: 266, protein: '11g', carbs: '33g', fat: '10g' },
  934: { name: 'Hotdog', calories: 290, protein: '10g', carbs: '25g', fat: '18g' },
  933: { name: 'Cheeseburger', calories: 303, protein: '15g', carbs: '30g', fat: '14g' },
  
  // --- BENDA LAIN (Untuk Test di Meja Kerja) ---
  508: { name: 'Keyboard Komputer', calories: 0, protein: '0g', carbs: '0g', fat: '0g' },
  898: { name: 'Botol Minum', calories: 0, protein: '0g', carbs: '0g', fat: '0g' },
};

export const getFoodData = (classId: number) => {
  if (FOOD_DATABASE[classId]) {
    return FOOD_DATABASE[classId];
  }

  // Jika tidak dikenal
  return {
    name: 'Tidak Dikenali / Bukan Makanan Umum',
    calories: '?',
    protein: '?',
    carbs: '?',
    fat: '?',
    isUnknown: true
  };
};