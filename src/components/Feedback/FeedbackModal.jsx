import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendToTelegram, formatFeedbackMessage } from '../../utils/telegram';
import { X, MessageSquare, AlertCircle, Send, CheckCircle } from 'lucide-react';

export const FeedbackModal = ({ onClose }) => {
  const { currentUser, addFeedback } = useAuth();
  const [type, setType] = useState('feedback');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError('');

    const feedback = addFeedback({
      type,
      message: message.trim(),
      username: currentUser.username,
      name: currentUser.name,
      userId: currentUser.id
    });

    const text = formatFeedbackMessage({
      type,
      name: currentUser.name,
      username: currentUser.username,
      message: message.trim()
    });

    const ok = await sendToTelegram(text);
    setSending(false);

    if (ok) {
      setSent(true);
      setTimeout(() => onClose(), 2000);
    } else {
      setSent(true);
      setTimeout(() => onClose(), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="feedback-modal">
        <div className="feedback-modal-header">
          <div className="feedback-modal-title-wrap">
            <div className="feedback-modal-icon">
              {type === 'feedback' ? <MessageSquare size={20} /> : <AlertCircle size={20} />}
            </div>
            <h2 className="feedback-modal-title">
              {type === 'feedback' ? 'Fikr qoldirish' : 'Adminga murojaat'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="feedback-success">
            <CheckCircle size={48} className="feedback-success-icon" />
            <h3>Xabar yuborildi!</h3>
            <p>Admin tez orada ko'rib chiqadi</p>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={handleSend}>
            <div className="feedback-type-tabs">
              <button
                type="button"
                className={`feedback-type-tab ${type === 'feedback' ? 'active' : ''}`}
                onClick={() => setType('feedback')}
              >
                <MessageSquare size={15} />
                Fikr-mulohaza
              </button>
              <button
                type="button"
                className={`feedback-type-tab ${type === 'contact' ? 'active' : ''}`}
                onClick={() => setType('contact')}
              >
                <AlertCircle size={15} />
                Murojaat
              </button>
            </div>

            <div className="feedback-field">
              <label className="feedback-label">
                {type === 'feedback'
                  ? 'Fikringizni yozing...'
                  : 'Muammo yoki so\'rovingizni yozing...'}
              </label>
              <textarea
                className="feedback-textarea"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={type === 'feedback'
                  ? 'Ilova haqida fikringizni bildiring...'
                  : 'Admin bilan bog\'lanish sababini yozing...'}
                rows={5}
                required
              />
              <span className="feedback-char-count">{message.length}/500</span>
            </div>

            {error && <div className="feedback-error">{error}</div>}

            <div className="feedback-footer">
              <span className="feedback-user-badge">
                👤 {currentUser.name} ({currentUser.username})
              </span>
              <button
                type="submit"
                className="feedback-send-btn"
                disabled={sending || !message.trim()}
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