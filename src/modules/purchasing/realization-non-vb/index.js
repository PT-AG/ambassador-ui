export class Index {
  configureRouter(config, router) {
    config.map([
      {
        route: ["", "list"],
        moduleId: "./list",
        name: "list",
        nav: false,
        //title: "List: Realisasi VB Non PO",
        title: "List: Realisasi VB Cash",
      },
      {
        route: "create",
        moduleId: "./create",
        name: "create",
        nav: false,
        //title: "Create: Realisasi VB Non PO",
        title: "Create: Realisasi VB Cash",
      },
      
      {
        route: "view/:id",
        moduleId: "./view",
        name: "view",
        nav: false,
        //title: "View:  Realisasi VB Non PO",
        title: "View:  Realisasi VB Cash",
      },
     
      {
        route: "edit/:id",
        moduleId: "./edit",
        name: "edit",
        nav: false,
        //title: "Edit: Realisasi VB Non PO",
        title: "Edit: Realisasi VB Cash",
      },
     
    ]);

    this.router = router;
  }
}
