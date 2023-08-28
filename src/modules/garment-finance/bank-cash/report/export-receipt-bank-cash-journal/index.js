export class Index {
    configureRouter(config, router) {
        config.map([
            { route: ['', 'list'], moduleId: './list', name: 'list', nav: true, title: 'List: Jurnal Penerimaan Kas Bank Export' }
        ]);
        this.router = router;
    }
}
