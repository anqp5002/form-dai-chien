import FunnyForm from '@/components/FunnyForm';

export default function HomePage() {
  return (
    <main className="page-form">
      <div className="page-bg-effects">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <FunnyForm />
      <footer className="page-footer">
        <p>Nhóm 8 — Xử Lý Form &amp; Validation Hiện Đại với Next.js</p>
      </footer>
    </main>
  );
}
