export class Index {
    configureRouter(config, router) {
        config.map([
            { route: ['', 'list'], moduleId: './list', name: 'list', nav: false, title: 'List Approval PO Eksternal (Kasie)' },
            { route: 'view/:id', moduleId: './view', name: 'view', nav: false, title: 'View Approval PO Eksternal (Kasie)' }
        ]);
        this.router = router;
    }
}