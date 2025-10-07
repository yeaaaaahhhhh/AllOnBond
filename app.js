(function () {
  const state = {
    bankTaxPct: 15.4,
    etfTaxPct: 15.4,
    frequency: 'monthly',
    useCompounding: true,
    search: '',
  };

  const etfs = [
    // 샘플 데이터 (세전 TTM 분배율)
    { provider: 'KODEX', name: '종합채권(AA-이상) 액티브 월분배', ticker: '273130', ttmYieldPct: 4.2, frequency: 'monthly' },
    { provider: 'TIGER', name: '국채선물10년 인버스X1(채권형) 월분배', ticker: '123456', ttmYieldPct: 4.5, frequency: 'monthly' },
    { provider: 'KBSTAR', name: '국고채3년', ticker: '136340', ttmYieldPct: 3.6, frequency: 'semiannual' },
    { provider: 'KOSEF', name: '10년국고채', ticker: '148070', ttmYieldPct: 3.9, frequency: 'semiannual' },
  ];

  function freqToM(freqSelect, fallback) {
    const map = { monthly: 12, quarterly: 4, semiannual: 2, annual: 1 };
    return map[freqSelect] || fallback || 12;
  }

  function calcAfterTaxYield(ttmYieldPct, etfTaxPct) {
    const y = Number(ttmYieldPct) / 100;
    const t = Number(etfTaxPct) / 100;
    return Math.max(0, y * (1 - t));
  }

  function calcBankEquivalentPreTaxSimple(afterTaxYield, bankTaxPct) {
    const bt = Number(bankTaxPct) / 100;
    if (bt >= 1) return 0;
    return afterTaxYield / (1 - bt);
  }

  function calcEffectiveAnnualFromPayout(afterTaxYield, m) {
    if (!m || m <= 1) return afterTaxYield;
    const perPeriod = afterTaxYield / m;
    return Math.pow(1 + perPeriod, m) - 1;
  }

  function formatPct(v) {
    return (v * 100).toFixed(2) + '%';
  }

  function render() {
    const bankTax = Number(document.getElementById('bankTax').value || state.bankTaxPct);
    const etfTax = Number(document.getElementById('etfTax').value || state.etfTaxPct);
    const freqSelect = document.getElementById('frequency').value || state.frequency;
    const useComp = document.getElementById('compound').checked;
    const query = (document.getElementById('search').value || '').trim().toLowerCase();

    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';

    const filtered = etfs.filter((e) => {
      if (!query) return true;
      return (
        e.name.toLowerCase().includes(query) ||
        e.ticker.toLowerCase().includes(query) ||
        e.provider.toLowerCase().includes(query)
      );
    });

    filtered.forEach((e) => {
      const m = freqToM(e.frequency || freqSelect, 12);
      const afterTax = calcAfterTaxYield(e.ttmYieldPct, etfTax);
      const bankSimple = calcBankEquivalentPreTaxSimple(afterTax, bankTax);
      const effective = useComp ? calcEffectiveAnnualFromPayout(afterTax, m) : afterTax;
      const bankComp = calcBankEquivalentPreTaxSimple(effective, bankTax);

      const tr = document.createElement('tr');
      tr.className = 'border-t hover:bg-gray-50';
      tr.innerHTML = `
        <td class="px-3 py-2">${e.provider}</td>
        <td class="px-3 py-2">${e.name}</td>
        <td class="px-3 py-2">${e.ticker}</td>
        <td class="px-3 py-2 text-right">${Number(e.ttmYieldPct).toFixed(2)}%</td>
        <td class="px-3 py-2 text-right">${formatPct(afterTax)}</td>
        <td class="px-3 py-2 text-right">${formatPct(bankSimple)}</td>
        <td class="px-3 py-2 text-right">${formatPct(bankComp)}</td>
        <td class="px-3 py-2">${(e.frequency || freqSelect)}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('lastUpdated').textContent = '업데이트: ' + new Date().toISOString().slice(0, 10);
  }

  function bind() {
    document.getElementById('bankTax').addEventListener('input', render);
    document.getElementById('etfTax').addEventListener('input', render);
    document.getElementById('frequency').addEventListener('change', render);
    document.getElementById('compound').addEventListener('change', render);
    document.getElementById('search').addEventListener('input', render);
  }

  window.addEventListener('DOMContentLoaded', function () {
    bind();
    render();
  });
})();
