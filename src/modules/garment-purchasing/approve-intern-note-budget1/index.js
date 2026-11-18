export class Index {
    configureRouter(config, router) {
        config.map([
            { route: ['', 'list'], moduleId: './list', name: 'list', nav: false, title: 'List: Nota Intern Garment' },
            { route: 'view/:id', moduleId: './view', name: 'view', nav: false, title: 'View:  Nota Intern Garment' },
        ]);

        this.router = router;
    }
}