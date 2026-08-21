import { toPng } from 'html-to-image';

export async function exportTreeAsImage() {
  const worldElement = document.getElementById('family-canvas-world');
  if (!worldElement) {
    alert("Daraxt elementi topilmadi.");
    return;
  }

  try {
    const dataUrl = await toPng(worldElement, {
      backgroundColor: '#0b0f19',
      quality: 0.95,
      pixelRatio: 2
    });

    const link = document.createElement('a');
    link.download = `oila_shajarasi_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('PNG eksport qilishda xatolik:', error);
    alert("Rasmni saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
}
