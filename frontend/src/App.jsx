import { useState } from 'react'

import './App.css'


import styles from './LoginForm.module.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Anmeldung erfolgreich!');
        console.log('Angemeldet als:', data.user);
      } else {
        setMessage(data.error || 'Anmeldung fehlgeschlagen');
      }
    } catch (error) {
      setMessage('Ein Fehler ist aufgetreten');
      console.error('Fehler:', error);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Bei Ihrem Konto anmelden</h1>
        <input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Anmelden</button>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
}

export default App;