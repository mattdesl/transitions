var isPromise = require('is-promise')

module.exports = function(Promise) {
	function wrap(fn) {
	    if (typeof fn !== "function") {
	        throw new TypeError("fn must be a function")
	    }
	    return function Promise_method() {
	        var value = fn.apply(this, Array.prototype.slice.call(arguments,0))
	        if (isPromise(value))
	            return value
	        return Promise.resolve(value)
	    }
	}

	var promise = function(func, view, opt) {
		var p
		if (typeof view[func] === 'function') {
			p = wrap(view[func].bind(view))(opt)
		} else
			p = Promise.resolve(opt)
		return p
	}

	function transition(view, opt) {
		return {
			view: view,
			create: promise.bind(null, 'create', view, opt),
			dispose: promise.bind(null, 'dispose', view, opt),
			show: promise.bind(null, 'show', view, opt),
			hide: promise.bind(null, 'hide', view, opt)
		}
	}

	//statics
	transition.create = promise.bind(null, 'create')
	transition.dispose = promise.bind(null, 'dispose')
	transition.show = promise.bind(null, 'show')
	transition.hide = promise.bind(null, 'hide')

	function allOf(views, opt, func) {
		return Promise.all(views.map(function(v) {
			return func(v, opt)
		}))
	}

	//convenience
	transition.all = function all(views, opt) {
		if (!Array.isArray(views))
			views = [views]
		return {
			views: views,
			create: allOf.bind(null, views, opt, transition.create),
			show: allOf.bind(null, views, opt, transition.show),
			hide: allOf.bind(null, views, opt, transition.hide),
			dispose: allOf.bind(null, views, opt, transition.dispose),
		}
	}


	function promisify(func, view) {
		if (typeof view[func] === 'function') {
			return Promise.promisify(view[func])
		}
		return Promise.resolve
	}

	//promisify a node-style "view" object
	// transition.promisify = function(view) {
	// 	return {
	// 		view: view,
	// 		create: promisify.bind(null, 'create', view),
	// 		dispose: promisify.bind(null, 'dispose', view),
	// 		show: promisify.bind(null, 'show', view),
	// 		hide: promisify.bind(null, 'hide', view)
	// 	}
	// }

	return transition
}