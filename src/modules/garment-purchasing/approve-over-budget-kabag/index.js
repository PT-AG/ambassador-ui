export class Index {
    configureRouter(config, router) {
        config.map([
            { route: ['', 'list'], moduleId: './list', name: 'list', nav: false, title: 'Approval Over Budget Kabag' },
            { route: 'view/:id', moduleId: './view', name: 'view', nav: false, title: 'View: Approval Over Budget Kabag' }
        ]);

        this.router = router;
    }
}
