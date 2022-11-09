export class Index {
    configureRouter(config, router) {
        config.map([
            { route: ['', 'list'], moduleId: './list', name: 'list', nav: true, title: 'List: Master Tanggal Stock Opname' },
           
            { route: 'create', moduleId: './create', name: 'create', nav: false, title: 'Create: Master Tanggal Stock Opname' }
        ]);
    }
}
