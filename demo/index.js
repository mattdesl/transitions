var Promise = require('bluebird')
var transition = require('../')

var view = function(t) {
	return { 
		create: function() {
			console.log('creating', t, arguments)
			return Promise.delay(1000) 
		},
		show: function() { 
			console.log('showing...', t)
			return Promise.delay(500) 
		}
	}
}

var views = [
	view('foo'),
	view('bar'),
	view('baz')
]

//Three ways of writing a parallel handler

//Option A
//---------------------
//Convenience all() 
var states = transition.all(views)

states.create()
	.then(states.show)
	.then(function() {
		console.log('all states created and shown')
	})

/*
//Option B
//---------------------
function wait(views, func) {
	return function() {
		return Promise.all(views.map(func))
	}
}

var create = wait(views, transition.create)
var show = wait(views, transition.show)

create()
	.then(function() {
		console.log("done creating")
	})
	.then(show)
	.then(function() {
		console.log("done animating")
	})
*/

/*
//Option C
//---------------------
Promise
	//create all views
	.all(views.map(transition.create))
	//then animate all
	.then(Promise.all(views.map(transition.show)))
	//handle on complete
	.then(function() {
		console.log('done creating and animating')
	})
*/