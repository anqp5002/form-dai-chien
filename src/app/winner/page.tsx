import WinnerBoard from '@/components/WinnerBoard';

export const metadata = {
  title: '🏆 Bảng Vinh Danh — Đại Chiến Phá Form',
};

export default function WinnerPage() {
  return (
    <main className="page-dashboard">
      <WinnerBoard />
    </main>
  );
}
