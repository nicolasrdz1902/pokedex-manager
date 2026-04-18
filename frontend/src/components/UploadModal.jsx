import { useState, useRef } from 'react';
import api from '../services/api';
import styles from './UploadModal.module.css';

export default function UploadModal({ onClose, onSuccess }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const inputRef = useRef();

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus('idle');
    setMessage('');
  }

  async function handleSubmit() {
    if (!file) return;
    setStatus('loading');
    setMessage('Analyzing image...');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post('/collection/identify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('success');
      setMessage(`Identified: ${data.identified} — added to your collection!`);
      onSuccess(data.pokemon);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to identify Pokémon');
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>x</button>
        <h2>Identify Pokémon from Card</h2>
        <p className={styles.hint}>Upload a photo of a Pokémon card and we'll identify it automatically.</p>

        <div
          className={styles.dropzone}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile({ target: { files: e.dataTransfer.files } }); }}
        >
          {preview ? (
            <img src={preview} alt="Preview" className={styles.preview} />
          ) : (
            <span>Click or drag an image here</span>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} hidden />

        {message && (
          <p className={`${styles.message} ${styles[status]}`}>{message}</p>
        )}

        <div className={styles.buttons}>
          <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!file || status === 'loading'}
            className={styles.analyzeBtn}
          >
            {status === 'loading' ? 'Analyzing...' : 'Analyze & Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
