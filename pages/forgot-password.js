import React, { useState } from 'react';
import styles from './login.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:8080/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }),
      });
      const text = await res.text();
      setMessage(text);
    } catch (error) {
      setMessage('Erreur lors de la demande de réinitialisation');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginContainer}>
        <img src="/logoEDBM-auth.822bbb75.png" alt="Logo EDBM" className={styles.logo} />
        <h1 className={styles.title}>Mot de passe oublié</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formgroup}>
            <label htmlFor="email" className={styles.label}>Email :</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={styles.input}
              placeholder="Entrez votre email"
            />
          </div>
          <button type="submit" className={styles.button}>Envoyer le lien de réinitialisation</button>
        </form>
        {message && <p className={styles.errorMessage}>{message}</p>}
        <p className={styles.backToLogin}>
          <a href="/login">Retour à la page de connexion</a>
        </p>
      </div>
    </div>
  );
}
