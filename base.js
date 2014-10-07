module.exports = function(Promise) {
	var promise = function(func, view, opt) {
		var p
		if (typeof view[func] === 'function') {
			// p = view[func](opt)
			p = Promise.method(view[func].bind(view))(opt)
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

	return transition
}