import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './login.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password }),
      });
      const text = await res.text();
      if (res.ok) {
        localStorage.setItem('authToken', text);
        router.push('/dashboard');
      } else {
        setMessage(text);
      }
    } catch (error) {
      setMessage('Erreur lors de la connexion');
    }
  };
  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginContainer}>
        <img src="/logoEDBM-auth.822bbb75.png" alt="Logo EDBM" className={styles.logo} />
        <h1 className={styles.title}>Connexion</h1>
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
          <div className={styles.formgroup}>
            <label htmlFor="password" className={styles.label}>Mot de passe :</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="Entrez votre mot de passe"
              />
              <button
                type="button"
                className={styles.showPasswordButton}
                onClick={toggleShowPassword}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
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
          <button type="submit" className={styles.button}>Se connecter</button>
        </form>
        <p className={styles.forgotPassword}>
          <Link href="/forgot-password">Mot de passe oublié ?</Link>
        </p>
        {message && <p className={styles.errorMessage}>{message}</p>}
      </div>
    </div>
  );
}
