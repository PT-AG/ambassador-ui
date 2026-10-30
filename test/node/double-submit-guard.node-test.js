/* Standalone verification: double-submit guard pada create pages.
 * Dijalankan: node (babel-register via .babelrc env node)
 * Tidak butuh browser/karma.
 */
process.env.NODE_ENV = 'production';
require('babel-register');

const assert = require('assert');
const path = require('path');

module.paths_win = null;

function loadCreate(rel) {
  return require(path.resolve(__dirname, rel)).Create;
}

class RouterStub {
  navigateToRoute() {}
}

function makeServiceStub(delayMs, value, reject) {
  return {
    calls: 0,
    create() {
      this.calls++;
      return new Promise((resolve, rejectFn) => {
        setTimeout(() => (reject ? rejectFn(new Error('x')) : resolve(value || {})), delayMs);
      });
    }
  };
}

class RouterShim { constructor() {} }

(async () => {
  const pages = [
    ['preparing', 'ambassador-ui/src/modules/garment-production/preparing/create.js'],
    ['loading', 'ambassador-ui/src/modules/garment-production/loading/create.js'],
    ['UEN by-user (Bon Pengeluaran Unit)', 'ambassador-ui/src/modules/garment-purchasing/unit-expenditure-note-by-user/create.js'],
    ['UDO by-user', 'ambassador-ui/src/modules/garment-purchasing/unit-delivery-order-by-user/create.js'],
    ['UDO retur', 'ambassador-ui/src/modules/garment-purchasing/unit-delivery-order-retur/create.js'],
    ['UEN all', 'ambassador-ui/src/modules/garment-purchasing/unit-expenditure-note-all/create.js'],
    ['UDO all', 'ambassador-ui/src/modules/garment-purchasing/unit-delivery-order-all/create.js']
  ];

  for (const [name, rel] of pages) {
    const Ctor = loadCreate(rel);

    // Case 1: dua click beruntun -> hanya satu POST
    const svc1 = makeServiceStub(300);
    const vm1 = new Ctor();
    vm1.service = svc1;
    vm1.router = new RouterStub();
    vm1.data = { Items: [], Unit: { Id: 0 }, UnitDOType: 'RETUR', ExpenditureType: 'INTERNAL' };
    vm1.save({});
    vm1.save({});
    vm1.save({});
    await new Promise(r => setTimeout(r, 350));
    assert.strictEqual(svc1.calls, 1, name + ': dua click harus hanya 1 create()');
    console.log('PASS', name, '- double click -> 1 request');

    // Case 2: gagal validasi -> tombol aktif lagi, bisa retry
    const svc2 = makeServiceStub(300, null, true);
    const vm2 = new Ctor();
    vm2.service = svc2;
    vm2.router = new RouterStub();
    vm2.data = { Items: [], Unit: { Id: 0 } };
    vm2.save({});
    vm2.save({});
    await new Promise(r => setTimeout(r, 350));
    assert.strictEqual(svc2.calls, 1, name + ': guard aktif saat in-flight');
    await new Promise(r => setTimeout(r, 50));
    vm2.save({});
    await new Promise(r => setTimeout(r, 300));
    assert.strictEqual(svc2.calls, 2, name + ': request kedua SETELAH handler selesai harus tetap terkirim (retry harus bisa)');
    console.log('PASS', name, '- return path mengembalikan tombol utk retry');
  }

  console.log('\nSEMUA TEST PASS');
  process.exit(0);
})().catch(e => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
