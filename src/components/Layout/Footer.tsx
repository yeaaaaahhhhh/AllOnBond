export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong>All On Bond</strong> - 채권 수익률 계산 및 비교 서비스
          </p>
          <p className="mb-4 text-xs text-gray-500">
            본 서비스는 교육 및 참고 목적으로 제공되며, 투자 권유가 아닙니다.
            <br />
            실제 투자 결정 시에는 전문가의 조언을 받으시기 바랍니다.
          </p>
          <p className="text-xs text-gray-400">
            © {currentYear} All On Bond. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
