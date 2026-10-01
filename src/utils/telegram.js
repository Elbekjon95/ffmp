const TELEGRAM_BOT_TOKEN = '7967164892:AAEyTebWsPG8x3BK0DJrIdcrUc2Czo_q-HQ';
const TELEGRAM_CHAT_ID = '-1002669864097';

export async function sendToTelegram(text) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });
    const data = await response.json();
    return data.ok;
  } catch (err) {
    console.error('Telegram xatosi:', err);
    return false;
  }
}

export function formatFeedbackMessage({ type, name, message, username }) {
  const typeEmoji = type === 'feedback' ? '\u{1F4AC}' : '\u{1F198}';
  const typeLabel = type === 'feedback' ? 'Fikr-mulohaza' : 'Murojaat';
  const now = new Date().toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  return `${typeEmoji} <b>${typeLabel}</b>\n\n\u{1F464} <b>Foydalanuvchi:</b> ${name} (${username})\n\u{1F4C5} <b>Vaqt:</b> ${now}\n\n\u{1F4DD} <b>Xabar:</b>\n${message}`;
}