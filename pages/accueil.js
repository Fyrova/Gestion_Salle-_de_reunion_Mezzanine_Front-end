import Head from 'next/head';
import MyCalendar from '../components/Calendar';

export default function Home() {
  return (
    <div>
      <Head>
        <title>My Calendar Page</title>
      </Head>
      <main>
        <h1>Welcome to My Calendar</h1>
        <MyCalendar />
      </main>
    </div>
  );
}
