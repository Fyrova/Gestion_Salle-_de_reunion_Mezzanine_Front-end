import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import { Montserrat } from 'next/font/google';
import { useRouter } from 'next/router';

const mona = Montserrat({
  subsets: ['latin'],
});

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear any authentication tokens or session storage here
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    // Redirect to login page
    router.push('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src="/logoEDBM-auth.822bbb75.png" alt="EDBM Logo" className={styles.logo}/>
        <h1>Gestion de la salle Mezzanine</h1>
      </div>
      <nav className={styles.nav}>
        <a href="/dashboard">
          <span className={styles.navIcon}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <rect width="4" height="4" x="1" y="1" rx="1"/>
              <rect width="4" height="10" x="6" y="1" rx="1"/>
              <rect width="4" height="6" x="11" y="5" rx="1"/>
            </svg>
          </span>
          Tableau de bord
        </a>
        <a href="/reservations">
          <span className={styles.navIcon}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <rect width="14" height="12" x="1" y="2" rx="2" ry="2" stroke="currentColor" strokeWidth="1" fill="none"/>
              <line x1="1" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="1"/>
              <line x1="5" y1="0" x2="5" y2="4" stroke="currentColor" strokeWidth="1"/>
              <line x1="11" y1="0" x2="11" y2="4" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </span>
          Réservations
        </a>
        <a href="/reservations/create">
          <span className={styles.navIcon}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="2"/>
              <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </span>
          Créer une réservation
        </a>
        <a href="/rapport">
          <span className={styles.navIcon}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <polyline points="2,10 6,6 10,10 14,6" fill="none" stroke="currentColor" strokeWidth="2"/>
              <line x1="2" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </span>
          Rapport
        </a>
        <a href="/email-logs">
          <span className={styles.navIcon}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" fill="none"/>
              <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1" fill="none"/>
            </svg>
          </span>
          Notifications
        </a>
        <button onClick={handleLogout} className={styles.logout} type="button">
          <span className={styles.navIcon}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2v2H4v8h2v2H2V2h4zM11 8l-3-3v2H7v2h1v2l3-3z"/>
            </svg>
          </span>
          Déconnexion
        </button>
      </nav>
    </aside>
  );
}
