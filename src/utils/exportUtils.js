import { toPng } from 'html-to-image';

export async function exportTreeAsImage() {
  const worldElement = document.getElementById('family-canvas-world');
  if (!worldElement) {
    alert("Daraxt elementi topilmadi.");
    return;
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const bgColor = isDark ? '#0b0f19' : '#f8fafc';

  try {
    const dataUrl = await toPng(worldElement, {
      backgroundColor: bgColor,
      quality: 0.95,
      pixelRatio: 2,
      cacheBust: true,
      filter: (node) => {
        // Exclude ghost cards (+ Add Father / Mother / Spouse / Son / Daughter) from exported image
        if (
          node?.classList?.contains('ghost-nodes-container') ||
          node?.classList?.contains('ghost-card')
        ) {
          return false;
        }
        return true;
      }
    });

    const link = document.createElement('a');
    link.download = `shajara_oila_daraxti_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('PNG eksport qilishda xatolik:', error);
    alert("Rasmni saqlashda xatolik yuz berdi: " + (error.message || "Noma'lum xatolik"));
  }
}
