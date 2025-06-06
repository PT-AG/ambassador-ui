export class Index {
  configureRouter(config, router) {
    config.map([
      { route: ['', 'list'], moduleId: './list', name: 'list', nav: true, title: 'List: VB Cash' },
      { route: 'view/:id', moduleId: './view', name: 'view', nav: false, title: 'View: VB Cash' },
      { route: 'edit/:id', moduleId: './edit', name: 'edit', nav: false, title: 'Edit: VB Cash' },
      { route: 'create', moduleId: './create', name: 'create', nav: false, title: 'Create: VB Cash' }
    ]);

    this.router = router;
  }
}
