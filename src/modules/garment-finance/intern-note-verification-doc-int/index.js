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
        title: 'Compare : Verifikasi NI dan Dokumen Eksternal'
      },
      // { 
      //   route: 'view/:id', 
      //   moduleId: './view', 
      //   name: 'view', 
      //   nav: false, 
      //   title: 'View: Verifikasi NI dan Dokumen Eksternal' 
      // },
    ]);

    this.router = router;
  }
}
