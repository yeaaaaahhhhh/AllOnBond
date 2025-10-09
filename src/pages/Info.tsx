export default function Info() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">계산 설명</h2>
        <p className="mt-1 text-sm text-gray-600">채권 수익률 계산의 수식과 과정을 이해하세요</p>
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            만기수익률 (YTM: Yield to Maturity)
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p>
              만기수익률은 채권을 현재 가격에 매입하여 만기까지 보유할 경우 받을 수 있는 연평균
              수익률입니다.
            </p>
            <p className="mt-2">
              채권의 현재 가격은 미래의 모든 현금흐름(이자와 원금)을 할인율로 할인한 현재가치의
              합입니다.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">예금환산 수익률</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p>
              채권의 복리 수익률을 예금의 단리(또는 연복리) 기준으로 환산한 수익률입니다. 예금
              수익률과 직접 비교하기 위해 사용됩니다.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">세금 계산</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="font-medium">한국 개인투자자 기준:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>이자소득세: 15.4% (소득세 14% + 지방소득세 1.4%)</li>
              <li>매매차익: 개인은 비과세 (2025년부터 금융투자소득세 적용 예정)</li>
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">일수 계산 (ACT/365)</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p>
              실제 일수(Actual)를 365일로 나누어 연분수를 계산하는 방식입니다. 한국 채권 시장에서
              일반적으로 사용됩니다.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
