var transition = require('./')
var test = require('tape').test
var Promise = require('bluebird')

var view = function(t, expected) {
	return {
		expected: expected,

		create: function(index) {
			t.equal(index, expected, 'create triggered')
			return Promise.delay(500)
		},
	}
}

test('should fire async functions', function(t) {
	t.plan(5)
	var view = {
		create: function(opt) {
			t.equal(opt, 'foo', 'create triggered')
		},
		show: function(opt) {
			t.equal(opt, 'foo', 'show triggered')
			return Promise.delay(1000)
		},
		hide: function(opt) {
			t.equal(opt, 'foo', 'hide triggered')
		},
		dispose: function(opt) {
			t.equal(opt, 'foo', 'dispose triggered')
		}
	}

	//you can pass it any data, like an object for a template
	//or options for styling/timing
	var state = transition(view, 'foo') 

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
})

// test('should promisify', function(t) {
// 	t.plan(2)
// 	var view = {
// 		show: function(err, opt) {
// 			console.log("PROMISIFY BITCH")
// 			t.equal(opt, 'foo', 'show triggered')
// 			setTimeout(function() {
// 				if (done) done(opt)
// 			}, 1000)
// 		}
// 	}

// 	view = transition.promisify(view) 

// 	view.show()

// 	//you can pass it any data, like an object for a template
// 	//or options for styling/timing
// 	// var state = transition(view, 'foo')

// 	// //first we initialize the state
// 	// state.create()
// 	// 	//then we can animate it in
// 	// 	.then(state.show)
// 	// 	//and handle the callback when it's all done
// 	// 	.then(function() {
// 	// 		t.ok(true, 'async finished')
// 	// 	})
// })

test('in parallel with Promise.all', function(t) {
	var views = [
		view(t, 0),
		view(t, 1),
		view(t, 2)
	]

	t.plan(views.length + 1)

	//map sends create(view, index)
	var create = views.map(transition.create)
	Promise.all(create)
		.then(function() {
			t.ok(true, "all views created")
		})
})


test('in parallel with transitions.all', function(t) {
	var data = 'foo'
	var views = [
		view(t, data),
		view(t, data),
		view(t, data)
	]

	t.plan(views.length + 1)

	//map sends create(view, index)
	var states = transition.all(views, data)
	states.create()
		.then(function() {
			t.ok(true, "all views created")
		})
})

test('each series', function(t) {
	var data = 'data'
	var views = [
		view(t, data),
		view(t, data),
		view(t, data)
	]

	t.plan(views.length + 1)

	// one way of writing a "series" with Promises
	var current = Promise.fulfilled()
	var promises = views.map(function(view, index) {
		current = current.then(function() {
			return transition.create(view, data)
		})
		return current
	})
	Promise.all(promises)
		.then(function() {
			t.ok(true, 'all views created')
		})
})