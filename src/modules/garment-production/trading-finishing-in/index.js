export class Index {
    configureRouter(config, router) {
        config.map([
            { route: ['', 'list'], moduleId: './list', name: 'list', nav: true, title: 'List Finishing In Trading' },
            { route: 'create', moduleId: './create', name: 'create', nav: false, title: 'Create Finishing In Trading' },
            { route: 'view/:id', moduleId: './view', name: 'view', nav: false, title: 'View Finishing In Trading' },
        ]);
        this.router = router;
    }
}