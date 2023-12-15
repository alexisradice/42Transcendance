import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import LeftDrawer from '../components/LeftDrawer/LeftDrawer';

export function MainPage() {
  return (
    <>
      <Header />
      <main>
        <LeftDrawer />
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
