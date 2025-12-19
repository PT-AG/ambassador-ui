export class Index {
    configureRouter(config, router) {
        config.map([
            { route: ['', 'list'], moduleId: './list', name: 'list', nav: false, title: 'List Approval PO Eksternal (Kabag)' },
            { route: 'view/:id', moduleId: './view', name: 'view', nav: false, title: 'View Approval PO Eksternal (Kabag)' }
        ]);
        this.router = router;
    }
}