import { Montserrat } from 'next/font/google';
import Layout from '../components/Layout';
import styles from './login.module.css';

const mona = Montserrat({
  subsets: ['latin'],
});

const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Handle login logic here
}

export default function LoginPage() {
    return (
        <>
        <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: black;
          color: white;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
            <main style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap'}} className={ mona.className }>
            <div style={{ height: 'max', width:'500px', backgroundColor:'#A25598' }}></div>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                  <h1>Connexion</h1>
                    <div className={styles.formgroup}>
                        <label for="email">Email</label>
                        <input type="email" name='email' placeholder="Email"/>
                    </div>

                    <div className={styles.formgroup}>
                        <label for="password">Mot de passe</label>
                        <input type="password" name='password' placeholder="Mot de passe"/>
                    </div>
                    <button type="submit" className={styles.button}>Se connecter</button>
                </form>
            </main>
        </>
    )
}