import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import styles from './reservations/reservations.module.css';

export default function EmailLogs() {
  const [allEmailLogs, setAllEmailLogs] = useState([]); // Tous les logs
  const [filteredEmailLogs, setFilteredEmailLogs] = useState([]); // Logs filtrés
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusInput, setStatusInput] = useState('');
  const [recipientInput, setRecipientInput] = useState('');

  // Chargement initial des données
  useEffect(() => {
    setLoading(true);
    fetch('/api/email-logs')
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des logs');
        return res.json();
      })
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
        setAllEmailLogs(sorted);
        setFilteredEmailLogs(sorted); // Initialise avec toutes les données
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filtrage des données quand les critères changent
  useEffect(() => {
    const filtered = allEmailLogs.filter(log => {
      const matchesStatus = !statusInput || log.status === statusInput;
      const matchesRecipient = !recipientInput || 
        log.recipient.toLowerCase().includes(recipientInput.toLowerCase());
      return matchesStatus && matchesRecipient;
    });
    setFilteredEmailLogs(filtered);
  }, [statusInput, recipientInput, allEmailLogs]);

  return (
    <Layout>
      <Header />
      <main className={styles.pageContainer}>
        <h1 className={styles.title}>HISTORIQUE DES EMAILS ENVOYÉS</h1>
        <div className={`${styles.filters} ${styles.filtersContainer}`} style={{display:'flex',justifyContent:'center', gap:'30px', alignItems:'center'}}>
          <label>
            Filtrer par statut:
            <select
              className={styles.select}
              value={statusInput}
              onChange={e => setStatusInput(e.target.value)}
              style={{width:'200px'}}
            >
              <option value="">Tous</option>
              <option value="SUCCESS">Succès</option>
              <option value="FAILURE">Échec</option>
            </select>
          </label>
          <label style={{display:'flex', alignItems:'center'}}>
            Filtrer par destinataire:
            <input
              className={styles.input}
              type="text"
              value={recipientInput}
              onChange={e => setRecipientInput(e.target.value)}
              placeholder="Email destinataire"
              style={{marginRight: '10px'}}
            />
          </label>
        </div>
        
        {loading && <p>Chargement des logs...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {!loading && !error && (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Destinataire</th>
                  <th>Type d'email</th>
                  <th>Statut</th>
                  <th>Message d'erreur</th>
                  <th>Date d'envoi</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmailLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.recipient}</td>
                    <td>{log.emailType}</td>
                    <td className={log.status === 'SUCCESS' ? styles['status-confirmed'] : styles['status-cancelled']}>
                      {log.status}
                    </td>
                    <td>{log.errorMessage || '-'}</td>
                    <td>{new Date(log.sentAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </Layout>
  );
}