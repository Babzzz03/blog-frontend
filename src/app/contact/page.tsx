import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/common/ContactForm';

export const metadata = { title: 'Contact | My Blog' };

export default function ContactPage() {
  return (
    <div>
      <Header />
      <ContactForm />
      <Footer />
    </div>
  );
}
