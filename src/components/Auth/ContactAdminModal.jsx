import React, { useState } from 'react';
import { sendToTelegram } from '../../utils/telegram';
import { X, MessageSquare, AlertCircle, Send, CheckCircle, User } from 'lucide-react';

export const ContactAdminModal = ({ onClose }) => {
  const [type, setType] = useState('contact');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !name.trim()) return;
    setSending(true);

    const typeEmoji = type === 'feedback' ? '\u{1F4AC}' : '\u{1F198}';
    const typeLabel = type === 'feedback' ? 'Fikr-mulohaza' : 'Murojaat';
    const now = new Date().toLocaleString('uz-UZ', {
      timeZone: 'Asia/Tashkent',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    const text = `${typeEmoji} <b>${typeLabel} (Login sahifasi)</b>\n\n\u{1F464} <b>Ismi:</b> ${name.trim()}\n\u{1F4C5} <b>Vaqt:</b> ${now}\n\n\u{1F4DD} <b>Xabar:</b>\n${message.trim()}`;

    await sendToTelegram(text);
    setSending(false);
    setSent(true);
    setTimeout(() => onClose(), 2200);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9100 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="feedback-modal contact-admin-modal">
        <div className="feedback-modal-header">
          <div className="feedback-modal-title-wrap">
            <div className="feedback-modal-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              {type === 'feedback' ? <MessageSquare size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <h2 className="feedback-modal-title">Admin bilan bog'lanish</h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Kirish uchun admin yordami so'rang
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="feedback-success">
            <CheckCircle size={48} className="feedback-success-icon" />
            <h3>Xabar yuborildi!</h3>
            <p>Admin tez orada siz bilan bog'lanadi</p>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={handleSend}>
            <div className="feedback-type-tabs">
              <button
                type="button"
                className={`feedback-type-tab ${type === 'contact' ? 'active' : ''}`}
                onClick={() => setType('contact')}
              >
                <AlertCircle size={15} />
                Murojaat
              </button>
              <button
                type="button"
                className={`feedback-type-tab ${type === 'feedback' ? 'active' : ''}`}
                onClick={() => setType('feedback')}
              >
                <MessageSquare size={15} />
                Fikr-mulohaza
              </button>
            </div>

            <div className="feedback-field">
              <label className="feedback-label">Ismingiz</label>
              <div className="login-input-wrap">
                <User size={16} className="login-input-icon" />
                <input
                  type="text"
                  className="login-input"
                  style={{ fontSize: '0.88rem' }}
                  placeholder="Ism familyangizni kiriting"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="feedback-field">
              <label className="feedback-label">
                {type === 'contact' ? 'Muammo yoki so\'rovingiz' : 'Fikringiz'}
              </label>
              <textarea
                className="feedback-textarea"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={type === 'contact'
                  ? 'Tizimga kirish uchun yordam so\'rang yoki muammoingizni yozing...'
                  : 'Ilova haqida fikringizni bildiring...'}
                rows={4}
                required
              />
            </div>

            <div className="feedback-footer">
              <span className="feedback-user-badge" style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                🔒 Xabar Telegramga yuboriladi
              </span>
              <button
                type="submit"
                className="feedback-send-btn"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
                disabled={sending || !message.trim() || !name.trim()}
              >
                {sending ? (
                  <span className="login-spinner" />
                ) : (
                  <>
                    <Send size={15} />
                    Yuborish
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};