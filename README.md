# transitions

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Using promises for cleaner animation and transitional states. 

This handles [views](#views) which are abstract features of any UI or visual application (buttons, effects, entire pages, etc). 

A view might look like this:  

```js
var view = {
	create: function(data) {
		//e.g. render a template with data
	},
	show: function(data) {
		//e.g. animate in a DIV
		return Promise.delay(1000)
	},
	hide: function(data) {
		//e.g. animate out a DIV
	}
}
```

Now you can sequence events for this view by using `transitions`:

```js
//get a "state" which gracefully wraps missing functions
var state = transition(view, { /* template data */ }) 

//first we initialize the state
state.create()
	//then we can animate it in
	.then(state.show)
	//and do some stuff while it's visible
	.then(function() {
		return Promise.delay(1000)
	})
	//and then animate out
	.then(state.hide)
	//and dispose of it
	.then(state.dispose)
	//and handle the callback when it's all done
	.then(function() {
		t.ok(true, 'async finished')
	})
```

## views

A "view" is just an object which may or may not expose any of the following asynchronous methods:

- `create` - called to instantiate the element
- `show` - called to show (animate in) the element
- `hide` - called to hide (animate out) the element
- `dispose` - called to dispose/destroy the element

## Usage

[![NPM](https://nodei.co/npm/transitions.png)](https://nodei.co/npm/transitions/)

#### `transitions(view[, data])`

Returns a new object with the functions `create`, `show`, `hide`, `dispose`. Calling any of them will return a promise for that view's function (or a fulfilled Promise if none exist).

```js
transition(view, { name: 'foo' }).create()
	.then(function() {
		console.log("view created")
	})
```

#### `transitions.create(view[, data])`
#### `transitions.show(view[, data])`
#### `transitions.hide(view[, data])`
#### `transitions.dispose(view[, data])`

Calls a view's `create()`, `show()`, etc functions with the specified `data`. If the view doesn't define the function, this will return a resolved Promise so it can be treated in the same way.

#### `transitions.all(views[, data])`

This is a convenience function to handle an array of views (or a single view) in parallel. The same can be achieved with `map` and `Promise.all`. Simple example:

```js
//say we are sending our "app" context as data to the views
var states = transitions.all(views, app)

states.create()
	.then( states.show )
	.then( app.doSomethingCool )
	.then( states.hide )
	.then( states.dispose )
```

If `views` is not an array, it will be made into a single-element array. 

## examples

See the [test.js](test.js) and [demo](demo/index.js) for more examples of animating in parallel and in series. 

The real beauty comes from composing transitions together in a functional manner. For example, a typical "carousel" might requires previous states to animate out and be disposed before animating in the next state.

```js
function carousel(prev, next) {
	//previous and next views, or "dummy" views if they don't exist
	var prevState = Transition(prev||{}, this)
	var nextState = Transition(next||{}, this)

	//sequencing
	return prevState.hide()
		.then(prevState.dispose)
		.then(nextState.create)
		.then(nextState.show)
}

coursel(views[i], views[i+1])
	.then(doSomething)
```

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/transitions/blob/master/LICENSE.md) for details.
