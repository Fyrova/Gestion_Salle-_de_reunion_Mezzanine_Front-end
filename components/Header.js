import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import { Montserrat } from 'next/font/google';

const mona = Montserrat({
  subsets: ['latin'],
});

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img src="/logoEDBM-auth.822bbb75.png" alt="EDBM Logo" className={styles.logo}/>
        <div style={{display:'flex', alignItems: 'baseline' }}>
            <h1 className={mona.className}>Gestion de la salle Mezzanine</h1>
          
          <nav className={styles.nav} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className={mona.className}>Tableau de bord</Link>
            <Link href="/reservations" className={mona.className}>Réservations</Link>
            <Link href="/reservations/create" className={mona.className}>Créer une réservation</Link>
            <Link href="/rapport" className={mona.className}>Rapport</Link>
          </nav>
      </div>
      </div>
    </header>
  );
}
