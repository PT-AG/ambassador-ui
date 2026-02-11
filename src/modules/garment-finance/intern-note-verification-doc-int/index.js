export class Index {
  configureRouter(config, router) {
    config.map([
      {
        route: ['', 'list'],
        moduleId: './list',
        name: 'list',
        nav: false,
        title: 'List: Verifikasi NI dan Dokumen Eksternal'
      },
      {
        route: 'compare',
        moduleId: './compare',
        name: 'compare',
        nav: false,
        title: 'Compare'
      }
    ]);

    this.router = router;
  }
}
