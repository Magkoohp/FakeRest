# FakeRest

Intercept AJAX calls to fake a REST server based on JSON data. Use it on top of [Sinon.js](http://sinonjs.org/) (for `XMLHTTPRequest`) or [fetch-mock](https://github.com/wheresrhys/fetch-mock) (for `fetch`) to test JavaScript REST clients on the browser side (e.g. single page apps) without a server.

See it in action in the [react-admin](https://marmelab.com/react-admin/) [demo](https://marmelab.com/react-admin-demo) ([source code](https://github.com/marmelab/react-admin/tree/master/examples/demo)).

## Usage

### MSW

We recommend you use [MSW](https://mswjs.io/) to mock your API. This will allow you to inspect requests as you usually do in the devtools network tab.

First, install msw and initialize it:

```sh
npm install msw@latest --save-dev
npx msw init <PUBLIC_DIR> # eg: public
```

Then configure it:

```js
// in ./src/msw.js
import { setupWorker } from "msw/browser";
import { getMswHandlers } from "fakerest";

const data = {
    'authors': [
        { id: 0, first_name: 'Leo', last_name: 'Tolstoi' },
        { id: 1, first_name: 'Jane', last_name: 'Austen' }
    ],
    'books': [
        { id: 0, author_id: 0, title: 'Anna Karenina' },
        { id: 1, author_id: 0, title: 'War and Peace' },
        { id: 2, author_id: 1, title: 'Pride and Prejudice' },
        { id: 3, author_id: 1, title: 'Sense and Sensibility' }
    ],
    'settings': {
        language: 'english',
        preferred_format: 'hardback',
    }
};

export const worker = setupWorker(...getMswHandlers({
    data
}));
```

Finally call the `worker.start()` method before rendering your application. For instance, in a Vite React application:

```js
import React from "react";
import ReactDom from "react-dom";
import { App } from "./App";
import { worker } from "./msw";

worker.start().then(() => {
  ReactDom.render(<App />, document.getElementById("root"));
});
```

Another option is to use the `MswServer` class. This is useful if you must conditionally include data:

```js
// in ./src/msw.js
import { setupWorker } from "msw/browser";
import { MswServer } from "fakerest";

const data = {
    'authors': [
        { id: 0, first_name: 'Leo', last_name: 'Tolstoi' },
        { id: 1, first_name: 'Jane', last_name: 'Austen' }
    ],
    'books': [
        { id: 0, author_id: 0, title: 'Anna Karenina' },
        { id: 1, author_id: 0, title: 'War and Peace' },
        { id: 2, author_id: 1, title: 'Pride and Prejudice' },
        { id: 3, author_id: 1, title: 'Sense and Sensibility' }
    ],
    'settings': {
        language: 'english',
        preferred_format: 'hardback',
    }
};

const restServer = new MswServer();
restServer.init(data);

export const worker = setupWorker(...restServer.getHandlers());
```

### Sinon

```html
<script src="/path/to/FakeRest.min.js"></script>
<script src="/path/to/sinon.js"></script>
<script type="text/javascript">
var data = {
    'authors': [
        { id: 0, first_name: 'Leo', last_name: 'Tolstoi' },
        { id: 1, first_name: 'Jane', last_name: 'Austen' }
    ],
    'books': [
        { id: 0, author_id: 0, title: 'Anna Karenina' },
        { id: 1, author_id: 0, title: 'War and Peace' },
        { id: 2, author_id: 1, title: 'Pride and Prejudice' },
        { id: 3, author_id: 1, title: 'Sense and Sensibility' }
    ],
    'settings': {
        language: 'english',
        preferred_format: 'hardback',
    }
};

// use sinon.js to monkey-patch XmlHttpRequest
var server = sinon.fakeServer.create();
server.respondWith(FakeRest.getSinonHandler({ data }));
</script>
```

Another option is to use the `SinonServer` class. This is useful if you must conditionally include data or interceptors:

```html
<script src="/path/to/FakeRest.min.js"></script>
<script src="/path/to/sinon.js"></script>
<script type="text/javascript">
var data = {
    'authors': [
        { id: 0, first_name: 'Leo', last_name: 'Tolstoi' },
        { id: 1, first_name: 'Jane', last_name: 'Austen' }
    ],
    'books': [
        { id: 0, author_id: 0, title: 'Anna Karenina' },
        { id: 1, author_id: 0, title: 'War and Peace' },
        { id: 2, author_id: 1, title: 'Pride and Prejudice' },
        { id: 3, author_id: 1, title: 'Sense and Sensibility' }
    ],
    'settings': {
        language: 'english',
        preferred_format: 'hardback',
    }
};
// initialize fake REST server
var restServer = new FakeRest.SinonServer();
restServer.init(data);

// use sinon.js to monkey-patch XmlHttpRequest
var server = sinon.fakeServer.create();
server.respondWith(restServer.getHandler());
</script>
```

### fetch-mock

```js
import fetchMock from 'fetch-mock';
import FakeRest from 'fakerest';

const data = {
    'authors': [
        { id: 0, first_name: 'Leo', last_name: 'Tolstoi' },
        { id: 1, first_name: 'Jane', last_name: 'Austen' }
    ],
    'books': [
        { id: 0, author_id: 0, title: 'Anna Karenina' },
        { id: 1, author_id: 0, title: 'War and Peace' },
        { id: 2, author_id: 1, title: 'Pride and Prejudice' },
        { id: 3, author_id: 1, title: 'Sense and Sensibility' }
    ],
    'settings': {
        language: 'english',
        preferred_format: 'hardback',
    }
};

fetchMock.mock(
    'begin:http://localhost:3000',
    FakeRest.getFetchMockHandler({ baseUrl: 'http://localhost:3000', data })
);
```

Another option is to use the `FetchMockServer` class. This is useful if you must conditionally include data or interceptors:

```js
import fetchMock from 'fetch-mock';
import FakeRest from 'fakerest';

const data = {
    'authors': [
        { id: 0, first_name: 'Leo', last_name: 'Tolstoi' },
        { id: 1, first_name: 'Jane', last_name: 'Austen' }
    ],
    'books': [
        { id: 0, author_id: 0, title: 'Anna Karenina' },
        { id: 1, author_id: 0, title: 'War and Peace' },
        { id: 2, author_id: 1, title: 'Pride and Prejudice' },
        { id: 3, author_id: 1, title: 'Sense and Sensibility' }
    ],
    'settings': {
        language: 'english',
        preferred_format: 'hardback',
    }
};
const restServer = new FakeRest.FetchMockServer({ baseUrl: 'http://localhost:3000' });
restServer.init(data);
fetchMock.mock('begin:http://localhost:3000', restServer.getHandler());
```

FakeRest will now intercept every `XmlHttpRequest` to the REST server. The handled routes for collections of items are:

```
GET    /:resource
POST   /:resource
GET    /:resource/:id
PUT    /:resource/:id
PATCH  /:resource/:id
DELETE /:resource/:id
```

The handled routes for single items are:

```
GET    /:resource
PUT    /:resource
PATCH  /:resource
```


Let's see an example:

```js
// Query the fake REST server
var req = new XMLHttpRequest();
req.open("GET", "/authors", false);
req.send(null);
console.log(req.responseText);
// [
//    {"id":0,"first_name":"Leo","last_name":"Tolstoi"},
//    {"id":1,"first_name":"Jane","last_name":"Austen"}
// ]

var req = new XMLHttpRequest();
req.open("GET", "/books/3", false);
req.send(null);
console.log(req.responseText);
// {"id":3,"author_id":1,"title":"Sense and Sensibility"}

var req = new XMLHttpRequest();
req.open("GET", "/settings", false);
req.send(null);
console.log(req.responseText);
// {"language:"english","preferred_format":"hardback"}

var req = new XMLHttpRequest();
req.open("POST", "/books", false);
req.send(JSON.stringify({ author_id: 1, title: 'Emma' }));
console.log(req.responseText);
// {"author_id":1,"title":"Emma","id":4}

// restore native XHR constructor
server.restore();
```

*Tip*: The `fakerServer` provided by Sinon.js is [available as a standalone library](http://sinonjs.org/docs/#server), without the entire stubbing framework. Simply add the following bower dependency:

```
devDependencies: {
  "sinon-server": "http://sinonjs.org/releases/sinon-server-1.14.1.js"
}
```

## Installation

FakeRest is available through npm and Bower:

```sh
# If you use Bower
bower install fakerest --save-dev
# If you use npm
npm install fakerest --save-dev
```

## REST Flavor

FakeRest defines a REST flavor, described below. It is inspired by commonly used ways how to handle aspects like filtering and sorting.

* `GET /foo` returns a JSON array. It accepts three query parameters: `filter`, `sort`, and `range`. It responds with a status 200 if there is no pagination, or 206 if the list of items is paginated. The response contains a mention of the total count in the `Content-Range` header.

        GET /books?filter={"author_id":1}&embed=["author"]&sort=["title","desc"]&range=[0-9]

        HTTP 1.1 200 OK
        Content-Range: items 0-1/2
        Content-Type: application/json
        [
          { "id": 3, "author_id": 1, "title": "Sense and Sensibility", "author": { "id": 1, "first_name": "Jane", "last_name": "Austen" } },
          { "id": 2, "author_id": 1, "title": "Pride and Prejudice", "author": { "id": 1, "first_name": "Jane", "last_name": "Austen" } }
        ]

    The `filter` param must be a serialized object literal describing the criteria to apply to the search query.

        GET /books?filter={"author_id":1} // return books where author_id is equal to 1
        HTTP 1.1 200 OK
        Content-Range: items 0-1/2
        Content-Type: application/json
        [
          { "id": 2, "author_id": 1, "title": "Pride and Prejudice" },
          { "id": 3, "author_id": 1, "title": "Sense and Sensibility" }
        ]

        // array values are possible
        GET /books?filter={"id":[2,3]} // return books where id is in [2,3]
        HTTP 1.1 200 OK
        Content-Range: items 0-1/2
        Content-Type: application/json
        [
          { "id": 2, "author_id": 1, "title": "Pride and Prejudice" },
          { "id": 3, "author_id": 1, "title": "Sense and Sensibility" }
        ]

        // use the special "q" filter to make a full-text search on all text fields
        GET /books?filter={"q":"and"} // return books where any of the book properties contains the string 'and'

        HTTP 1.1 200 OK
        Content-Range: items 0-2/3
        Content-Type: application/json
        [
          { "id": 1, "author_id": 0, "title": "War and Peace" },
          { "id": 2, "author_id": 1, "title": "Pride and Prejudice" },
          { "id": 3, "author_id": 1, "title": "Sense and Sensibility" }
        ]

        // use _gt, _gte, _lte, _lt, or _neq suffix on filter names to make range queries
        GET /books?filter={"price_lte":20} // return books where price is less than or equal to 20
        GET /books?filter={"price_gt":20} // return books where price is greater than 20

        // when the filter object contains more than one property, the criteria combine with an AND logic
        GET /books?filter={"published_at_gte":"2015-06-12","published_at_lte":"2015-06-15"} // return books published between two dates

    The `embed` param sets the related objects or collections to be embedded in the response.

        // embed author in books
        GET /books?embed=["author"]
        HTTP 1.1 200 OK
        Content-Range: items 0-3/4
        Content-Type: application/json
        [
            { "id": 0, "author_id": 0, "title": "Anna Karenina", "author": { "id": 0, "first_name": "Leo", "last_name": "Tolstoi" } },
            { "id": 1, "author_id": 0, "title": "War and Peace", "author": { "id": 0, "first_name": "Leo", "last_name": "Tolstoi" } },
            { "id": 2, "author_id": 1, "title": "Pride and Prejudice", "author": { "id": 1, "first_name": "Jane", "last_name": "Austen" } },
            { "id": 3, "author_id": 1, "title": "Sense and Sensibility", "author": { "id": 1, "first_name": "Jane", "last_name": "Austen" } }
        ]

        // embed books in author
        GET /authors?embed=["books"]
        HTTP 1.1 200 OK
        Content-Range: items 0-1/2
        Content-Type: application/json
        [
            { id: 0, first_name: 'Leo', last_name: 'Tolstoi', books: [{ id: 0, author_id: 0, title: 'Anna Karenina' }, { id: 1, author_id: 0, title: 'War and Peace' }] },
            { id: 1, first_name: 'Jane', last_name: 'Austen', books: [{ id: 2, author_id: 1, title: 'Pride and Prejudice' }, { id: 3, author_id: 1, title: 'Sense and Sensibility' }] }
        ]

        // you can embed several objects
        GET /authors?embed=["books","country"]

    The `sort` param must be a serialized array literal defining first the property used for sorting, then the sorting direction.

        GET /author?sort=["date_of_birth","asc"]  // return authors, the oldest first
        GET /author?sort=["date_of_birth","desc"]  // return authors, the youngest first

    The `range` param defines the number of results by specifying the rank of the first and last result. The first result is #0.

        GET /books?range=[0-9] // return the first 10 books
        GET /books?range=[10-19] // return the 10 next books

* `POST /foo` returns a status 201 with a `Location` header for the newly created resource, and the new resource in the body.

        POST /books
        { "author_id": 1, "title": "Emma" }

        HTTP 1.1 201 Created
        Location: /books/4
        Content-Type: application/json
        { "author_id": 1, "title": "Emma", "id": 4 }

* `GET /foo/:id` returns a JSON object, and a status 200, unless the resource doesn't exist

        GET /books/2

        HTTP 1.1 200 OK
        Content-Type: application/json
        { "id": 2, "author_id": 1, "title": "Pride and Prejudice" }

    The `embed` param sets the related objects or collections to be embedded in the response.

        GET /books/2?embed=['author']

        HTTP 1.1 200 OK
        Content-Type: application/json
        { "id": 2, "author_id": 1, "title": "Pride and Prejudice", "author": { "id": 1, "first_name": "Jane", "last_name": "Austen" } }

* `PUT /foo/:id` returns the modified JSON object, and a status 200, unless the resource doesn't exist
* `DELETE /foo/:id` returns the deleted JSON object, and a status 200, unless the resource doesn't exist

If the REST flavor you want to simulate differs from the one chosen for FakeRest, no problem: request and response interceptors will do the conversion (see below).  

Note that all of the above apply only to collections. Single objects respond to `GET /bar`, `PUT /bar` and `PATCH /bar` in a manner identical to those operations for `/foo/:id`, including embedding. `POST /bar` and `DELETE /bar` are not enabled.

## Supported Filters

Operators are specified as suffixes on each filtered field. For instance, applying the `_lte` operator on the `price` field for the `books` resource is done by like this:

    GET /books?filter={"price_lte":20} // return books where price is less than or equal to 20

- `_eq`: check for equality on simple values:

        GET /books?filter={"price_eq":20} // return books where price is equal to 20

- `_neq`: check for inequality on simple values

        GET /books?filter={"price_neq":20} // return books where price is not equal to 20

- `_eq_any`: check for equality on any passed values

        GET /books?filter={"price_eq_any":[20, 30]} // return books where price is equal to 20 or 30

- `_neq_any`: check for inequality on any passed values

        GET /books?filter={"price_neq_any":[20, 30]} // return books where price is not equal to 20 nor 30

- `_inc_any`: check for items that includes any of the passed values

        GET /books?filter={"authors_inc_any":['William Gibson', 'Pat Cadigan']} // return books where authors includes either 'William Gibson' or 'Pat Cadigan' or both

- `_q`: check for items that contains the provided text

        GET /books?filter={"author_q":['Gibson']} // return books where author includes 'Gibson' not considering the other fields

- `_lt`: check for items that has a value lower than the provided value

        GET /books?filter={"price_lte":100} // return books that have a price lower that 100

- `_lte`: check for items that has a value lower or equal than the provided value

        GET /books?filter={"price_lte":100} // return books that have a price lower or equal to 100

- `_gt`: check for items that has a value greater than the provided value

        GET /books?filter={"price_gte":100} // return books that have a price greater that 100

- `_gte`: check for items that has a value greater or equal than the provided value

        GET /books?filter={"price_gte":100} // return books that have a price greater or equal to 100

## Usage and Configuration

```js
// initialize a rest server with a custom base URL
const restServer = new FakeRest.SinonServer({ baseUrl: 'http://my.custom.domain' }); // only URLs starting with my.custom.domain will be intercepted
restServer.toggleLogging(); // logging is off by default, enable it to see network calls in the console
// Set all JSON data at once - only if identifier name is 'id'
restServer.init(json);
// modify the request before FakeRest handles it, using a request interceptor
// request is {
//     url: '...',
//     headers: [...],
//     requestBody: '...',
//     json: ..., // parsed JSON body
//     queryString: '...',
//     params: {...} // parsed query string
// }
restServer.addRequestInterceptor(function(request) {
    var start = (request.params._start - 1) || 0;
    var end = request.params._end !== undefined ? (request.params._end - 1) : 19;
    request.params.range = [start, end];
    return request; // always return the modified input
});
// modify the response before FakeRest sends it, using a response interceptor
// response is {
//     status: ...,
//     headers: [...],
//     body: {...}
// }
restServer.addResponseInterceptor(function(response) {
    response.body = { data: response.body, status: response.status };
    return response; // always return the modified input
});
// set default query, e.g. to force embeds or filters
restServer.setDefaultQuery(function(resourceName) {
    if (resourceName == 'authors') return { embed: ['books'] }
    if (resourceName == 'books') return { filter: { published: true } }
    return {};
})
// enable batch request handler, i.e. allow API clients to query several resources into a single request
// see [Facebook's Batch Requests philosophy](https://developers.facebook.com/docs/graph-api/making-multiple-requests) for more details.
restServer.setBatchUrl('/batch');

// you can create more than one fake server to listen to several domains
const restServer2 = new FakeRest.SinonServer({ baseUrl: 'http://my.other.domain' });
// Set data collection by collection - allows to customize the identifier name
const authorsCollection = new FakeRest.Collection({ items: [], identifierName: '_id' });
authorsCollection.addOne({ first_name: 'Leo', last_name: 'Tolstoi' }); // { _id: 0, first_name: 'Leo', last_name: 'Tolstoi' }
authorsCollection.addOne({ first_name: 'Jane', last_name: 'Austen' }); // { _id: 1, first_name: 'Jane', last_name: 'Austen' }
// collections have auto incremented identifiers by default but accept identifiers already set
authorsCollection.addOne({ _id: 3, first_name: 'Marcel', last_name: 'Proust' }); // { _id: 3, first_name: 'Marcel', last_name: 'Proust' }
restServer2.addCollection('authors', authorsCollection);
// collections are mutable
authorsCollection.updateOne(1, { last_name: 'Doe' }); // { _id: 1, first_name: 'Jane', last_name: 'Doe' }
authorsCollection.removeOne(3); // { _id: 3, first_name: 'Marcel', last_name: 'Proust' }

const server = sinon.fakeServer.create();
server.autoRespond = true;
server.respondWith(restServer.getHandler());
server.respondWith(restServer2.getHandler());
```

## Configure Identifiers Generation

By default, FakeRest uses an auto incremented sequence for the items identifiers. If you'd rather use another type of identifiers (e.g. UUIDs), you can provide your own `getNewId` function at the server level:

```js
import FakeRest from 'fakerest';
import uuid from 'uuid';

const restServer = new FakeRest.SinonServer({ baseUrl: 'http://my.custom.domain', getNewId: () => uuid.v5() });
```

This can also be specified at the collection level:

```js
import FakeRest from 'fakerest';
import uuid from 'uuid';

const restServer = new FakeRest.SinonServer({ baseUrl: 'http://my.custom.domain' });
const authorsCollection = new FakeRest.Collection({ items: [], identifierName: '_id', getNewId: () => uuid.v5() });
```

## Development

```sh
# Install dependencies
make install
# Run the demo with MSW
make run-msw

# Run the demo with fetch-mock
make run-fetch-mock
# Watch source files and recompile dist/FakeRest.js when anything is modified
make watch
# Run tests
make test
# Build minified version
make build
```

To test the Sinon integration, build the library then run the demo to start Vite and visit http://localhost:5173/sinon.html

## License

FakeRest is licensed under the [MIT License](LICENSE), sponsored by [marmelab](http://marmelab.com).
