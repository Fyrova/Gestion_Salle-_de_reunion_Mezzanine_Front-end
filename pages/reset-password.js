import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './login.module.css';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token === undefined) {
      setMessage('');
    } else if (!token) {
      setMessage('Token manquant ou invalide');
    }
  }, [token]);

  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (newPassword !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      const res = await fetch('http://localhost:8080/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token, newPassword }),
      });
      const text = await res.text();
      setMessage(text);
      if (res.ok) {
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error) {
      setMessage('Erreur lors de la réinitialisation du mot de passe');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginContainer}>
        <img src="/logoEDBM-auth.822bbb75.png" alt="Logo EDBM" className={styles.logo} />
        <h1 className={styles.title}>Réinitialiser le mot de passe</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formgroup}>
            <label htmlFor="newPassword" className={styles.label}>Nouveau mot de passe :</label>
            <div className={styles.passwordWrapper}>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="Entrez votre nouveau mot de passe"
              />
              <button
                type="button"
                className={styles.showPasswordButton}
                onClick={toggleShowNewPassword}
                aria-label={showNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showNewPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="#666666">
                    <path d="M12 6a9.77 9.77 0 0 1 9 6 9.77 9.77 0 0 1-9 6 9.77 9.77 0 0 1-9-6 9.77 9.77 0 0 1 9-6m0-2C7 4 2.73 7.11 1 12c1.73 4.89 6 8 11 8s9.27-3.11 11-8c-1.73-4.89-6-8-11-8z"/>
                    <path d="M12 9a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="#666666">
                    <path d="M12 6a9.77 9.77 0 0 1 9 6 9.77 9.77 0 0 1-9 6 9.77 9.77 0 0 1-9-6 9.77 9.77 0 0 1 9-6m0-2C7 4 2.73 7.11 1 12c1.73 4.89 6 8 11 8s9.27-3.11 11-8c-1.73-4.89-6-8-11-8z"/>
                    <path d="M2 2l20 20"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className={styles.formgroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirmer le mot de passe :</label>
            <div className={styles.passwordWrapper}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="Confirmez votre mot de passe"
              />
              <button
                type="button"
                className={styles.showPasswordButton}
                onClick={toggleShowConfirmPassword}
                aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="#666666">
                    <path d="M12 6a9.77 9.77 0 0 1 9 6 9.77 9.77 0 0 1-9 6 9.77 9.77 0 0 1-9-6 9.77 9.77 0 0 1 9-6m0-2C7 4 2.73 7.11 1 12c1.73 4.89 6 8 11 8s9.27-3.11 11-8c-1.73-4.89-6-8-11-8z"/>
                    <path d="M12 9a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="#666666">
                    <path d="M12 6a9.77 9.77 0 0 1 9 6 9.77 9.77 0 0 1-9 6 9.77 9.77 0 0 1-9-6 9.77 9.77 0 0 1 9-6m0-2C7 4 2.73 7.11 1 12c1.73 4.89 6 8 11 8s9.27-3.11 11-8c-1.73-4.89-6-8-11-8z"/>
                    <path d="M2 2l20 20"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" className={styles.button}>Réinitialiser</button>
        </form>
        {message && <p className={styles.errorMessage}>{message}</p>}
        <p className={styles.backToLogin}>
          <a href="/login">Retour à la page de connexion</a>
        </p>
      </div>
    </div>
  );
}
