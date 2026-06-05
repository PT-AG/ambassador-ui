export class Index {
    configureRouter(config, router) {
        config.map([
            { route: ['', 'list'], moduleId: './list', name: 'list', nav: false, title: 'List: Disposisi Pembelian' },
            { route: 'view/:id', moduleId: './view', name: 'view', nav: false, title: 'View:  Disposisi Pembelian' },
        ]);

        this.router = router;
    }
}
