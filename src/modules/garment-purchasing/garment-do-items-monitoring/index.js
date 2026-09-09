export class Index {
    configureRouter(config, router) {
        config.map([
            { route: 'stelling/:id', moduleId: './stelling', name: 'stelling', nav: false, title: 'Kartu Stelling' },
            { route: ['', 'list'], moduleId: './list', name: 'list', nav: true, title: 'List' }
        ]);

        this.router = router;
    }
}
