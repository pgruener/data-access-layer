# data-access-layer
Data access layer with offline mode for JavaScript UI Frameworks with RESTful backend.

This framework is currently *in development* and not ready for use. We are looking forward to deliver a production ready version soon. Stay tuned.


One of the most exciting parts, if you wrap up a new app project with JavaScript based views with common ui frameworks like [React](https://reactjs.org/), [ReactXP](https://microsoft.github.io/reactxp/), [Angular](https://angular.io/), etc., is to present the first prototype. As the application grows, there will be several refactorings, as the data models gets more complicated. Also much more UX improvements take place in the ui components of the application.

At some point, it gets necessary, to display the same data models on different views in different ways. It might also be necessary to change parts of some data properties in several views and keep the other views up-to-date, which are also related to the changed data model(s).

At least when this point is reached, there is a huge reason to continue with structural organized data models with data binding to the destination views. Data binding enables views to get bound to either a concrete model entity, or a whole collection of data. As soon as some data is modified (independent of the modification came from a user via a view or an application based property update), those changes will be propagated to each view, which is bound to the updated data model.

With the right data binding capability it is possible, to start in a lean and easy way upfront. It also takes advantage of clearly separating client- and model-based business logic, which is later synced to a backend.

This data access layer library builds an easy, structured way to define data models, binding them to views, and organize them to have a perfect backend synchronization.

The data models' data collections are represented in a separate logical data layer, which empowers the application to provide an offline mode right out of the box.

There's a growing list of supported UI framework connectors with this data binding solution. Currently supported UI frameworks:
- ReactXP
- Plain JavaScript

The backend connectors are also modularized to be able to communicate with any backend service(s). Currently we only used it to communicate with RESTful interfaces, but the connectors are designed as generic as there shouldn't be any trouble extending them.

Currently supported backend connectors:
- [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) (currently focussed to the design of [Rails](https://en.wikipedia.org/wiki/Ruby_on_Rails) applications (rails-api))
- [localStorage](https://en.wikipedia.org/wiki/Web_storage#localStorage) (even if the browser's localStorage is not a backend, there is a possibility to persist the data in it if needed)
