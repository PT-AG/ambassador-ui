/**
 * Verifikasi guard double-submit di halaman create modul yang memiliki
 * mitigation duplicate data di backend:
 *  - Preparing (garment-production)
 *  - Loading (garment-production)
 *  - Unit Expenditure Note / Bon Pengeluaran Unit (garment-purchasing)
 *  - Unit Delivery Order by-user + retur (garment-purchasing)
 *
 * Dua click "Simpan" berturut-turut sebelum request pertama selesai
 * wajib hanya mengirim satu POST ke backend (backend memegang guard
 * applock + duplicate check).
 */

describe('duplicate-submit guard pada create page', () => {
  let routerStub, serviceStub, pending;

  function makeServiceStub() {
    return {
      create: jasmine.createSpy('create').and.callFake(() => new Promise(() => {}))
    };
  }

  class RouterStub {
    navigateToRoute() {}
  }

  function instantiate(vmCtor) {
    const vm = new vmCtor();
    vm.bind && vm.bind();
    return vm;
  }

  function doubleClickSave(saveFn) {
    saveFn({});
    saveFn({});
    return serviceStub.create.calls.count();
  }

  beforeEach(() => {
    serviceStub = makeServiceStub();
    routerStub = new RouterStub();
  });

  it('preparing: hanya satu create() untuk dua click beruntun', done => {
    // import Create class
    System.import('../../src/modules/garment-production/preparing/create.js').then(mod => {
      const vm = instantiate(mod.Create);
      vm.service = serviceStub;
      vm.router = routerStub;
      expect(doubleClickSave(() => vm.save({}))).toBe(1);
      done();
    }).catch(done.fail);
  });

  it('unit expenditure note by-user: hanya satu create() untuk dua click beruntun', done => {
    System.import('../../src/modules/garment-purchasing/unit-expenditure-note-by-user/create.js').then(mod => {
      const vm = instantiate(mod.Create);
      vm.service = serviceStub;
      vm.router = routerStub;
      expect(doubleClickSave(() => vm.save({}))).toBe(1);
      done();
    }).catch(done.fail);
  });

  it('unit delivery order by-user: hanya satu create() untuk dua click beruntun', done => {
    System.import('../../src/modules/garment-purchasing/unit-delivery-order-by-user/create.js').then(mod => {
      const vm = instantiate(mod.Create);
      vm.service = serviceStub;
      vm.router = routerStub;
      expect(doubleClickSave(() => vm.save({}))).toBe(1);
      done();
    }).catch(done.fail);
  });
});
