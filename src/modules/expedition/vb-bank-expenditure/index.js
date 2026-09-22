export class Index {
    configureRouter(config, router) {
        config.map([
            { route: ['', 'list'], moduleId: './list', name: 'list', nav: true, title: 'Pengeluaran  Bank VB' },
            { route: 'create', moduleId: './create', name: 'create', nav: false, title: 'Create: Pengeluaran  Bank VB' },
        ]);

        this.router = router;
    }
}