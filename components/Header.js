import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image src="/logoEDBM-auth.822bbb75.png" alt="EDBM Logo" width={50} height={50} />
        <h1>EDBM - Gestion de la salle de réunion Mezzanine</h1>
      </div>
      <nav className={styles.nav}>
        <Link href="/dashboard">Tableau de bord</Link>
        <Link href="/reservations">Réservations</Link>
        <Link href="/reservations/create">Créer une réservation</Link>
        <Link href="/rapport">Rapport</Link>
      </nav>
    </header>
  );
}
