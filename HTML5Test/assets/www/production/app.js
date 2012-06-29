/*da87ed5355ea1c13956b60cb23d5b5ab53faf54a*/
Ext.define("Ext.event.ListenerStack", {
	currentOrder : "current",
	length : 0,
	constructor : function () {
		this.listeners = {
			before : [],
			current : [],
			after : []
		};
		this.lateBindingMap = {};
		return this
	},
	add : function (h, j, k, e) {
		var a = this.lateBindingMap,
		g = this.getAll(e),
		f = g.length,
		b,
		d,
		c;
		if (typeof h == "string" && j.isIdentifiable) {
			c = j.getId();
			b = a[c];
			if (b) {
				if (b[h]) {
					return false
				} else {
					b[h] = true
				}
			} else {
				a[c] = b = {};
				b[h] = true
			}
		} else {
			if (f > 0) {
				while (f--) {
					d = g[f];
					if (d.fn === h && d.scope === j) {
						d.options = k;
						return false
					}
				}
			}
		}
		d = this.create(h, j, k, e);
		if (k && k.prepend) {
			delete k.prepend;
			g.unshift(d)
		} else {
			g.push(d)
		}
		this.length++;
		return true
	},
	getAt : function (b, a) {
		return this.getAll(a)[b]
	},
	getAll : function (a) {
		if (!a) {
			a = this.currentOrder
		}
		return this.listeners[a]
	},
	count : function (a) {
		return this.getAll(a).length
	},
	create : function (d, c, b, a) {
		return {
			stack : this,
			fn : d,
			firingFn : false,
			boundFn : false,
			isLateBinding : typeof d == "string",
			scope : c,
			options : b || {},
			order : a
		}
	},
	remove : function (h, j, e) {
		var g = this.getAll(e),
		f = g.length,
		b = false,
		a = this.lateBindingMap,
		d,
		c;
		if (f > 0) {
			while (f--) {
				d = g[f];
				if (d.fn === h && d.scope === j) {
					g.splice(f, 1);
					b = true;
					this.length--;
					if (typeof h == "string" && j.isIdentifiable) {
						c = j.getId();
						if (a[c] && a[c][h]) {
							delete a[c][h]
						}
					}
					break
				}
			}
		}
		return b
	}
});
Ext.define("Ext.event.Controller", {
	isFiring : false,
	listenerStack : null,
	constructor : function (a) {
		this.firingListeners = [];
		this.firingArguments = [];
		this.setInfo(a);
		return this
	},
	setInfo : function (a) {
		this.info = a
	},
	getInfo : function () {
		return this.info
	},
	setListenerStacks : function (a) {
		this.listenerStacks = a
	},
	fire : function (h, e) {
		var n = this.listenerStacks,
		m = this.firingListeners,
		d = this.firingArguments,
		k = m.push,
		g = n.length,
		j,
		l,
		c,
		o,
		a = false,
		b = false,
		f;
		m.length = 0;
		if (e) {
			if (e.order !== "after") {
				a = true
			} else {
				b = true
			}
		}
		if (g === 1) {
			j = n[0].listeners;
			l = j.before;
			c = j.current;
			o = j.after;
			if (l.length > 0) {
				k.apply(m, l)
			}
			if (a) {
				k.call(m, e)
			}
			if (c.length > 0) {
				k.apply(m, c)
			}
			if (b) {
				k.call(m, e)
			}
			if (o.length > 0) {
				k.apply(m, o)
			}
		} else {
			for (f = 0; f < g; f++) {
				l = n[f].listeners.before;
				if (l.length > 0) {
					k.apply(m, l)
				}
			}
			if (a) {
				k.call(m, e)
			}
			for (f = 0; f < g; f++) {
				c = n[f].listeners.current;
				if (c.length > 0) {
					k.apply(m, c)
				}
			}
			if (b) {
				k.call(m, e)
			}
			for (f = 0; f < g; f++) {
				o = n[f].listeners.after;
				if (o.length > 0) {
					k.apply(m, o)
				}
			}
		}
		if (m.length === 0) {
			return this
		}
		if (!h) {
			h = []
		}
		d.length = 0;
		d.push.apply(d, h);
		d.push(null, this);
		this.doFire();
		return this
	},
	doFire : function () {
		var k = this.firingListeners,
		c = this.firingArguments,
		g = c.length - 2,
		d,
		f,
		b,
		o,
		h,
		n,
		a,
		j,
		l,
		e,
		m;
		this.isPausing = false;
		this.isPaused = false;
		this.isStopped = false;
		this.isFiring = true;
		for (d = 0, f = k.length; d < f; d++) {
			b = k[d];
			o = b.options;
			h = b.fn;
			n = b.firingFn;
			a = b.boundFn;
			j = b.isLateBinding;
			l = b.scope;
			if (j && a && a !== l[h]) {
				a = false;
				n = false
			}
			if (!a) {
				if (j) {
					a = l[h];
					if (!a) {
						continue
					}
				} else {
					a = h
				}
				b.boundFn = a
			}
			if (!n) {
				n = a;
				if (o.buffer) {
					n = Ext.Function.createBuffered(n, o.buffer, l)
				}
				if (o.delay) {
					n = Ext.Function.createDelayed(n, o.delay, l)
				}
				b.firingFn = n
			}
			c[g] = o;
			e = c;
			if (o.args) {
				e = o.args.concat(e)
			}
			if (o.single === true) {
				b.stack.remove(h, l, b.order)
			}
			m = n.apply(l, e);
			if (m === false) {
				this.stop()
			}
			if (this.isStopped) {
				break
			}
			if (this.isPausing) {
				this.isPaused = true;
				k.splice(0, d + 1);
				return
			}
		}
		this.isFiring = false;
		this.listenerStacks = null;
		k.length = 0;
		c.length = 0;
		this.connectingController = null
	},
	connect : function (a) {
		this.connectingController = a
	},
	resume : function () {
		var a = this.connectingController;
		this.isPausing = false;
		if (this.isPaused && this.firingListeners.length > 0) {
			this.isPaused = false;
			this.doFire()
		}
		if (a) {
			a.resume()
		}
		return this
	},
	isInterrupted : function () {
		return this.isStopped || this.isPaused
	},
	stop : function () {
		var a = this.connectingController;
		this.isStopped = true;
		if (a) {
			this.connectingController = null;
			a.stop()
		}
		this.isFiring = false;
		this.listenerStacks = null;
		return this
	},
	pause : function () {
		var a = this.connectingController;
		this.isPausing = true;
		if (a) {
			a.pause()
		}
		return this
	}
});
Ext.define("Ext.event.publisher.Publisher", {
	targetType : "",
	idSelectorRegex : /^#([\w\-]+)$/i,
	constructor : function () {
		var b = this.handledEvents,
		a,
		c,
		e,
		d;
		a = this.handledEventsMap = {};
		for (c = 0, e = b.length; c < e; c++) {
			d = b[c];
			a[d] = true
		}
		this.subscribers = {};
		return this
	},
	handles : function (a) {
		var b = this.handledEventsMap;
		return !!b[a] || !!b["*"] || a === "*"
	},
	getHandledEvents : function () {
		return this.handledEvents
	},
	setDispatcher : function (a) {
		this.dispatcher = a
	},
	subscribe : function () {
		return false
	},
	unsubscribe : function () {
		return false
	},
	unsubscribeAll : function () {
		delete this.subscribers;
		this.subscribers = {};
		return this
	},
	notify : function () {
		return false
	},
	getTargetType : function () {
		return this.targetType
	},
	dispatch : function (c, a, b) {
		this.dispatcher.doDispatchEvent(this.targetType, c, a, b)
	}
});
Ext.define("Ext.event.Event", {
	alternateClassName : "Ext.EventObject",
	isStopped : false,
	set : function (a, b) {
		if (arguments.length === 1 && typeof a != "string") {
			var c = a;
			for (a in c) {
				if (c.hasOwnProperty(a)) {
					this[a] = c[a]
				}
			}
		} else {
			this[a] = c[a]
		}
	},
	stopEvent : function () {
		return this.stopPropagation()
	},
	stopPropagation : function () {
		this.isStopped = true;
		return this
	}
});
Ext.define("Ext.event.Dispatcher", {
	requires : ["Ext.event.ListenerStack", "Ext.event.Controller"],
	statics : {
		getInstance : function () {
			if (!this.instance) {
				this.instance = new this()
			}
			return this.instance
		},
		setInstance : function (a) {
			this.instance = a;
			return this
		}
	},
	config : {
		publishers : {}
		
	},
	wildcard : "*",
	constructor : function (a) {
		this.listenerStacks = {};
		this.activePublishers = {};
		this.publishersCache = {};
		this.noActivePublishers = [];
		this.controller = null;
		this.initConfig(a);
		return this
	},
	getListenerStack : function (e, g, c, b) {
		var d = this.listenerStacks,
		f = d[e],
		a;
		b = Boolean(b);
		if (!f) {
			if (b) {
				d[e] = f = {}
				
			} else {
				return null
			}
		}
		f = f[g];
		if (!f) {
			if (b) {
				d[e][g] = f = {}
				
			} else {
				return null
			}
		}
		a = f[c];
		if (!a) {
			if (b) {
				f[c] = a = new Ext.event.ListenerStack()
			} else {
				return null
			}
		}
		return a
	},
	getController : function (d, f, c, b) {
		var a = this.controller,
		e = {
			targetType : d,
			target : f,
			eventName : c
		};
		if (!a) {
			this.controller = a = new Ext.event.Controller()
		}
		if (a.isFiring) {
			a = new Ext.event.Controller()
		}
		a.setInfo(e);
		if (b && a !== b) {
			a.connect(b)
		}
		return a
	},
	applyPublishers : function (c) {
		var a,
		b;
		this.publishersCache = {};
		for (a in c) {
			if (c.hasOwnProperty(a)) {
				b = c[a];
				this.registerPublisher(b)
			}
		}
		return c
	},
	registerPublisher : function (b) {
		var a = this.activePublishers,
		c = b.getTargetType(),
		d = a[c];
		if (!d) {
			a[c] = d = []
		}
		d.push(b);
		b.setDispatcher(this);
		return this
	},
	getCachedActivePublishers : function (c, b) {
		var a = this.publishersCache,
		d;
		if ((d = a[c]) && (d = d[b])) {
			return d
		}
		return null
	},
	cacheActivePublishers : function (c, b, d) {
		var a = this.publishersCache;
		if (!a[c]) {
			a[c] = {}
			
		}
		a[c][b] = d;
		return d
	},
	getActivePublishers : function (f, b) {
		var g,
		a,
		c,
		e,
		d;
		if ((g = this.getCachedActivePublishers(f, b))) {
			return g
		}
		a = this.activePublishers[f];
		if (a) {
			g = [];
			for (c = 0, e = a.length; c < e; c++) {
				d = a[c];
				if (d.handles(b)) {
					g.push(d)
				}
			}
		} else {
			g = this.noActivePublishers
		}
		return this.cacheActivePublishers(f, b, g)
	},
	hasListener : function (c, d, b) {
		var a = this.getListenerStack(c, d, b);
		if (a) {
			return a.count() > 0
		}
		return false
	},
	addListener : function (d, e, a) {
		var f = this.getActivePublishers(d, a),
		c = f.length,
		b;
		if (c > 0) {
			for (b = 0; b < c; b++) {
				f[b].subscribe(e, a)
			}
		}
		return this.doAddListener.apply(this, arguments)
	},
	doAddListener : function (g, h, c, f, e, d, a) {
		var b = this.getListenerStack(g, h, c, true);
		return b.add(f, e, d, a)
	},
	removeListener : function (d, e, a) {
		var f = this.getActivePublishers(d, a),
		c = f.length,
		b;
		if (c > 0) {
			for (b = 0; b < c; b++) {
				f[b].unsubscribe(e, a)
			}
		}
		return this.doRemoveListener.apply(this, arguments)
	},
	doRemoveListener : function (f, g, c, e, d, a) {
		var b = this.getListenerStack(f, g, c);
		if (b === null) {
			return false
		}
		return b.remove(e, d, a)
	},
	clearListeners : function (a, e, d) {
		var j = this.listenerStacks,
		f = arguments.length,
		b,
		h,
		c,
		g;
		if (f === 3) {
			if (j[a] && j[a][e]) {
				this.removeListener(a, e, d);
				delete j[a][e][d]
			}
		} else {
			if (f === 2) {
				if (j[a]) {
					b = j[a][e];
					if (b) {
						for (d in b) {
							if (b.hasOwnProperty(d)) {
								h = this.getActivePublishers(a, d);
								for (c = 0, f = h.length; c < f; c++) {
									h[c].unsubscribe(e, d, true)
								}
							}
						}
						delete j[a][e]
					}
				}
			} else {
				if (f === 1) {
					h = this.activePublishers[a];
					for (c = 0, f = h.length; c < f; c++) {
						h[c].unsubscribeAll()
					}
					delete j[a]
				} else {
					h = this.activePublishers;
					for (a in h) {
						if (h.hasOwnProperty(a)) {
							g = h[a];
							for (c = 0, f = g.length; c < f; c++) {
								g[c].unsubscribeAll()
							}
						}
					}
					delete this.listenerStacks;
					this.listenerStacks = {}
					
				}
			}
		}
		return this
	},
	dispatchEvent : function (d, e, a) {
		var f = this.getActivePublishers(d, a),
		c = f.length,
		b;
		if (c > 0) {
			for (b = 0; b < c; b++) {
				f[b].notify(e, a)
			}
		}
		return this.doDispatchEvent.apply(this, arguments)
	},
	doDispatchEvent : function (a, g, f, i, c, b) {
		var h = this.getListenerStack(a, g, f),
		d = this.getWildcardListenerStacks(a, g, f),
		e;
		if ((h === null || h.length == 0)) {
			if (d.length == 0 && !c) {
				return
			}
		} else {
			d.push(h)
		}
		e = this.getController(a, g, f, b);
		e.setListenerStacks(d);
		e.fire(i, c);
		return !e.isInterrupted()
	},
	getWildcardListenerStacks : function (g, h, d) {
		var f = [],
		b = this.wildcard,
		c = d !== b,
		e = h !== b,
		a;
		if (c && (a = this.getListenerStack(g, h, b))) {
			f.push(a)
		}
		if (e && (a = this.getListenerStack(g, b, d))) {
			f.push(a)
		}
		return f
	}
});
Ext.define("Ext.event.Dom", {
	extend : "Ext.event.Event",
	constructor : function (a) {
		var c = a.target,
		b;
		if (c && c.nodeType !== 1) {
			c = c.parentNode
		}
		b = a.changedTouches;
		if (b) {
			b = b[0];
			this.pageX = b.pageX;
			this.pageY = b.pageY
		} else {
			this.pageX = a.pageX;
			this.pageY = a.pageY
		}
		this.browserEvent = this.event = a;
		this.target = this.delegatedTarget = c;
		this.type = a.type;
		this.timeStamp = this.time = a.timeStamp;
		if (typeof this.time != "number") {
			this.time = new Date(this.time).getTime()
		}
		return this
	},
	stopEvent : function () {
		this.preventDefault();
		return this.callParent()
	},
	preventDefault : function () {
		this.browserEvent.preventDefault()
	},
	getPageX : function () {
		return this.browserEvent.pageX
	},
	getPageY : function () {
		return this.browserEvent.pageY
	},
	getXY : function () {
		if (!this.xy) {
			this.xy = [this.getPageX(), this.getPageY()]
		}
		return this.xy
	},
	getTarget : function (b, c, a) {
		if (arguments.length === 0) {
			return this.delegatedTarget
		}
		return b ? Ext.fly(this.target).findParent(b, c, a) : (a ? Ext.get(this.target) : this.target)
	},
	getTime : function () {
		return this.time
	},
	setDelegatedTarget : function (a) {
		this.delegatedTarget = a
	},
	makeUnpreventable : function () {
		this.browserEvent.preventDefault = Ext.emptyFn
	}
});
Ext.define("Ext.event.publisher.Dom", {
	extend : "Ext.event.publisher.Publisher",
	requires : ["Ext.env.Browser", "Ext.Element", "Ext.event.Dom"],
	targetType : "element",
	idOrClassSelectorRegex : /^([#|\.])([\w\-]+)$/,
	handledEvents : ["click", "focus", "blur", "mousemove", "mousedown", "mouseup", "mouseover", "mouseout", "keyup", "keydown", "keypress", "submit", "transitionend", "animationstart", "animationend"],
	classNameSplitRegex : /\s+/,
	SELECTOR_ALL : "*",
	constructor : function () {
		var f = this.getHandledEvents(),
		e = {},
		b,
		c,
		a,
		d;
		this.doBubbleEventsMap = {
			click : true,
			submit : true,
			mousedown : true,
			mousemove : true,
			mouseup : true,
			mouseover : true,
			mouseout : true,
			transitionend : true
		};
		this.onEvent = Ext.Function.bind(this.onEvent, this);
		for (b = 0, c = f.length; b < c; b++) {
			a = f[b];
			d = this.getVendorEventName(a);
			e[d] = a;
			this.attachListener(d)
		}
		this.eventNameMap = e;
		return this.callParent()
	},
	getSubscribers : function (a) {
		var c = this.subscribers,
		b = c[a];
		if (!b) {
			b = c[a] = {
				id : {
					$length : 0
				},
				className : {
					$length : 0
				},
				selector : [],
				all : 0,
				$length : 0
			}
		}
		return b
	},
	getVendorEventName : function (a) {
		if (a === "transitionend") {
			a = Ext.browser.getVendorProperyName("transitionEnd")
		} else {
			if (a === "animationstart") {
				a = Ext.browser.getVendorProperyName("animationStart")
			} else {
				if (a === "animationend") {
					a = Ext.browser.getVendorProperyName("animationEnd")
				}
			}
		}
		return a
	},
	attachListener : function (a) {
		document.addEventListener(a, this.onEvent, !this.doesEventBubble(a));
		return this
	},
	removeListener : function (a) {
		document.removeEventListener(a, this.onEvent, !this.doesEventBubble(a));
		return this
	},
	doesEventBubble : function (a) {
		return !!this.doBubbleEventsMap[a]
	},
	subscribe : function (g, f) {
		if (!this.handles(f)) {
			return false
		}
		var e = g.match(this.idOrClassSelectorRegex),
		a = this.getSubscribers(f),
		c = a.id,
		d = a.className,
		b = a.selector,
		h,
		i;
		if (e !== null) {
			h = e[1];
			i = e[2];
			if (h === "#") {
				if (c.hasOwnProperty(i)) {
					c[i]++;
					return true
				}
				c[i] = 1;
				c.$length++
			} else {
				if (d.hasOwnProperty(i)) {
					d[i]++;
					return true
				}
				d[i] = 1;
				d.$length++
			}
		} else {
			if (g === this.SELECTOR_ALL) {
				a.all++
			} else {
				if (b.hasOwnProperty(g)) {
					b[g]++;
					return true
				}
				b[g] = 1;
				b.push(g)
			}
		}
		a.$length++;
		return true
	},
	unsubscribe : function (g, f, j) {
		if (!this.handles(f)) {
			return false
		}
		var e = g.match(this.idOrClassSelectorRegex),
		a = this.getSubscribers(f),
		c = a.id,
		d = a.className,
		b = a.selector,
		h,
		i;
		j = Boolean(j);
		if (e !== null) {
			h = e[1];
			i = e[2];
			if (h === "#") {
				if (!c.hasOwnProperty(i) || (!j && --c[i] > 0)) {
					return true
				}
				delete c[i];
				c.$length--
			} else {
				if (!d.hasOwnProperty(i) || (!j && --d[i] > 0)) {
					return true
				}
				delete d[i];
				d.$length--
			}
		} else {
			if (g === this.SELECTOR_ALL) {
				if (j) {
					a.all = 0
				} else {
					a.all--
				}
			} else {
				if (!b.hasOwnProperty(g) || (!j && --b[g] > 0)) {
					return true
				}
				delete b[g];
				Ext.Array.remove(b, g)
			}
		}
		a.$length--;
		return true
	},
	getElementTarget : function (a) {
		if (a.nodeType !== 1) {
			a = a.parentNode;
			if (!a || a.nodeType !== 1) {
				return null
			}
		}
		return a
	},
	getBubblingTargets : function (b) {
		var a = [];
		if (!b) {
			return a
		}
		do {
			a[a.length] = b;
			b = b.parentNode
		} while (b && b.nodeType === 1);
		return a
	},
	dispatch : function (c, a, b) {
		b.push(b[0].target);
		this.callParent(arguments)
	},
	publish : function (b, a, c) {
		var d = this.getSubscribers(b),
		e;
		if (d.$length === 0 || !this.doPublish(d, b, a, c)) {
			e = this.getSubscribers("*");
			if (e.$length > 0) {
				this.doPublish(e, b, a, c)
			}
		}
		return this
	},
	doPublish : function (f, h, x, u) {
		var r = f.id,
		g = f.className,
		b = f.selector,
		p = r.$length > 0,
		a = g.$length > 0,
		l = b.length > 0,
		o = f.all > 0,
		y = {},
		e = [u],
		q = false,
		m = this.classNameSplitRegex,
		v,
		k,
		t,
		d,
		z,
		n,
		c,
		w,
		s;
		for (v = 0, k = x.length; v < k; v++) {
			z = x[v];
			u.setDelegatedTarget(z);
			if (p) {
				n = z.id;
				if (n) {
					if (r.hasOwnProperty(n)) {
						q = true;
						this.dispatch("#" + n, h, e)
					}
				}
			}
			if (a) {
				c = z.className;
				if (c) {
					w = c.split(m);
					for (t = 0, d = w.length; t < d; t++) {
						c = w[t];
						if (!y[c]) {
							y[c] = true;
							if (g.hasOwnProperty(c)) {
								q = true;
								this.dispatch("." + c, h, e)
							}
						}
					}
				}
			}
			if (u.isStopped) {
				return q
			}
		}
		if (o && !q) {
			u.setDelegatedTarget(u.browserEvent.target);
			q = true;
			this.dispatch(this.SELECTOR_ALL, h, e);
			if (u.isStopped) {
				return q
			}
		}
		if (l) {
			for (t = 0, d = x.length; t < d; t++) {
				z = x[t];
				for (v = 0, k = b.length; v < k; v++) {
					s = b[v];
					if (this.matchesSelector(z, s)) {
						u.setDelegatedTarget(z);
						q = true;
						this.dispatch(s, h, e)
					}
					if (u.isStopped) {
						return q
					}
				}
			}
		}
		return q
	},
	matchesSelector : function (b, a) {
		if ("webkitMatchesSelector" in b) {
			return b.webkitMatchesSelector(a)
		}
		return Ext.DomQuery.is(b, a)
	},
	onEvent : function (d) {
		var b = this.eventNameMap[d.type];
		if (!b || this.getSubscribersCount(b) === 0) {
			return
		}
		var c = this.getElementTarget(d.target),
		a;
		if (!c) {
			return
		}
		if (this.doesEventBubble(b)) {
			a = this.getBubblingTargets(c)
		} else {
			a = [c]
		}
		this.publish(b, a, new Ext.event.Dom(d))
	},
	getSubscribersCount : function (a) {
		if (!this.handles(a)) {
			return 0
		}
		return this.getSubscribers(a).$length + this.getSubscribers("*").$length
	}
});
Ext.define("Ext.util.Point", {
	radianToDegreeConstant : 180 / Math.PI,
	statics : {
		fromEvent : function (b) {
			var a = b.changedTouches,
			c = (a && a.length > 0) ? a[0] : b;
			return this.fromTouch(c)
		},
		fromTouch : function (a) {
			return new this(a.pageX, a.pageY)
		},
		from : function (a) {
			if (!a) {
				return new this(0, 0)
			}
			if (!(a instanceof this)) {
				return new this(a.x, a.y)
			}
			return a
		}
	},
	constructor : function (a, b) {
		if (typeof a == "undefined") {
			a = 0
		}
		if (typeof b == "undefined") {
			b = 0
		}
		this.x = a;
		this.y = b;
		return this
	},
	clone : function () {
		return new this.self(this.x, this.y)
	},
	copy : function () {
		return this.clone.apply(this, arguments)
	},
	copyFrom : function (a) {
		this.x = a.x;
		this.y = a.y;
		return this
	},
	toString : function () {
		return "Point[" + this.x + "," + this.y + "]"
	},
	equals : function (a) {
		return (this.x === a.x && this.y === a.y)
	},
	isCloseTo : function (c, b) {
		if (typeof b == "number") {
			b = {
				x : b
			};
			b.y = b.x
		}
		var a = c.x,
		f = c.y,
		e = b.x,
		d = b.y;
		return (this.x <= a + e && this.x >= a - e && this.y <= f + d && this.y >= f - d)
	},
	isWithin : function () {
		return this.isCloseTo.apply(this, arguments)
	},
	translate : function (a, b) {
		this.x += a;
		this.y += b;
		return this
	},
	roundedEquals : function (a) {
		return (Math.round(this.x) === Math.round(a.x) && Math.round(this.y) === Math.round(a.y))
	},
	getDistanceTo : function (b) {
		var c = this.x - b.x,
		a = this.y - b.y;
		return Math.sqrt(c * c + a * a)
	},
	getAngleTo : function (b) {
		var c = this.x - b.x,
		a = this.y - b.y;
		return Math.atan2(a, c) * this.radianToDegreeConstant
	}
});
Ext.define("Ext.event.Touch", {
	extend : "Ext.event.Dom",
	requires : ["Ext.util.Point"],
	constructor : function (a, b) {
		if (b) {
			this.set(b)
		}
		this.touchesMap = {};
		this.changedTouches = this.cloneTouches(a.changedTouches);
		this.touches = this.cloneTouches(a.touches);
		this.targetTouches = this.cloneTouches(a.targetTouches);
		return this.callParent([a])
	},
	clone : function () {
		return new this.self(this)
	},
	setTargets : function (a) {
		this.doSetTargets(this.changedTouches, a);
		this.doSetTargets(this.touches, a);
		this.doSetTargets(this.targetTouches, a)
	},
	doSetTargets : function (f, d) {
		var c,
		e,
		g,
		b,
		a;
		for (c = 0, e = f.length; c < e; c++) {
			g = f[c];
			b = g.identifier;
			a = d[b];
			if (a) {
				g.targets = a
			}
		}
	},
	cloneTouches : function (f) {
		var e = this.touchesMap,
		h = [],
		d = null,
		b,
		c,
		g,
		a;
		for (b = 0, c = f.length; b < c; b++) {
			g = f[b];
			a = g.identifier;
			if (d !== null && a === d) {
				a++
			}
			d = a;
			if (!e[a]) {
				e[a] = {
					pageX : g.pageX,
					pageY : g.pageY,
					identifier : a,
					target : g.target,
					timeStamp : g.timeStamp,
					point : Ext.util.Point.fromTouch(g),
					targets : g.targets
				}
			}
			h[b] = e[a]
		}
		return h
	}
});
Ext.define("Ext.event.publisher.TouchGesture", {
	extend : "Ext.event.publisher.Dom",
	requires : ["Ext.util.Point", "Ext.event.Touch"],
	handledEvents : ["touchstart", "touchmove", "touchend", "touchcancel"],
	moveEventName : "touchmove",
	config : {
		moveThrottle : 1,
		buffering : {
			enabled : false,
			interval : 10
		},
		recognizers : {}
		
	},
	currentTouchesCount : 0,
	constructor : function (a) {
		this.processEvents = Ext.Function.bind(this.processEvents, this);
		this.eventProcessors = {
			touchstart : this.onTouchStart,
			touchmove : this.onTouchMove,
			touchend : this.onTouchEnd,
			touchcancel : this.onTouchEnd
		};
		this.eventToRecognizerMap = {};
		this.activeRecognizers = [];
		this.currentRecognizers = [];
		this.currentTargets = {};
		this.currentTouches = {};
		this.buffer = [];
		this.initConfig(a);
		return this.callParent()
	},
	applyBuffering : function (a) {
		if (a.enabled === true) {
			this.bufferTimer = setInterval(this.processEvents, a.interval)
		} else {
			clearInterval(this.bufferTimer)
		}
		return a
	},
	applyRecognizers : function (b) {
		var c,
		a;
		for (c in b) {
			if (b.hasOwnProperty(c)) {
				a = b[c];
				if (a) {
					this.registerRecognizer(a)
				}
			}
		}
		return b
	},
	handles : function (a) {
		return this.callParent(arguments) || this.eventToRecognizerMap.hasOwnProperty(a)
	},
	doesEventBubble : function () {
		return true
	},
	eventLogs : [],
	onEvent : function (b) {
		var a = this.getBuffering();
		b = new Ext.event.Touch(b);
		if (a.enabled) {
			this.buffer.push(b)
		} else {
			this.processEvent(b)
		}
	},
	processEvents : function () {
		var a = this.buffer,
		f = a.length,
		d = [],
		c,
		e,
		b;
		if (f > 0) {
			c = a.slice(0);
			a.length = 0;
			for (b = 0; b < f; b++) {
				e = c[b];
				if (e.type === this.moveEventName) {
					d.push(e)
				} else {
					if (d.length > 0) {
						this.processEvent(this.mergeEvents(d));
						d.length = 0
					}
					this.processEvent(e)
				}
			}
			if (d.length > 0) {
				this.processEvent(this.mergeEvents(d));
				d.length = 0
			}
		}
	},
	mergeEvents : function (c) {
		var b = [],
		f = c.length,
		a,
		e,
		d;
		d = c[f - 1];
		if (f === 1) {
			return d
		}
		for (a = 0; a < f; a++) {
			e = c[a];
			b.push(e.changedTouches)
		}
		d.changedTouches = this.mergeTouchLists(b);
		return d
	},
	mergeTouchLists : function (l) {
		var e = {},
		h = [],
		d,
		k,
		a,
		b,
		f,
		c,
		g;
		for (d = 0, k = l.length; d < k; d++) {
			a = l[d];
			for (b = 0, f = a.length; b < f; b++) {
				c = a[b];
				g = c.identifier;
				e[g] = c
			}
		}
		for (g in e) {
			if (e.hasOwnProperty(g)) {
				h.push(e[g])
			}
		}
		return h
	},
	registerRecognizer : function (a) {
		var g = this.eventToRecognizerMap,
		e = this.activeRecognizers,
		c = a.getHandledEvents(),
		d,
		f,
		b;
		a.setOnRecognized(this.onRecognized);
		a.setCallbackScope(this);
		for (d = 0, f = c.length; d < f; d++) {
			b = c[d];
			g[b] = a
		}
		e.push(a);
		return this
	},
	onRecognized : function (f, h, d, a) {
		var k = [],
		j = d.length,
		g,
		c,
		b;
		if (j === 1) {
			return this.publish(f, d[0].targets, h, a)
		}
		for (c = 0; c < j; c++) {
			b = d[c];
			k.push(b.targets)
		}
		g = this.getCommonTargets(k);
		this.publish(f, g, h, a)
	},
	publish : function (b, a, c, d) {
		c.set(d);
		return this.callParent([b, a, c])
	},
	getCommonTargets : function (a) {
		var h = a[0],
		f = a.length;
		if (f === 1) {
			return h
		}
		var d = [],
		e = 1,
		g,
		b,
		c;
		while (true) {
			g = h[h.length - e];
			if (!g) {
				return d
			}
			for (c = 1; c < f; c++) {
				b = a[c];
				if (b[b.length - e] !== g) {
					return d
				}
			}
			d.unshift(g);
			e++
		}
		return d
	},
	invokeRecognizers : function (c, g) {
		var b = this.activeRecognizers,
		f = b.length,
		d,
		a;
		if (c === "onStart") {
			for (d = 0; d < f; d++) {
				b[d].isActive = true
			}
		}
		for (d = 0; d < f; d++) {
			a = b[d];
			if (a.isActive && a[c].call(a, g) === false) {
				a.isActive = false
			}
		}
	},
	getActiveRecognizers : function () {
		return this.activeRecognizers
	},
	processEvent : function (a) {
		this.eventProcessors[a.type].call(this, a)
	},
	onTouchStart : function (k) {
		var m = this.currentTargets,
		g = this.currentTouches,
		o = this.currentTouchesCount,
		n = k.changedTouches,
		f = k.touches,
		h = f.length,
		a = {},
		l = n.length,
		d,
		c,
		j,
		b;
		o += l;
		if (o > h) {
			for (d = 0; d < h; d++) {
				c = f[d];
				j = c.identifier;
				a[j] = true
			}
			for (j in g) {
				if (g.hasOwnProperty(j)) {
					if (!a[j]) {
						o--;
						b = k.clone();
						c = g[j];
						c.targets = this.getBubblingTargets(this.getElementTarget(c.target));
						b.changedTouches = [c];
						this.onTouchEnd(b)
					}
				}
			}
			if (o > h) {
				return
			}
		}
		for (d = 0; d < l; d++) {
			c = n[d];
			j = c.identifier;
			if (!g.hasOwnProperty(j)) {
				this.currentTouchesCount++
			}
			g[j] = c;
			m[j] = this.getBubblingTargets(this.getElementTarget(c.target))
		}
		k.setTargets(m);
		for (d = 0; d < l; d++) {
			c = n[d];
			this.publish("touchstart", c.targets, k, {
				touch : c
			})
		}
		if (!this.isStarted) {
			this.isStarted = true;
			this.invokeRecognizers("onStart", k)
		}
		this.invokeRecognizers("onTouchStart", k)
	},
	onTouchMove : function (j) {
		if (!this.isStarted) {
			return
		}
		var l = this.currentTargets,
		g = this.currentTouches,
		c = this.getMoveThrottle(),
		m = j.changedTouches,
		b = 0,
		f,
		k,
		d,
		n,
		a,
		h;
		j.setTargets(l);
		for (f = 0, k = m.length; f < k; f++) {
			d = m[f];
			h = d.identifier;
			n = d.point;
			a = g[h].point;
			if (c && n.isCloseTo(a, c)) {
				b++;
				continue
			}
			g[h] = d;
			this.publish("touchmove", d.targets, j, {
				touch : d
			})
		}
		if (b < k) {
			this.invokeRecognizers("onTouchMove", j)
		}
	},
	onTouchEnd : function (d) {
		if (!this.isStarted) {
			return
		}
		var h = this.currentTargets,
		c = this.currentTouches,
		k = d.changedTouches,
		g = k.length,
		j,
		f,
		b,
		a;
		d.setTargets(h);
		this.currentTouchesCount -= g;
		j = (this.currentTouchesCount === 0);
		if (j) {
			this.isStarted = false
		}
		for (b = 0; b < g; b++) {
			a = k[b];
			f = a.identifier;
			delete c[f];
			delete h[f];
			this.publish("touchend", a.targets, d, {
				touch : a
			})
		}
		this.invokeRecognizers("onTouchEnd", d);
		if (j) {
			this.invokeRecognizers("onEnd", d)
		}
	}
}, function () {
	if (!Ext.feature.has.Touch) {
		this.override({
			moveEventName : "mousemove",
			map : {
				mouseToTouch : {
					mousedown : "touchstart",
					mousemove : "touchmove",
					mouseup : "touchend"
				},
				touchToMouse : {
					touchstart : "mousedown",
					touchmove : "mousemove",
					touchend : "mouseup"
				}
			},
			attachListener : function (a) {
				a = this.map.touchToMouse[a];
				if (!a) {
					return
				}
				return this.callOverridden([a])
			},
			lastEventType : null,
			onEvent : function (d) {
				if ("button" in d && d.button !== 0) {
					return
				}
				var c = d.type,
				b = [d];
				if (c === "mousedown" && this.lastEventType && this.lastEventType !== "mouseup") {
					var a = document.createEvent("MouseEvent");
					a.initMouseEvent("mouseup", d.bubbles, d.cancelable, document.defaultView, d.detail, d.screenX, d.screenY, d.clientX, d.clientY, d.ctrlKey, d.altKey, d.shiftKey, d.metaKey, d.metaKey, d.button, d.relatedTarget);
					this.onEvent(a)
				}
				if (c !== "mousemove") {
					this.lastEventType = c
				}
				d.identifier = 1;
				d.touches = (c !== "mouseup") ? b : [];
				d.targetTouches = (c !== "mouseup") ? b : [];
				d.changedTouches = b;
				return this.callOverridden([d])
			},
			processEvent : function (a) {
				this.eventProcessors[this.map.mouseToTouch[a.type]].call(this, a)
			}
		})
	}
});
Ext.define("Ext.event.recognizer.Recognizer", {
	mixins : ["Ext.mixin.Identifiable"],
	handledEvents : [],
	config : {
		onRecognized : Ext.emptyFn,
		onFailed : Ext.emptyFn,
		callbackScope : null
	},
	constructor : function (a) {
		this.initConfig(a);
		return this
	},
	getHandledEvents : function () {
		return this.handledEvents
	},
	onStart : Ext.emptyFn,
	onEnd : Ext.emptyFn,
	fail : function () {
		this.getOnFailed().apply(this.getCallbackScope(), arguments);
		return false
	},
	fire : function () {
		this.getOnRecognized().apply(this.getCallbackScope(), arguments)
	}
});
Ext.define("Ext.event.recognizer.Touch", {
	extend : "Ext.event.recognizer.Recognizer",
	onTouchStart : Ext.emptyFn,
	onTouchMove : Ext.emptyFn,
	onTouchEnd : Ext.emptyFn
});
Ext.define("Ext.event.recognizer.SingleTouch", {
	extend : "Ext.event.recognizer.Touch",
	inheritableStatics : {
		NOT_SINGLE_TOUCH : 1,
		TOUCH_MOVED : 2
	},
	onTouchStart : function (a) {
		if (a.touches.length > 1) {
			return this.fail(this.self.NOT_SINGLE_TOUCH)
		}
	}
});
Ext.define("Ext.event.recognizer.Drag", {
	extend : "Ext.event.recognizer.SingleTouch",
	isStarted : false,
	startPoint : null,
	previousPoint : null,
	lastPoint : null,
	handledEvents : ["dragstart", "drag", "dragend"],
	onTouchStart : function (b) {
		var c,
		a;
		if (this.callParent(arguments) === false) {
			if (this.isStarted && this.lastMoveEvent !== null) {
				this.onTouchEnd(this.lastMoveEvent)
			}
			return false
		}
		this.startTouches = c = b.changedTouches;
		this.startTouch = a = c[0];
		this.startPoint = a.point
	},
	onTouchMove : function (d) {
		var c = d.changedTouches,
		f = c[0],
		a = f.point,
		b = d.time;
		if (this.lastPoint) {
			this.previousPoint = this.lastPoint
		}
		if (this.lastTime) {
			this.previousTime = this.lastTime
		}
		this.lastTime = b;
		this.lastPoint = a;
		this.lastMoveEvent = d;
		if (!this.isStarted) {
			this.isStarted = true;
			this.startTime = b;
			this.previousTime = b;
			this.previousPoint = this.startPoint;
			this.fire("dragstart", d, this.startTouches, this.getInfo(d, this.startTouch))
		} else {
			this.fire("drag", d, c, this.getInfo(d, f))
		}
	},
	onTouchEnd : function (c) {
		if (this.isStarted) {
			var b = c.changedTouches,
			d = b[0],
			a = d.point;
			this.isStarted = false;
			this.lastPoint = a;
			this.fire("dragend", c, b, this.getInfo(c, d));
			this.startTime = 0;
			this.previousTime = 0;
			this.lastTime = 0;
			this.startPoint = null;
			this.previousPoint = null;
			this.lastPoint = null;
			this.lastMoveEvent = null
		}
	},
	getInfo : function (j, i) {
		var d = j.time,
		a = this.startPoint,
		f = this.previousPoint,
		b = this.startTime,
		k = this.previousTime,
		l = this.lastPoint,
		h = l.x - a.x,
		g = l.y - a.y,
		c = {
			touch : i,
			startX : a.x,
			startY : a.y,
			previousX : f.x,
			previousY : f.y,
			pageX : l.x,
			pageY : l.y,
			deltaX : h,
			deltaY : g,
			absDeltaX : Math.abs(h),
			absDeltaY : Math.abs(g),
			previousDeltaX : l.x - f.x,
			previousDeltaY : l.y - f.y,
			time : d,
			startTime : b,
			previousTime : k,
			deltaTime : d - b,
			previousDeltaTime : d - k
		};
		return c
	}
});
Ext.define("Ext.event.recognizer.Tap", {
	handledEvents : ["tap"],
	extend : "Ext.event.recognizer.SingleTouch",
	onTouchMove : function () {
		return this.fail(this.self.TOUCH_MOVED)
	},
	onTouchEnd : function (a) {
		var b = a.changedTouches[0];
		this.fire("tap", a, [b])
	}
}, function () {});
Ext.define("Ext.event.recognizer.DoubleTap", {
	extend : "Ext.event.recognizer.SingleTouch",
	config : {
		maxDuration : 300
	},
	handledEvents : ["singletap", "doubletap"],
	singleTapTimer : null,
	onTouchStart : function (a) {
		if (this.callParent(arguments) === false) {
			return false
		}
		this.startTime = a.time;
		clearTimeout(this.singleTapTimer)
	},
	onTouchMove : function () {
		return this.fail(this.self.TOUCH_MOVED)
	},
	onEnd : function (g) {
		var c = this,
		b = this.getMaxDuration(),
		h = g.changedTouches[0],
		f = g.time,
		a = this.lastTapTime,
		d;
		this.lastTapTime = f;
		if (a) {
			d = f - a;
			if (d <= b) {
				this.lastTapTime = 0;
				this.fire("doubletap", g, [h], {
					touch : h,
					duration : d
				});
				return
			}
		}
		if (f - this.startTime > b) {
			this.fireSingleTap(g, h)
		} else {
			this.singleTapTimer = setTimeout(function () {
					c.fireSingleTap(g, h)
				}, b)
		}
	},
	fireSingleTap : function (a, b) {
		this.fire("singletap", a, [b], {
			touch : b
		})
	}
});
Ext.define("Ext.event.recognizer.LongPress", {
	extend : "Ext.event.recognizer.SingleTouch",
	inheritableStatics : {
		DURATION_NOT_ENOUGH : 32
	},
	config : {
		minDuration : 1000
	},
	handledEvents : ["longpress"],
	fireLongPress : function (a) {
		var b = a.changedTouches[0];
		this.fire("longpress", a, [b], {
			touch : b,
			duration : this.getMinDuration()
		});
		this.isLongPress = true
	},
	onTouchStart : function (b) {
		var a = this;
		if (this.callParent(arguments) === false) {
			return false
		}
		this.isLongPress = false;
		this.timer = setTimeout(function () {
				a.fireLongPress(b)
			}, this.getMinDuration())
	},
	onTouchMove : function () {
		return this.fail(this.self.TOUCH_MOVED)
	},
	onTouchEnd : function () {
		if (!this.isLongPress) {
			return this.fail(this.self.DURATION_NOT_ENOUGH)
		}
	},
	fail : function () {
		clearTimeout(this.timer);
		return this.callParent(arguments)
	}
}, function () {
	this.override({
		handledEvents : ["longpress", "taphold"],
		fire : function (a) {
			if (a === "longpress") {
				var b = Array.prototype.slice.call(arguments);
				b[0] = "taphold";
				this.fire.apply(this, b)
			}
			return this.callOverridden(arguments)
		}
	})
});
Ext.define("Ext.event.recognizer.Swipe", {
	extend : "Ext.event.recognizer.SingleTouch",
	handledEvents : ["swipe"],
	inheritableStatics : {
		MAX_OFFSET_EXCEEDED : 16,
		MAX_DURATION_EXCEEDED : 17,
		DISTANCE_NOT_ENOUGH : 18
	},
	config : {
		minDistance : 80,
		maxOffset : 35,
		maxDuration : 1000
	},
	onTouchStart : function (a) {
		if (this.callParent(arguments) === false) {
			return false
		}
		var b = a.changedTouches[0];
		this.startTime = a.time;
		this.isHorizontal = true;
		this.isVertical = true;
		this.startX = b.pageX;
		this.startY = b.pageY
	},
	onTouchMove : function (f) {
		var h = f.changedTouches[0],
		b = h.pageX,
		g = h.pageY,
		c = Math.abs(b - this.startX),
		a = Math.abs(g - this.startY),
		d = f.time;
		if (d - this.startTime > this.getMaxDuration()) {
			return this.fail(this.self.MAX_DURATION_EXCEEDED)
		}
		if (this.isVertical && c > this.getMaxOffset()) {
			this.isVertical = false
		}
		if (this.isHorizontal && a > this.getMaxOffset()) {
			this.isHorizontal = false
		}
		if (!this.isHorizontal && !this.isVertical) {
			return this.fail(this.self.MAX_OFFSET_EXCEEDED)
		}
	},
	onTouchEnd : function (i) {
		if (this.onTouchMove(i) === false) {
			return false
		}
		var h = i.changedTouches[0],
		l = h.pageX,
		j = h.pageY,
		g = l - this.startX,
		f = j - this.startY,
		c = Math.abs(g),
		b = Math.abs(f),
		m = this.getMinDistance(),
		d = i.time - this.startTime,
		k,
		a;
		if (this.isVertical && b < m) {
			this.isVertical = false
		}
		if (this.isHorizontal && c < m) {
			this.isHorizontal = false
		}
		if (this.isHorizontal) {
			k = (g < 0) ? "left" : "right";
			a = c
		} else {
			if (this.isVertical) {
				k = (f < 0) ? "up" : "down";
				a = b
			} else {
				return this.fail(this.self.DISTANCE_NOT_ENOUGH)
			}
		}
		this.fire("swipe", i, [h], {
			touch : h,
			direction : k,
			distance : a,
			duration : d
		})
	}
});
Ext.define("Ext.event.recognizer.HorizontalSwipe", {
	extend : "Ext.event.recognizer.Swipe",
	handledEvents : ["swipe"],
	onTouchStart : function (a) {
		if (this.callParent(arguments) === false) {
			return false
		}
		var b = a.changedTouches[0];
		this.startTime = a.time;
		this.startX = b.pageX;
		this.startY = b.pageY
	},
	onTouchMove : function (f) {
		var h = f.changedTouches[0],
		g = h.pageY,
		a = Math.abs(g - this.startY),
		d = f.time,
		c = this.getMaxDuration(),
		b = this.getMaxOffset();
		if (d - this.startTime > c) {
			return this.fail(this.self.MAX_DURATION_EXCEEDED)
		}
		if (a > b) {
			return this.fail(this.self.MAX_OFFSET_EXCEEDED)
		}
	},
	onTouchEnd : function (f) {
		if (this.onTouchMove(f) !== false) {
			var i = f.changedTouches[0],
			a = i.pageX,
			b = a - this.startX,
			h = Math.abs(b),
			d = f.time - this.startTime,
			g = this.getMinDistance(),
			c;
			if (h < g) {
				return this.fail(this.self.DISTANCE_NOT_ENOUGH)
			}
			c = (b < 0) ? "left" : "right";
			this.fire("swipe", f, [i], {
				touch : i,
				direction : c,
				distance : h,
				duration : d
			})
		}
	}
});
Ext.define("Ext.event.recognizer.MultiTouch", {
	extend : "Ext.event.recognizer.Touch",
	requiredTouchesCount : 2,
	isTracking : false,
	isStarted : false,
	onTouchStart : function (d) {
		var a = this.requiredTouchesCount,
		c = d.touches,
		b = c.length;
		if (b === a) {
			this.start(d)
		} else {
			if (b > a) {
				this.end(d)
			}
		}
	},
	onTouchEnd : function (a) {
		this.end(a)
	},
	start : function () {
		if (!this.isTracking) {
			this.isTracking = true;
			this.isStarted = false
		}
	},
	end : function (a) {
		if (this.isTracking) {
			this.isTracking = false;
			if (this.isStarted) {
				this.isStarted = false;
				this.fireEnd(a)
			}
		}
	}
});
Ext.define("Ext.event.recognizer.Pinch", {
	extend : "Ext.event.recognizer.MultiTouch",
	requiredTouchesCount : 2,
	handledEvents : ["pinchstart", "pinch", "pinchend"],
	startDistance : 0,
	lastTouches : null,
	onTouchMove : function (c) {
		if (!this.isTracking) {
			return
		}
		var b = Array.prototype.slice.call(c.touches),
		d,
		a,
		f;
		d = b[0].point;
		a = b[1].point;
		f = d.getDistanceTo(a);
		if (f === 0) {
			return
		}
		if (!this.isStarted) {
			this.isStarted = true;
			this.startDistance = f;
			this.fire("pinchstart", c, b, {
				touches : b,
				distance : f,
				scale : 1
			})
		} else {
			this.fire("pinch", c, b, {
				touches : b,
				distance : f,
				scale : f / this.startDistance
			})
		}
		this.lastTouches = b
	},
	fireEnd : function (a) {
		this.fire("pinchend", a, this.lastTouches)
	},
	fail : function () {
		return this.callParent(arguments)
	}
});
Ext.define("Ext.event.recognizer.Rotate", {
	extend : "Ext.event.recognizer.MultiTouch",
	requiredTouchesCount : 2,
	handledEvents : ["rotatestart", "rotate", "rotateend"],
	startAngle : 0,
	lastTouches : null,
	lastAngle : null,
	onTouchMove : function (h) {
		if (!this.isTracking) {
			return
		}
		var g = Array.prototype.slice.call(h.touches),
		b = this.lastAngle,
		d,
		f,
		c,
		a,
		i,
		j;
		d = g[0].point;
		f = g[1].point;
		c = d.getAngleTo(f);
		if (b !== null) {
			j = Math.abs(b - c);
			a = c + 360;
			i = c - 360;
			if (Math.abs(a - b) < j) {
				c = a
			} else {
				if (Math.abs(i - b) < j) {
					c = i
				}
			}
		}
		this.lastAngle = c;
		if (!this.isStarted) {
			this.isStarted = true;
			this.startAngle = c;
			this.fire("rotatestart", h, g, {
				touches : g,
				angle : c,
				rotation : 0
			})
		} else {
			this.fire("rotate", h, g, {
				touches : g,
				angle : c,
				rotation : c - this.startAngle
			})
		}
		this.lastTouches = g
	},
	fireEnd : function (a) {
		this.lastAngle = null;
		this.fire("rotateend", a, this.lastTouches)
	}
});
Ext.define("Ext.ComponentQuery", {
	singleton : true,
	uses : ["Ext.ComponentManager"]
}, function () {
	var g = this,
	j = ["var r = [],", "i = 0,", "it = items,", "l = it.length,", "c;", "for (; i < l; i++) {", "c = it[i];", "if (c.{0}) {", "r.push(c);", "}", "}", "return r;"].join(""),
	e = function (o, n) {
		return n.method.apply(this, [o].concat(n.args))
	},
	a = function (p, t) {
		var n = [],
		q = 0,
		s = p.length,
		r,
		o = t !== ">";
		for (; q < s; q++) {
			r = p[q];
			if (r.getRefItems) {
				n = n.concat(r.getRefItems(o))
			}
		}
		return n
	},
	f = function (o) {
		var n = [],
		p = 0,
		r = o.length,
		q;
		for (; p < r; p++) {
			q = o[p];
			while (!!(q = (q.ownerCt || q.floatParent))) {
				n.push(q)
			}
		}
		return n
	},
	l = function (o, t, s) {
		if (t === "*") {
			return o.slice()
		} else {
			var n = [],
			p = 0,
			r = o.length,
			q;
			for (; p < r; p++) {
				q = o[p];
				if (q.isXType(t, s)) {
					n.push(q)
				}
			}
			return n
		}
	},
	i = function (o, r) {
		var t = Ext.Array,
		n = [],
		p = 0,
		s = o.length,
		q;
		for (; p < s; p++) {
			q = o[p];
			if (q.el ? q.el.hasCls(r) : t.contains(q.initCls(), r)) {
				n.push(q)
			}
		}
		return n
	},
	m = function (r, u, o, t) {
		var w = [],
		q = 0,
		n = r.length,
		v,
		s,
		p;
		for (; q < n; q++) {
			v = r[q];
			s = Ext.Class.getConfigNameMap(u).get;
			if (v[s]) {
				p = v[s]();
				if (!t ? !!p : (String(p) === t)) {
					w.push(v)
				}
			} else {
				if (v.config && v.config[u]) {
					if (!t ? !!v.config[u] : (String(v.config[u]) === t)) {
						w.push(v)
					}
				} else {
					if (!t ? !!v[u] : (String(v[u]) === t)) {
						w.push(v)
					}
				}
			}
		}
		return w
	},
	d = function (o, s) {
		var n = [],
		p = 0,
		r = o.length,
		q;
		for (; p < r; p++) {
			q = o[p];
			if (q.getId() === s || q.getItemId() === s) {
				n.push(q)
			}
		}
		return n
	},
	k = function (n, o, p) {
		return g.pseudos[o](n, p)
	},
	h = /^(\s?([>\^])\s?|\s|$)/,
	c = /^(#)?([\w\-]+|\*)(?:\((true|false)\))?/,
	b = [{
			re : /^\.([\w\-]+)(?:\((true|false)\))?/,
			method : l
		}, {
			re : /^(?:[\[](?:@)?([\w\-]+)\s?(?:(=|.=)\s?['"]?(.*?)["']?)?[\]])/,
			method : m
		}, {
			re : /^#([\w\-]+)/,
			method : d
		}, {
			re : /^\:([\w\-]+)(?:\(((?:\{[^\}]+\})|(?:(?!\{)[^\s>\/]*?(?!\})))\))?/,
			method : k
		}, {
			re : /^(?:\{([^\}]+)\})/,
			method : j
		}
	];
	g.Query = Ext.extend(Object, {
			constructor : function (n) {
				n = n || {};
				Ext.apply(this, n)
			},
			execute : function (o) {
				var q = this.operations,
				r = 0,
				s = q.length,
				p,
				n;
				if (!o) {
					n = Ext.ComponentManager.all.getArray()
				} else {
					if (Ext.isArray(o)) {
						n = o
					}
				}
				for (; r < s; r++) {
					p = q[r];
					if (p.mode === "^") {
						n = f(n || [o])
					} else {
						if (p.mode) {
							n = a(n || [o], p.mode)
						} else {
							n = e(n || a([o]), p)
						}
					}
					if (r === s - 1) {
						return n
					}
				}
				return []
			},
			is : function (p) {
				var o = this.operations,
				s = Ext.isArray(p) ? p : [p],
				n = s.length,
				t = o[o.length - 1],
				r,
				q;
				s = e(s, t);
				if (s.length === n) {
					if (o.length > 1) {
						for (q = 0, r = s.length; q < r; q++) {
							if (Ext.Array.indexOf(this.execute(), s[q]) === -1) {
								return false
							}
						}
					}
					return true
				}
				return false
			}
		});
	Ext.apply(this, {
		cache : {},
		pseudos : {
			not : function (t, n) {
				var u = Ext.ComponentQuery,
				r = 0,
				s = t.length,
				q = [],
				p = -1,
				o;
				for (; r < s; ++r) {
					o = t[r];
					if (!u.is(o, n)) {
						q[++p] = o
					}
				}
				return q
			}
		},
		query : function (o, v) {
			var w = o.split(","),
			n = w.length,
			p = 0,
			q = [],
			x = [],
			u = {},
			s,
			r,
			t;
			for (; p < n; p++) {
				o = Ext.String.trim(w[p]);
				s = this.parse(o);
				q = q.concat(s.execute(v))
			}
			if (n > 1) {
				r = q.length;
				for (p = 0; p < r; p++) {
					t = q[p];
					if (!u[t.id]) {
						x.push(t);
						u[t.id] = true
					}
				}
				q = x
			}
			return q
		},
		is : function (o, n) {
			if (!n) {
				return true
			}
			var p = this.cache[n];
			if (!p) {
				this.cache[n] = p = this.parse(n)
			}
			return p.is(o)
		},
		parse : function (q) {
			var o = [],
			p = b.length,
			u,
			r,
			v,
			w,
			x,
			s,
			t,
			n;
			while (q && u !== q) {
				u = q;
				r = q.match(c);
				if (r) {
					v = r[1];
					if (v === "#") {
						o.push({
							method : d,
							args : [Ext.String.trim(r[2])]
						})
					} else {
						if (v === ".") {
							o.push({
								method : i,
								args : [Ext.String.trim(r[2])]
							})
						} else {
							o.push({
								method : l,
								args : [Ext.String.trim(r[2]), Boolean(r[3])]
							})
						}
					}
					q = q.replace(r[0], "")
				}
				while (!(w = q.match(h))) {
					for (s = 0; q && s < p; s++) {
						t = b[s];
						x = q.match(t.re);
						n = t.method;
						if (x) {
							o.push({
								method : Ext.isString(t.method) ? Ext.functionFactory("items", Ext.String.format.apply(Ext.String, [n].concat(x.slice(1)))) : t.method,
								args : x.slice(1)
							});
							q = q.replace(x[0], "");
							break
						}
					}
				}
				if (w[1]) {
					o.push({
						mode : w[2] || w[1]
					});
					q = q.replace(w[0], "")
				}
			}
			return new g.Query({
				operations : o
			})
		}
	})
});
Ext.define("Ext.ComponentManager", {
	alternateClassName : "Ext.ComponentMgr",
	singleton : true,
	constructor : function () {
		var a = {};
		this.all = {
			map : a,
			getArray : function () {
				var b = [],
				c;
				for (c in a) {
					b.push(a[c])
				}
				return b
			}
		};
		this.map = a
	},
	register : function (a) {
		var b = a.getId();
		this.map[a.getId()] = a
	},
	unregister : function (a) {
		delete this.map[a.getId()]
	},
	isRegistered : function (a) {
		return this.map[a] !== undefined
	},
	get : function (a) {
		return this.map[a]
	},
	create : function (a, c) {
		if (a.isComponent) {
			return a
		} else {
			if (Ext.isString(a)) {
				return Ext.createByAlias("widget." + a)
			} else {
				var b = a.xtype || c;
				return Ext.createByAlias("widget." + b, a)
			}
		}
	},
	registerType : Ext.emptyFn
});
Ext.define("Ext.mixin.Mixin", {
	onClassExtended : function (b, e) {
		var a = e.mixinConfig,
		d,
		f,
		c;
		if (a) {
			d = b.superclass.mixinConfig;
			if (d) {
				a = e.mixinConfig = Ext.merge({}, d, a)
			}
			e.mixinId = a.id;
			f = a.beforeHooks;
			c = a.hooks || a.afterHooks;
			if (f || c) {
				Ext.Function.interceptBefore(e, "onClassMixedIn", function (h) {
					var g = this.prototype;
					if (f) {
						Ext.Object.each(f, function (j, i) {
							h.override(i, function () {
								if (g[j].apply(this, arguments) !== false) {
									return this.callOverridden(arguments)
								}
							})
						})
					}
					if (c) {
						Ext.Object.each(c, function (j, i) {
							h.override(i, function () {
								var k = this.callOverridden(arguments);
								g[j].apply(this, arguments);
								return k
							})
						})
					}
				})
			}
		}
	}
});
Ext.define("Ext.behavior.Behavior", {
	constructor : function (a) {
		this.component = a;
		a.on("destroy", "onComponentDestroy", this)
	},
	onComponentDestroy : Ext.emptyFn
});
Ext.define("Ext.mixin.Observable", {
	requires : ["Ext.event.Dispatcher"],
	extend : "Ext.mixin.Mixin",
	mixins : ["Ext.mixin.Identifiable"],
	mixinConfig : {
		id : "observable",
		hooks : {
			destroy : "destroy"
		}
	},
	alternateClassName : "Ext.util.Observable",
	isObservable : true,
	observableType : "observable",
	validIdRegex : /^([\w\-]+)$/,
	observableIdPrefix : "#",
	listenerOptionsRegex : /^(?:delegate|single|delay|buffer|args|prepend)$/,
	config : {
		listeners : null,
		bubbleEvents : null
	},
	constructor : function (a) {
		this.initConfig(a)
	},
	applyListeners : function (a) {
		if (a) {
			this.addListener(a)
		}
	},
	applyBubbleEvents : function (a) {
		if (a) {
			this.enableBubble(a)
		}
	},
	getOptimizedObservableId : function () {
		return this.observableId
	},
	getObservableId : function () {
		if (!this.observableId) {
			var a = this.getUniqueId();
			this.observableId = this.observableIdPrefix + a;
			this.getObservableId = this.getOptimizedObservableId
		}
		return this.observableId
	},
	getOptimizedEventDispatcher : function () {
		return this.eventDispatcher
	},
	getEventDispatcher : function () {
		if (!this.eventDispatcher) {
			this.eventDispatcher = Ext.event.Dispatcher.getInstance();
			this.getEventDispatcher = this.getOptimizedEventDispatcher;
			this.getListeners();
			this.getBubbleEvents()
		}
		return this.eventDispatcher
	},
	getManagedListeners : function (c, b) {
		var d = c.getUniqueId(),
		a = this.managedListeners;
		if (!a) {
			this.managedListeners = a = {}
			
		}
		if (!a[d]) {
			a[d] = {};
			c.doAddListener("destroy", "clearManagedListeners", this, {
				single : true,
				args : [c]
			})
		}
		if (!a[d][b]) {
			a[d][b] = []
		}
		return a[d][b]
	},
	getUsedSelectors : function () {
		var a = this.usedSelectors;
		if (!a) {
			a = this.usedSelectors = [];
			a.$map = {}
			
		}
		return a
	},
	fireEvent : function (a) {
		var b = Array.prototype.slice.call(arguments, 1);
		return this.doFireEvent(a, b)
	},
	fireAction : function (c, e, g, f, d, a) {
		var b = typeof g,
		h;
		if (e === undefined) {
			e = []
		}
		if (b != "undefined") {
			h = {
				fn : g,
				isLateBinding : b == "string",
				scope : f || this,
				options : d || {},
				order : a
			}
		}
		return this.doFireEvent(c, e, h)
	},
	doFireEvent : function (b, c, e, a) {
		if (this.eventFiringSuspended) {
			return
		}
		var f = this.getObservableId(),
		d = this.getEventDispatcher();
		return d.dispatchEvent(this.observableType, f, b, c, e, a)
	},
	doAddListener : function (a, i, k, l, c) {
		var e = (k && k !== this && k.isIdentifiable),
		b = this.getUsedSelectors(),
		f = b.$map,
		d = this.getObservableId(),
		g,
		j,
		h;
		if (!l) {
			l = {}
			
		}
		if (!k) {
			k = this
		}
		if (l.delegate) {
			h = l.delegate;
			d += " " + h
		}
		if (!(d in f)) {
			f[d] = true;
			b.push(d)
		}
		g = this.addDispatcherListener(d, a, i, k, l, c);
		if (g && e) {
			j = this.getManagedListeners(k, a);
			j.push({
				delegate : h,
				scope : k,
				fn : i,
				order : c
			})
		}
		return g
	},
	addDispatcherListener : function (b, d, f, e, c, a) {
		return this.getEventDispatcher().addListener(this.observableType, b, d, f, e, c, a)
	},
	doRemoveListener : function (b, k, m, n, d) {
		var g = (m && m !== this && m.isIdentifiable),
		e = this.getObservableId(),
		a,
		l,
		f,
		h,
		c,
		j;
		if (n && n.delegate) {
			j = n.delegate;
			e += " " + j
		}
		if (!m) {
			m = this
		}
		a = this.removeDispatcherListener(e, b, k, m, d);
		if (a && g) {
			l = this.getManagedListeners(m, b);
			for (f = 0, h = l.length; f < h; f++) {
				c = l[f];
				if (c.fn === k && c.scope === m && c.delegate === j && c.order === d) {
					l.splice(f, 1);
					break
				}
			}
		}
		return a
	},
	removeDispatcherListener : function (b, c, e, d, a) {
		return this.getEventDispatcher().removeListener(this.observableType, b, c, e, d, a)
	},
	clearManagedListeners : function (d) {
		var j = this.managedListeners,
		a,
		c,
		h,
		f,
		e,
		g,
		b,
		k;
		if (!j) {
			return this
		}
		if (d) {
			if (typeof d != "string") {
				a = d.getUniqueId()
			} else {
				a = d
			}
			c = j[a];
			for (f in c) {
				if (c.hasOwnProperty(f)) {
					h = c[f];
					for (e = 0, g = h.length; e < g; e++) {
						b = h[e];
						k = {};
						if (b.delegate) {
							k.delegate = b.delegate
						}
						if (this.doRemoveListener(f, b.fn, b.scope, k, b.order)) {
							e--;
							g--
						}
					}
				}
			}
			delete j[a];
			return this
		}
		for (a in j) {
			if (j.hasOwnProperty(a)) {
				this.clearManagedListeners(a)
			}
		}
	},
	changeListener : function (l, h, n, p, q, d) {
		var b,
		m,
		g,
		j,
		a,
		o,
		f,
		k,
		c,
		e;
		if (typeof n != "undefined") {
			if (typeof h != "string") {
				for (f = 0, k = h.length; f < k; f++) {
					a = h[f];
					l.call(this, a, n, p, q, d)
				}
				return this
			}
			l.call(this, h, n, p, q, d)
		} else {
			if (Ext.isArray(h)) {
				m = h;
				for (f = 0, k = m.length; f < k; f++) {
					c = m[f];
					l.call(this, c.event, c.fn, c.scope, c, c.order)
				}
			} else {
				g = this.listenerOptionsRegex;
				q = h;
				b = [];
				m = [];
				j = {};
				for (a in q) {
					o = q[a];
					if (a === "scope") {
						p = o;
						continue
					} else {
						if (a === "order") {
							d = o;
							continue
						}
					}
					if (!g.test(a)) {
						e = typeof o;
						if (e != "string" && e != "function") {
							l.call(this, a, o.fn, o.scope || p, o, o.order || d);
							continue
						}
						b.push(a);
						m.push(o)
					} else {
						j[a] = o
					}
				}
				for (f = 0, k = b.length; f < k; f++) {
					l.call(this, b[f], m[f], p, j, d)
				}
			}
		}
	},
	addListener : function (b, e, d, c, a) {
		return this.changeListener(this.doAddListener, b, e, d, c, a)
	},
	addBeforeListener : function (a, d, c, b) {
		return this.addListener(a, d, c, b, "before")
	},
	addAfterListener : function (a, d, c, b) {
		return this.addListener(a, d, c, b, "after")
	},
	removeListener : function (b, e, d, c, a) {
		return this.changeListener(this.doRemoveListener, b, e, d, c, a)
	},
	removeBeforeListener : function (a, d, c, b) {
		return this.removeListener(a, d, c, b, "before")
	},
	removeAfterListener : function (a, d, c, b) {
		return this.removeListener(a, d, c, b, "after")
	},
	clearListeners : function () {
		var e = this.getUsedSelectors(),
		c = this.getEventDispatcher(),
		b,
		d,
		a;
		for (b = 0, d = e.length; b < d; b++) {
			a = e[b];
			c.clearListeners(this.observableType, a)
		}
	},
	hasListener : function (a) {
		return this.getEventDispatcher().hasListener(this.observableType, this.getObservableId(), a)
	},
	suspendEvents : function (a) {
		this.eventFiringSuspended = true
	},
	resumeEvents : function () {
		this.eventFiringSuspended = false
	},
	relayEvents : function (b, d, g) {
		var c,
		f,
		e,
		a;
		if (typeof g == "undefined") {
			g = ""
		}
		if (typeof d == "string") {
			d = [d]
		}
		if (Ext.isArray(d)) {
			for (c = 0, f = d.length; c < f; c++) {
				e = d[c];
				a = g + e;
				b.addListener(e, this.createEventRelayer(a), this)
			}
		} else {
			for (e in d) {
				if (d.hasOwnProperty(e)) {
					a = g + d[e];
					b.addListener(e, this.createEventRelayer(a), this)
				}
			}
		}
		return this
	},
	relayEvent : function (e, f, h, i, a) {
		var g = typeof f,
		c = e[e.length - 1],
		d = c.getInfo().eventName,
		b;
		e = Array.prototype.slice.call(e, 0, -2);
		e[0] = this;
		if (g != "undefined") {
			b = {
				fn : f,
				scope : h || this,
				options : i || {},
				order : a,
				isLateBinding : g == "string"
			}
		}
		return this.doFireEvent(d, e, b, c)
	},
	createEventRelayer : function (a) {
		return function () {
			return this.doFireEvent(a, Array.prototype.slice.call(arguments, 0, -2))
		}
	},
	enableBubble : function (d) {
		var a = this.isBubblingEnabled,
		c,
		e,
		b;
		if (!a) {
			a = this.isBubblingEnabled = {}
			
		}
		if (typeof d == "string") {
			d = Ext.Array.clone(arguments)
		}
		for (c = 0, e = d.length; c < e; c++) {
			b = d[c];
			if (!a[b]) {
				a[b] = true;
				this.addListener(b, this.createEventBubbler(b), this)
			}
		}
	},
	createEventBubbler : function (a) {
		return function b() {
			var c = ("getBubbleTarget" in this) ? this.getBubbleTarget() : null;
			if (c && c !== this && c.isObservable) {
				c.fireAction(a, Array.prototype.slice.call(arguments, 0, -2), b, c, null, "after")
			}
		}
	},
	getBubbleTarget : function () {
		return false
	},
	destroy : function () {
		if (this.observableId) {
			this.fireEvent("destroy", this);
			this.clearListeners();
			this.clearManagedListeners()
		}
	},
	addEvents : Ext.emptyFn
}, function () {
	this.createAlias({
		on : "addListener",
		un : "removeListener",
		onBefore : "addBeforeListener",
		onAfter : "addAfterListener",
		unBefore : "removeBeforeListener",
		unAfter : "removeAfterListener"
	})
});
Ext.define("Ext.XTemplateParser", {
	constructor : function (a) {
		Ext.apply(this, a)
	},
	doTpl : Ext.emptyFn,
	parse : function (n) {
		var o = this,
		l = n.length,
		c = {
			elseif : "elif"
		},
		j = o.topRe,
		b = o.actionsRe,
		k,
		p,
		r,
		f,
		q,
		g,
		a,
		e,
		d,
		h,
		i;
		o.level = 0;
		o.stack = p = [];
		for (k = 0; k < l; k = h) {
			j.lastIndex = k;
			f = j.exec(n);
			if (!f) {
				o.doText(n.substring(k, l));
				break
			}
			d = f.index;
			h = j.lastIndex;
			if (k < d) {
				o.doText(n.substring(k, d))
			}
			if (f[1]) {
				h = n.indexOf("%}", d + 2);
				o.doEval(n.substring(d + 2, h));
				h += 2
			} else {
				if (f[2]) {
					h = n.indexOf("]}", d + 2);
					o.doExpr(n.substring(d + 2, h));
					h += 2
				} else {
					if (f[3]) {
						o.doTag(f[3])
					} else {
						if (f[4]) {
							i = null;
							while ((e = b.exec(f[4])) !== null) {
								r = e[2] || e[3];
								if (r) {
									r = Ext.String.htmlDecode(r);
									q = e[1];
									q = c[q] || q;
									i = i || {};
									g = i[q];
									if (typeof g == "string") {
										i[q] = [g, r]
									} else {
										if (g) {
											i[q].push(r)
										} else {
											i[q] = r
										}
									}
								}
							}
							if (!i) {
								if (o.elseRe.test(f[4])) {
									o.doElse()
								} else {
									if (o.defaultRe.test(f[4])) {
										o.doDefault()
									} else {
										o.doTpl();
										p.push({
											type : "tpl"
										})
									}
								}
							} else {
								if (i["if"]) {
									o.doIf(i["if"], i);
									p.push({
										type : "if"
									})
								} else {
									if (i["switch"]) {
										o.doSwitch(i["switch"], i);
										p.push({
											type : "switch"
										})
									} else {
										if (i["case"]) {
											o.doCase(i["case"], i)
										} else {
											if (i.elif) {
												o.doElseIf(i.elif, i)
											} else {
												if (i["for"]) {
													++o.level;
													o.doFor(i["for"], i);
													p.push({
														type : "for",
														actions : i
													})
												} else {
													if (i.exec) {
														o.doExec(i.exec, i);
														p.push({
															type : "exec",
															actions : i
														})
													}
												}
											}
										}
									}
								}
							}
						} else {
							a = p.pop();
							o.doEnd(a.type, a.actions);
							if (a.type == "for") {
								--o.level
							}
						}
					}
				}
			}
		}
	},
	topRe : /(?:(\{\%)|(\{\[)|\{([^{}]*)\})|(?:<tpl([^>]*)\>)|(?:<\/tpl>)/g,
	actionsRe : /\s*(elif|elseif|if|for|exec|switch|case|eval)\s*\=\s*(?:(?:["]([^"]*)["])|(?:[']([^']*)[']))\s*/g,
	defaultRe : /^\s*default\s*$/,
	elseRe : /^\s*else\s*$/
});
Ext.define("Ext.fx.easing.Abstract", {
	config : {
		startTime : 0,
		startValue : 0
	},
	isEasing : true,
	isEnded : false,
	constructor : function (a) {
		this.initConfig(a);
		return this
	},
	applyStartTime : function (a) {
		if (!a) {
			a = Ext.Date.now()
		}
		return a
	},
	updateStartTime : function (a) {
		this.reset()
	},
	reset : function () {
		this.isEnded = false
	},
	getValue : Ext.emptyFn
});
Ext.define("Ext.mixin.Traversable", {
	extend : "Ext.mixin.Mixin",
	mixinConfig : {
		id : "traversable"
	},
	setParent : function (a) {
		this.parent = a;
		return this
	},
	hasParent : function () {
		return Boolean(this.parent)
	},
	getParent : function () {
		return this.parent
	},
	getAncestors : function () {
		var b = [],
		a = this.getParent();
		while (a) {
			b.push(a);
			a = a.getParent()
		}
		return b
	},
	getAncestorIds : function () {
		var b = [],
		a = this.getParent();
		while (a) {
			b.push(a.getId());
			a = a.getParent()
		}
		return b
	}
});
Ext.define("Ext.Evented", {
	alternateClassName : "Ext.EventedBase",
	mixins : ["Ext.mixin.Observable"],
	statics : {
		generateSetter : function (e) {
			var c = e.internal,
			b = e.apply,
			a = e.changeEvent,
			d = e.doSet;
			return function (h) {
				var i = this.initialized,
				g = this[c],
				f = this[b];
				if (f) {
					h = f.call(this, h, g);
					if (typeof h == "undefined") {
						return this
					}
				}
				g = this[c];
				if (h !== g) {
					if (i) {
						this.fireAction(a, [this, h, g], this.doSet, this, {
							nameMap : e
						})
					} else {
						this[c] = h;
						this[d].call(this, h, g)
					}
				}
				return this
			}
		}
	},
	initialized : false,
	constructor : function (a) {
		this.initialConfig = a;
		this.initialize()
	},
	initialize : function () {
		this.initConfig(this.initialConfig);
		this.initialized = true
	},
	doSet : function (c, d, b, a) {
		var e = a.nameMap;
		c[e.internal] = d;
		c[e.doSet].call(this, d, b)
	},
	onClassExtended : function (a, e) {
		if (!e.hasOwnProperty("eventedConfig")) {
			return
		}
		var d = Ext.Class,
		c = e.config,
		g = e.eventedConfig,
		b,
		f;
		e.config = (c) ? Ext.applyIf(c, g) : g;
		for (b in g) {
			if (g.hasOwnProperty(b)) {
				f = d.getConfigNameMap(b);
				e[f.set] = this.generateSetter(f)
			}
		}
	}
});
Ext.define("Ext.AbstractComponent", {
	extend : "Ext.Evented",
	onClassExtended : function (b, f) {
		if (!f.hasOwnProperty("cachedConfig")) {
			return
		}
		var g = b.prototype,
		c = f.config,
		e = f.cachedConfig,
		d = g.cachedConfigList,
		i = g.hasCachedConfig,
		a,
		h;
		delete f.cachedConfig;
		g.cachedConfigList = d = (d) ? d.slice() : [];
		g.hasCachedConfig = i = (i) ? Ext.Object.chain(i) : {};
		if (!c) {
			f.config = c = {}
			
		}
		for (a in e) {
			if (e.hasOwnProperty(a)) {
				h = e[a];
				if (!i[a]) {
					i[a] = true;
					d.push(a)
				}
				c[a] = h
			}
		}
	},
	getElementConfig : Ext.emptyFn,
	referenceAttributeName : "reference",
	referenceSelector : "[reference]",
	addReferenceNode : function (a, b) {
		Ext.Object.defineProperty(this, a, {
			get : function () {
				var c;
				delete this[a];
				this[a] = c = new Ext.Element(b);
				return c
			},
			configurable : true
		})
	},
	initElement : function () {
		var k = this.self.prototype,
		n = this.getId(),
		s = [],
		g = true,
		x = this.referenceAttributeName,
		p = false,
		e,
		v,
		b,
		o,
		t,
		d,
		l,
		c,
		f,
		j,
		w,
		m,
		a,
		q,
		h,
		y,
		u,
		r;
		if (k.hasOwnProperty("renderTemplate")) {
			e = this.renderTemplate.cloneNode(true);
			v = e.firstChild
		} else {
			g = false;
			p = true;
			e = document.createDocumentFragment();
			v = Ext.Element.create(this.getElementConfig(), true);
			e.appendChild(v)
		}
		o = e.querySelectorAll(this.referenceSelector);
		for (t = 0, d = o.length; t < d; t++) {
			l = o[t];
			c = l.getAttribute(x);
			if (g) {
				l.removeAttribute(x)
			}
			if (c == "element") {
				l.id = n;
				this.element = b = new Ext.Element(l)
			} else {
				this.addReferenceNode(c, l)
			}
			s.push(c)
		}
		this.referenceList = s;
		if (!this.innerElement) {
			this.innerElement = b
		}
		if (v === b.dom) {
			this.renderElement = b
		} else {
			this.addReferenceNode("renderElement", v)
		}
		if (p) {
			f = Ext.Class.configNameCache;
			j = this.config;
			w = this.cachedConfigList;
			m = this.initConfigList;
			a = this.initConfigMap;
			q = [];
			for (t = 0, d = w.length; t < d; t++) {
				y = w[t];
				u = f[y];
				if (a[y]) {
					a[y] = false;
					Ext.Array.remove(m, y)
				}
				if (j[y] !== null) {
					q.push(y);
					this[u.get] = this[u.initGet]
				}
			}
			for (t = 0, d = q.length; t < d; t++) {
				y = q[t];
				u = f[y];
				r = u.internal;
				this[r] = null;
				this[u.set].call(this, j[y]);
				delete this[u.get];
				k[r] = this[r]
			}
			v = this.renderElement.dom;
			k.renderTemplate = e = document.createDocumentFragment();
			e.appendChild(v.cloneNode(true));
			h = e.querySelectorAll("[id]");
			for (t = 0, d = h.length; t < d; t++) {
				b = h[t];
				b.removeAttribute("id")
			}
			for (t = 0, d = s.length; t < d; t++) {
				c = s[t];
				this[c].dom.removeAttribute("reference")
			}
		}
		return this
	}
});
Ext.define("Ext.XTemplateCompiler", {
	extend : "Ext.XTemplateParser",
	useEval : Ext.isGecko,
	useFormat : true,
	propNameRe : /^[\w\d\$]*$/,
	compile : function (a) {
		var c = this,
		b = c.generate(a);
		return c.useEval ? c.evalTpl(b) : (new Function("Ext", b))(Ext)
	},
	generate : function (a) {
		var c = this;
		c.body = ["var c0=values, p0=parent, n0=xcount, i0=xindex;\n"];
		c.funcs = ["var fm=Ext.util.Format;"];
		c.switches = [];
		c.parse(a);
		c.funcs.push((c.useEval ? "$=" : "return") + " function (" + c.fnArgs + ") {", c.body.join(""), "}");
		var b = c.funcs.join("\n");
		return b
	},
	doText : function (a) {
		a = a.replace(this.aposRe, "\\'");
		a = a.replace(this.newLineRe, "\\n");
		this.body.push("out.push('", a, "')\n")
	},
	doExpr : function (a) {
		this.body.push("out.push(String(", a, "))\n")
	},
	doTag : function (a) {
		this.doExpr(this.parseTag(a))
	},
	doElse : function () {
		this.body.push("} else {\n")
	},
	doEval : function (a) {
		this.body.push(a, "\n")
	},
	doIf : function (b, c) {
		var a = this;
		if (a.propNameRe.test(b)) {
			a.body.push("if (", a.parseTag(b), ") {\n")
		} else {
			a.body.push("if (", a.addFn(b), a.callFn, ") {\n")
		}
		if (c.exec) {
			a.doExec(c.exec)
		}
	},
	doElseIf : function (b, c) {
		var a = this;
		if (a.propNameRe.test(b)) {
			a.body.push("} else if (", a.parseTag(b), ") {\n")
		} else {
			a.body.push("} else if (", a.addFn(b), a.callFn, ") {\n")
		}
		if (c.exec) {
			a.doExec(c.exec)
		}
	},
	doSwitch : function (b) {
		var a = this;
		if (a.propNameRe.test(b)) {
			a.body.push("switch (", a.parseTag(b), ") {\n")
		} else {
			a.body.push("switch (", a.addFn(b), a.callFn, ") {\n")
		}
		a.switches.push(0)
	},
	doCase : function (e) {
		var d = this,
		c = Ext.isArray(e) ? e : [e],
		f = d.switches.length - 1,
		a,
		b;
		if (d.switches[f]) {
			d.body.push("break;\n")
		} else {
			d.switches[f]++
		}
		for (b = 0, f = c.length; b < f; ++b) {
			a = d.intRe.exec(c[b]);
			c[b] = a ? a[1] : ("'" + c[b].replace(d.aposRe, "\\'") + "'")
		}
		d.body.push("case ", c.join(": case "), ":\n")
	},
	doDefault : function () {
		var a = this,
		b = a.switches.length - 1;
		if (a.switches[b]) {
			a.body.push("break;\n")
		} else {
			a.switches[b]++
		}
		a.body.push("default:\n")
	},
	doEnd : function (b, d) {
		var c = this,
		a = c.level - 1;
		if (b == "for") {
			if (d.exec) {
				c.doExec(d.exec)
			}
			c.body.push("}\n");
			c.body.push("parent=p", a, ";values=r", a + 1, ";xcount=n", a, ";xindex=i", a, "\n")
		} else {
			if (b == "if" || b == "switch") {
				c.body.push("}\n")
			}
		}
	},
	doFor : function (e, f) {
		var d = this,
		c = d.addFn(e),
		b = d.level,
		a = b - 1;
		d.body.push("var c", b, "=", c, d.callFn, ", a", b, "=Ext.isArray(c", b, "),p", b, "=(parent=c", a, "),r", b, "=values\n", "for (var i", b, "=0,n", b, "=a", b, "?c", b, ".length:(c", b, "?1:0), xcount=n", b, ";i", b, "<n" + b + ";++i", b, "){\n", "values=a", b, "?c", b, "[i", b, "]:c", b, "\n", "xindex=i", b, "+1\n")
	},
	doExec : function (c, d) {
		var b = this,
		a = "f" + b.funcs.length;
		b.funcs.push("function " + a + "(" + b.fnArgs + ") {", " try { with(values) {", "  " + c, " }} catch(e) {}", "}");
		b.body.push(a + b.callFn + "\n")
	},
	addFn : function (a) {
		var c = this,
		b = "f" + c.funcs.length;
		if (a === ".") {
			c.funcs.push("function " + b + "(" + c.fnArgs + ") {", " return values", "}")
		} else {
			if (a === "..") {
				c.funcs.push("function " + b + "(" + c.fnArgs + ") {", " return parent", "}")
			} else {
				c.funcs.push("function " + b + "(" + c.fnArgs + ") {", " try { with(values) {", "  return(" + a + ")", " }} catch(e) {}", "}")
			}
		}
		return b
	},
	parseTag : function (b) {
		var a = this.tagRe.exec(b),
		e = a[1],
		g = a[2],
		d = a[3],
		f = a[4],
		c;
		if (e == ".") {
			c = 'Ext.Array.indexOf(["string", "number", "boolean"], typeof values) > -1 || Ext.isDate(values) ? values : ""'
		} else {
			if (e == "#") {
				c = "xindex"
			} else {
				if (e.substr(0, 7) == "parent.") {
					c = e
				} else {
					if ((e.indexOf(".") !== -1) && (e.indexOf("-") === -1)) {
						c = "values." + e
					} else {
						c = "values['" + e + "']"
					}
				}
			}
		}
		if (f) {
			c = "(" + c + f + ")"
		}
		if (g && this.useFormat) {
			d = d ? "," + d : "";
			if (g.substr(0, 5) != "this.") {
				g = "fm." + g + "("
			} else {
				g += "("
			}
		} else {
			d = "";
			g = "(" + c + " === undefined ? '' : "
		}
		return g + c + d + ")"
	},
	evalTpl : function ($) {
		eval($);
		return $
	},
	newLineRe : /\r\n|\r|\n/g,
	aposRe : /[']/g,
	intRe : /^\s*(\d+)\s*$/,
	tagRe : /([\w-\.\#]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?(\s?[\+\-\*\/]\s?[\d\.\+\-\*\/\(\)]+)?/
}, function () {
	var a = this.prototype;
	a.fnArgs = "out,values,parent,xindex,xcount";
	a.callFn = ".call(this," + a.fnArgs + ")"
});
(function () {
	function b(d) {
		var c = Array.prototype.slice.call(arguments, 1);
		return d.replace(/\{(\d+)\}/g, function (e, f) {
			return c[f]
		})
	}
	Ext.DateExtras = {
		now : Date.now || function () {
			return +new Date()
		},
		getElapsed : function (d, c) {
			return Math.abs(d - (c || new Date()))
		},
		useStrict : false,
		formatCodeToRegex : function (d, c) {
			var e = a.parseCodes[d];
			if (e) {
				e = typeof e == "function" ? e() : e;
				a.parseCodes[d] = e
			}
			return e ? Ext.applyIf({
				c : e.c ? b(e.c, c || "{0}") : e.c
			}, e) : {
				g : 0,
				c : null,
				s : Ext.String.escapeRegex(d)
			}
		},
		parseFunctions : {
			MS : function (d, c) {
				var e = new RegExp("\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/");
				var f = (d || "").match(e);
				return f ? new Date(((f[1] || "") + f[2]) * 1) : null
			}
		},
		parseRegexes : [],
		formatFunctions : {
			MS : function () {
				return "\\/Date(" + this.getTime() + ")\\/"
			}
		},
		y2kYear : 50,
		MILLI : "ms",
		SECOND : "s",
		MINUTE : "mi",
		HOUR : "h",
		DAY : "d",
		MONTH : "mo",
		YEAR : "y",
		defaults : {},
		dayNames : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		monthNames : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		monthNumbers : {
			Jan : 0,
			Feb : 1,
			Mar : 2,
			Apr : 3,
			May : 4,
			Jun : 5,
			Jul : 6,
			Aug : 7,
			Sep : 8,
			Oct : 9,
			Nov : 10,
			Dec : 11
		},
		defaultFormat : "m/d/Y",
		getShortMonthName : function (c) {
			return a.monthNames[c].substring(0, 3)
		},
		getShortDayName : function (c) {
			return a.dayNames[c].substring(0, 3)
		},
		getMonthNumber : function (c) {
			return a.monthNumbers[c.substring(0, 1).toUpperCase() + c.substring(1, 3).toLowerCase()]
		},
		formatCodes : {
			d : "Ext.String.leftPad(this.getDate(), 2, '0')",
			D : "Ext.Date.getShortDayName(this.getDay())",
			j : "this.getDate()",
			l : "Ext.Date.dayNames[this.getDay()]",
			N : "(this.getDay() ? this.getDay() : 7)",
			S : "Ext.Date.getSuffix(this)",
			w : "this.getDay()",
			z : "Ext.Date.getDayOfYear(this)",
			W : "Ext.String.leftPad(Ext.Date.getWeekOfYear(this), 2, '0')",
			F : "Ext.Date.monthNames[this.getMonth()]",
			m : "Ext.String.leftPad(this.getMonth() + 1, 2, '0')",
			M : "Ext.Date.getShortMonthName(this.getMonth())",
			n : "(this.getMonth() + 1)",
			t : "Ext.Date.getDaysInMonth(this)",
			L : "(Ext.Date.isLeapYear(this) ? 1 : 0)",
			o : "(this.getFullYear() + (Ext.Date.getWeekOfYear(this) == 1 && this.getMonth() > 0 ? +1 : (Ext.Date.getWeekOfYear(this) >= 52 && this.getMonth() < 11 ? -1 : 0)))",
			Y : "Ext.String.leftPad(this.getFullYear(), 4, '0')",
			y : "('' + this.getFullYear()).substring(2, 4)",
			a : "(this.getHours() < 12 ? 'am' : 'pm')",
			A : "(this.getHours() < 12 ? 'AM' : 'PM')",
			g : "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
			G : "this.getHours()",
			h : "Ext.String.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
			H : "Ext.String.leftPad(this.getHours(), 2, '0')",
			i : "Ext.String.leftPad(this.getMinutes(), 2, '0')",
			s : "Ext.String.leftPad(this.getSeconds(), 2, '0')",
			u : "Ext.String.leftPad(this.getMilliseconds(), 3, '0')",
			O : "Ext.Date.getGMTOffset(this)",
			P : "Ext.Date.getGMTOffset(this, true)",
			T : "Ext.Date.getTimezone(this)",
			Z : "(this.getTimezoneOffset() * -60)",
			c : function () {
				for (var j = "Y-m-dTH:i:sP", g = [], f = 0, d = j.length; f < d; ++f) {
					var h = j.charAt(f);
					g.push(h == "T" ? "'T'" : a.getFormatCode(h))
				}
				return g.join(" + ")
			},
			U : "Math.round(this.getTime() / 1000)"
		},
		isValid : function (n, c, l, j, f, g, e) {
			j = j || 0;
			f = f || 0;
			g = g || 0;
			e = e || 0;
			var k = a.add(new Date(n < 100 ? 100 : n, c - 1, l, j, f, g, e), a.YEAR, n < 100 ? n - 100 : 0);
			return n == k.getFullYear() && c == k.getMonth() + 1 && l == k.getDate() && j == k.getHours() && f == k.getMinutes() && g == k.getSeconds() && e == k.getMilliseconds()
		},
		parse : function (d, f, c) {
			var e = a.parseFunctions;
			if (e[f] == null) {
				a.createParser(f)
			}
			return e[f](d, Ext.isDefined(c) ? c : a.useStrict)
		},
		parseDate : function (d, e, c) {
			return a.parse(d, e, c)
		},
		getFormatCode : function (d) {
			var c = a.formatCodes[d];
			if (c) {
				c = typeof c == "function" ? c() : c;
				a.formatCodes[d] = c
			}
			return c || ("'" + Ext.String.escape(d) + "'")
		},
		createFormat : function (g) {
			var f = [],
			c = false,
			e = "";
			for (var d = 0; d < g.length; ++d) {
				e = g.charAt(d);
				if (!c && e == "\\") {
					c = true
				} else {
					if (c) {
						c = false;
						f.push("'" + Ext.String.escape(e) + "'")
					} else {
						f.push(a.getFormatCode(e))
					}
				}
			}
			a.formatFunctions[g] = Ext.functionFactory("return " + f.join("+"))
		},
		createParser : (function () {
			var c = ["var dt, y, m, d, h, i, s, ms, o, z, zz, u, v,", "def = Ext.Date.defaults,", "results = String(input).match(Ext.Date.parseRegexes[{0}]);", "if(results){", "{1}", "if(u != null){", "v = new Date(u * 1000);", "}else{", "dt = Ext.Date.clearTime(new Date);", "y = Ext.Number.from(y, Ext.Number.from(def.y, dt.getFullYear()));", "m = Ext.Number.from(m, Ext.Number.from(def.m - 1, dt.getMonth()));", "d = Ext.Number.from(d, Ext.Number.from(def.d, dt.getDate()));", "h  = Ext.Number.from(h, Ext.Number.from(def.h, dt.getHours()));", "i  = Ext.Number.from(i, Ext.Number.from(def.i, dt.getMinutes()));", "s  = Ext.Number.from(s, Ext.Number.from(def.s, dt.getSeconds()));", "ms = Ext.Number.from(ms, Ext.Number.from(def.ms, dt.getMilliseconds()));", "if(z >= 0 && y >= 0){", "v = Ext.Date.add(new Date(y < 100 ? 100 : y, 0, 1, h, i, s, ms), Ext.Date.YEAR, y < 100 ? y - 100 : 0);", "v = !strict? v : (strict === true && (z <= 364 || (Ext.Date.isLeapYear(v) && z <= 365))? Ext.Date.add(v, Ext.Date.DAY, z) : null);", "}else if(strict === true && !Ext.Date.isValid(y, m + 1, d, h, i, s, ms)){", "v = null;", "}else{", "v = Ext.Date.add(new Date(y < 100 ? 100 : y, m, d, h, i, s, ms), Ext.Date.YEAR, y < 100 ? y - 100 : 0);", "}", "}", "}", "if(v){", "if(zz != null){", "v = Ext.Date.add(v, Ext.Date.SECOND, -v.getTimezoneOffset() * 60 - zz);", "}else if(o){", "v = Ext.Date.add(v, Ext.Date.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));", "}", "}", "return v;"].join("\n");
			return function (l) {
				var e = a.parseRegexes.length,
				m = 1,
				f = [],
				k = [],
				j = false,
				d = "";
				for (var h = 0; h < l.length; ++h) {
					d = l.charAt(h);
					if (!j && d == "\\") {
						j = true
					} else {
						if (j) {
							j = false;
							k.push(Ext.String.escape(d))
						} else {
							var g = a.formatCodeToRegex(d, m);
							m += g.g;
							k.push(g.s);
							if (g.g && g.c) {
								f.push(g.c)
							}
						}
					}
				}
				a.parseRegexes[e] = new RegExp("^" + k.join("") + "$", "i");
				a.parseFunctions[l] = Ext.functionFactory("input", "strict", b(c, e, f.join("")))
			}
		})(),
		parseCodes : {
			d : {
				g : 1,
				c : "d = parseInt(results[{0}], 10);\n",
				s : "(\\d{2})"
			},
			j : {
				g : 1,
				c : "d = parseInt(results[{0}], 10);\n",
				s : "(\\d{1,2})"
			},
			D : function () {
				for (var c = [], d = 0; d < 7; c.push(a.getShortDayName(d)), ++d) {}
				
				return {
					g : 0,
					c : null,
					s : "(?:" + c.join("|") + ")"
				}
			},
			l : function () {
				return {
					g : 0,
					c : null,
					s : "(?:" + a.dayNames.join("|") + ")"
				}
			},
			N : {
				g : 0,
				c : null,
				s : "[1-7]"
			},
			S : {
				g : 0,
				c : null,
				s : "(?:st|nd|rd|th)"
			},
			w : {
				g : 0,
				c : null,
				s : "[0-6]"
			},
			z : {
				g : 1,
				c : "z = parseInt(results[{0}], 10);\n",
				s : "(\\d{1,3})"
			},
			W : {
				g : 0,
				c : null,
				s : "(?:\\d{2})"
			},
			F : function () {
				return {
					g : 1,
					c : "m = parseInt(Ext.Date.getMonthNumber(results[{0}]), 10);\n",
					s : "(" + a.monthNames.join("|") + ")"
				}
			},
			M : function () {
				for (var c = [], d = 0; d < 12; c.push(a.getShortMonthName(d)), ++d) {}
				
				return Ext.applyIf({
					s : "(" + c.join("|") + ")"
				}, a.formatCodeToRegex("F"))
			},
			m : {
				g : 1,
				c : "m = parseInt(results[{0}], 10) - 1;\n",
				s : "(\\d{2})"
			},
			n : {
				g : 1,
				c : "m = parseInt(results[{0}], 10) - 1;\n",
				s : "(\\d{1,2})"
			},
			t : {
				g : 0,
				c : null,
				s : "(?:\\d{2})"
			},
			L : {
				g : 0,
				c : null,
				s : "(?:1|0)"
			},
			o : function () {
				return a.formatCodeToRegex("Y")
			},
			Y : {
				g : 1,
				c : "y = parseInt(results[{0}], 10);\n",
				s : "(\\d{4})"
			},
			y : {
				g : 1,
				c : "var ty = parseInt(results[{0}], 10);\ny = ty > Ext.Date.y2kYear ? 1900 + ty : 2000 + ty;\n",
				s : "(\\d{1,2})"
			},
			a : {
				g : 1,
				c : "if (/(am)/i.test(results[{0}])) {\nif (!h || h == 12) { h = 0; }\n} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
				s : "(am|pm|AM|PM)"
			},
			A : {
				g : 1,
				c : "if (/(am)/i.test(results[{0}])) {\nif (!h || h == 12) { h = 0; }\n} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
				s : "(AM|PM|am|pm)"
			},
			g : function () {
				return a.formatCodeToRegex("G")
			},
			G : {
				g : 1,
				c : "h = parseInt(results[{0}], 10);\n",
				s : "(\\d{1,2})"
			},
			h : function () {
				return a.formatCodeToRegex("H")
			},
			H : {
				g : 1,
				c : "h = parseInt(results[{0}], 10);\n",
				s : "(\\d{2})"
			},
			i : {
				g : 1,
				c : "i = parseInt(results[{0}], 10);\n",
				s : "(\\d{2})"
			},
			s : {
				g : 1,
				c : "s = parseInt(results[{0}], 10);\n",
				s : "(\\d{2})"
			},
			u : {
				g : 1,
				c : "ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
				s : "(\\d+)"
			},
			O : {
				g : 1,
				c : ["o = results[{0}];", "var sn = o.substring(0,1),", "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),", "mn = o.substring(3,5) % 60;", "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n"].join("\n"),
				s : "([+-]\\d{4})"
			},
			P : {
				g : 1,
				c : ["o = results[{0}];", "var sn = o.substring(0,1),", "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),", "mn = o.substring(4,6) % 60;", "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n"].join("\n"),
				s : "([+-]\\d{2}:\\d{2})"
			},
			T : {
				g : 0,
				c : null,
				s : "[A-Z]{1,4}"
			},
			Z : {
				g : 1,
				c : "zz = results[{0}] * 1;\nzz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
				s : "([+-]?\\d{1,5})"
			},
			c : function () {
				var e = [],
				c = [a.formatCodeToRegex("Y", 1), a.formatCodeToRegex("m", 2), a.formatCodeToRegex("d", 3), a.formatCodeToRegex("h", 4), a.formatCodeToRegex("i", 5), a.formatCodeToRegex("s", 6), {
						c : "ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"
					}, {
						c : ["if(results[8]) {", "if(results[8] == 'Z'){", "zz = 0;", "}else if (results[8].indexOf(':') > -1){", a.formatCodeToRegex("P", 8).c, "}else{", a.formatCodeToRegex("O", 8).c, "}", "}"].join("\n")
					}
				];
				for (var f = 0, d = c.length; f < d; ++f) {
					e.push(c[f].c)
				}
				return {
					g : 1,
					c : e.join(""),
					s : [c[0].s, "(?:", "-", c[1].s, "(?:", "-", c[2].s, "(?:", "(?:T| )?", c[3].s, ":", c[4].s, "(?::", c[5].s, ")?", "(?:(?:\\.|,)(\\d+))?", "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?", ")?", ")?", ")?"].join("")
				}
			},
			U : {
				g : 1,
				c : "u = parseInt(results[{0}], 10);\n",
				s : "(-?\\d+)"
			}
		},
		dateFormat : function (c, d) {
			return a.format(c, d)
		},
		format : function (d, e) {
			if (a.formatFunctions[e] == null) {
				a.createFormat(e)
			}
			var c = a.formatFunctions[e].call(d);
			return c + ""
		},
		getTimezone : function (c) {
			return c.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "")
		},
		getGMTOffset : function (c, d) {
			var e = c.getTimezoneOffset();
			return (e > 0 ? "-" : "+") + Ext.String.leftPad(Math.floor(Math.abs(e) / 60), 2, "0") + (d ? ":" : "") + Ext.String.leftPad(Math.abs(e % 60), 2, "0")
		},
		getDayOfYear : function (f) {
			var e = 0,
			h = Ext.Date.clone(f),
			c = f.getMonth(),
			g;
			for (g = 0, h.setDate(1), h.setMonth(0); g < c; h.setMonth(++g)) {
				e += a.getDaysInMonth(h)
			}
			return e + f.getDate() - 1
		},
		getWeekOfYear : (function () {
			var c = 86400000,
			d = 7 * c;
			return function (f) {
				var g = Date.UTC(f.getFullYear(), f.getMonth(), f.getDate() + 3) / c,
				e = Math.floor(g / 7),
				h = new Date(e * d).getUTCFullYear();
				return e - Math.floor(Date.UTC(h, 0, 7) / d) + 1
			}
		})(),
		isLeapYear : function (c) {
			var d = c.getFullYear();
			return !!((d & 3) == 0 && (d % 100 || (d % 400 == 0 && d)))
		},
		getFirstDayOfMonth : function (d) {
			var c = (d.getDay() - (d.getDate() - 1)) % 7;
			return (c < 0) ? (c + 7) : c
		},
		getLastDayOfMonth : function (c) {
			return a.getLastDateOfMonth(c).getDay()
		},
		getFirstDateOfMonth : function (c) {
			return new Date(c.getFullYear(), c.getMonth(), 1)
		},
		getLastDateOfMonth : function (c) {
			return new Date(c.getFullYear(), c.getMonth(), a.getDaysInMonth(c))
		},
		getDaysInMonth : (function () {
			var c = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			return function (e) {
				var d = e.getMonth();
				return d == 1 && a.isLeapYear(e) ? 29 : c[d]
			}
		})(),
		getSuffix : function (c) {
			switch (c.getDate()) {
			case 1:
			case 21:
			case 31:
				return "st";
			case 2:
			case 22:
				return "nd";
			case 3:
			case 23:
				return "rd";
			default:
				return "th"
			}
		},
		clone : function (c) {
			return new Date(c.getTime())
		},
		isDST : function (c) {
			return new Date(c.getFullYear(), 0, 1).getTimezoneOffset() != c.getTimezoneOffset()
		},
		clearTime : function (e, i) {
			if (i) {
				return Ext.Date.clearTime(Ext.Date.clone(e))
			}
			var g = e.getDate();
			e.setHours(0);
			e.setMinutes(0);
			e.setSeconds(0);
			e.setMilliseconds(0);
			if (e.getDate() != g) {
				for (var f = 1, h = a.add(e, Ext.Date.HOUR, f); h.getDate() != g; f++, h = a.add(e, Ext.Date.HOUR, f)) {}
				
				e.setDate(g);
				e.setHours(h.getHours())
			}
			return e
		},
		add : function (g, f, h) {
			var i = Ext.Date.clone(g),
			c = Ext.Date;
			if (!f || h === 0) {
				return i
			}
			switch (f.toLowerCase()) {
			case Ext.Date.MILLI:
				i.setMilliseconds(i.getMilliseconds() + h);
				break;
			case Ext.Date.SECOND:
				i.setSeconds(i.getSeconds() + h);
				break;
			case Ext.Date.MINUTE:
				i.setMinutes(i.getMinutes() + h);
				break;
			case Ext.Date.HOUR:
				i.setHours(i.getHours() + h);
				break;
			case Ext.Date.DAY:
				i.setDate(i.getDate() + h);
				break;
			case Ext.Date.MONTH:
				var e = g.getDate();
				if (e > 28) {
					e = Math.min(e, Ext.Date.getLastDateOfMonth(Ext.Date.add(Ext.Date.getFirstDateOfMonth(g), "mo", h)).getDate())
				}
				i.setDate(e);
				i.setMonth(g.getMonth() + h);
				break;
			case Ext.Date.YEAR:
				i.setFullYear(g.getFullYear() + h);
				break
			}
			return i
		},
		between : function (d, f, c) {
			var e = d.getTime();
			return f.getTime() <= e && e <= c.getTime()
		}
	};
	var a = Ext.DateExtras;
	Ext.apply(Ext.Date, a)
})();
Ext.define("Ext.util.Format", {
	requires : ["Ext.DateExtras"],
	singleton : true,
	defaultDateFormat : "m/d/Y",
	escapeRe : /('|\\)/g,
	trimRe : /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g,
	formatRe : /\{(\d+)\}/g,
	escapeRegexRe : /([-.*+?^${}()|[\]\/\\])/g,
	dashesRe : /-/g,
	iso8601TestRe : /\d\dT\d\d/,
	iso8601SplitRe : /[- :T\.Z\+]/,
	ellipsis : function (c, a, d) {
		if (c && c.length > a) {
			if (d) {
				var e = c.substr(0, a - 2),
				b = Math.max(e.lastIndexOf(" "), e.lastIndexOf("."), e.lastIndexOf("!"), e.lastIndexOf("?"));
				if (b != -1 && b >= (a - 15)) {
					return e.substr(0, b) + "..."
				}
			}
			return c.substr(0, a - 3) + "..."
		}
		return c
	},
	escapeRegex : function (a) {
		return a.replace(Ext.util.Format.escapeRegexRe, "\\$1")
	},
	escape : function (a) {
		return a.replace(Ext.util.Format.escapeRe, "\\$1")
	},
	toggle : function (b, c, a) {
		return b == c ? a : c
	},
	trim : function (a) {
		return a.replace(Ext.util.Format.trimRe, "")
	},
	leftPad : function (d, b, c) {
		var a = String(d);
		c = c || " ";
		while (a.length < b) {
			a = c + a
		}
		return a
	},
	format : function (b) {
		var a = Ext.toArray(arguments, 1);
		return b.replace(Ext.util.Format.formatRe, function (c, d) {
			return a[d]
		})
	},
	htmlEncode : function (a) {
		return !a ? a : String(a).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
	},
	htmlDecode : function (a) {
		return !a ? a : String(a).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
	},
	date : function (b, c) {
		var a = b;
		if (!b) {
			return ""
		}
		if (!Ext.isDate(b)) {
			a = new Date(Date.parse(b));
			if (isNaN(a)) {
				if (this.iso8601TestRe.test(b)) {
					a = b.split(this.iso8601SplitRe);
					a = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5])
				}
				if (isNaN(a)) {
					a = new Date(Date.parse(b.replace(this.dashesRe, "/")))
				}
			}
			b = a
		}
		return Ext.Date.format(b, c || Ext.util.Format.defaultDateFormat)
	}
});
Ext.define("Ext.Template", {
	requires : ["Ext.dom.Helper", "Ext.util.Format"],
	inheritableStatics : {
		from : function (b, a) {
			b = Ext.getDom(b);
			return new this(b.value || b.innerHTML, a || "")
		}
	},
	constructor : function (d) {
		var f = this,
		b = arguments,
		a = [],
		c = 0,
		e = b.length,
		g;
		f.initialConfig = {};
		if (e > 1) {
			for (; c < e; c++) {
				g = b[c];
				if (typeof g == "object") {
					Ext.apply(f.initialConfig, g);
					Ext.apply(f, g)
				} else {
					a.push(g)
				}
			}
			d = a.join("")
		} else {
			if (Ext.isArray(d)) {
				a.push(d.join(""))
			} else {
				a.push(d)
			}
		}
		f.html = a.join("");
		if (f.compiled) {
			f.compile()
		}
	},
	isTemplate : true,
	disableFormats : false,
	re : /\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,
	apply : function (a) {
		var g = this,
		d = g.disableFormats !== true,
		f = Ext.util.Format,
		c = g,
		b;
		if (g.compiled) {
			return g.compiled(a).join("")
		}
		function e(h, j, k, i) {
			if (k && d) {
				if (i) {
					i = [a[j]].concat(Ext.functionFactory("return [" + i + "];")())
				} else {
					i = [a[j]]
				}
				if (k.substr(0, 5) == "this.") {
					return c[k.substr(5)].apply(c, i)
				} else {
					return f[k].apply(f, i)
				}
			} else {
				return a[j] !== undefined ? a[j] : ""
			}
		}
		b = g.html.replace(g.re, e);
		return b
	},
	applyOut : function (a, b) {
		var c = this;
		if (c.compiled) {
			b.push.apply(b, c.compiled(a))
		} else {
			b.push(c.apply(a))
		}
		return b
	},
	applyTemplate : function () {
		return this.apply.apply(this, arguments)
	},
	set : function (a, c) {
		var b = this;
		b.html = a;
		b.compiled = null;
		return c ? b.compile() : b
	},
	compileARe : /\\/g,
	compileBRe : /(\r\n|\n)/g,
	compileCRe : /'/g,
	compile : function () {
		var me = this,
		fm = Ext.util.Format,
		useFormat = me.disableFormats !== true,
		body,
		bodyReturn;
		function fn(m, name, format, args) {
			if (format && useFormat) {
				args = args ? "," + args : "";
				if (format.substr(0, 5) != "this.") {
					format = "fm." + format + "("
				} else {
					format = "this." + format.substr(5) + "("
				}
			} else {
				args = "";
				format = "(values['" + name + "'] == undefined ? '' : "
			}
			return "'," + format + "values['" + name + "']" + args + ") ,'"
		}
		bodyReturn = me.html.replace(me.compileARe, "\\\\").replace(me.compileBRe, "\\n").replace(me.compileCRe, "\\'").replace(me.re, fn);
		body = "this.compiled = function(values){ return ['" + bodyReturn + "'];};";
		eval(body);
		return me
	},
	insertFirst : function (b, a, c) {
		return this.doInsert("afterBegin", b, a, c)
	},
	insertBefore : function (b, a, c) {
		return this.doInsert("beforeBegin", b, a, c)
	},
	insertAfter : function (b, a, c) {
		return this.doInsert("afterEnd", b, a, c)
	},
	append : function (b, a, c) {
		return this.doInsert("beforeEnd", b, a, c)
	},
	doInsert : function (c, e, b, a) {
		e = Ext.getDom(e);
		var d = Ext.DomHelper.insertHtml(c, e, this.apply(b));
		return a ? Ext.get(d, true) : d
	},
	overwrite : function (b, a, c) {
		b = Ext.getDom(b);
		b.innerHTML = this.apply(a);
		return c ? Ext.get(b.firstChild, true) : b.firstChild
	}
});
Ext.define("Ext.XTemplate", {
	extend : "Ext.Template",
	requires : "Ext.XTemplateCompiler",
	apply : function (a) {
		return this.applyOut(a, []).join("")
	},
	applyOut : function (a, b) {
		var d = this,
		c;
		if (!d.fn) {
			c = new Ext.XTemplateCompiler({
					useFormat : d.disableFormats !== true
				});
			d.fn = c.compile(d.html)
		}
		try {
			d.fn.call(d, b, a, {}, 1, 1)
		} catch (f) {}
		
		return b
	},
	compile : function () {
		return this
	},
	statics : {
		getTpl : function (a, c) {
			var b = a[c],
			d;
			if (b && !b.isTemplate) {
				b = Ext.ClassManager.dynInstantiate("Ext.XTemplate", b);
				if (a.hasOwnProperty(c)) {
					a[c] = b
				} else {
					for (d = a.self.prototype; d; d = d.superclass) {
						if (d.hasOwnProperty(c)) {
							d[c] = b;
							break
						}
					}
				}
			}
			return b || null
		}
	}
});
Ext.define("Ext.util.SizeMonitor", {
	extend : "Ext.Evented",
	config : {
		element : null,
		detectorCls : Ext.baseCSSPrefix + "size-change-detector",
		callback : Ext.emptyFn,
		scope : null,
		args : []
	},
	constructor : function (d) {
		this.initConfig(d);
		this.doFireSizeChangeEvent = Ext.Function.bind(this.doFireSizeChangeEvent, this);
		var g = this,
		e = this.getElement().dom,
		b = this.getDetectorCls(),
		c = Ext.Element.create({
				classList : [b, b + "-expand"],
				children : [{}
					
				]
			}, true),
		h = Ext.Element.create({
				classList : [b, b + "-shrink"],
				children : [{}
					
				]
			}, true),
		a = function (i) {
			g.onDetectorScroll("expand", i)
		},
		f = function (i) {
			g.onDetectorScroll("shrink", i)
		};
		e.appendChild(c);
		e.appendChild(h);
		this.detectors = {
			expand : c,
			shrink : h
		};
		this.position = {
			expand : {
				left : 0,
				top : 0
			},
			shrink : {
				left : 0,
				top : 0
			}
		};
		this.listeners = {
			expand : a,
			shrink : f
		};
		this.refresh();
		c.addEventListener("scroll", a, true);
		h.addEventListener("scroll", f, true)
	},
	applyElement : function (a) {
		if (a) {
			return Ext.get(a)
		}
	},
	updateElement : function (a) {
		a.on("destroy", "destroy", this)
	},
	refreshPosition : function (b) {
		var e = this.detectors[b],
		a = this.position[b],
		d,
		c;
		a.left = d = e.scrollWidth - e.offsetWidth;
		a.top = c = e.scrollHeight - e.offsetHeight;
		e.scrollLeft = d;
		e.scrollTop = c
	},
	refresh : function () {
		this.refreshPosition("expand");
		this.refreshPosition("shrink")
	},
	onDetectorScroll : function (b) {
		var c = this.detectors[b],
		a = this.position[b];
		if (c.scrollLeft !== a.left || c.scrollTop !== a.top) {
			this.refresh();
			this.fireSizeChangeEvent()
		}
	},
	fireSizeChangeEvent : function () {
		clearTimeout(this.sizeChangeThrottleTimer);
		this.sizeChangeThrottleTimer = setTimeout(this.doFireSizeChangeEvent, 1)
	},
	doFireSizeChangeEvent : function () {
		this.getCallback().apply(this.getScope(), this.getArgs())
	},
	destroyDetector : function (a) {
		var c = this.detectors[a],
		b = this.listeners[a];
		c.removeEventListener("scroll", b, true);
		Ext.removeNode(c)
	},
	destroy : function () {
		this.callParent(arguments);
		this.destroyDetector("expand");
		this.destroyDetector("shrink");
		delete this.listeners;
		delete this.detectors
	}
});
Ext.define("Ext.fx.easing.Linear", {
	extend : "Ext.fx.easing.Abstract",
	alias : "easing.linear",
	config : {
		duration : 0,
		endValue : 0
	},
	updateStartValue : function (a) {
		this.distance = this.getEndValue() - a
	},
	updateEndValue : function (a) {
		this.distance = a - this.getStartValue()
	},
	getValue : function () {
		var a = Ext.Date.now() - this.getStartTime(),
		b = this.getDuration();
		if (a > b) {
			this.isEnded = true;
			return this.getEndValue()
		} else {
			return this.getStartValue() + ((a / b) * this.distance)
		}
	}
});
Ext.define("Ext.util.translatable.Abstract", {
	extend : "Ext.Evented",
	requires : ["Ext.fx.easing.Linear"],
	config : {
		element : null,
		easing : null,
		easingX : null,
		easingY : null,
		fps : 60
	},
	constructor : function (a) {
		var b;
		this.doAnimationFrame = Ext.Function.bind(this.doAnimationFrame, this);
		this.x = 0;
		this.y = 0;
		this.activeEasingX = null;
		this.activeEasingY = null;
		this.initialConfig = a;
		if (a && a.element) {
			b = a.element;
			this.setElement(b)
		}
	},
	applyElement : function (a) {
		if (!a) {
			return
		}
		return Ext.get(a)
	},
	updateElement : function (a) {
		this.initConfig(this.initialConfig);
		this.refresh()
	},
	factoryEasing : function (a) {
		return Ext.factory(a, Ext.fx.easing.Linear, null, "easing")
	},
	applyEasing : function (a) {
		if (!this.getEasingX()) {
			this.setEasingX(this.factoryEasing(a))
		}
		if (!this.getEasingY()) {
			this.setEasingY(this.factoryEasing(a))
		}
	},
	applyEasingX : function (a) {
		return this.factoryEasing(a)
	},
	applyEasingY : function (a) {
		return this.factoryEasing(a)
	},
	updateFps : function (a) {
		this.animationInterval = 1000 / a
	},
	doTranslate : function (a, b) {
		if (typeof a == "number") {
			this.x = a
		}
		if (typeof b == "number") {
			this.y = b
		}
		return this
	},
	translate : function (a, c, b) {
		if (!this.getElement().dom) {
			return
		}
		if (Ext.isObject(a)) {
			throw new Error()
		}
		this.stopAnimation();
		if (b) {
			return this.translateAnimated(a, c, b)
		}
		return this.doTranslate(a, c)
	},
	animate : function (b, a) {
		this.activeEasingX = b;
		this.activeEasingY = a;
		this.isAnimating = true;
		this.animationTimer = setInterval(this.doAnimationFrame, this.animationInterval);
		this.fireEvent("animationstart", this, this.x, this.y);
		return this
	},
	translateAnimated : function (b, g, e) {
		if (Ext.isObject(b)) {
			throw new Error()
		}
		if (!Ext.isObject(e)) {
			e = {}
			
		}
		var d = Ext.Date.now(),
		f = e.easing,
		c = (typeof b == "number") ? (e.easingX || this.getEasingX() || f || true) : null,
		a = (typeof g == "number") ? (e.easingY || this.getEasingY() || f || true) : null;
		if (c) {
			c = this.factoryEasing(c);
			c.setStartTime(d);
			c.setStartValue(this.x);
			c.setEndValue(b);
			if ("duration" in e) {
				c.setDuration(e.duration)
			}
		}
		if (a) {
			a = this.factoryEasing(a);
			a.setStartTime(d);
			a.setStartValue(this.y);
			a.setEndValue(g);
			if ("duration" in e) {
				a.setDuration(e.duration)
			}
		}
		return this.animate(c, a)
	},
	doAnimationFrame : function () {
		var c = this.activeEasingX,
		b = this.activeEasingY,
		d = this.getElement(),
		a,
		e;
		if (!this.isAnimating || !d.dom) {
			return
		}
		if (c === null && b === null) {
			this.stopAnimation();
			return
		}
		if (c !== null) {
			this.x = a = Math.round(c.getValue());
			if (c.isEnded) {
				this.activeEasingX = null;
				this.fireEvent("axisanimationend", this, "x", a)
			}
		} else {
			a = this.x
		}
		if (b !== null) {
			this.y = e = Math.round(b.getValue());
			if (b.isEnded) {
				this.activeEasingY = null;
				this.fireEvent("axisanimationend", this, "y", e)
			}
		} else {
			e = this.y
		}
		this.doTranslate(a, e);
		this.fireEvent("animationframe", this, a, e)
	},
	stopAnimation : function () {
		if (!this.isAnimating) {
			return
		}
		this.activeEasingX = null;
		this.activeEasingY = null;
		this.isAnimating = false;
		clearInterval(this.animationTimer);
		this.fireEvent("animationend", this, this.x, this.y)
	},
	refresh : function () {
		this.translate(this.x, this.y)
	}
});
Ext.define("Ext.util.translatable.CssTransform", {
	extend : "Ext.util.translatable.Abstract",
	doTranslate : function (a, c) {
		var b = this.getElement().dom.style;
		if (typeof a != "number") {
			a = this.x
		}
		if (typeof c != "number") {
			c = this.y
		}
		b.webkitTransform = "translate3d(" + a + "px, " + c + "px, 0px)";
		return this.callParent(arguments)
	},
	destroy : function () {
		var a = this.getElement();
		if (a && !a.isDestroyed) {
			a.dom.style.webkitTransform = null
		}
		this.callParent(arguments)
	}
});
Ext.define("Ext.util.translatable.ScrollPosition", {
	extend : "Ext.util.translatable.Abstract",
	wrapperWidth : 0,
	wrapperHeight : 0,
	baseCls : "x-translatable",
	config : {
		useWrapper : true
	},
	getWrapper : function () {
		var e = this.wrapper,
		c = this.baseCls,
		b = this.getElement(),
		d,
		a;
		if (!e) {
			a = b.getParent();
			if (!a) {
				return null
			}
			if (this.getUseWrapper()) {
				e = b.wrap({
						className : c + "-wrapper"
					}, true)
			} else {
				e = a.dom
			}
			e.appendChild(Ext.Element.create({
					className : c + "-stretcher"
				}, true));
			this.nestedStretcher = d = Ext.Element.create({
					className : c + "-nested-stretcher"
				}, true);
			b.appendChild(d);
			b.addCls(c);
			a.addCls(c + "-container");
			this.container = a;
			this.wrapper = e;
			this.refresh()
		}
		return e
	},
	doTranslate : function (a, c) {
		var b = this.getWrapper();
		if (b) {
			if (typeof a == "number") {
				b.scrollLeft = this.wrapperWidth - a
			}
			if (typeof c == "number") {
				b.scrollTop = this.wrapperHeight - c
			}
		}
		return this.callParent(arguments)
	},
	refresh : function () {
		var a = this.getWrapper();
		if (a) {
			this.wrapperWidth = a.offsetWidth;
			this.wrapperHeight = a.offsetHeight;
			this.callParent(arguments)
		}
	},
	destroy : function () {
		var b = this.getElement(),
		a = this.baseCls;
		if (this.wrapper) {
			if (this.getUseWrapper()) {
				b.unwrap()
			}
			this.container.removeCls(a + "-container");
			b.removeCls(a);
			b.removeChild(this.nestedStretcher)
		}
		this.callParent(arguments)
	}
});
Ext.define("Ext.util.Translatable", {
	requires : ["Ext.util.translatable.CssTransform", "Ext.util.translatable.ScrollPosition"],
	constructor : function (a) {
		var c = Ext.util.translatable,
		e = c.CssTransform,
		d = c.ScrollPosition,
		b;
		if (typeof a == "object" && "translationMethod" in a) {
			if (a.translationMethod === "scrollposition") {
				b = d
			} else {
				if (a.translationMethod === "csstransform") {
					b = e
				}
			}
		}
		if (!b) {
			if (Ext.os.is.Android2 || Ext.browser.is.ChromeMobile) {
				b = d
			} else {
				b = e
			}
		}
		return new b(a)
	}
});
Ext.define("Ext.behavior.Translatable", {
	extend : "Ext.behavior.Behavior",
	requires : ["Ext.util.Translatable"],
	constructor : function () {
		this.listeners = {
			painted : "onComponentPainted",
			scope : this
		};
		this.callParent(arguments)
	},
	onComponentPainted : function () {
		this.translatable.refresh()
	},
	setConfig : function (c) {
		var a = this.translatable,
		b = this.component;
		if (c) {
			if (!a) {
				this.translatable = a = new Ext.util.Translatable(c);
				a.setElement(b.renderElement);
				a.on("destroy", "onTranslatableDestroy", this);
				if (b.isPainted()) {
					this.onComponentPainted(b)
				}
				b.on(this.listeners)
			} else {
				if (Ext.isObject(c)) {
					a.setConfig(c)
				}
			}
		} else {
			if (a) {
				a.destroy()
			}
		}
		return this
	},
	getTranslatable : function () {
		return this.translatable
	},
	onTranslatableDestroy : function () {
		var a = this.component;
		delete this.translatable;
		a.un(this.listeners)
	},
	onComponentDestroy : function () {
		var a = this.translatable;
		if (a) {
			a.destroy()
		}
	}
});
Ext.define("Ext.util.Draggable", {
	isDraggable : true,
	mixins : ["Ext.mixin.Observable"],
	requires : ["Ext.util.SizeMonitor", "Ext.util.Translatable"],
	config : {
		cls : Ext.baseCSSPrefix + "draggable",
		draggingCls : Ext.baseCSSPrefix + "dragging",
		element : null,
		constraint : "container",
		disabled : null,
		direction : "both",
		initialOffset : {
			x : 0,
			y : 0
		},
		translatable : {}
		
	},
	DIRECTION_BOTH : "both",
	DIRECTION_VERTICAL : "vertical",
	DIRECTION_HORIZONTAL : "horizontal",
	defaultConstraint : {
		min : {
			x : -Infinity,
			y : -Infinity
		},
		max : {
			x : Infinity,
			y : Infinity
		}
	},
	sizeMonitor : null,
	containerSizeMonitor : null,
	constructor : function (a) {
		var b;
		this.extraConstraint = {};
		this.initialConfig = a;
		this.offset = {
			x : 0,
			y : 0
		};
		this.listeners = {
			dragstart : "onDragStart",
			drag : "onDrag",
			dragend : "onDragEnd",
			scope : this
		};
		if (a && a.element) {
			b = a.element;
			delete a.element;
			this.setElement(b)
		}
		return this
	},
	applyElement : function (a) {
		if (!a) {
			return
		}
		return Ext.get(a)
	},
	updateElement : function (a) {
		a.on(this.listeners);
		this.sizeMonitor = new Ext.util.SizeMonitor({
				element : a,
				callback : this.doRefresh,
				scope : this
			});
		this.initConfig(this.initialConfig)
	},
	updateInitialOffset : function (b) {
		if (typeof b == "number") {
			b = {
				x : b,
				y : b
			}
		}
		var c = this.offset,
		a,
		d;
		c.x = a = b.x;
		c.y = d = b.y;
		this.getTranslatable().doTranslate(a, d)
	},
	updateCls : function (a) {
		this.getElement().addCls(a)
	},
	applyTranslatable : function (a, b) {
		a = Ext.factory(a, Ext.util.Translatable, b);
		a.setElement(this.getElement());
		return a
	},
	setExtraConstraint : function (a) {
		this.extraConstraint = a || {};
		this.refreshConstraint();
		return this
	},
	addExtraConstraint : function (a) {
		Ext.merge(this.extraConstraint, a);
		this.refreshConstraint();
		return this
	},
	applyConstraint : function (a) {
		this.currentConstraint = a;
		if (!a) {
			a = this.defaultConstraint
		}
		if (a === "container") {
			return Ext.merge(this.getContainerConstraint(), this.extraConstraint)
		}
		return Ext.merge({}, this.extraConstraint, a)
	},
	updateConstraint : function () {
		this.refreshOffset()
	},
	getContainerConstraint : function () {
		var b = this.getContainer(),
		c = this.getElement();
		if (!b || !c.dom) {
			return this.defaultConstraint
		}
		var h = c.dom,
		g = b.dom,
		d = h.offsetWidth,
		a = h.offsetHeight,
		f = g.offsetWidth,
		e = g.offsetHeight;
		return {
			min : {
				x : 0,
				y : 0
			},
			max : {
				x : f - d,
				y : e - a
			}
		}
	},
	getContainer : function () {
		var a = this.container;
		if (!a) {
			a = this.getElement().getParent();
			if (a) {
				this.containerSizeMonitor = new Ext.util.SizeMonitor({
						element : a,
						callback : this.doRefresh,
						scope : this
					});
				this.container = a;
				a.on("destroy", "onContainerDestroy", this)
			}
		}
		return a
	},
	onContainerDestroy : function () {
		delete this.container;
		delete this.containerSizeMonitor
	},
	detachListeners : function () {
		this.getElement().un(this.listeners)
	},
	isAxisEnabled : function (a) {
		var b = this.getDirection();
		if (a === "x") {
			return (b === this.DIRECTION_BOTH || b === this.DIRECTION_HORIZONTAL)
		}
		return (b === this.DIRECTION_BOTH || b === this.DIRECTION_VERTICAL)
	},
	onDragStart : function (a) {
		if (this.getDisabled()) {
			return false
		}
		var b = this.offset;
		this.fireAction("dragstart", [this, a, b.x, b.y], this.initDragStart)
	},
	initDragStart : function (b, c, a, d) {
		this.dragStartOffset = {
			x : a,
			y : d
		};
		this.isDragging = true;
		this.getElement().addCls(this.getDraggingCls())
	},
	onDrag : function (b) {
		if (!this.isDragging) {
			return
		}
		var a = this.dragStartOffset;
		this.fireAction("drag", [this, b, a.x + b.deltaX, a.y + b.deltaY], this.doDrag)
	},
	doDrag : function (b, c, a, d) {
		b.setOffset(a, d)
	},
	onDragEnd : function (a) {
		if (!this.isDragging) {
			return
		}
		this.onDrag(a);
		this.isDragging = false;
		this.getElement().removeCls(this.getDraggingCls());
		this.fireEvent("dragend", this, a, this.offset.x, this.offset.y)
	},
	setOffset : function (i, h, b) {
		var f = this.offset,
		a = this.getConstraint(),
		e = a.min,
		c = a.max,
		d = Math.min,
		g = Math.max;
		if (this.isAxisEnabled("x") && typeof i == "number") {
			i = d(g(i, e.x), c.x)
		} else {
			i = f.x
		}
		if (this.isAxisEnabled("y") && typeof h == "number") {
			h = d(g(h, e.y), c.y)
		} else {
			h = f.y
		}
		f.x = i;
		f.y = h;
		this.getTranslatable().translate(i, h, b)
	},
	getOffset : function () {
		return this.offset
	},
	refreshConstraint : function () {
		this.setConstraint(this.currentConstraint)
	},
	refreshOffset : function () {
		var a = this.offset;
		this.setOffset(a.x, a.y)
	},
	doRefresh : function () {
		this.refreshConstraint();
		this.getTranslatable().refresh();
		this.refreshOffset()
	},
	refresh : function () {
		if (this.sizeMonitor) {
			this.sizeMonitor.refresh()
		}
		if (this.containerSizeMonitor) {
			this.containerSizeMonitor.refresh()
		}
		this.doRefresh()
	},
	enable : function () {
		return this.setDisabled(false)
	},
	disable : function () {
		return this.setDisabled(true)
	},
	destroy : function () {
		var a = this.getTranslatable();
		Ext.destroy(this.containerSizeMonitor, this.sizeMonitor);
		delete this.sizeMonitor;
		delete this.containerSizeMonitor;
		var b = this.getElement();
		if (b && !b.isDestroyed) {
			b.removeCls(this.getCls())
		}
		this.detachListeners();
		if (a) {
			a.destroy()
		}
	}
}, function () {});
Ext.define("Ext.behavior.Draggable", {
	extend : "Ext.behavior.Behavior",
	requires : ["Ext.util.Draggable"],
	constructor : function () {
		this.listeners = {
			painted : "onComponentPainted",
			scope : this
		};
		this.callParent(arguments)
	},
	onComponentPainted : function () {
		this.draggable.refresh()
	},
	setConfig : function (c) {
		var a = this.draggable,
		b = this.component;
		if (c) {
			if (!a) {
				b.setTranslatable(true);
				this.draggable = a = new Ext.util.Draggable(c);
				a.setTranslatable(b.getTranslatable());
				a.setElement(b.renderElement);
				a.on("destroy", "onDraggableDestroy", this);
				if (b.isPainted()) {
					this.onComponentPainted(b)
				}
				b.on(this.listeners)
			} else {
				if (Ext.isObject(c)) {
					a.setConfig(c)
				}
			}
		} else {
			if (a) {
				a.destroy()
			}
		}
		return this
	},
	getDraggable : function () {
		return this.draggable
	},
	onDraggableDestroy : function () {
		var a = this.component;
		delete this.draggable;
		a.un(this.listeners)
	},
	onComponentDestroy : function () {
		var a = this.draggable;
		if (a) {
			a.destroy()
		}
	}
});
(function (a) {
	Ext.define("Ext.Component", {
		extend : "Ext.AbstractComponent",
		alternateClassName : "Ext.lib.Component",
		mixins : ["Ext.mixin.Traversable"],
		requires : ["Ext.ComponentManager", "Ext.XTemplate", "Ext.dom.Element", "Ext.behavior.Translatable", "Ext.behavior.Draggable"],
		xtype : "component",
		observableType : "component",
		cachedConfig : {
			baseCls : null,
			cls : null,
			floatingCls : null,
			hiddenCls : a + "item-hidden",
			ui : null,
			margin : null,
			padding : null,
			border : null,
			styleHtmlCls : a + "html",
			styleHtmlContent : null
		},
		eventedConfig : {
			left : null,
			top : null,
			right : null,
			bottom : null,
			width : null,
			height : null,
			minWidth : null,
			minHeight : null,
			maxWidth : null,
			maxHeight : null,
			docked : null,
			centered : null,
			hidden : null,
			disabled : null
		},
		config : {
			style : null,
			html : null,
			draggable : null,
			translatable : null,
			renderTo : null,
			zIndex : null,
			tpl : null,
			enterAnimation : null,
			exitAnimation : null,
			showAnimation : null,
			hideAnimation : null,
			tplWriteMode : "overwrite",
			data : null,
			disabledCls : a + "item-disabled",
			contentEl : null,
			itemId : undefined,
			record : null,
			plugins : null
		},
		listenerOptionsRegex : /^(?:delegate|single|delay|buffer|args|prepend|element)$/,
		alignmentRegex : /^([a-z]+)-([a-z]+)(\?)?$/,
		isComponent : true,
		floating : false,
		rendered : false,
		dockPositions : {
			top : true,
			right : true,
			bottom : true,
			left : true
		},
		innerElement : null,
		element : null,
		template : [],
		constructor : function (c) {
			var d = this,
			b = d.config,
			e;
			d.onInitializedListeners = [];
			d.initialConfig = c;
			if (c !== undefined && "id" in c) {
				e = c.id
			} else {
				if ("id" in b) {
					e = b.id
				} else {
					e = d.getId()
				}
			}
			d.id = e;
			d.setId(e);
			Ext.ComponentManager.register(d);
			d.initElement();
			d.initConfig(d.initialConfig);
			d.initialize();
			d.triggerInitialized();
			if (d.config.fullscreen) {
				d.fireEvent("fullscreen", d)
			}
			d.fireEvent("initialize", d)
		},
		beforeInitConfig : function (b) {
			this.beforeInitialize.apply(this, arguments)
		},
		beforeInitialize : Ext.emptyFn,
		initialize : Ext.emptyFn,
		getTemplate : function () {
			return this.template
		},
		getElementConfig : function () {
			return {
				reference : "element",
				children : this.getTemplate()
			}
		},
		triggerInitialized : function () {
			var c = this.onInitializedListeners,
			d = c.length,
			e,
			b;
			if (!this.initialized) {
				this.initialized = true;
				if (d > 0) {
					for (b = 0; b < d; b++) {
						e = c[b];
						e.fn.call(e.scope, this)
					}
					c.length = 0
				}
			}
		},
		onInitialized : function (d, c) {
			var b = this.onInitializedListeners;
			if (!c) {
				c = this
			}
			if (this.initialized) {
				d.call(c, this)
			} else {
				b.push({
					fn : d,
					scope : c
				})
			}
		},
		renderTo : function (b, d) {
			var f = this.renderElement.dom,
			e = Ext.getDom(b),
			c = Ext.getDom(d);
			if (e) {
				if (c) {
					e.insertBefore(f, c)
				} else {
					e.appendChild(f)
				}
				this.setRendered(Boolean(f.offsetParent))
			}
		},
		setParent : function (c) {
			var b = this.parent;
			if (c && b && b !== c) {
				b.remove(this, false)
			}
			this.parent = c;
			return this
		},
		applyPlugins : function (b) {
			var d,
			c,
			e;
			if (!b) {
				return b
			}
			b = [].concat(b);
			for (c = 0, d = b.length; c < d; c++) {
				e = b[c];
				b[c] = Ext.factory(e, "Ext.plugin.Plugin", null, "plugin")
			}
			return b
		},
		updatePlugins : function (e, b) {
			var d,
			c;
			if (e) {
				for (c = 0, d = e.length; c < d; c++) {
					e[c].init(this)
				}
			}
			if (b) {
				for (c = 0, d = b.length; c < d; c++) {
					Ext.destroy(b[c])
				}
			}
		},
		updateRenderTo : function (b) {
			this.renderTo(b)
		},
		updateStyle : function (b) {
			this.element.applyStyles(b)
		},
		updateBorder : function (b) {
			this.element.setBorder(b)
		},
		updatePadding : function (b) {
			this.innerElement.setPadding(b)
		},
		updateMargin : function (b) {
			this.element.setMargin(b)
		},
		updateUi : function (b, d) {
			var c = this.getBaseCls();
			if (c) {
				if (d) {
					this.element.removeCls(d, c)
				}
				if (b) {
					this.element.addCls(b, c)
				}
			}
		},
		applyBaseCls : function (b) {
			return b || a + this.xtype
		},
		updateBaseCls : function (b, c) {
			var d = this,
			e = d.getUi();
			if (b) {
				this.element.addCls(b);
				if (e) {
					this.element.addCls(b, null, e)
				}
			}
			if (c) {
				this.element.removeCls(c);
				if (e) {
					this.element.removeCls(c, null, e)
				}
			}
		},
		addCls : function (b, h, j) {
			var e = this.getCls(),
			g = (e) ? e.slice() : [],
			f,
			d,
			c;
			h = h || "";
			j = j || "";
			if (typeof b == "string") {
				b = [b]
			}
			f = b.length;
			if (!g.length && h === "" && j === "") {
				g = b
			} else {
				for (d = 0; d < f; d++) {
					c = h + b[d] + j;
					if (g.indexOf(c) == -1) {
						g.push(c)
					}
				}
			}
			this.setCls(g)
		},
		removeCls : function (b, g, h) {
			var d = this.getCls(),
			f = (d) ? d.slice() : [],
			e,
			c;
			g = g || "";
			h = h || "";
			if (typeof b == "string") {
				f = Ext.Array.remove(f, g + b + h)
			} else {
				e = b.length;
				for (c = 0; c < e; c++) {
					f = Ext.Array.remove(f, g + b[c] + h)
				}
			}
			this.setCls(f)
		},
		replaceCls : function (e, j, d, h) {
			var k = this.getCls(),
			f = (k) ? k.slice() : [],
			g,
			c,
			b;
			d = d || "";
			h = h || "";
			if (typeof e == "string") {
				f = Ext.Array.remove(f, d + e + h)
			} else {
				if (e) {
					g = e.length;
					for (c = 0; c < g; c++) {
						f = Ext.Array.remove(f, d + e[c] + h)
					}
				}
			}
			if (typeof j == "string") {
				f.push(d + j + h)
			} else {
				if (j) {
					g = j.length;
					if (!f.length && d === "" && h === "") {
						f = j
					} else {
						for (c = 0; c < g; c++) {
							b = d + j[c] + h;
							if (f.indexOf(b) == -1) {
								f.push(b)
							}
						}
					}
				}
			}
			this.setCls(f)
		},
		applyCls : function (b) {
			if (typeof b == "string") {
				b = [b]
			}
			if (!b || !b.length) {
				b = null
			}
			return b
		},
		updateCls : function (c, b) {
			if (b != c && this.element) {
				this.element.replaceCls(b, c)
			}
		},
		updateStyleHtmlCls : function (d, b) {
			var e = this.innerHtmlElement,
			c = this.innerElement;
			if (this.getStyleHtmlContent() && b) {
				if (e) {
					e.replaceCls(b, d)
				} else {
					c.replaceCls(b, d)
				}
			}
		},
		applyStyleHtmlContent : function (b) {
			return Boolean(b)
		},
		updateStyleHtmlContent : function (d) {
			var b = this.getStyleHtmlCls(),
			c = this.innerElement,
			e = this.innerHtmlElement;
			if (d) {
				if (e) {
					e.addCls(b)
				} else {
					c.addCls(b)
				}
			} else {
				if (e) {
					e.removeCls(b)
				} else {
					c.addCls(b)
				}
			}
		},
		applyContentEl : function (b) {
			if (b) {
				return Ext.get(b)
			}
		},
		updateContentEl : function (b, c) {
			if (c) {
				c.hide();
				Ext.getBody().append(c)
			}
			if (b) {
				this.setHtml(b.dom);
				b.show()
			}
		},
		getSize : function () {
			return {
				width : this.getWidth(),
				height : this.getHeight()
			}
		},
		isCentered : function () {
			return Boolean(this.getCentered())
		},
		isFloating : function () {
			return this.floating
		},
		isDocked : function () {
			return Boolean(this.getDocked())
		},
		isInnerItem : function () {
			var b = this;
			return !b.isCentered() && !b.isFloating() && !b.isDocked()
		},
		filterPositionValue : function (b) {
			if (b === "" || b === "auto") {
				b = null
			}
			return b
		},
		applyTop : function (b) {
			return this.filterPositionValue(b)
		},
		applyRight : function (b) {
			return this.filterPositionValue(b)
		},
		applyBottom : function (b) {
			return this.filterPositionValue(b)
		},
		applyLeft : function (b) {
			return this.filterPositionValue(b)
		},
		doSetTop : function (b) {
			this.updateFloating();
			this.element.setTop(b)
		},
		doSetRight : function (b) {
			this.updateFloating();
			this.element.setRight(b)
		},
		doSetBottom : function (b) {
			this.updateFloating();
			this.element.setBottom(b)
		},
		doSetLeft : function (b) {
			this.updateFloating();
			this.element.setLeft(b)
		},
		doSetWidth : function (b) {
			this.element.setWidth(b)
		},
		doSetHeight : function (b) {
			this.element.setHeight(b)
		},
		doSetMinWidth : function (b) {
			this.element.setMinWidth(b)
		},
		doSetMinHeight : function (b) {
			this.element.setMinHeight(b)
		},
		doSetMaxWidth : function (b) {
			this.element.setMaxWidth(b)
		},
		doSetMaxHeight : function (b) {
			this.element.setMaxHeight(b)
		},
		applyCentered : function (b) {
			b = Boolean(b);
			if (b) {
				if (this.isFloating()) {
					this.resetFloating()
				}
				if (this.isDocked()) {
					this.setDocked(false)
				}
			}
			return b
		},
		doSetCentered : Ext.emptyFn,
		applyDocked : function (b) {
			if (!b) {
				return null
			}
			if (!this.dockPositions[b]) {
				return
			}
			if (this.isFloating()) {
				this.resetFloating()
			}
			if (this.isCentered()) {
				this.setCentered(false)
			}
			return b
		},
		doSetDocked : Ext.emptyFn,
		resetFloating : function () {
			this.setTop(null);
			this.setRight(null);
			this.setBottom(null);
			this.setLeft(null)
		},
		updateFloating : function () {
			var c = true,
			b = this.getFloatingCls();
			if (this.getTop() === null && this.getBottom() === null && this.getRight() === null && this.getLeft() === null) {
				c = false
			}
			if (c !== this.floating) {
				if (c) {
					if (this.isCentered()) {
						this.setCentered(false)
					}
					if (this.isDocked()) {
						this.setDocked(false)
					}
					if (b) {
						this.addCls(b)
					}
				} else {
					if (b) {
						this.removeCls(b)
					}
				}
				this.floating = c;
				this.fireEvent("floatingchange", this, c)
			}
		},
		updateFloatingCls : function (b, c) {
			if (this.isFloating()) {
				this.replaceCls(c, b)
			}
		},
		applyDisabled : function (b) {
			return Boolean(b)
		},
		doSetDisabled : function (b) {
			this.element[b ? "addCls" : "removeCls"](this.getDisabledCls())
		},
		updateDisabledCls : function (b, c) {
			if (this.isDisabled()) {
				this.element.replaceCls(c, b)
			}
		},
		disable : function () {
			this.setDisabled(true)
		},
		enable : function () {
			this.setDisabled(false)
		},
		isDisabled : function () {
			return this.getDisabled()
		},
		applyZIndex : function (b) {
			if (b !== null) {
				b = Number(b);
				if (isNaN(b)) {
					b = null
				}
			}
			return b
		},
		updateZIndex : function (c) {
			var b = this.element.dom.style;
			if (c !== null) {
				b.setProperty("z-index", c, "important")
			} else {
				b.removeProperty("z-index")
			}
		},
		getInnerHtmlElement : function () {
			var b = this.innerHtmlElement,
			c = this.getStyleHtmlCls();
			if (!b || !b.dom || !b.dom.parentNode) {
				this.innerHtmlElement = b = this.innerElement.createChild({
						cls : "x-innerhtml "
					});
				if (this.getStyleHtmlContent()) {
					this.innerHtmlElement.addCls(c);
					this.innerElement.removeCls(c)
				}
			}
			return b
		},
		updateHtml : function (b) {
			var c = this.getInnerHtmlElement();
			if (Ext.isElement(b)) {
				c.setHtml("");
				c.append(b)
			} else {
				c.setHtml(b)
			}
		},
		applyHidden : function (b) {
			return Boolean(b)
		},
		doSetHidden : function (c) {
			var b = this.renderElement;
			if (b.isDestroyed) {
				return
			}
			if (c) {
				b.hide()
			} else {
				b.show()
			}
			if (this.element) {
				this.element[c ? "addCls" : "removeCls"](this.getHiddenCls())
			}
			this.fireEvent(c ? "hide" : "show", this)
		},
		updateHiddenCls : function (b, c) {
			if (this.isHidden()) {
				this.element.replaceCls(c, b)
			}
		},
		isHidden : function () {
			return this.getHidden()
		},
		hide : function (b) {
			if (!this.getHidden()) {
				if (b === undefined || (b && b.isComponent)) {
					b = this.getHideAnimation()
				}
				if (b) {
					if (b === true) {
						b = "fadeOut"
					}
					this.onBefore({
						hiddenchange : "animateFn",
						scope : this,
						single : true,
						args : [b]
					})
				}
				this.setHidden(true)
			}
			return this
		},
		show : function (c) {
			var b = this.getHidden();
			if (b || b === null) {
				if (c === true) {
					c = "fadeIn"
				} else {
					if (c === undefined || (c && c.isComponent)) {
						c = this.getShowAnimation()
					}
				}
				if (c) {
					this.onBefore({
						hiddenchange : "animateFn",
						scope : this,
						single : true,
						args : [c]
					})
				}
				this.setHidden(false)
			}
			return this
		},
		animateFn : function (g, e, h, d, c, b) {
			if (g && (!h || (h && this.isPainted()))) {
				var f = new Ext.fx.Animation(g);
				f.setElement(e.element);
				if (h) {
					f.setOnEnd(function () {
						b.resume()
					});
					b.pause()
				}
				Ext.Animator.run(f)
			}
		},
		setVisibility : function (b) {
			this.renderElement.setVisibility(b)
		},
		isRendered : function () {
			return this.rendered
		},
		isPainted : function () {
			return this.renderElement.isPainted()
		},
		applyTpl : function (b) {
			return (Ext.isObject(b) && b.isTemplate) ? b : new Ext.XTemplate(b)
		},
		applyData : function (b) {
			if (Ext.isObject(b)) {
				return Ext.apply({}, b)
			}
			return b
		},
		updateData : function (d) {
			var e = this;
			if (d) {
				var c = e.getTpl(),
				b = e.getTplWriteMode();
				if (c) {
					c[b](e.getInnerHtmlElement(), d)
				}
				this.fireEvent("updatedata", e, d)
			}
		},
		applyRecord : function (b) {
			if (b && Ext.isObject(b) && b.isModel) {
				return b
			}
			return null
		},
		updateRecord : function (c, b) {
			var d = this;
			if (b) {
				b.unjoin(d)
			}
			if (!c) {
				d.updateData("")
			} else {
				c.join(d);
				d.updateData(c.getData(true))
			}
		},
		afterEdit : function () {
			this.updateRecord(this.getRecord())
		},
		afterErase : function () {
			this.setRecord(null)
		},
		applyItemId : function (b) {
			return b || this.getId()
		},
		isXType : function (c, b) {
			if (b) {
				return this.xtypes.indexOf(c) != -1
			}
			return Boolean(this.xtypesMap[c])
		},
		getXTypes : function () {
			return this.xtypesChain.join("/")
		},
		getDraggableBehavior : function () {
			var b = this.draggableBehavior;
			if (!b) {
				b = this.draggableBehavior = new Ext.behavior.Draggable(this)
			}
			return b
		},
		applyDraggable : function (b) {
			this.getDraggableBehavior().setConfig(b)
		},
		getDraggable : function () {
			return this.getDraggableBehavior().getDraggable()
		},
		getTranslatableBehavior : function () {
			var b = this.translatableBehavior;
			if (!b) {
				b = this.translatableBehavior = new Ext.behavior.Translatable(this)
			}
			return b
		},
		applyTranslatable : function (b) {
			this.getTranslatableBehavior().setConfig(b)
		},
		getTranslatable : function () {
			return this.getTranslatableBehavior().getTranslatable()
		},
		translateAxis : function (c, e, d) {
			var b,
			f;
			if (c === "x") {
				b = e
			} else {
				f = e
			}
			return this.translate(b, f, d)
		},
		translate : function () {
			var b = this.getTranslatable();
			if (!b) {
				this.setTranslatable(true);
				b = this.getTranslatable()
			}
			b.translate.apply(b, arguments)
		},
		setRendered : function (c) {
			var b = this.rendered;
			if (c !== b) {
				this.rendered = c;
				return true
			}
			return false
		},
		setSize : function (c, b) {
			if (c != undefined) {
				this.setWidth(c)
			}
			if (b != undefined) {
				this.setHeight(b)
			}
		},
		doAddListener : function (d, f, e, c, b) {
			if (c && "element" in c) {
				this[c.element].doAddListener(d, f, e || this, c, b)
			}
			return this.callParent(arguments)
		},
		doRemoveListener : function (d, f, e, c, b) {
			if (c && "element" in c) {
				this[c.element].doRemoveListener(d, f, e || this, c, b)
			}
			return this.callParent(arguments)
		},
		showBy : function (d, f) {
			var c = Ext.Array.from(arguments);
			var b = Ext.Viewport,
			e = this.getParent();
			this.setVisibility(false);
			if (e !== b) {
				b.add(this)
			}
			this.show();
			this.on("erased", "onShowByErased", this, {
				single : true
			});
			b.on("resize", "refreshShowBy", this, {
				args : [d, f]
			});
			this.currentShowByArgs = c;
			this.alignTo(d, f);
			this.setVisibility(true)
		},
		refreshShowBy : function (b, c) {
			this.alignTo(b, c)
		},
		onShowByErased : function () {
			Ext.Viewport.un("resize", "refreshShowBy", this)
		},
		alignTo : function (o, j) {
			var f = o.isComponent ? o.renderElement : o,
			c = this.renderElement,
			q = f.getPageBox(),
			B = this.getParent().element.getPageBox(),
			n = c.getPageBox(),
			y = q.height,
			p = q.width,
			t = n.height,
			v = n.width;
			B.bottom -= 5;
			B.height -= 10;
			B.left += 5;
			B.right -= 5;
			B.top += 5;
			B.width -= 10;
			if (!j || j === "auto") {
				if (B.bottom - q.bottom < t) {
					if (q.top - B.top < t) {
						if (q.left - B.left < v) {
							j = "cl-cr?"
						} else {
							j = "cr-cl?"
						}
					} else {
						j = "bc-tc?"
					}
				} else {
					j = "tc-bc?"
				}
			}
			var b = j.match(this.alignmentRegex);
			var w = b[1].split(""),
			d = b[2].split(""),
			z = (b[3] === "?"),
			i = w[0],
			u = w[1] || i,
			m = d[0],
			l = d[1] || m,
			r = q.top,
			e = q.left,
			k = y / 2,
			g = p / 2,
			h = v / 2,
			s = t / 2,
			x,
			A;
			switch (i) {
			case "t":
				switch (m) {
				case "c":
					r += k;
					break;
				case "b":
					r += y
				}
				break;
			case "b":
				switch (m) {
				case "c":
					r -= (t - k);
					break;
				case "t":
					r -= t;
					break;
				case "b":
					r -= t - y
				}
				break;
			case "c":
				switch (m) {
				case "t":
					r -= s;
					break;
				case "c":
					r -= (s - k);
					break;
				case "b":
					r -= (s - y)
				}
				break
			}
			switch (u) {
			case "l":
				switch (l) {
				case "c":
					e += k;
					break;
				case "r":
					e += p
				}
				break;
			case "r":
				switch (l) {
				case "r":
					e -= (v - p);
					break;
				case "c":
					e -= (v - h);
					break;
				case "l":
					e -= v
				}
				break;
			case "c":
				switch (l) {
				case "l":
					e -= h;
					break;
				case "c":
					e -= (h - g);
					break;
				case "r":
					e -= (h - p)
				}
				break
			}
			if (z) {
				x = (B.left + B.width) - v;
				A = (B.top + B.height) - t;
				e = Math.max(B.left, Math.min(x, e));
				r = Math.max(B.top, Math.min(A, r))
			}
			this.setLeft(e);
			this.setTop(r)
		},
		up : function (c) {
			var b = this.parent;
			if (c) {
				for (; b; b = b.parent) {
					if (Ext.ComponentQuery.is(b, c)) {
						return b
					}
				}
			}
			return b
		},
		getBubbleTarget : function () {
			return this.getParent()
		},
		destroy : function () {
			this.destroy = Ext.emptyFn;
			var e = this.getParent(),
			c = this.referenceList,
			d,
			f,
			b;
			Ext.destroy(this.getTranslatable(), this.getPlugins());
			if (e) {
				e.remove(this, false)
			}
			for (d = 0, f = c.length; d < f; d++) {
				b = c[d];
				this[b].destroy();
				delete this[b]
			}
			Ext.destroy(this.innerHtmlElement);
			this.setRecord(null);
			Ext.ComponentManager.unregister(this);
			this.callParent()
		}
	}, function () {})
})(Ext.baseCSSPrefix);
Ext.define("Ext.event.publisher.ComponentDelegation", {
	extend : "Ext.event.publisher.Publisher",
	requires : ["Ext.Component", "Ext.ComponentQuery"],
	targetType : "component",
	optimizedSelectorRegex : /^#([\w\-]+)((?:[\s]*)>(?:[\s]*)|(?:\s*))([\w\-]+)$/i,
	handledEvents : ["*"],
	getSubscribers : function (b, a) {
		var d = this.subscribers,
		c = d[b];
		if (!c && a) {
			c = d[b] = {
				type : {
					$length : 0
				},
				selector : [],
				$length : 0
			}
		}
		return c
	},
	subscribe : function (g, f) {
		if (this.idSelectorRegex.test(g)) {
			return false
		}
		var e = g.match(this.optimizedSelectorRegex),
		a = this.getSubscribers(f, true),
		k = a.type,
		c = a.selector,
		d,
		i,
		j,
		b,
		h;
		if (e !== null) {
			d = e[1];
			i = e[2].indexOf(">") === -1;
			j = e[3];
			b = k[j];
			if (!b) {
				k[j] = b = {
					descendents : {
						$length : 0
					},
					children : {
						$length : 0
					},
					$length : 0
				}
			}
			h = i ? b.descendents : b.children;
			if (h.hasOwnProperty(d)) {
				h[d]++;
				return true
			}
			h[d] = 1;
			h.$length++;
			b.$length++;
			k.$length++
		} else {
			if (c.hasOwnProperty(g)) {
				c[g]++;
				return true
			}
			c[g] = 1;
			c.push(g)
		}
		a.$length++;
		return true
	},
	unsubscribe : function (g, f, k) {
		var a = this.getSubscribers(f);
		if (!a) {
			return false
		}
		var e = g.match(this.optimizedSelectorRegex),
		l = a.type,
		c = a.selector,
		d,
		i,
		j,
		b,
		h;
		k = Boolean(k);
		if (e !== null) {
			d = e[1];
			i = e[2].indexOf(">") === -1;
			j = e[3];
			b = l[j];
			if (!b) {
				return true
			}
			h = i ? b.descendents : b.children;
			if (!h.hasOwnProperty(d) || (!k && --h[d] > 0)) {
				return true
			}
			delete h[d];
			h.$length--;
			b.$length--;
			l.$length--
		} else {
			if (!c.hasOwnProperty(g) || (!k && --c[g] > 0)) {
				return true
			}
			delete c[g];
			Ext.Array.remove(c, g)
		}
		if (--a.$length === 0) {
			delete this.subscribers[f]
		}
		return true
	},
	notify : function (d, a) {
		var c = this.getSubscribers(a),
		e,
		b;
		if (!c || c.$length === 0) {
			return false
		}
		e = d.substr(1);
		b = Ext.ComponentManager.get(e);
		if (b) {
			this.dispatcher.doAddListener(this.targetType, d, a, "publish", this, {
				args : [a, b]
			}, "before")
		}
	},
	matchesSelector : function (b, a) {
		return Ext.ComponentQuery.is(b, a)
	},
	dispatch : function (d, b, c, a) {
		this.dispatcher.doDispatchEvent(this.targetType, d, b, c, null, a)
	},
	publish : function (g, k) {
		var e = this.getSubscribers(g);
		if (!e) {
			return
		}
		var p = arguments[arguments.length - 1],
		o = e.type,
		b = e.selector,
		d = Array.prototype.slice.call(arguments, 2, -2),
		l = k.xtypesChain,
		s,
		n,
		t,
		a,
		m,
		v,
		r,
		u,
		h,
		f,
		q,
		c;
		for (u = 0, h = l.length; u < h; u++) {
			f = l[u];
			e = o[f];
			if (e && e.$length > 0) {
				s = e.descendents;
				if (s.$length > 0) {
					if (!a) {
						a = k.getAncestorIds()
					}
					for (q = 0, c = a.length; q < c; q++) {
						m = a[q];
						if (s.hasOwnProperty(m)) {
							this.dispatch("#" + m + " " + f, g, d, p)
						}
					}
				}
				n = e.children;
				if (n.$length > 0) {
					if (!t) {
						if (a) {
							t = a[0]
						} else {
							v = k.getParent();
							if (v) {
								t = v.getId()
							}
						}
					}
					if (t) {
						if (n.hasOwnProperty(t)) {
							this.dispatch("#" + t + " > " + f, g, d, p)
						}
					}
				}
			}
		}
		h = b.length;
		if (h > 0) {
			for (u = 0; u < h; u++) {
				r = b[u];
				if (this.matchesSelector(k, r)) {
					this.dispatch(r, g, d, p)
				}
			}
		}
	}
});
Ext.define("Ext.event.publisher.ComponentPaint", {
	extend : "Ext.event.publisher.Publisher",
	targetType : "component",
	handledEvents : ["painted", "erased"],
	eventNames : {
		painted : "painted",
		erased : "erased"
	},
	constructor : function () {
		this.callParent(arguments);
		this.hiddenQueue = {};
		this.renderedQueue = {}
		
	},
	getSubscribers : function (b, a) {
		var c = this.subscribers;
		if (!c.hasOwnProperty(b)) {
			if (!a) {
				return null
			}
			c[b] = {
				$length : 0
			}
		}
		return c[b]
	},
	setDispatcher : function (a) {
		var b = this.targetType;
		a.doAddListener(b, "*", "renderedchange", "onBeforeComponentRenderedChange", this, null, "before");
		a.doAddListener(b, "*", "hiddenchange", "onBeforeComponentHiddenChange", this, null, "before");
		a.doAddListener(b, "*", "renderedchange", "onComponentRenderedChange", this, null, "after");
		a.doAddListener(b, "*", "hiddenchange", "onComponentHiddenChange", this, null, "after");
		return this.callParent(arguments)
	},
	subscribe : function (d, a) {
		var b = d.match(this.idSelectorRegex),
		c,
		e;
		if (!b) {
			return false
		}
		e = b[1];
		c = this.getSubscribers(a, true);
		if (c.hasOwnProperty(e)) {
			c[e]++;
			return true
		}
		c[e] = 1;
		c.$length++;
		return true
	},
	unsubscribe : function (e, a, c) {
		var b = e.match(this.idSelectorRegex),
		d,
		f;
		if (!b || !(d = this.getSubscribers(a))) {
			return false
		}
		f = b[1];
		if (!d.hasOwnProperty(f) || (!c && --d[f] > 0)) {
			return true
		}
		delete d[f];
		if (--d.$length === 0) {
			delete this.subscribers[a]
		}
		return true
	},
	onBeforeComponentRenderedChange : function (b, d, g) {
		var f = this.eventNames,
		c = g ? f.painted : f.erased,
		e = this.getSubscribers(c),
		a;
		if (e && e.$length > 0) {
			this.renderedQueue[d.getId()] = a = [];
			this.publish(e, d, c, a)
		}
	},
	onBeforeComponentHiddenChange : function (c, d) {
		var f = this.eventNames,
		b = d ? f.erased : f.painted,
		e = this.getSubscribers(b),
		a;
		if (e && e.$length > 0) {
			this.hiddenQueue[c.getId()] = a = [];
			this.publish(e, c, b, a)
		}
	},
	onComponentRenderedChange : function (b, c) {
		var d = this.renderedQueue,
		e = c.getId(),
		a;
		if (!d.hasOwnProperty(e)) {
			return
		}
		a = d[e];
		delete d[e];
		if (a.length > 0) {
			this.dispatchQueue(a)
		}
	},
	onComponentHiddenChange : function (c) {
		var b = this.hiddenQueue,
		d = c.getId(),
		a;
		if (!b.hasOwnProperty(d)) {
			return
		}
		a = b[d];
		delete b[d];
		if (a.length > 0) {
			this.dispatchQueue(a)
		}
	},
	dispatchQueue : function (g) {
		var l = this.dispatcher,
		a = this.targetType,
		b = this.eventNames,
		e = g.slice(),
		f = e.length,
		c,
		k,
		h,
		d,
		j;
		g.length = 0;
		if (f > 0) {
			for (c = 0; c < f; c++) {
				k = e[c];
				h = k.component;
				d = k.eventName;
				j = h.isPainted();
				if ((d === b.painted && j) || d === b.erased && !j) {
					l.doDispatchEvent(a, "#" + k.id, d, [h])
				}
			}
			e.length = 0
		}
	},
	publish : function (a, k, f, j) {
		var c = k.getId(),
		b = false,
		d,
		h,
		e,
		g,
		l;
		if (a[c]) {
			d = this.eventNames;
			l = k.isPainted();
			if ((f === d.painted && !l) || f === d.erased && l) {
				b = true
			} else {
				return this
			}
		}
		if (k.isContainer) {
			h = k.getItems().items;
			for (e = 0, g = h.length; e < g; e++) {
				this.publish(a, h[e], f, j)
			}
		} else {
			if (k.isDecorator) {
				this.publish(a, k.getComponent(), f, j)
			}
		}
		if (b) {
			j.push({
				id : c,
				eventName : f,
				component : k
			})
		}
	}
});
Ext.define("Ext.event.publisher.ComponentSize", {
	extend : "Ext.event.publisher.Publisher",
	requires : ["Ext.ComponentManager", "Ext.util.SizeMonitor"],
	targetType : "component",
	handledEvents : ["resize"],
	constructor : function () {
		this.callParent(arguments);
		this.sizeMonitors = {}
		
	},
	subscribe : function (g) {
		var c = g.match(this.idSelectorRegex),
		f = this.subscribers,
		a = this.sizeMonitors,
		d = this.dispatcher,
		e = this.targetType,
		b;
		if (!c) {
			return false
		}
		if (!f.hasOwnProperty(g)) {
			f[g] = 0;
			d.addListener(e, g, "painted", "onComponentPainted", this, null, "before");
			b = Ext.ComponentManager.get(c[1]);
			a[g] = new Ext.util.SizeMonitor({
					element : b.element,
					callback : this.onComponentSizeChange,
					scope : this,
					args : [this, g]
				})
		}
		f[g]++;
		return true
	},
	unsubscribe : function (h, b, e) {
		var c = h.match(this.idSelectorRegex),
		g = this.subscribers,
		d = this.dispatcher,
		f = this.targetType,
		a = this.sizeMonitors;
		if (!c) {
			return false
		}
		if (!g.hasOwnProperty(h) || (!e && --g[h] > 0)) {
			return true
		}
		a[h].destroy();
		delete a[h];
		d.removeListener(f, h, "painted", "onComponentPainted", this, "before");
		delete g[h];
		return true
	},
	onComponentPainted : function (b) {
		var c = b.getObservableId(),
		a = this.sizeMonitors[c];
		a.refresh()
	},
	onComponentSizeChange : function (a, b) {
		this.dispatcher.doDispatchEvent(this.targetType, b, "resize", [a])
	}
});
Ext.define("Ext.log.Base", {
	config : {},
	constructor : function (a) {
		this.initConfig(a);
		return this
	}
});
(function () {
	var a = Ext.define("Ext.log.Logger", {
			extend : "Ext.log.Base",
			statics : {
				defaultPriority : "info",
				priorities : {
					verbose : 0,
					info : 1,
					deprecate : 2,
					warn : 3,
					error : 4
				}
			},
			config : {
				enabled : true,
				minPriority : "deprecate",
				writers : {}
				
			},
			log : function (m, k, c) {
				if (!this.getEnabled()) {
					return this
				}
				var h = a,
				n = h.priorities,
				j = n[k],
				d = this.log.caller,
				l = "",
				e = this.getWriters(),
				b,
				f,
				g;
				if (!k) {
					k = "info"
				}
				if (n[this.getMinPriority()] > j) {
					return this
				}
				if (!c) {
					c = 1
				}
				if (Ext.isArray(m)) {
					m = m.join(" ")
				} else {
					m = String(m)
				}
				if (typeof c == "number") {
					f = c;
					do {
						f--;
						d = d.caller;
						if (!d) {
							break
						}
						if (!g) {
							g = d.caller
						}
						if (f <= 0 && d.displayName) {
							break
						}
					} while (d !== g);
					l = Ext.getDisplayName(d)
				} else {
					d = d.caller;
					l = Ext.getDisplayName(c) + "#" + d.$name
				}
				b = {
					time : Ext.Date.now(),
					priority : j,
					priorityName : k,
					message : m,
					caller : d,
					callerDisplayName : l
				};
				for (f in e) {
					if (e.hasOwnProperty(f)) {
						e[f].write(Ext.merge({}, b))
					}
				}
				return this
			}
		}, function () {
			Ext.Object.each(this.priorities, function (b) {
				this.override(b, function (c, d) {
					if (!d) {
						d = 1
					}
					if (typeof d == "number") {
						d += 1
					}
					this.log(c, b, d)
				})
			}, this)
		})
})();
Ext.define("Ext.log.formatter.Formatter", {
	extend : "Ext.log.Base",
	config : {
		messageFormat : "{message}"
	},
	format : function (a) {
		return this.substitute(this.getMessageFormat(), a)
	},
	substitute : function (b, d) {
		var a,
		c;
		for (a in d) {
			if (d.hasOwnProperty(a)) {
				c = d[a];
				b = b.replace(new RegExp("\\{" + a + "\\}", "g"), c)
			}
		}
		return b
	}
});
Ext.define("Ext.log.writer.Writer", {
	extend : "Ext.log.Base",
	requires : ["Ext.log.formatter.Formatter"],
	config : {
		formatter : null,
		filters : {}
		
	},
	constructor : function () {
		this.activeFilters = [];
		return this.callParent(arguments)
	},
	updateFilters : function (c) {
		var d = this.activeFilters,
		a,
		b;
		d.length = 0;
		for (a in c) {
			if (c.hasOwnProperty(a)) {
				b = c[a];
				d.push(b)
			}
		}
	},
	write : function (f) {
		var e = this.activeFilters,
		b = this.getFormatter(),
		a,
		d,
		c;
		for (a = 0, d = e.length; a < d; a++) {
			c = e[a];
			if (!e[a].accept(f)) {
				return this
			}
		}
		if (b) {
			f.message = b.format(f)
		}
		this.doWrite(f);
		return this
	},
	doWrite : Ext.emptyFn
});
Ext.define("Ext.log.writer.Console", {
	extend : "Ext.log.writer.Writer",
	config : {
		throwOnErrors : true,
		throwOnWarnings : false
	},
	doWrite : function (d) {
		var c = d.message,
		b = d.priorityName,
		a;
		if (b === "error" && this.getThrowOnErrors()) {
			throw new Error(c)
		}
		if (typeof console !== "undefined") {
			a = b;
			if (a === "deprecate") {
				a = "warn"
			}
			if (a === "warn" && this.getThrowOnWarnings()) {
				throw new Error(c)
			}
			if (!(a in console)) {
				a = "log"
			}
			console[a](c)
		}
	}
});
Ext.define("Ext.log.formatter.Default", {
	extend : "Ext.log.formatter.Formatter",
	config : {
		messageFormat : "[{priorityName}][{callerDisplayName}] {message}"
	},
	format : function (a) {
		var a = Ext.merge({}, a, {
				priorityName : a.priorityName.toUpperCase()
			});
		return this.callParent([a])
	}
});
Ext.define("Ext.fx.State", {
	isAnimatable : {
		"background-color" : true,
		"background-image" : true,
		"background-position" : true,
		"border-bottom-color" : true,
		"border-bottom-width" : true,
		"border-color" : true,
		"border-left-color" : true,
		"border-left-width" : true,
		"border-right-color" : true,
		"border-right-width" : true,
		"border-spacing" : true,
		"border-top-color" : true,
		"border-top-width" : true,
		"border-width" : true,
		bottom : true,
		color : true,
		crop : true,
		"font-size" : true,
		"font-weight" : true,
		height : true,
		left : true,
		"letter-spacing" : true,
		"line-height" : true,
		"margin-bottom" : true,
		"margin-left" : true,
		"margin-right" : true,
		"margin-top" : true,
		"max-height" : true,
		"max-width" : true,
		"min-height" : true,
		"min-width" : true,
		opacity : true,
		"outline-color" : true,
		"outline-offset" : true,
		"outline-width" : true,
		"padding-bottom" : true,
		"padding-left" : true,
		"padding-right" : true,
		"padding-top" : true,
		right : true,
		"text-indent" : true,
		"text-shadow" : true,
		top : true,
		"vertical-align" : true,
		visibility : true,
		width : true,
		"word-spacing" : true,
		"z-index" : true,
		zoom : true,
		transform : true
	},
	constructor : function (a) {
		this.data = {};
		this.set(a)
	},
	setConfig : function (a) {
		this.set(a);
		return this
	},
	setRaw : function (a) {
		this.data = a;
		return this
	},
	clear : function () {
		return this.setRaw({})
	},
	setTransform : function (c, g) {
		var f = this.data,
		a = Ext.isArray(g),
		b = f.transform,
		e,
		d;
		if (!b) {
			b = f.transform = {
				translateX : 0,
				translateY : 0,
				translateZ : 0,
				scaleX : 1,
				scaleY : 1,
				scaleZ : 1,
				rotate : 0,
				rotateX : 0,
				rotateY : 0,
				rotateZ : 0,
				skewX : 0,
				skewY : 0
			}
		}
		if (typeof c == "string") {
			switch (c) {
			case "translate":
				if (a) {
					e = g.length;
					if (e == 0) {
						break
					}
					b.translateX = g[0];
					if (e == 1) {
						break
					}
					b.translateY = g[1];
					if (e == 2) {
						break
					}
					b.translateZ = g[2]
				} else {
					b.translateX = g
				}
				break;
			case "rotate":
				if (a) {
					e = g.length;
					if (e == 0) {
						break
					}
					b.rotateX = g[0];
					if (e == 1) {
						break
					}
					b.rotateY = g[1];
					if (e == 2) {
						break
					}
					b.rotateZ = g[2]
				} else {
					b.rotate = g
				}
				break;
			case "scale":
				if (a) {
					e = g.length;
					if (e == 0) {
						break
					}
					b.scaleX = g[0];
					if (e == 1) {
						break
					}
					b.scaleY = g[1];
					if (e == 2) {
						break
					}
					b.scaleZ = g[2]
				} else {
					b.scaleX = g;
					b.scaleY = g
				}
				break;
			case "skew":
				if (a) {
					e = g.length;
					if (e == 0) {
						break
					}
					b.skewX = g[0];
					if (e == 1) {
						break
					}
					b.skewY = g[1]
				} else {
					b.skewX = g
				}
				break;
			default:
				b[c] = g
			}
		} else {
			for (d in c) {
				if (c.hasOwnProperty(d)) {
					g = c[d];
					this.setTransform(d, g)
				}
			}
		}
	},
	set : function (a, d) {
		var c = this.data,
		b;
		if (typeof a != "string") {
			for (b in a) {
				d = a[b];
				if (b === "transform") {
					this.setTransform(d)
				} else {
					c[b] = d
				}
			}
		} else {
			if (a === "transform") {
				this.setTransform(d)
			} else {
				c[a] = d
			}
		}
		return this
	},
	unset : function (a) {
		var b = this.data;
		if (b.hasOwnProperty(a)) {
			delete b[a]
		}
		return this
	},
	getData : function () {
		return this.data
	}
});
Ext.define("Ext.fx.animation.Abstract", {
	extend : "Ext.Evented",
	isAnimation : true,
	requires : ["Ext.fx.State"],
	config : {
		name : "",
		element : null,
		before : null,
		from : {},
		to : {},
		after : null,
		states : {},
		duration : 300,
		easing : "linear",
		iteration : 1,
		direction : "normal",
		delay : 0,
		onBeforeStart : null,
		onEnd : null,
		onBeforeEnd : null,
		scope : null,
		reverse : null,
		preserveEndState : false,
		replacePrevious : true
	},
	STATE_FROM : "0%",
	STATE_TO : "100%",
	DIRECTION_UP : "up",
	DIRECTION_DOWN : "down",
	DIRECTION_LEFT : "left",
	DIRECTION_RIGHT : "right",
	stateNameRegex : /^(?:[\d\.]+)%$/,
	constructor : function () {
		this.states = {};
		this.callParent(arguments);
		return this
	},
	applyElement : function (a) {
		return Ext.get(a)
	},
	applyBefore : function (a, b) {
		if (a) {
			return Ext.factory(a, Ext.fx.State, b)
		}
	},
	applyAfter : function (b, a) {
		if (b) {
			return Ext.factory(b, Ext.fx.State, a)
		}
	},
	setFrom : function (a) {
		return this.setState(this.STATE_FROM, a)
	},
	setTo : function (a) {
		return this.setState(this.STATE_TO, a)
	},
	getFrom : function () {
		return this.getState(this.STATE_FROM)
	},
	getTo : function () {
		return this.getState(this.STATE_TO)
	},
	setStates : function (a) {
		var c = this.stateNameRegex,
		b;
		for (b in a) {
			if (c.test(b)) {
				this.setState(b, a[b])
			}
		}
		return this
	},
	getStates : function () {
		return this.states
	},
	stop : function () {
		this.fireEvent("stop", this)
	},
	destroy : function () {
		this.stop();
		this.callParent()
	},
	setState : function (b, d) {
		var a = this.getStates(),
		c;
		c = Ext.factory(d, Ext.fx.State, a[b]);
		if (c) {
			a[b] = c
		}
		return this
	},
	getState : function (a) {
		return this.getStates()[a]
	},
	getData : function () {
		var k = this.getStates(),
		e = {},
		g = this.getBefore(),
		c = this.getAfter(),
		h = k[this.STATE_FROM],
		i = k[this.STATE_TO],
		j = h.getData(),
		f = i.getData(),
		d,
		b,
		a;
		for (b in k) {
			if (k.hasOwnProperty(b)) {
				a = k[b];
				d = a.getData();
				e[b] = d
			}
		}
		if (Ext.os.is.Android2) {
			e["0.0001%"] = j
		}
		return {
			before : g ? g.getData() : {},
			after : c ? c.getData() : {},
			states : e,
			from : j,
			to : f,
			duration : this.getDuration(),
			iteration : this.getIteration(),
			direction : this.getDirection(),
			easing : this.getEasing(),
			delay : this.getDelay(),
			onEnd : this.getOnEnd(),
			onBeforeEnd : this.getOnBeforeEnd(),
			onBeforeStart : this.getOnBeforeStart(),
			scope : this.getScope(),
			preserveEndState : this.getPreserveEndState(),
			replacePrevious : this.getReplacePrevious()
		}
	}
});
Ext.define("Ext.fx.animation.Slide", {
	extend : "Ext.fx.animation.Abstract",
	alternateClassName : "Ext.fx.animation.SlideIn",
	alias : ["animation.slide", "animation.slideIn"],
	config : {
		direction : "left",
		out : false,
		offset : 0,
		easing : "auto",
		containerBox : "auto",
		elementBox : "auto",
		isElementBoxFit : true,
		useCssTransform : true
	},
	reverseDirectionMap : {
		up : "down",
		down : "up",
		left : "right",
		right : "left"
	},
	applyEasing : function (a) {
		if (a === "auto") {
			return "ease-" + ((this.getOut()) ? "in" : "out")
		}
		return a
	},
	getContainerBox : function () {
		var a = this._containerBox;
		if (a === "auto") {
			a = this.getElement().getParent().getPageBox()
		}
		return a
	},
	getElementBox : function () {
		var a = this._elementBox;
		if (this.getIsElementBoxFit()) {
			return this.getContainerBox()
		}
		if (a === "auto") {
			a = this.getElement().getPageBox()
		}
		return a
	},
	getData : function () {
		var p = this.getElementBox(),
		c = this.getContainerBox(),
		g = p ? p : c,
		n = this.getFrom(),
		o = this.getTo(),
		f = this.getOut(),
		e = this.getOffset(),
		m = this.getDirection(),
		b = this.getUseCssTransform(),
		h = this.getReverse(),
		d = 0,
		a = 0,
		l,
		j,
		k,
		i;
		if (h) {
			m = this.reverseDirectionMap[m]
		}
		switch (m) {
		case this.DIRECTION_UP:
			if (f) {
				a = c.top - g.top - g.height - e
			} else {
				a = c.bottom - g.bottom + g.height + e
			}
			break;
		case this.DIRECTION_DOWN:
			if (f) {
				a = c.bottom - g.bottom + g.height + e
			} else {
				a = c.top - g.height - g.top - e
			}
			break;
		case this.DIRECTION_RIGHT:
			if (f) {
				d = c.right - g.right + g.width + e
			} else {
				d = c.left - g.left - g.width - e
			}
			break;
		case this.DIRECTION_LEFT:
			if (f) {
				d = c.left - g.left - g.width - e
			} else {
				d = c.right - g.right + g.width + e
			}
			break
		}
		l = (f) ? 0 : d;
		j = (f) ? 0 : a;
		if (b) {
			n.setTransform({
				translateX : l,
				translateY : j
			})
		} else {
			n.set("left", l);
			n.set("top", j)
		}
		k = (f) ? d : 0;
		i = (f) ? a : 0;
		if (b) {
			o.setTransform({
				translateX : k,
				translateY : i
			})
		} else {
			o.set("left", k);
			o.set("top", i)
		}
		return this.callParent(arguments)
	}
});
Ext.define("Ext.fx.animation.SlideOut", {
	extend : "Ext.fx.animation.Slide",
	alias : ["animation.slideOut"],
	config : {
		out : true
	}
});
Ext.define("Ext.fx.animation.Fade", {
	extend : "Ext.fx.animation.Abstract",
	alternateClassName : "Ext.fx.animation.FadeIn",
	alias : ["animation.fade", "animation.fadeIn"],
	config : {
		out : false,
		before : {
			display : null,
			opacity : 0
		},
		after : {
			opacity : null
		},
		reverse : null
	},
	updateOut : function (a) {
		var c = this.getTo(),
		b = this.getFrom();
		if (a) {
			b.set("opacity", 1);
			c.set("opacity", 0)
		} else {
			b.set("opacity", 0);
			c.set("opacity", 1)
		}
	}
});
Ext.define("Ext.fx.animation.FadeOut", {
	extend : "Ext.fx.animation.Fade",
	alias : "animation.fadeOut",
	config : {
		out : true,
		before : {}
		
	}
});
Ext.define("Ext.fx.animation.Flip", {
	extend : "Ext.fx.animation.Abstract",
	alias : "animation.flip",
	config : {
		easing : "ease-in",
		direction : "right",
		half : false,
		out : null
	},
	getData : function () {
		var h = this.getFrom(),
		i = this.getTo(),
		g = this.getDirection(),
		b = this.getOut(),
		l = this.getHalf(),
		c = (l) ? 90 : 180,
		e = 1,
		a = 1,
		k = 0,
		j = 0,
		f = 0,
		d = 0;
		if (b) {
			a = 0.8
		} else {
			e = 0.8
		}
		switch (g) {
		case this.DIRECTION_UP:
			if (b) {
				f = c
			} else {
				k = -c
			}
			break;
		case this.DIRECTION_DOWN:
			if (b) {
				f = -c
			} else {
				k = c
			}
			break;
		case this.DIRECTION_RIGHT:
			if (b) {
				d = -c
			} else {
				j = c
			}
			break;
		case this.DIRECTION_LEFT:
			if (b) {
				d = -c
			} else {
				j = c
			}
			break
		}
		h.setTransform({
			rotateX : k,
			rotateY : j,
			scale : e
		});
		i.setTransform({
			rotateX : f,
			rotateY : d,
			scale : a
		});
		return this.callParent(arguments)
	}
});
Ext.define("Ext.fx.animation.Pop", {
	extend : "Ext.fx.animation.Abstract",
	alias : ["animation.pop", "animation.popIn"],
	alternateClassName : "Ext.fx.animation.PopIn",
	config : {
		out : false,
		before : {
			display : null,
			opacity : 0
		},
		after : {
			opacity : null
		}
	},
	getData : function () {
		var c = this.getTo(),
		b = this.getFrom(),
		a = this.getOut();
		if (a) {
			b.set("opacity", 1);
			b.setTransform({
				scale : 1
			});
			c.set("opacity", 0);
			c.setTransform({
				scale : 0
			})
		} else {
			b.set("opacity", 0);
			b.setTransform({
				scale : 0
			});
			c.set("opacity", 1);
			c.setTransform({
				scale : 1
			})
		}
		return this.callParent(arguments)
	}
});
Ext.define("Ext.fx.animation.PopOut", {
	extend : "Ext.fx.animation.Pop",
	alias : "animation.popOut",
	config : {
		out : true,
		before : {}
		
	}
});
Ext.define("Ext.fx.Animation", {
	requires : ["Ext.fx.animation.Slide", "Ext.fx.animation.SlideOut", "Ext.fx.animation.Fade", "Ext.fx.animation.FadeOut", "Ext.fx.animation.Flip", "Ext.fx.animation.Pop", "Ext.fx.animation.PopOut"],
	constructor : function (b) {
		var a = Ext.fx.animation.Abstract,
		c;
		if (typeof b == "string") {
			c = b;
			b = {}
			
		} else {
			if (b && b.type) {
				c = b.type
			}
		}
		if (c) {
			if (Ext.os.is.Android2) {
				if (c == "pop") {
					c = "fade"
				}
				if (c == "popIn") {
					c = "fadeIn"
				}
				if (c == "popOut") {
					c = "fadeOut"
				}
			}
			a = Ext.ClassManager.getByAlias("animation." + c)
		}
		return Ext.factory(b, a)
	}
});
Ext.define("Ext.fx.runner.Css", {
	extend : "Ext.Evented",
	requires : ["Ext.fx.Animation"],
	prefixedProperties : {
		transform : true,
		"transform-origin" : true,
		perspective : true,
		"transform-style" : true,
		transition : true,
		"transition-property" : true,
		"transition-duration" : true,
		"transition-timing-function" : true,
		"transition-delay" : true,
		animation : true,
		"animation-name" : true,
		"animation-duration" : true,
		"animation-iteration-count" : true,
		"animation-direction" : true,
		"animation-timing-function" : true,
		"animation-delay" : true
	},
	lengthProperties : {
		top : true,
		right : true,
		bottom : true,
		left : true,
		width : true,
		height : true,
		"max-height" : true,
		"max-width" : true,
		"min-height" : true,
		"min-width" : true,
		"margin-bottom" : true,
		"margin-left" : true,
		"margin-right" : true,
		"margin-top" : true,
		"padding-bottom" : true,
		"padding-left" : true,
		"padding-right" : true,
		"padding-top" : true,
		"border-bottom-width" : true,
		"border-left-width" : true,
		"border-right-width" : true,
		"border-spacing" : true,
		"border-top-width" : true,
		"border-width" : true,
		"outline-width" : true,
		"letter-spacing" : true,
		"line-height" : true,
		"text-indent" : true,
		"word-spacing" : true,
		"font-size" : true,
		translate : true,
		translateX : true,
		translateY : true,
		translateZ : true,
		translate3d : true
	},
	durationProperties : {
		"transition-duration" : true,
		"transition-delay" : true,
		"animation-duration" : true,
		"animation-delay" : true
	},
	angleProperties : {
		rotate : true,
		rotateX : true,
		rotateY : true,
		rotateZ : true,
		skew : true,
		skewX : true,
		skewY : true
	},
	lengthUnitRegex : /([a-z%]*)$/,
	DEFAULT_UNIT_LENGTH : "px",
	DEFAULT_UNIT_ANGLE : "deg",
	DEFAULT_UNIT_DURATION : "ms",
	formattedNameCache : {},
	constructor : function () {
		var a = Ext.feature.has.Css3dTransforms;
		if (a) {
			this.transformMethods = ["translateX", "translateY", "translateZ", "rotate", "rotateX", "rotateY", "rotateZ", "skewX", "skewY", "scaleX", "scaleY", "scaleZ"]
		} else {
			this.transformMethods = ["translateX", "translateY", "rotate", "skewX", "skewY", "scaleX", "scaleY"]
		}
		this.vendorPrefix = Ext.browser.getStyleDashPrefix();
		this.ruleStylesCache = {};
		return this
	},
	getStyleSheet : function () {
		var c = this.styleSheet,
		a,
		b;
		if (!c) {
			a = document.createElement("style");
			a.type = "text/css";
			(document.head || document.getElementsByTagName("head")[0]).appendChild(a);
			b = document.styleSheets;
			this.styleSheet = c = b[b.length - 1]
		}
		return c
	},
	applyRules : function (i) {
		var g = this.getStyleSheet(),
		k = this.ruleStylesCache,
		j = g.cssRules,
		c,
		e,
		h,
		b,
		d,
		a,
		f;
		for (c in i) {
			e = i[c];
			h = k[c];
			if (h === undefined) {
				d = j.length;
				g.insertRule(c + "{}", d);
				h = k[c] = j.item(d).style
			}
			b = h.$cache;
			if (!b) {
				b = h.$cache = {}
				
			}
			for (a in e) {
				f = this.formatValue(e[a], a);
				a = this.formatName(a);
				if (b[a] !== f) {
					b[a] = f;
					if (f === null) {
						h.removeProperty(a)
					} else {
						h.setProperty(a, f, "important")
					}
				}
			}
		}
		return this
	},
	applyStyles : function (d) {
		var g,
		c,
		f,
		b,
		a,
		e;
		for (g in d) {
			c = document.getElementById(g);
			if (!c) {
				return this
			}
			f = c.style;
			b = d[g];
			for (a in b) {
				e = this.formatValue(b[a], a);
				a = this.formatName(a);
				if (e === null) {
					f.removeProperty(a)
				} else {
					f.setProperty(a, e, "important")
				}
			}
		}
		return this
	},
	formatName : function (b) {
		var a = this.formattedNameCache,
		c = a[b];
		if (!c) {
			if (this.prefixedProperties[b]) {
				c = this.vendorPrefix + b
			} else {
				c = b
			}
			a[b] = c
		}
		return c
	},
	formatValue : function (j, b) {
		var g = typeof j,
		l = this.DEFAULT_UNIT_LENGTH,
		e,
		a,
		d,
		f,
		c,
		k,
		h;
		if (g == "string") {
			if (this.lengthProperties[b]) {
				h = j.match(this.lengthUnitRegex)[1];
				if (h.length > 0) {}
				else {
					return j + l
				}
			}
			return j
		} else {
			if (g == "number") {
				if (j == 0) {
					return "0"
				}
				if (this.lengthProperties[b]) {
					return j + l
				}
				if (this.angleProperties[b]) {
					return j + this.DEFAULT_UNIT_ANGLE
				}
				if (this.durationProperties[b]) {
					return j + this.DEFAULT_UNIT_DURATION
				}
			} else {
				if (b === "transform") {
					e = this.transformMethods;
					c = [];
					for (d = 0, f = e.length; d < f; d++) {
						a = e[d];
						c.push(a + "(" + this.formatValue(j[a], a) + ")")
					}
					return c.join(" ")
				} else {
					if (Ext.isArray(j)) {
						k = [];
						for (d = 0, f = j.length; d < f; d++) {
							k.push(this.formatValue(j[d], b))
						}
						return (k.length > 0) ? k.join(", ") : "none"
					}
				}
			}
		}
		return j
	}
});
Ext.define("Ext.fx.runner.CssTransition", {
	extend : "Ext.fx.runner.Css",
	listenersAttached : false,
	constructor : function () {
		this.runningAnimationsData = {};
		return this.callParent(arguments)
	},
	attachListeners : function () {
		this.listenersAttached = true;
		this.getEventDispatcher().addListener("element", "*", "transitionend", "onTransitionEnd", this)
	},
	onTransitionEnd : function (b) {
		var a = b.target,
		c = a.id;
		if (c && this.runningAnimationsData.hasOwnProperty(c)) {
			this.refreshRunningAnimationsData(Ext.get(a), [b.browserEvent.propertyName])
		}
	},
	onAnimationEnd : function (g, f, d, j, n) {
		var c = g.getId(),
		k = this.runningAnimationsData[c],
		o = {},
		m = {},
		b,
		h,
		e,
		l,
		a;
		d.un("stop", "onAnimationStop", this);
		if (k) {
			b = k.nameMap
		}
		o[c] = m;
		if (f.onBeforeEnd) {
			f.onBeforeEnd.call(f.scope || this, g, j)
		}
		d.fireEvent("animationbeforeend", d, g, j);
		this.fireEvent("animationbeforeend", this, d, g, j);
		if (n || (!j && !f.preserveEndState)) {
			h = f.toPropertyNames;
			for (e = 0, l = h.length; e < l; e++) {
				a = h[e];
				if (b && !b.hasOwnProperty(a)) {
					m[a] = null
				}
			}
		}
		if (f.after) {
			Ext.merge(m, f.after)
		}
		this.applyStyles(o);
		if (f.onEnd) {
			f.onEnd.call(f.scope || this, g, j)
		}
		d.fireEvent("animationend", d, g, j);
		this.fireEvent("animationend", this, d, g, j)
	},
	onAllAnimationsEnd : function (b) {
		var c = b.getId(),
		a = {};
		delete this.runningAnimationsData[c];
		a[c] = {
			"transition-property" : null,
			"transition-duration" : null,
			"transition-timing-function" : null,
			"transition-delay" : null
		};
		this.applyStyles(a);
		this.fireEvent("animationallend", this, b)
	},
	hasRunningAnimations : function (a) {
		var c = a.getId(),
		b = this.runningAnimationsData;
		return b.hasOwnProperty(c) && b[c].sessions.length > 0
	},
	refreshRunningAnimationsData : function (d, k, t, p) {
		var g = d.getId(),
		q = this.runningAnimationsData,
		a = q[g];
		if (!a) {
			return
		}
		var m = a.nameMap,
		s = a.nameList,
		b = a.sessions,
		f,
		h,
		e,
		u,
		l,
		c,
		r,
		o,
		n = false;
		t = Boolean(t);
		p = Boolean(p);
		if (!b) {
			return this
		}
		f = b.length;
		if (f === 0) {
			return this
		}
		if (p) {
			a.nameMap = {};
			s.length = 0;
			for (l = 0; l < f; l++) {
				c = b[l];
				this.onAnimationEnd(d, c.data, c.animation, t, p)
			}
			b.length = 0
		} else {
			for (l = 0; l < f; l++) {
				c = b[l];
				r = c.map;
				o = c.list;
				for (h = 0, e = k.length; h < e; h++) {
					u = k[h];
					if (r[u]) {
						delete r[u];
						Ext.Array.remove(o, u);
						c.length--;
						if (--m[u] == 0) {
							delete m[u];
							Ext.Array.remove(s, u)
						}
					}
				}
				if (c.length == 0) {
					b.splice(l, 1);
					l--;
					f--;
					n = true;
					this.onAnimationEnd(d, c.data, c.animation, t)
				}
			}
		}
		if (!p && !t && b.length == 0 && n) {
			this.onAllAnimationsEnd(d)
		}
	},
	getRunningData : function (b) {
		var a = this.runningAnimationsData;
		if (!a.hasOwnProperty(b)) {
			a[b] = {
				nameMap : {},
				nameList : [],
				sessions : []
			}
		}
		return a[b]
	},
	getTestElement : function () {
		var c = this.testElement,
		b,
		d,
		a;
		if (!c) {
			b = document.createElement("iframe");
			a = b.style;
			a.setProperty("visibility", "hidden", "important");
			a.setProperty("width", "0px", "important");
			a.setProperty("height", "0px", "important");
			a.setProperty("position", "absolute", "important");
			a.setProperty("border", "0px", "important");
			a.setProperty("zIndex", "-1000", "important");
			document.body.appendChild(b);
			d = b.contentDocument;
			d.open();
			d.writeln("</body>");
			d.close();
			this.testElement = c = d.createElement("div");
			c.style.setProperty("position", "absolute", "!important");
			d.body.appendChild(c);
			this.testElementComputedStyle = window.getComputedStyle(c)
		}
		return c
	},
	getCssStyleValue : function (b, e) {
		var d = this.getTestElement(),
		a = this.testElementComputedStyle,
		c = d.style;
		c.setProperty(b, e);
		e = a.getPropertyValue(b);
		c.removeProperty(b);
		return e
	},
	run : function (p) {
		var F = this,
		h = this.lengthProperties,
		x = {},
		E = {},
		G = {},
		d,
		s,
		y,
		e,
		u,
		I,
		v,
		q,
		r,
		a,
		A,
		z,
		o,
		B,
		l,
		t,
		g,
		C,
		H,
		k,
		f,
		w,
		n,
		c,
		D,
		b,
		m;
		if (!this.listenersAttached) {
			this.attachListeners()
		}
		p = Ext.Array.from(p);
		for (A = 0, o = p.length; A < o; A++) {
			B = p[A];
			B = Ext.factory(B, Ext.fx.Animation);
			d = B.getElement();
			g = window.getComputedStyle(d.dom);
			s = d.getId();
			G = Ext.merge({}, B.getData());
			if (B.onBeforeStart) {
				B.onBeforeStart.call(B.scope || this, d)
			}
			B.fireEvent("animationstart", B);
			this.fireEvent("animationstart", this, B);
			G[s] = G;
			u = G.before;
			y = G.from;
			e = G.to;
			G.fromPropertyNames = I = [];
			G.toPropertyNames = v = [];
			for (H in e) {
				if (e.hasOwnProperty(H)) {
					e[H] = k = this.formatValue(e[H], H);
					C = this.formatName(H);
					n = h.hasOwnProperty(H);
					if (!n) {
						k = this.getCssStyleValue(C, k)
					}
					if (y.hasOwnProperty(H)) {
						y[H] = w = this.formatValue(y[H], H);
						if (!n) {
							w = this.getCssStyleValue(C, w)
						}
						if (k !== w) {
							I.push(C);
							v.push(C)
						}
					} else {
						f = g.getPropertyValue(C);
						if (k !== f) {
							v.push(C)
						}
					}
				}
			}
			l = v.length;
			if (l === 0) {
				this.onAnimationEnd(d, G, B);
				continue
			}
			a = this.getRunningData(s);
			b = a.sessions;
			if (b.length > 0) {
				this.refreshRunningAnimationsData(d, Ext.Array.merge(I, v), true, G.replacePrevious)
			}
			c = a.nameMap;
			D = a.nameList;
			t = {};
			for (z = 0; z < l; z++) {
				H = v[z];
				t[H] = true;
				if (!c.hasOwnProperty(H)) {
					c[H] = 1;
					D.push(H)
				} else {
					c[H]++
				}
			}
			m = {
				element : d,
				map : t,
				list : v.slice(),
				length : l,
				data : G,
				animation : B
			};
			b.push(m);
			B.on("stop", "onAnimationStop", this);
			x[s] = y = Ext.apply(Ext.Object.chain(u), y);
			if (D.length > 0) {
				I = Ext.Array.difference(D, I);
				v = Ext.Array.merge(I, v);
				y["transition-property"] = I
			}
			E[s] = e = Ext.Object.chain(e);
			e["transition-property"] = v;
			e["transition-duration"] = G.duration;
			e["transition-timing-function"] = G.easing;
			e["transition-delay"] = G.delay;
			B.startTime = Date.now()
		}
		r = this.$className;
		this.applyStyles(x);
		q = function (i) {
			if (i.data === r && i.source === window) {
				window.removeEventListener("message", q, false);
				F.applyStyles(E)
			}
		};
		window.addEventListener("message", q, false);
		window.postMessage(r, "*")
	},
	onAnimationStop : function (d) {
		var f = this.runningAnimationsData,
		h,
		a,
		g,
		b,
		c,
		e;
		for (h in f) {
			if (f.hasOwnProperty(h)) {
				a = f[h];
				g = a.sessions;
				for (b = 0, c = g.length; b < c; b++) {
					e = g[b];
					if (e.animation === d) {
						this.refreshRunningAnimationsData(e.element, e.list.slice(), true)
					}
				}
			}
		}
	}
});
Ext.define("Ext.fx.Runner", {
	requires : ["Ext.fx.runner.CssTransition"],
	constructor : function () {
		return new Ext.fx.runner.CssTransition()
	}
});
Ext.define("Ext.Mask", {
	extend : "Ext.Component",
	xtype : "mask",
	config : {
		baseCls : Ext.baseCSSPrefix + "mask",
		transparent : false,
		top : 0,
		left : 0,
		right : 0,
		bottom : 0
	},
	initialize : function () {
		this.callParent();
		this.on({
			painted : "onPainted",
			erased : "onErased"
		})
	},
	onPainted : function () {
		this.element.on("*", "onEvent", this)
	},
	onErased : function () {
		this.element.un("*", "onEvent", this)
	},
	onEvent : function (b) {
		var a = arguments[arguments.length - 1];
		if (a.info.eventName === "tap") {
			this.fireEvent("tap", this, b);
			return false
		}
		if (b && b.stopEvent) {
			b.stopEvent()
		}
		return false
	},
	updateTransparent : function (a) {
		this[a ? "addCls" : "removeCls"](this.getBaseCls() + "-transparent")
	}
});
(function (a) {
	Ext.define("Ext.layout.Default", {
		extend : "Ext.Evented",
		alternateClassName : ["Ext.layout.AutoContainerLayout", "Ext.layout.ContainerLayout"],
		alias : ["layout.auto", "layout.default"],
		isLayout : true,
		hasDockedItemsCls : a + "hasdocked",
		centeredItemCls : a + "centered",
		floatingItemCls : a + "floating",
		dockingWrapperCls : a + "docking",
		dockingInnerCls : a + "docking-inner",
		maskCls : a + "mask",
		positionMap : {
			top : "start",
			left : "start",
			bottom : "end",
			right : "end"
		},
		positionDirectionMap : {
			top : "vertical",
			bottom : "vertical",
			left : "horizontal",
			right : "horizontal"
		},
		DIRECTION_VERTICAL : "vertical",
		DIRECTION_HORIZONTAL : "horizontal",
		POSITION_START : "start",
		POSITION_END : "end",
		config : {
			animation : null
		},
		constructor : function (b, c) {
			this.container = b;
			this.innerItems = [];
			this.centeringWrappers = {};
			this.initConfig(c)
		},
		reapply : Ext.emptyFn,
		unapply : Ext.emptyFn,
		onItemAdd : function () {
			this.doItemAdd.apply(this, arguments)
		},
		onItemRemove : function () {
			this.doItemRemove.apply(this, arguments)
		},
		onItemMove : function () {
			this.doItemMove.apply(this, arguments)
		},
		onItemCenteredChange : function () {
			this.doItemCenteredChange.apply(this, arguments)
		},
		onItemFloatingChange : function () {
			this.doItemFloatingChange.apply(this, arguments)
		},
		onItemDockedChange : function () {
			this.doItemDockedChange.apply(this, arguments)
		},
		doItemAdd : function (c, b) {
			var d = c.getDocked();
			if (d !== null) {
				this.dockItem(c, d)
			} else {
				if (c.isCentered()) {
					this.centerItem(c, b)
				} else {
					this.insertItem(c, b)
				}
			}
			if (c.isFloating()) {
				this.onItemFloatingChange(c, true)
			}
		},
		doItemRemove : function (b) {
			if (b.isDocked()) {
				this.undockItem(b)
			} else {
				if (b.isCentered()) {
					this.uncenterItem(b)
				}
			}
			if (b.getTranslatable()) {
				b.setTranslatable(false)
			}
			Ext.Array.remove(this.innerItems, b);
			Ext.fly(b.renderElement).destroy()
		},
		doItemMove : function (c, d, b) {
			if (c.isCentered()) {
				c.setZIndex((d + 1) * 2)
			} else {
				if (c.isFloating()) {
					c.setZIndex((d + 1) * 2)
				}
				this.insertItem(c, d)
			}
		},
		doItemCenteredChange : function (c, b) {
			if (b) {
				this.centerItem(c)
			} else {
				this.uncenterItem(c)
			}
		},
		doItemFloatingChange : function (d, e) {
			var c = d.element,
			b = this.floatingItemCls;
			if (e) {
				if (d.getZIndex() === null) {
					d.setZIndex((this.container.indexOf(d) + 1) * 2)
				}
				c.addCls(b)
			} else {
				d.setZIndex(null);
				c.removeCls(b)
			}
		},
		doItemDockedChange : function (b, d, c) {
			if (c) {
				this.undockItem(b, c)
			}
			if (d) {
				this.dockItem(b, d)
			}
		},
		centerItem : function (b) {
			this.insertItem(b, 0);
			if (b.getZIndex() === null) {
				b.setZIndex((this.container.indexOf(b) + 1) * 2)
			}
			this.createCenteringWrapper(b);
			b.element.addCls(this.floatingItemCls)
		},
		uncenterItem : function (b) {
			this.destroyCenteringWrapper(b);
			b.setZIndex(null);
			this.insertItem(b, this.container.indexOf(b));
			b.element.removeCls(this.floatingItemCls)
		},
		dockItem : function (f, b) {
			var c = this.container,
			g = f.renderElement,
			e = f.element,
			d = this.dockingInnerElement;
			if (!d) {
				c.setUseBodyElement(true);
				this.dockingInnerElement = d = c.bodyElement
			}
			this.getDockingWrapper(b);
			if (this.positionMap[b] === this.POSITION_START) {
				g.insertBefore(d)
			} else {
				g.insertAfter(d)
			}
			e.addCls(a + "docked-" + b)
		},
		undockItem : function (b, c) {
			this.insertItem(b, this.container.indexOf(b));
			b.element.removeCls(a + "docked-" + c)
		},
		getDockingWrapper : function (b) {
			var e = this.currentDockingDirection,
			d = this.positionDirectionMap[b],
			c = this.dockingWrapper;
			if (e !== d) {
				this.currentDockingDirection = d;
				this.dockingWrapper = c = this.createDockingWrapper(d)
			}
			return c
		},
		createDockingWrapper : function (b) {
			return this.dockingInnerElement.wrap({
				classList : [this.dockingWrapperCls + "-" + b]
			}, true)
		},
		createCenteringWrapper : function (c) {
			var f = c.getId(),
			d = this.centeringWrappers,
			b = c.renderElement,
			e;
			d[f] = e = b.wrap({
					className : this.centeredItemCls
				});
			return e
		},
		destroyCenteringWrapper : function (c) {
			var f = c.getId(),
			d = this.centeringWrappers,
			b = c.renderElement,
			e = d[f];
			b.unwrap();
			e.destroy();
			delete d[f];
			return this
		},
		getInnerItemsContainer : function () {
			return this.container.innerElement
		},
		insertItem : function (k, g) {
			var d = this.container,
			j = d.getItems().items,
			e = this.innerItems,
			c = this.getInnerItemsContainer().dom,
			i = k.renderElement.dom,
			h,
			f,
			b;
			if (d.has(k)) {
				Ext.Array.remove(e, k)
			}
			if (typeof g == "number") {
				h = j[g];
				if (h === k) {
					h = j[++g]
				}
				while (h && (h.isCentered() || h.isDocked())) {
					h = j[++g]
				}
				if (h) {
					b = e.indexOf(h);
					if (b !== -1) {
						while (h && (h.isCentered() || h.isDocked())) {
							h = e[++b]
						}
						if (h) {
							e.splice(b, 0, k);
							f = h.renderElement.dom;
							c.insertBefore(i, f);
							return this
						}
					}
				}
			}
			e.push(k);
			c.appendChild(i);
			return this
		}
	})
})(Ext.baseCSSPrefix);
Ext.define("Ext.layout.AbstractBox", {
	extend : "Ext.layout.Default",
	config : {
		align : "stretch",
		pack : null
	},
	flexItemCls : Ext.baseCSSPrefix + "layout-box-item",
	positionMap : {
		middle : "center",
		left : "start",
		top : "start",
		right : "end",
		bottom : "end"
	},
	constructor : function (a) {
		this.callParent(arguments);
		a.innerElement.addCls(this.cls);
		a.on(this.sizeChangeEventName, "onItemSizeChange", this, {
			delegate : "> component"
		})
	},
	reapply : function () {
		this.container.innerElement.addCls(this.cls);
		this.updatePack(this.getPack());
		this.updateAlign(this.getAlign())
	},
	unapply : function () {
		this.container.innerElement.removeCls(this.cls);
		this.updatePack(null);
		this.updateAlign(null)
	},
	doItemAdd : function (d, b) {
		this.callParent(arguments);
		if (d.isInnerItem()) {
			var c = d.getConfig(this.sizePropertyName),
			a = d.config;
			if (!c && ("flex" in a)) {
				this.setItemFlex(d, a.flex)
			}
		}
	},
	doItemRemove : function (a) {
		if (a.isInnerItem()) {
			this.setItemFlex(a, null)
		}
		this.callParent(arguments)
	},
	onItemSizeChange : function (a) {
		this.setItemFlex(a, null)
	},
	doItemCenteredChange : function (b, a) {
		if (a) {
			this.setItemFlex(b, null)
		}
		this.callParent(arguments)
	},
	doItemFloatingChange : function (a, b) {
		if (b) {
			this.setItemFlex(a, null)
		}
		this.callParent(arguments)
	},
	doItemDockedChange : function (a, b) {
		if (b) {
			this.setItemFlex(a, null)
		}
		this.callParent(arguments)
	},
	redrawContainer : function () {
		var a = this.container,
		b = a.renderElement.dom.parentNode;
		if (b && b.nodeType !== 11) {
			a.innerElement.redraw()
		}
	},
	setItemFlex : function (c, a) {
		var b = c.element,
		d = this.flexItemCls;
		if (a) {
			b.addCls(d)
		} else {
			if (b.hasCls(d)) {
				this.redrawContainer();
				b.removeCls(d)
			}
		}
		b.dom.style.webkitBoxFlex = a
	},
	convertPosition : function (a) {
		if (this.positionMap.hasOwnProperty(a)) {
			return this.positionMap[a]
		}
		return a
	},
	applyAlign : function (a) {
		return this.convertPosition(a)
	},
	updateAlign : function (a) {
		this.container.innerElement.dom.style.webkitBoxAlign = a
	},
	applyPack : function (a) {
		return this.convertPosition(a)
	},
	updatePack : function (a) {
		this.container.innerElement.dom.style.webkitBoxPack = a
	}
});
Ext.define("Ext.util.Filter", {
	isFilter : true,
	config : {
		property : null,
		value : null,
		filterFn : Ext.emptyFn,
		anyMatch : false,
		exactMatch : false,
		caseSensitive : false,
		root : null,
		id : undefined,
		scope : null
	},
	applyId : function (a) {
		if (!a) {
			if (this.getProperty()) {
				a = this.getProperty() + "-" + String(this.getValue())
			}
			if (!a) {
				a = Ext.id(null, "ext-filter-")
			}
		}
		return a
	},
	constructor : function (a) {
		this.initConfig(a)
	},
	applyFilterFn : function (b) {
		if (b === Ext.emptyFn) {
			b = this.getInitialConfig("filter");
			if (b) {
				return b
			}
			var a = this.getValue();
			if (!this.getProperty() && !a && a !== 0) {
				return Ext.emptyFn
			} else {
				return this.createFilterFn()
			}
		}
		return b
	},
	createFilterFn : function () {
		var a = this,
		b = a.createValueMatcher();
		return function (d) {
			var c = a.getRoot(),
			e = a.getProperty();
			if (c) {
				d = d[c]
			}
			return b.test(d[e])
		}
	},
	createValueMatcher : function () {
		var d = this,
		e = d.getValue(),
		f = d.getAnyMatch(),
		c = d.getExactMatch(),
		a = d.getCaseSensitive(),
		b = Ext.String.escapeRegex;
		if (e === null || e === undefined || !e.exec) {
			e = String(e);
			if (f === true) {
				e = b(e)
			} else {
				e = "^" + b(e);
				if (c === true) {
					e += "$"
				}
			}
			e = new RegExp(e, a ? "" : "i")
		}
		return e
	}
});
Ext.define("Ext.util.Sorter", {
	isSorter : true,
	config : {
		property : null,
		sorterFn : null,
		root : null,
		transform : null,
		direction : "ASC",
		id : undefined
	},
	constructor : function (a) {
		this.initConfig(a)
	},
	applyId : function (a) {
		if (!a) {
			a = this.getProperty();
			if (!a) {
				a = Ext.id(null, "ext-sorter-")
			}
		}
		return a
	},
	createSortFunction : function (b) {
		var c = this,
		a = c.getDirection().toUpperCase() == "DESC" ? -1 : 1;
		return function (e, d) {
			return a * b.call(c, e, d)
		}
	},
	defaultSortFn : function (e, c) {
		var g = this,
		f = g._transform,
		b = g._root,
		d,
		a,
		h = g._property;
		if (b !== null) {
			e = e[b];
			c = c[b]
		}
		d = e[h];
		a = c[h];
		if (f) {
			d = f(d);
			a = f(a)
		}
		return d > a ? 1 : (d < a ? -1 : 0)
	},
	updateDirection : function () {
		this.updateSortFn()
	},
	updateSortFn : function () {
		this.sort = this.createSortFunction(this.getSorterFn() || this.defaultSortFn)
	},
	toggle : function () {
		this.setDirection(Ext.String.toggle(this.getDirection(), "ASC", "DESC"))
	}
});
Ext.define("Ext.fx.easing.EaseOut", {
	extend : "Ext.fx.easing.Linear",
	alias : "easing.ease-out",
	config : {
		exponent : 4,
		duration : 1500
	},
	getValue : function () {
		var f = Ext.Date.now() - this.getStartTime(),
		d = this.getDuration(),
		b = this.getStartValue(),
		h = this.getEndValue(),
		a = this.distance,
		c = f / d,
		g = 1 - c,
		e = 1 - Math.pow(g, this.getExponent()),
		i = b + (e * a);
		if (f >= d) {
			this.isEnded = true;
			return h
		}
		return i
	}
});
Ext.define("Ext.fx.layout.card.Abstract", {
	extend : "Ext.Evented",
	isAnimation : true,
	config : {
		direction : "left",
		duration : null,
		reverse : null,
		layout : null
	},
	updateLayout : function () {
		this.enable()
	},
	enable : function () {
		var a = this.getLayout();
		if (a) {
			a.onBefore("activeitemchange", "onActiveItemChange", this)
		}
	},
	disable : function () {
		var a = this.getLayout();
		if (this.isAnimating) {
			this.stopAnimation()
		}
		if (a) {
			a.unBefore("activeitemchange", "onActiveItemChange", this)
		}
	},
	onActiveItemChange : Ext.emptyFn,
	destroy : function () {
		var a = this.getLayout();
		if (this.isAnimating) {
			this.stopAnimation()
		}
		if (a) {
			a.unBefore("activeitemchange", "onActiveItemChange", this)
		}
		this.setLayout(null)
	}
});
Ext.define("Ext.fx.easing.Momentum", {
	extend : "Ext.fx.easing.Abstract",
	config : {
		acceleration : 30,
		friction : 0,
		startVelocity : 0
	},
	alpha : 0,
	updateFriction : function (b) {
		var a = Math.log(1 - (b / 10));
		this.theta = a;
		this.alpha = a / this.getAcceleration()
	},
	updateStartVelocity : function (a) {
		this.velocity = a * this.getAcceleration()
	},
	updateAcceleration : function (a) {
		this.velocity = this.getStartVelocity() * a;
		this.alpha = this.theta / a
	},
	getValue : function () {
		return this.getStartValue() - this.velocity * (1 - this.getFrictionFactor()) / this.theta
	},
	getFrictionFactor : function () {
		var a = Ext.Date.now() - this.getStartTime();
		return Math.exp(a * this.alpha)
	},
	getVelocity : function () {
		return this.getFrictionFactor() * this.velocity
	}
});
Ext.define("Ext.fx.easing.Bounce", {
	extend : "Ext.fx.easing.Abstract",
	config : {
		springTension : 0.3,
		acceleration : 30,
		startVelocity : 0
	},
	getValue : function () {
		var b = Ext.Date.now() - this.getStartTime(),
		c = (b / this.getAcceleration()),
		a = c * Math.pow(Math.E, -this.getSpringTension() * c);
		return this.getStartValue() + (this.getStartVelocity() * a)
	}
});
Ext.define("Ext.scroll.indicator.Abstract", {
	extend : "Ext.Component",
	config : {
		baseCls : "x-scroll-indicator",
		axis : "x",
		value : 0,
		length : null,
		hidden : true,
		ui : "dark"
	},
	cachedConfig : {
		ratio : 1,
		barCls : "x-scroll-bar",
		active : true
	},
	barElement : null,
	barLength : 0,
	gapLength : 0,
	getElementConfig : function () {
		return {
			reference : "barElement",
			children : [this.callParent()]
		}
	},
	applyRatio : function (a) {
		if (isNaN(a)) {
			a = 1
		}
		return a
	},
	refresh : function () {
		var f = this.barElement,
		e = f.dom,
		c = this.getRatio(),
		b = this.getAxis(),
		a = (b === "x") ? e.offsetWidth : e.offsetHeight,
		d = a * c;
		this.barLength = a;
		this.gapLength = a - d;
		this.setLength(d);
		this.updateValue(this.getValue())
	},
	updateBarCls : function (a) {
		this.barElement.addCls(a)
	},
	updateAxis : function (a) {
		this.element.addCls(this.getBaseCls(), null, a);
		this.barElement.addCls(this.getBarCls(), null, a)
	},
	updateValue : function (a) {
		this.setOffset(this.gapLength * a)
	},
	updateActive : function (a) {
		this.barElement[a ? "addCls" : "removeCls"]("active")
	},
	doSetHidden : function (a) {
		var b = this.element.dom.style;
		if (a) {
			b.opacity = "0"
		} else {
			b.opacity = ""
		}
	},
	updateLength : function (c) {
		var b = this.getAxis(),
		a = this.element;
		if (b === "x") {
			a.setWidth(c)
		} else {
			a.setHeight(c)
		}
	},
	setOffset : function (c) {
		var b = this.getAxis(),
		a = this.element;
		if (b === "x") {
			a.setLeft(c)
		} else {
			a.setTop(c)
		}
	}
});
Ext.define("Ext.LoadMask", {
	extend : "Ext.Mask",
	xtype : "loadmask",
	config : {
		message : "Loading...",
		messageCls : Ext.baseCSSPrefix + "mask-message",
		indicator : true,
		listeners : {
			painted : "onPainted",
			erased : "onErased"
		}
	},
	getTemplate : function () {
		var a = Ext.baseCSSPrefix;
		return [{
				reference : "innerElement",
				cls : a + "mask-inner",
				children : [{
						reference : "indicatorElement",
						cls : a + "loading-spinner-outer",
						children : [{
								cls : a + "loading-spinner",
								children : [{
										tag : "span",
										cls : a + "loading-top"
									}, {
										tag : "span",
										cls : a + "loading-right"
									}, {
										tag : "span",
										cls : a + "loading-bottom"
									}, {
										tag : "span",
										cls : a + "loading-left"
									}
								]
							}
						]
					}, {
						reference : "messageElement"
					}
				]
			}
		]
	},
	updateMessage : function (a) {
		this.messageElement.setHtml(a)
	},
	updateMessageCls : function (b, a) {
		this.messageElement.replaceCls(a, b)
	},
	updateIndicator : function (a) {
		this[a ? "removeCls" : "addCls"](Ext.baseCSSPrefix + "indicator-hidden")
	},
	onPainted : function () {
		this.getParent().on({
			scope : this,
			resize : this.refreshPosition
		});
		this.refreshPosition()
	},
	onErased : function () {
		this.getParent().un({
			scope : this,
			resize : this.refreshPosition
		})
	},
	refreshPosition : function () {
		var c = this.getParent(),
		d = c.getScrollable(),
		a = (d) ? d.getScroller() : null,
		f = (a) ? a.position : {
			x : 0,
			y : 0
		},
		e = c.element.getSize(),
		b = this.element.getSize();
		this.innerElement.setStyle({
			marginTop : Math.round(e.height - b.height + (f.y * 2)) + "px",
			marginLeft : Math.round(e.width - b.width + f.x) + "px"
		})
	}
}, function () {});
Ext.define("Ext.layout.Fit", {
	extend : "Ext.layout.Default",
	alternateClassName : "Ext.layout.FitLayout",
	alias : "layout.fit",
	cls : Ext.baseCSSPrefix + "layout-fit",
	itemCls : Ext.baseCSSPrefix + "layout-fit-item",
	constructor : function (a) {
		this.callParent(arguments);
		this.apply()
	},
	apply : function () {
		this.container.innerElement.addCls(this.cls)
	},
	reapply : function () {
		this.apply()
	},
	unapply : function () {
		this.container.innerElement.removeCls(this.cls)
	},
	doItemAdd : function (b, a) {
		if (b.isInnerItem()) {
			b.addCls(this.itemCls)
		}
		this.callParent(arguments)
	},
	doItemRemove : function (a) {
		if (a.isInnerItem()) {
			a.removeCls(this.itemCls)
		}
		this.callParent(arguments)
	}
});
Ext.define("Ext.layout.HBox", {
	extend : "Ext.layout.AbstractBox",
	alternateClassName : "Ext.layout.HBoxLayout",
	alias : "layout.hbox",
	sizePropertyName : "width",
	sizeChangeEventName : "widthchange",
	cls : Ext.baseCSSPrefix + "layout-hbox"
});
Ext.define("Ext.layout.VBox", {
	extend : "Ext.layout.AbstractBox",
	alternateClassName : "Ext.layout.VBoxLayout",
	alias : "layout.vbox",
	sizePropertyName : "height",
	sizeChangeEventName : "heightchange",
	cls : Ext.baseCSSPrefix + "layout-vbox"
});
Ext.define("Ext.util.AbstractMixedCollection", {
	requires : ["Ext.util.Filter"],
	mixins : {
		observable : "Ext.mixin.Observable"
	},
	constructor : function (b, a) {
		var c = this;
		c.items = [];
		c.map = {};
		c.keys = [];
		c.length = 0;
		c.allowFunctions = b === true;
		if (a) {
			c.getKey = a
		}
		c.mixins.observable.constructor.call(c)
	},
	allowFunctions : false,
	add : function (b, e) {
		var d = this,
		f = e,
		c = b,
		a;
		if (arguments.length == 1) {
			f = c;
			c = d.getKey(f)
		}
		if (typeof c != "undefined" && c !== null) {
			a = d.map[c];
			if (typeof a != "undefined") {
				return d.replace(c, f)
			}
			d.map[c] = f
		}
		d.length++;
		d.items.push(f);
		d.keys.push(c);
		d.fireEvent("add", d.length - 1, f, c);
		return f
	},
	getKey : function (a) {
		return a.id
	},
	replace : function (c, e) {
		var d = this,
		a,
		b;
		if (arguments.length == 1) {
			e = arguments[0];
			c = d.getKey(e)
		}
		a = d.map[c];
		if (typeof c == "undefined" || c === null || typeof a == "undefined") {
			return d.add(c, e)
		}
		b = d.indexOfKey(c);
		d.items[b] = e;
		d.map[c] = e;
		d.fireEvent("replace", c, a, e);
		return e
	},
	addAll : function (f) {
		var e = this,
		d = 0,
		b,
		a,
		c;
		if (arguments.length > 1 || Ext.isArray(f)) {
			b = arguments.length > 1 ? arguments : f;
			for (a = b.length; d < a; d++) {
				e.add(b[d])
			}
		} else {
			for (c in f) {
				if (f.hasOwnProperty(c)) {
					if (e.allowFunctions || typeof f[c] != "function") {
						e.add(c, f[c])
					}
				}
			}
		}
	},
	each : function (e, d) {
		var b = [].concat(this.items),
		c = 0,
		a = b.length,
		f;
		for (; c < a; c++) {
			f = b[c];
			if (e.call(d || f, f, c, a) === false) {
				break
			}
		}
	},
	eachKey : function (e, d) {
		var f = this.keys,
		b = this.items,
		c = 0,
		a = f.length;
		for (; c < a; c++) {
			e.call(d || window, f[c], b[c], c, a)
		}
	},
	findBy : function (e, d) {
		var f = this.keys,
		b = this.items,
		c = 0,
		a = b.length;
		for (; c < a; c++) {
			if (e.call(d || window, b[c], f[c])) {
				return b[c]
			}
		}
		return null
	},
	insert : function (a, b, e) {
		var d = this,
		c = b,
		f = e;
		if (arguments.length == 2) {
			f = c;
			c = d.getKey(f)
		}
		if (d.containsKey(c)) {
			d.suspendEvents();
			d.removeAtKey(c);
			d.resumeEvents()
		}
		if (a >= d.length) {
			return d.add(c, f)
		}
		d.length++;
		Ext.Array.splice(d.items, a, 0, f);
		if (typeof c != "undefined" && c !== null) {
			d.map[c] = f
		}
		Ext.Array.splice(d.keys, a, 0, c);
		d.fireEvent("add", a, f, c);
		return f
	},
	remove : function (a) {
		return this.removeAt(this.indexOf(a))
	},
	removeAll : function (a) {
		Ext.each(a || [], function (b) {
			this.remove(b)
		}, this);
		return this
	},
	removeAt : function (a) {
		var c = this,
		d,
		b;
		if (a < c.length && a >= 0) {
			c.length--;
			d = c.items[a];
			Ext.Array.erase(c.items, a, 1);
			b = c.keys[a];
			if (typeof b != "undefined") {
				delete c.map[b]
			}
			Ext.Array.erase(c.keys, a, 1);
			c.fireEvent("remove", d, b);
			return d
		}
		return false
	},
	removeAtKey : function (a) {
		return this.removeAt(this.indexOfKey(a))
	},
	getCount : function () {
		return this.length
	},
	indexOf : function (a) {
		return Ext.Array.indexOf(this.items, a)
	},
	indexOfKey : function (a) {
		return Ext.Array.indexOf(this.keys, a)
	},
	get : function (b) {
		var d = this,
		a = d.map[b],
		c = a !== undefined ? a : (typeof b == "number") ? d.items[b] : undefined;
		return typeof c != "function" || d.allowFunctions ? c : null
	},
	getAt : function (a) {
		return this.items[a]
	},
	getByKey : function (a) {
		return this.map[a]
	},
	contains : function (a) {
		return Ext.Array.contains(this.items, a)
	},
	containsKey : function (a) {
		return typeof this.map[a] != "undefined"
	},
	clear : function () {
		var a = this;
		a.length = 0;
		a.items = [];
		a.keys = [];
		a.map = {};
		a.fireEvent("clear")
	},
	first : function () {
		return this.items[0]
	},
	last : function () {
		return this.items[this.length - 1]
	},
	sum : function (g, b, h, a) {
		var c = this.extractValues(g, b),
		f = c.length,
		e = 0,
		d;
		h = h || 0;
		a = (a || a === 0) ? a : f - 1;
		for (d = h; d <= a; d++) {
			e += c[d]
		}
		return e
	},
	collect : function (j, e, g) {
		var k = this.extractValues(j, e),
		a = k.length,
		b = {},
		c = [],
		h,
		f,
		d;
		for (d = 0; d < a; d++) {
			h = k[d];
			f = String(h);
			if ((g || !Ext.isEmpty(h)) && !b[f]) {
				b[f] = true;
				c.push(h)
			}
		}
		return c
	},
	extractValues : function (c, a) {
		var b = this.items;
		if (a) {
			b = Ext.Array.pluck(b, a)
		}
		return Ext.Array.pluck(b, c)
	},
	getRange : function (f, a) {
		var e = this,
		c = e.items,
		b = [],
		d;
		if (c.length < 1) {
			return b
		}
		f = f || 0;
		a = Math.min(typeof a == "undefined" ? e.length - 1 : a, e.length - 1);
		if (f <= a) {
			for (d = f; d <= a; d++) {
				b[b.length] = c[d]
			}
		} else {
			for (d = f; d >= a; d--) {
				b[b.length] = c[d]
			}
		}
		return b
	},
	filter : function (d, c, f, a) {
		var b = [],
		e;
		if (Ext.isString(d)) {
			b.push(Ext.create("Ext.util.Filter", {
					property : d,
					value : c,
					anyMatch : f,
					caseSensitive : a
				}))
		} else {
			if (Ext.isArray(d) || d instanceof Ext.util.Filter) {
				b = b.concat(d)
			}
		}
		e = function (g) {
			var m = true,
			n = b.length,
			h;
			for (h = 0; h < n; h++) {
				var l = b[h],
				k = l.getFilterFn(),
				j = l.getScope();
				m = m && k.call(j, g)
			}
			return m
		};
		return this.filterBy(e)
	},
	filterBy : function (e, d) {
		var h = this,
		a = new this.self(),
		g = h.keys,
		b = h.items,
		f = b.length,
		c;
		a.getKey = h.getKey;
		for (c = 0; c < f; c++) {
			if (e.call(d || h, b[c], g[c])) {
				a.add(g[c], b[c])
			}
		}
		return a
	},
	findIndex : function (c, b, e, d, a) {
		if (Ext.isEmpty(b, false)) {
			return -1
		}
		b = this.createValueMatcher(b, d, a);
		return this.findIndexBy(function (f) {
			return f && b.test(f[c])
		}, null, e)
	},
	findIndexBy : function (e, d, h) {
		var g = this,
		f = g.keys,
		b = g.items,
		c = h || 0,
		a = b.length;
		for (; c < a; c++) {
			if (e.call(d || g, b[c], f[c])) {
				return c
			}
		}
		return -1
	},
	createValueMatcher : function (c, e, a, b) {
		if (!c.exec) {
			var d = Ext.String.escapeRegex;
			c = String(c);
			if (e === true) {
				c = d(c)
			} else {
				c = "^" + d(c);
				if (b === true) {
					c += "$"
				}
			}
			c = new RegExp(c, a ? "" : "i")
		}
		return c
	},
	clone : function () {
		var e = this,
		f = new this.self(),
		d = e.keys,
		b = e.items,
		c = 0,
		a = b.length;
		for (; c < a; c++) {
			f.add(d[c], b[c])
		}
		f.getKey = e.getKey;
		return f
	}
});
Ext.define("Ext.util.Sortable", {
	isSortable : true,
	defaultSortDirection : "ASC",
	requires : ["Ext.util.Sorter"],
	initSortable : function () {
		var a = this,
		b = a.sorters;
		a.sorters = Ext.create("Ext.util.AbstractMixedCollection", false, function (c) {
				return c.id || c.property
			});
		if (b) {
			a.sorters.addAll(a.decodeSorters(b))
		}
	},
	sort : function (g, f, c, e) {
		var d = this,
		h,
		b,
		a;
		if (Ext.isArray(g)) {
			e = c;
			c = f;
			a = g
		} else {
			if (Ext.isObject(g)) {
				e = c;
				c = f;
				a = [g]
			} else {
				if (Ext.isString(g)) {
					h = d.sorters.get(g);
					if (!h) {
						h = {
							property : g,
							direction : f
						};
						a = [h]
					} else {
						if (f === undefined) {
							h.toggle()
						} else {
							h.setDirection(f)
						}
					}
				}
			}
		}
		if (a && a.length) {
			a = d.decodeSorters(a);
			if (Ext.isString(c)) {
				if (c === "prepend") {
					g = d.sorters.clone().items;
					d.sorters.clear();
					d.sorters.addAll(a);
					d.sorters.addAll(g)
				} else {
					d.sorters.addAll(a)
				}
			} else {
				d.sorters.clear();
				d.sorters.addAll(a)
			}
			if (e !== false) {
				d.onBeforeSort(a)
			}
		}
		if (e !== false) {
			g = d.sorters.items;
			if (g.length) {
				b = function (l, k) {
					var j = g[0].sort(l, k),
					n = g.length,
					m;
					for (m = 1; m < n; m++) {
						j = j || g[m].sort.call(this, l, k)
					}
					return j
				};
				d.doSort(b)
			}
		}
		return g
	},
	onBeforeSort : Ext.emptyFn,
	decodeSorters : function (f) {
		if (!Ext.isArray(f)) {
			if (f === undefined) {
				f = []
			} else {
				f = [f]
			}
		}
		var d = f.length,
		g = Ext.util.Sorter,
		a = this.model ? this.model.prototype.fields : null,
		e,
		b,
		c;
		for (c = 0; c < d; c++) {
			b = f[c];
			if (!(b instanceof g)) {
				if (Ext.isString(b)) {
					b = {
						property : b
					}
				}
				Ext.applyIf(b, {
					root : this.sortRoot,
					direction : "ASC"
				});
				if (b.fn) {
					b.sorterFn = b.fn
				}
				if (typeof b == "function") {
					b = {
						sorterFn : b
					}
				}
				if (a && !b.transform) {
					e = a.get(b.property);
					b.transform = e ? e.sortType : undefined
				}
				f[c] = Ext.create("Ext.util.Sorter", b)
			}
		}
		return f
	},
	getSorters : function () {
		return this.sorters.items
	}
});
Ext.define("Ext.util.MixedCollection", {
	extend : "Ext.util.AbstractMixedCollection",
	mixins : {
		sortable : "Ext.util.Sortable"
	},
	constructor : function () {
		var a = this;
		a.callParent(arguments);
		a.mixins.sortable.initSortable.call(a)
	},
	doSort : function (a) {
		this.sortBy(a)
	},
	_sort : function (k, a, j) {
		var h = this,
		d,
		e,
		b = String(a).toUpperCase() == "DESC" ? -1 : 1,
		g = [],
		l = h.keys,
		f = h.items;
		j = j || function (i, c) {
			return i - c
		};
		for (d = 0, e = f.length; d < e; d++) {
			g[g.length] = {
				key : l[d],
				value : f[d],
				index : d
			}
		}
		Ext.Array.sort(g, function (i, c) {
			var m = j(i[k], c[k]) * b;
			if (m === 0) {
				m = (i.index < c.index ? -1 : 1)
			}
			return m
		});
		for (d = 0, e = g.length; d < e; d++) {
			f[d] = g[d].value;
			l[d] = g[d].key
		}
		h.fireEvent("sort", h)
	},
	sortBy : function (c) {
		var g = this,
		b = g.items,
		f = g.keys,
		e = b.length,
		a = [],
		d;
		for (d = 0; d < e; d++) {
			a[d] = {
				key : f[d],
				value : b[d],
				index : d
			}
		}
		Ext.Array.sort(a, function (i, h) {
			var j = c(i.value, h.value);
			if (j === 0) {
				j = (i.index < h.index ? -1 : 1)
			}
			return j
		});
		for (d = 0; d < e; d++) {
			b[d] = a[d].value;
			f[d] = a[d].key
		}
		g.fireEvent("sort", g, b, f)
	},
	reorder : function (d) {
		var g = this,
		b = g.items,
		c = 0,
		f = b.length,
		a = [],
		e = [],
		h;
		g.suspendEvents();
		for (h in d) {
			a[d[h]] = b[h]
		}
		for (c = 0; c < f; c++) {
			if (d[c] == undefined) {
				e.push(b[c])
			}
		}
		for (c = 0; c < f; c++) {
			if (a[c] == undefined) {
				a[c] = e.shift()
			}
		}
		g.clear();
		g.addAll(a);
		g.resumeEvents();
		g.fireEvent("sort", g)
	},
	sortByKey : function (a, b) {
		this._sort("key", a, b || function (d, c) {
			var f = String(d).toUpperCase(),
			e = String(c).toUpperCase();
			return f > e ? 1 : (f < e ? -1 : 0)
		})
	}
});
Ext.define("Ext.ItemCollection", {
	extend : "Ext.util.MixedCollection",
	getKey : function (a) {
		return a.getItemId()
	},
	has : function (a) {
		return this.map.hasOwnProperty(a.getId())
	}
});
Ext.define("Ext.fx.layout.card.Scroll", {
	extend : "Ext.fx.layout.card.Abstract",
	requires : ["Ext.fx.easing.Linear"],
	alias : "fx.layout.card.scroll",
	config : {
		duration : 150
	},
	constructor : function (a) {
		this.initConfig(a);
		this.doAnimationFrame = Ext.Function.bind(this.doAnimationFrame, this)
	},
	getEasing : function () {
		var a = this.easing;
		if (!a) {
			this.easing = a = new Ext.fx.easing.Linear()
		}
		return a
	},
	updateDuration : function (a) {
		this.getEasing().setDuration(a)
	},
	onActiveItemChange : function (a, d, l, m, c) {
		var i = this.getDirection(),
		g = this.getEasing(),
		k,
		e,
		b,
		h,
		j,
		f;
		if (d && l) {
			if (this.isAnimating) {
				this.stopAnimation()
			}
			k = this.getLayout().container.innerElement;
			h = k.getWidth();
			j = k.getHeight();
			e = d.renderElement;
			b = l.renderElement;
			this.oldItem = l;
			this.newItem = d;
			this.currentEventController = c;
			this.containerElement = k;
			this.isReverse = f = this.getReverse();
			d.show();
			if (i == "right") {
				i = "left";
				this.isReverse = f = !f
			} else {
				if (i == "down") {
					i = "up";
					this.isReverse = f = !f
				}
			}
			if (i == "left") {
				if (f) {
					g.setConfig({
						startValue : h,
						endValue : 0
					});
					k.dom.scrollLeft = h;
					b.setLeft(h)
				} else {
					g.setConfig({
						startValue : 0,
						endValue : h
					});
					e.setLeft(h)
				}
			} else {
				if (f) {
					g.setConfig({
						startValue : j,
						endValue : 0
					});
					k.dom.scrollTop = j;
					b.setTop(j)
				} else {
					g.setConfig({
						startValue : 0,
						endValue : j
					});
					e.setTop(j)
				}
			}
			this.startAnimation();
			c.pause()
		}
	},
	startAnimation : function () {
		this.isAnimating = true;
		this.getEasing().setStartTime(Date.now());
		this.timer = setInterval(this.doAnimationFrame, 20);
		this.doAnimationFrame()
	},
	doAnimationFrame : function () {
		var d = this.getEasing(),
		c = this.getDirection(),
		a = "scrollTop",
		b;
		if (c == "left" || c == "right") {
			a = "scrollLeft"
		}
		if (d.isEnded) {
			this.stopAnimation()
		} else {
			b = d.getValue();
			this.containerElement.dom[a] = b
		}
	},
	stopAnimation : function () {
		var c = this,
		e = c.getDirection(),
		a = "setTop",
		d = c.oldItem,
		b = c.newItem;
		if (e == "left" || e == "right") {
			a = "setLeft"
		}
		c.currentEventController.resume();
		if (c.isReverse && d && d.renderElement && d.renderElement.dom) {
			d.renderElement[a](null)
		} else {
			if (b && b.renderElement && b.renderElement.dom) {
				b.renderElement[a](null)
			}
		}
		clearInterval(c.timer);
		c.isAnimating = false;
		c.fireEvent("animationend", c)
	}
});
Ext.define("Ext.fx.easing.BoundMomentum", {
	extend : "Ext.fx.easing.Abstract",
	requires : ["Ext.fx.easing.Momentum", "Ext.fx.easing.Bounce"],
	config : {
		momentum : null,
		bounce : null,
		minMomentumValue : 0,
		maxMomentumValue : 0,
		minVelocity : 0.01,
		startVelocity : 0
	},
	applyMomentum : function (a, b) {
		return Ext.factory(a, Ext.fx.easing.Momentum, b)
	},
	applyBounce : function (a, b) {
		return Ext.factory(a, Ext.fx.easing.Bounce, b)
	},
	updateStartTime : function (a) {
		this.getMomentum().setStartTime(a);
		this.callParent(arguments)
	},
	updateStartVelocity : function (a) {
		this.getMomentum().setStartVelocity(a)
	},
	updateStartValue : function (a) {
		this.getMomentum().setStartValue(a)
	},
	reset : function () {
		this.lastValue = null;
		this.isBouncingBack = false;
		this.isOutOfBound = false;
		return this.callParent(arguments)
	},
	getValue : function () {
		var a = this.getMomentum(),
		j = this.getBounce(),
		e = a.getStartVelocity(),
		f = e > 0 ? 1 : -1,
		g = this.getMinMomentumValue(),
		d = this.getMaxMomentumValue(),
		c = (f == 1) ? d : g,
		h = this.lastValue,
		i,
		b;
		if (e === 0) {
			return this.getStartValue()
		}
		if (!this.isOutOfBound) {
			i = a.getValue();
			b = a.getVelocity();
			if (Math.abs(b) < this.getMinVelocity()) {
				this.isEnded = true
			}
			if (i >= g && i <= d) {
				return i
			}
			this.isOutOfBound = true;
			j.setStartTime(Ext.Date.now()).setStartVelocity(b).setStartValue(c)
		}
		i = j.getValue();
		if (!this.isEnded) {
			if (!this.isBouncingBack) {
				if (h !== null) {
					if ((f == 1 && i < h) || (f == -1 && i > h)) {
						this.isBouncingBack = true
					}
				}
			} else {
				if (Math.round(i) == c) {
					this.isEnded = true
				}
			}
		}
		this.lastValue = i;
		return i
	}
});
Ext.define("Ext.scroll.Scroller", {
	extend : "Ext.Evented",
	requires : ["Ext.fx.easing.BoundMomentum", "Ext.fx.easing.EaseOut", "Ext.util.SizeMonitor", "Ext.util.Translatable"],
	config : {
		element : null,
		direction : "auto",
		translationMethod : "auto",
		fps : "auto",
		disabled : null,
		directionLock : false,
		momentumEasing : {
			momentum : {
				acceleration : 30,
				friction : 0.5
			},
			bounce : {
				acceleration : 30,
				springTension : 0.3
			},
			minVelocity : 1
		},
		bounceEasing : {
			duration : 400
		},
		outOfBoundRestrictFactor : 0.5,
		startMomentumResetTime : 300,
		maxAbsoluteVelocity : 6,
		containerSize : "auto",
		containerScrollSize : "auto",
		size : "auto",
		autoRefresh : true,
		initialOffset : {
			x : 0,
			y : 0
		},
		slotSnapSize : {
			x : 0,
			y : 0
		},
		slotSnapOffset : {
			x : 0,
			y : 0
		},
		slotSnapEasing : {
			duration : 150
		}
	},
	cls : Ext.baseCSSPrefix + "scroll-scroller",
	containerCls : Ext.baseCSSPrefix + "scroll-container",
	dragStartTime : 0,
	dragEndTime : 0,
	isDragging : false,
	isAnimating : false,
	constructor : function (a) {
		var b = a && a.element;
		this.doAnimationFrame = Ext.Function.bind(this.doAnimationFrame, this);
		this.stopAnimation = Ext.Function.bind(this.stopAnimation, this);
		this.listeners = {
			scope : this,
			touchstart : "onTouchStart",
			touchend : "onTouchEnd",
			dragstart : "onDragStart",
			drag : "onDrag",
			dragend : "onDragEnd"
		};
		this.minPosition = {
			x : 0,
			y : 0
		};
		this.startPosition = {
			x : 0,
			y : 0
		};
		this.size = {
			x : 0,
			y : 0
		};
		this.position = {
			x : 0,
			y : 0
		};
		this.velocity = {
			x : 0,
			y : 0
		};
		this.isAxisEnabledFlags = {
			x : false,
			y : false
		};
		this.flickStartPosition = {
			x : 0,
			y : 0
		};
		this.flickStartTime = {
			x : 0,
			y : 0
		};
		this.lastDragPosition = {
			x : 0,
			y : 0
		};
		this.dragDirection = {
			x : 0,
			y : 0
		};
		this.initialConfig = a;
		if (b) {
			this.setElement(b)
		}
		return this
	},
	applyElement : function (a) {
		if (!a) {
			return
		}
		return Ext.get(a)
	},
	updateElement : function (a) {
		this.initialize();
		a.addCls(this.cls);
		if (!this.getDisabled()) {
			this.attachListeneners()
		}
		this.onConfigUpdate(["containerSize", "size"], "refreshMaxPosition");
		this.on("maxpositionchange", "snapToBoundary");
		this.on("minpositionchange", "snapToBoundary");
		return this
	},
	getTranslatable : function () {
		if (!this.hasOwnProperty("translatable")) {
			var a = this.getBounceEasing();
			this.translatable = new Ext.util.Translatable({
					translationMethod : this.getTranslationMethod(),
					element : this.getElement(),
					easingX : a.x,
					easingY : a.y,
					useWrapper : false,
					listeners : {
						animationframe : "onAnimationFrame",
						animationend : "onAnimationEnd",
						axisanimationend : "onAxisAnimationEnd",
						scope : this
					}
				})
		}
		return this.translatable
	},
	updateFps : function (a) {
		if (a !== "auto") {
			this.getTranslatable().setFps(a)
		}
	},
	attachListeneners : function () {
		this.getContainer().on(this.listeners)
	},
	detachListeners : function () {
		this.getContainer().un(this.listeners)
	},
	updateDisabled : function (a) {
		if (a) {
			this.detachListeners()
		} else {
			this.attachListeneners()
		}
	},
	updateInitialOffset : function (c) {
		if (typeof c == "number") {
			c = {
				x : c,
				y : c
			}
		}
		var b = this.position,
		a,
		d;
		b.x = a = c.x;
		b.y = d = c.y;
		this.getTranslatable().doTranslate(-a, -d)
	},
	applyDirection : function (a) {
		var e = this.getMinPosition(),
		d = this.getMaxPosition(),
		c,
		b;
		this.givenDirection = a;
		if (a === "auto") {
			c = d.x > e.x;
			b = d.y > e.y;
			if (c && b) {
				a = "both"
			} else {
				if (c) {
					a = "horizontal"
				} else {
					a = "vertical"
				}
			}
		}
		return a
	},
	updateDirection : function (b) {
		var a = this.isAxisEnabledFlags;
		a.x = (b === "both" || b === "horizontal");
		a.y = (b === "both" || b === "vertical")
	},
	isAxisEnabled : function (a) {
		this.getDirection();
		return this.isAxisEnabledFlags[a]
	},
	applyMomentumEasing : function (b) {
		var a = Ext.fx.easing.BoundMomentum;
		return {
			x : Ext.factory(b, a),
			y : Ext.factory(b, a)
		}
	},
	applyBounceEasing : function (b) {
		var a = Ext.fx.easing.EaseOut;
		return {
			x : Ext.factory(b, a),
			y : Ext.factory(b, a)
		}
	},
	applySlotSnapEasing : function (b) {
		var a = Ext.fx.easing.EaseOut;
		return {
			x : Ext.factory(b, a),
			y : Ext.factory(b, a)
		}
	},
	getMinPosition : function () {
		var a = this.minPosition;
		if (!a) {
			this.minPosition = a = {
				x : 0,
				y : 0
			};
			this.fireEvent("minpositionchange", this, a)
		}
		return a
	},
	getMaxPosition : function () {
		var c = this.maxPosition,
		a,
		b;
		if (!c) {
			a = this.getSize();
			b = this.getContainerSize();
			this.maxPosition = c = {
				x : Math.max(0, a.x - b.x),
				y : Math.max(0, a.y - b.y)
			};
			this.fireEvent("maxpositionchange", this, c)
		}
		return c
	},
	refreshMaxPosition : function () {
		this.maxPosition = null;
		this.getMaxPosition()
	},
	applyContainerSize : function (b) {
		var c = this.getContainer().dom,
		a,
		d;
		if (!c) {
			return
		}
		this.givenContainerSize = b;
		if (b === "auto") {
			a = c.offsetWidth;
			d = c.offsetHeight
		} else {
			a = b.x;
			d = b.y
		}
		return {
			x : a,
			y : d
		}
	},
	applySize : function (b) {
		var c = this.getElement().dom,
		a,
		d;
		if (!c) {
			return
		}
		this.givenSize = b;
		if (b === "auto") {
			a = c.offsetWidth;
			d = c.offsetHeight
		} else {
			a = b.x;
			d = b.y
		}
		return {
			x : a,
			y : d
		}
	},
	applyContainerScrollSize : function (b) {
		var c = this.getContainer().dom,
		a,
		d;
		if (!c) {
			return
		}
		this.givenContainerScrollSize = b;
		if (b === "auto") {
			a = c.scrollWidth;
			d = c.scrollHeight
		} else {
			a = b.x;
			d = b.y
		}
		return {
			x : a,
			y : d
		}
	},
	updateAutoRefresh : function (b) {
		var c = Ext.util.SizeMonitor,
		a;
		if (b) {
			this.sizeMonitors = {
				element : new c({
					element : this.getElement(),
					callback : this.doRefresh,
					scope : this
				}),
				container : new c({
					element : this.getContainer(),
					callback : this.doRefresh,
					scope : this
				})
			}
		} else {
			a = this.sizeMonitors;
			if (a) {
				a.element.destroy();
				a.container.destroy()
			}
		}
	},
	applySlotSnapSize : function (a) {
		if (typeof a == "number") {
			return {
				x : a,
				y : a
			}
		}
		return a
	},
	applySlotSnapOffset : function (a) {
		if (typeof a == "number") {
			return {
				x : a,
				y : a
			}
		}
		return a
	},
	getContainer : function () {
		var a = this.container;
		if (!a) {
			this.container = a = this.getElement().getParent();
			a.addCls(this.containerCls)
		}
		return a
	},
	doRefresh : function () {
		this.stopAnimation();
		this.getTranslatable().refresh();
		this.setSize(this.givenSize);
		this.setContainerSize(this.givenContainerSize);
		this.setContainerScrollSize(this.givenContainerScrollSize);
		this.setDirection(this.givenDirection);
		this.fireEvent("refresh", this)
	},
	refresh : function () {
		var a = this.sizeMonitors;
		if (a) {
			a.element.refresh();
			a.container.refresh()
		}
		this.doRefresh();
		return this
	},
	scrollTo : function (c, h, g) {
		var b = this.getTranslatable(),
		a = this.position,
		d = false,
		f,
		e;
		if (this.isAxisEnabled("x")) {
			if (typeof c != "number") {
				c = a.x
			} else {
				if (a.x !== c) {
					a.x = c;
					d = true
				}
			}
			f = -c
		}
		if (this.isAxisEnabled("y")) {
			if (typeof h != "number") {
				h = a.y
			} else {
				if (a.y !== h) {
					a.y = h;
					d = true
				}
			}
			e = -h
		}
		if (d) {
			if (g !== undefined) {
				b.translateAnimated(f, e, g)
			} else {
				this.fireEvent("scroll", this, a.x, a.y);
				b.doTranslate(f, e)
			}
		}
		return this
	},
	scrollToTop : function (b) {
		var a = this.getInitialOffset();
		return this.scrollTo(a.x, a.y, b)
	},
	scrollToEnd : function (a) {
		return this.scrollTo(0, this.getSize().y - this.getContainerSize().y, a)
	},
	scrollBy : function (b, d, c) {
		var a = this.position;
		b = (typeof b == "number") ? b + a.x : null;
		d = (typeof d == "number") ? d + a.y : null;
		return this.scrollTo(b, d, c)
	},
	onTouchStart : function () {
		this.isTouching = true;
		this.stopAnimation()
	},
	onTouchEnd : function () {
		var a = this.position;
		this.isTouching = false;
		if (!this.isDragging && this.snapToSlot()) {
			this.fireEvent("scrollstart", this, a.x, a.y)
		}
	},
	onDragStart : function (l) {
		var o = this.getDirection(),
		g = l.absDeltaX,
		f = l.absDeltaY,
		j = this.getDirectionLock(),
		i = this.startPosition,
		d = this.flickStartPosition,
		k = this.flickStartTime,
		h = this.lastDragPosition,
		c = this.position,
		b = this.dragDirection,
		n = c.x,
		m = c.y,
		a = Ext.Date.now();
		this.isDragging = true;
		if (j && o !== "both") {
			if ((o === "horizontal" && g > f) || (o === "vertical" && f > g)) {
				l.stopPropagation()
			} else {
				this.isDragging = false;
				return
			}
		}
		h.x = n;
		h.y = m;
		d.x = n;
		d.y = m;
		i.x = n;
		i.y = m;
		k.x = a;
		k.y = a;
		b.x = 0;
		b.y = 0;
		this.dragStartTime = a;
		this.isDragging = true;
		this.fireEvent("scrollstart", this, n, m)
	},
	onAxisDrag : function (i, q) {
		if (!this.isAxisEnabled(i)) {
			return
		}
		var h = this.flickStartPosition,
		l = this.flickStartTime,
		j = this.lastDragPosition,
		e = this.dragDirection,
		g = this.position[i],
		k = this.getMinPosition()[i],
		o = this.getMaxPosition()[i],
		d = this.startPosition[i],
		p = j[i],
		n = d - q,
		c = e[i],
		m = this.getOutOfBoundRestrictFactor(),
		f = this.getStartMomentumResetTime(),
		b = Ext.Date.now(),
		a;
		if (n < k) {
			n *= m
		} else {
			if (n > o) {
				a = n - o;
				n = o + a * m
			}
		}
		if (n > p) {
			e[i] = 1
		} else {
			if (n < p) {
				e[i] = -1
			}
		}
		if ((c !== 0 && (e[i] !== c)) || (b - l[i]) > f) {
			h[i] = g;
			l[i] = b
		}
		j[i] = n
	},
	onDrag : function (b) {
		if (!this.isDragging) {
			return
		}
		var a = this.lastDragPosition;
		this.onAxisDrag("x", b.deltaX);
		this.onAxisDrag("y", b.deltaY);
		this.scrollTo(a.x, a.y)
	},
	onDragEnd : function (c) {
		var b,
		a;
		if (!this.isDragging) {
			return
		}
		this.dragEndTime = Ext.Date.now();
		this.onDrag(c);
		this.isDragging = false;
		b = this.getAnimationEasing("x");
		a = this.getAnimationEasing("y");
		if (b || a) {
			this.getTranslatable().animate(b, a)
		} else {
			this.onScrollEnd()
		}
	},
	getAnimationEasing : function (g) {
		if (!this.isAxisEnabled(g)) {
			return null
		}
		var e = this.position[g],
		f = this.flickStartPosition[g],
		k = this.flickStartTime[g],
		c = this.getMinPosition()[g],
		j = this.getMaxPosition()[g],
		a = this.getMaxAbsoluteVelocity(),
		d = null,
		b = this.dragEndTime,
		l,
		i,
		h;
		if (e < c) {
			d = c
		} else {
			if (e > j) {
				d = j
			}
		}
		if (d !== null) {
			l = this.getBounceEasing()[g];
			l.setConfig({
				startTime : b,
				startValue : -e,
				endValue : -d
			});
			return l
		}
		h = b - k;
		if (h === 0) {
			return null
		}
		i = (e - f) / (b - k);
		if (i === 0) {
			return null
		}
		if (i < -a) {
			i = -a
		} else {
			if (i > a) {
				i = a
			}
		}
		l = this.getMomentumEasing()[g];
		l.setConfig({
			startTime : b,
			startValue : -e,
			startVelocity : -i,
			minMomentumValue : -j,
			maxMomentumValue : 0
		});
		return l
	},
	onAnimationFrame : function (c, b, d) {
		var a = this.position;
		a.x = -b;
		a.y = -d;
		this.fireEvent("scroll", this, a.x, a.y)
	},
	onAxisAnimationEnd : function (a) {},
	onAnimationEnd : function () {
		this.snapToBoundary();
		this.onScrollEnd()
	},
	stopAnimation : function () {
		this.getTranslatable().stopAnimation()
	},
	onScrollEnd : function () {
		var a = this.position;
		if (this.isTouching || !this.snapToSlot()) {
			this.fireEvent("scrollend", this, a.x, a.y)
		}
	},
	snapToSlot : function () {
		var b = this.getSnapPosition("x"),
		a = this.getSnapPosition("y"),
		c = this.getSlotSnapEasing();
		if (b !== null || a !== null) {
			this.scrollTo(b, a, {
				easingX : c.x,
				easingY : c.y
			});
			return true
		}
		return false
	},
	getSnapPosition : function (c) {
		var g = this.getSlotSnapSize()[c],
		d = null,
		a,
		f,
		e,
		b;
		if (g !== 0 && this.isAxisEnabled(c)) {
			a = this.position[c];
			f = this.getSlotSnapOffset()[c];
			e = this.getMaxPosition()[c];
			b = (a - f) % g;
			if (b !== 0) {
				if (Math.abs(b) > g / 2) {
					d = a + ((b > 0) ? g - b : b - g);
					if (d > e) {
						d = a - b
					}
				} else {
					d = a - b
				}
			}
		}
		return d
	},
	snapToBoundary : function () {
		var g = this.position,
		c = this.getMinPosition(),
		f = this.getMaxPosition(),
		e = c.x,
		d = c.y,
		b = f.x,
		a = f.y,
		i = Math.round(g.x),
		h = Math.round(g.y);
		if (i < e) {
			i = e
		} else {
			if (i > b) {
				i = b
			}
		}
		if (h < d) {
			h = d
		} else {
			if (h > a) {
				h = a
			}
		}
		this.scrollTo(i, h)
	},
	destroy : function () {
		var b = this.getElement(),
		a = this.sizeMonitors;
		if (a) {
			a.element.destroy();
			a.container.destroy()
		}
		if (b && !b.isDestroyed) {
			b.removeCls(this.cls);
			this.getContainer().removeCls(this.containerCls)
		}
		Ext.destroy(this.translatable);
		this.callParent(arguments)
	}
}, function () {});
Ext.define("Ext.scroll.indicator.Default", {
	extend : "Ext.scroll.indicator.Abstract",
	config : {
		cls : "default"
	},
	setOffset : function (c) {
		var b = this.getAxis(),
		a = this.element.dom.style;
		if (b === "x") {
			a.webkitTransform = "translate3d(" + c + "px, 0, 0)"
		} else {
			a.webkitTransform = "translate3d(0, " + c + "px, 0)"
		}
	},
	applyLength : function (a) {
		return Math.round(Math.max(0, a))
	},
	updateValue : function (f) {
		var b = this.barLength,
		c = this.gapLength,
		d = this.getLength(),
		e,
		g,
		a;
		if (f <= 0) {
			g = 0;
			this.updateLength(this.applyLength(d + f * b))
		} else {
			if (f >= 1) {
				a = Math.round((f - 1) * b);
				e = this.applyLength(d - a);
				a = d - e;
				this.updateLength(e);
				g = c + a
			} else {
				g = c * f
			}
		}
		this.setOffset(g)
	}
});
Ext.define("Ext.scroll.indicator.ScrollPosition", {
	extend : "Ext.scroll.indicator.Abstract",
	config : {
		cls : "scrollposition"
	},
	getElementConfig : function () {
		var a = this.callParent(arguments);
		a.children.unshift({
			className : "x-scroll-bar-stretcher"
		});
		return a
	},
	updateValue : function (a) {
		if (this.gapLength === 0) {
			if (a > 1) {
				a = a - 1
			}
			this.setOffset(this.barLength * a)
		} else {
			this.setOffset(this.gapLength * a)
		}
	},
	setLength : function (e) {
		var c = this.getAxis(),
		a = this.barLength,
		d = this.barElement.dom,
		b = this.element;
		this.callParent(arguments);
		if (c === "x") {
			d.scrollLeft = a;
			b.setLeft(a)
		} else {
			d.scrollTop = a;
			b.setTop(a)
		}
	},
	setOffset : function (d) {
		var b = this.getAxis(),
		a = this.barLength,
		c = this.barElement.dom;
		d = a - d;
		if (b === "x") {
			c.scrollLeft = d
		} else {
			c.scrollTop = d
		}
	}
});
Ext.define("Ext.scroll.indicator.CssTransform", {
	extend : "Ext.scroll.indicator.Abstract",
	config : {
		cls : "csstransform"
	},
	getElementConfig : function () {
		var a = this.callParent();
		a.children[0].children = [{
				reference : "startElement"
			}, {
				reference : "middleElement"
			}, {
				reference : "endElement"
			}
		];
		return a
	},
	refresh : function () {
		var d = this.getAxis(),
		c = this.startElement.dom,
		a = this.endElement.dom,
		e = this.middleElement,
		b,
		f;
		if (d === "x") {
			b = c.offsetWidth;
			f = a.offsetWidth;
			e.setLeft(b)
		} else {
			b = c.offsetHeight;
			f = a.offsetHeight;
			e.setTop(b)
		}
		this.startElementLength = b;
		this.endElementLength = f;
		this.minLength = b + f;
		this.callParent()
	},
	applyLength : function (a) {
		return Math.round(Math.max(this.minLength, a))
	},
	updateLength : function (c) {
		var b = this.getAxis(),
		a = this.endElement.dom.style,
		e = this.middleElement.dom.style,
		d = this.endElementLength,
		g = c - d,
		f = g - this.startElementLength;
		if (b === "x") {
			a.webkitTransform = "translate3d(" + g + "px, 0, 0)";
			e.webkitTransform = "translate3d(0, 0, 0) scaleX(" + f + ")"
		} else {
			a.webkitTransform = "translate3d(0, " + g + "px, 0)";
			e.webkitTransform = "translate3d(0, 0, 0) scaleY(" + f + ")"
		}
	},
	updateValue : function (f) {
		var b = this.barLength,
		c = this.gapLength,
		d = this.getLength(),
		e,
		g,
		a;
		if (f <= 0) {
			g = 0;
			this.updateLength(this.applyLength(d + f * b))
		} else {
			if (f >= 1) {
				a = Math.round((f - 1) * b);
				e = this.applyLength(d - a);
				a = d - e;
				this.updateLength(e);
				g = c + a
			} else {
				g = c * f
			}
		}
		this.setOffset(g)
	},
	setOffset : function (c) {
		var a = this.getAxis(),
		b = this.element.dom.style;
		c = Math.round(c);
		if (a === "x") {
			b.webkitTransform = "translate3d(" + c + "px, 0, 0)"
		} else {
			b.webkitTransform = "translate3d(0, " + c + "px, 0)"
		}
	}
});
Ext.define("Ext.scroll.Indicator", {
	requires : ["Ext.scroll.indicator.Default", "Ext.scroll.indicator.ScrollPosition", "Ext.scroll.indicator.CssTransform"],
	alternateClassName : "Ext.util.Indicator",
	constructor : function (a) {
		if (Ext.os.is.Android2 || Ext.browser.is.ChromeMobile) {
			return new Ext.scroll.indicator.ScrollPosition(a)
		} else {
			if (Ext.os.is.iOS) {
				return new Ext.scroll.indicator.CssTransform(a)
			} else {
				return new Ext.scroll.indicator.Default(a)
			}
		}
	}
});
Ext.define("Ext.scroll.View", {
	extend : "Ext.Evented",
	alternateClassName : "Ext.util.ScrollView",
	requires : ["Ext.scroll.Scroller", "Ext.scroll.Indicator"],
	config : {
		indicatorsUi : "dark",
		element : null,
		scroller : {},
		indicators : {
			x : {
				axis : "x"
			},
			y : {
				axis : "y"
			}
		},
		indicatorsHidingDelay : 100,
		cls : Ext.baseCSSPrefix + "scroll-view"
	},
	processConfig : function (c) {
		if (!c) {
			return null
		}
		if (typeof c == "string") {
			c = {
				direction : c
			}
		}
		c = Ext.merge({}, c);
		var a = c.scroller,
		b;
		if (!a) {
			c.scroller = a = {}
			
		}
		for (b in c) {
			if (c.hasOwnProperty(b)) {
				if (!this.hasConfig(b)) {
					a[b] = c[b];
					delete c[b]
				}
			}
		}
		return c
	},
	constructor : function (a) {
		a = this.processConfig(a);
		this.useIndicators = {
			x : true,
			y : true
		};
		this.doHideIndicators = Ext.Function.bind(this.doHideIndicators, this);
		this.initConfig(a)
	},
	setConfig : function (a) {
		return this.callParent([this.processConfig(a)])
	},
	updateIndicatorsUi : function (a) {
		var b = this.getIndicators();
		b.x.setUi(a);
		b.y.setUi(a)
	},
	applyScroller : function (a, b) {
		return Ext.factory(a, Ext.scroll.Scroller, b)
	},
	applyIndicators : function (b, d) {
		var a = Ext.scroll.Indicator,
		c = this.useIndicators;
		if (!b) {
			b = {}
			
		}
		if (!b.x) {
			c.x = false;
			b.x = {}
			
		}
		if (!b.y) {
			c.y = false;
			b.y = {}
			
		}
		return {
			x : Ext.factory(b.x, a, d && d.x),
			y : Ext.factory(b.y, a, d && d.y)
		}
	},
	updateIndicators : function (a) {
		this.indicatorsGrid = Ext.Element.create({
				className : "x-scroll-bar-grid-wrapper",
				children : [{
						className : "x-scroll-bar-grid",
						children : [{
								children : [{}, {
										children : [a.y.barElement]
									}
								]
							}, {
								children : [{
										children : [a.x.barElement]
									}, {}
									
								]
							}
						]
					}
				]
			})
	},
	updateScroller : function (a) {
		a.on({
			scope : this,
			scrollstart : "onScrollStart",
			scroll : "onScroll",
			scrollend : "onScrollEnd",
			refresh : "refreshIndicators"
		})
	},
	isAxisEnabled : function (a) {
		return this.getScroller().isAxisEnabled(a) && this.useIndicators[a]
	},
	applyElement : function (a) {
		if (a) {
			return Ext.get(a)
		}
	},
	updateElement : function (c) {
		var b = c.getFirstChild().getFirstChild(),
		a = this.getScroller();
		c.addCls(this.getCls());
		c.insertFirst(this.indicatorsGrid);
		a.setElement(b);
		this.refreshIndicators();
		return this
	},
	showIndicators : function () {
		var a = this.getIndicators();
		if (this.hasOwnProperty("indicatorsHidingTimer")) {
			clearTimeout(this.indicatorsHidingTimer);
			delete this.indicatorsHidingTimer
		}
		if (this.isAxisEnabled("x")) {
			a.x.show()
		}
		if (this.isAxisEnabled("y")) {
			a.y.show()
		}
	},
	hideIndicators : function () {
		var a = this.getIndicatorsHidingDelay();
		if (a > 0) {
			this.indicatorsHidingTimer = setTimeout(this.doHideIndicators, a)
		} else {
			this.doHideIndicators()
		}
	},
	doHideIndicators : function () {
		var a = this.getIndicators();
		if (this.isAxisEnabled("x")) {
			a.x.hide()
		}
		if (this.isAxisEnabled("y")) {
			a.y.hide()
		}
	},
	onScrollStart : function () {
		this.onScroll.apply(this, arguments);
		this.showIndicators()
	},
	onScrollEnd : function () {
		this.hideIndicators()
	},
	onScroll : function (b, a, c) {
		this.setIndicatorValue("x", a);
		this.setIndicatorValue("y", c)
	},
	setIndicatorValue : function (b, f) {
		if (!this.isAxisEnabled(b)) {
			return this
		}
		var a = this.getScroller(),
		c = a.getMaxPosition()[b],
		e = a.getContainerSize()[b],
		d;
		if (c === 0) {
			d = f / e;
			if (f >= 0) {
				d += 1
			}
		} else {
			if (f > c) {
				d = 1 + ((f - c) / e)
			} else {
				if (f < 0) {
					d = f / e
				} else {
					d = f / c
				}
			}
		}
		this.getIndicators()[b].setValue(d)
	},
	refreshIndicator : function (d) {
		if (!this.isAxisEnabled(d)) {
			return this
		}
		var a = this.getScroller(),
		b = this.getIndicators()[d],
		e = a.getContainerSize()[d],
		f = a.getSize()[d],
		c = e / f;
		b.setRatio(c);
		b.refresh()
	},
	refresh : function () {
		return this.getScroller().refresh()
	},
	refreshIndicators : function () {
		var a = this.getIndicators();
		a.x.setActive(this.isAxisEnabled("x"));
		a.y.setActive(this.isAxisEnabled("y"));
		this.refreshIndicator("x");
		this.refreshIndicator("y")
	},
	destroy : function () {
		var a = this.getElement(),
		b = this.getIndicators();
		if (a && !a.isDestroyed) {
			a.removeCls(this.getCls())
		}
		b.x.destroy();
		b.y.destroy();
		Ext.destroy(this.getScroller(), this.indicatorsGrid);
		delete this.indicatorsGrid;
		this.callParent(arguments)
	}
});
Ext.define("Ext.behavior.Scrollable", {
	extend : "Ext.behavior.Behavior",
	requires : ["Ext.scroll.View"],
	constructor : function () {
		this.listeners = {
			painted : "onComponentPainted",
			scope : this
		};
		this.callParent(arguments)
	},
	onComponentPainted : function () {
		this.scrollView.refresh()
	},
	setConfig : function (d) {
		var b = this.scrollView,
		c = this.component,
		e,
		a;
		if (d) {
			if (!b) {
				this.scrollView = b = new Ext.scroll.View(d);
				b.on("destroy", "onScrollViewDestroy", this);
				c.setUseBodyElement(true);
				this.scrollerElement = a = c.innerElement;
				this.scrollContainer = a.wrap();
				this.scrollViewElement = e = c.bodyElement;
				b.setElement(e);
				if (c.isPainted()) {
					this.onComponentPainted(c)
				}
				c.on(this.listeners)
			} else {
				if (Ext.isString(d) || Ext.isObject(d)) {
					b.setConfig(d)
				}
			}
		} else {
			if (b) {
				b.destroy()
			}
		}
		return this
	},
	getScrollView : function () {
		return this.scrollView
	},
	onScrollViewDestroy : function () {
		var b = this.component,
		a = this.scrollerElement;
		if (!a.isDestroyed) {
			this.scrollerElement.unwrap()
		}
		this.scrollContainer.destroy();
		b.un(this.listeners);
		delete this.scrollerElement;
		delete this.scrollView;
		delete this.scrollContainer
	},
	onComponentDestroy : function () {
		var a = this.scrollView;
		if (a) {
			a.destroy()
		}
	}
});
Ext.define("Ext.fx.layout.card.Style", {
	extend : "Ext.fx.layout.card.Abstract",
	requires : ["Ext.fx.Animation"],
	config : {
		inAnimation : {
			before : {
				visibility : null
			},
			preserveEndState : false,
			replacePrevious : true
		},
		outAnimation : {
			preserveEndState : false,
			replacePrevious : true
		}
	},
	constructor : function (b) {
		var c,
		a;
		this.initConfig(b);
		this.endAnimationCounter = 0;
		c = this.getInAnimation();
		a = this.getOutAnimation();
		c.on("animationend", "incrementEnd", this);
		a.on("animationend", "incrementEnd", this)
	},
	updateDirection : function (a) {
		this.getInAnimation().setDirection(a);
		this.getOutAnimation().setDirection(a)
	},
	updateDuration : function (a) {
		this.getInAnimation().setDuration(a);
		this.getOutAnimation().setDuration(a)
	},
	updateReverse : function (a) {
		this.getInAnimation().setReverse(a);
		this.getOutAnimation().setReverse(a)
	},
	incrementEnd : function () {
		this.endAnimationCounter++;
		if (this.endAnimationCounter > 1) {
			this.endAnimationCounter = 0;
			this.fireEvent("animationend", this)
		}
	},
	applyInAnimation : function (b, a) {
		return Ext.factory(b, Ext.fx.Animation, a)
	},
	applyOutAnimation : function (b, a) {
		return Ext.factory(b, Ext.fx.Animation, a)
	},
	updateInAnimation : function (a) {
		a.setScope(this)
	},
	updateOutAnimation : function (a) {
		a.setScope(this)
	},
	onActiveItemChange : function (a, e, h, i, d) {
		var b = this.getInAnimation(),
		g = this.getOutAnimation(),
		f,
		c;
		if (e && h && h.isPainted()) {
			f = e.renderElement;
			c = h.renderElement;
			b.setElement(f);
			g.setElement(c);
			g.setOnBeforeEnd(function (j, k) {
				if (k || Ext.Animator.hasRunningAnimations(j)) {
					d.firingArguments[1] = null;
					d.firingArguments[2] = null
				}
			});
			g.setOnEnd(function () {
				d.resume()
			});
			f.dom.style.setProperty("visibility", "hidden", "!important");
			e.show();
			Ext.Animator.run([g, b]);
			d.pause()
		}
	}
});
Ext.define("Ext.fx.layout.card.Slide", {
	extend : "Ext.fx.layout.card.Style",
	alias : "fx.layout.card.slide",
	config : {
		inAnimation : {
			type : "slide",
			easing : "ease-out"
		},
		outAnimation : {
			type : "slide",
			easing : "ease-out",
			out : true
		}
	},
	updateReverse : function (a) {
		this.getInAnimation().setReverse(a);
		this.getOutAnimation().setReverse(a)
	}
});
Ext.define("Ext.fx.layout.card.Cover", {
	extend : "Ext.fx.layout.card.Style",
	alias : "fx.layout.card.cover",
	config : {
		reverse : null,
		inAnimation : {
			before : {
				"z-index" : 100
			},
			after : {
				"z-index" : 0
			},
			type : "slide",
			easing : "ease-out"
		},
		outAnimation : {
			easing : "ease-out",
			from : {
				opacity : 0.99
			},
			to : {
				opacity : 1
			},
			out : true
		}
	},
	updateReverse : function (a) {
		this.getInAnimation().setReverse(a);
		this.getOutAnimation().setReverse(a)
	}
});
Ext.define("Ext.fx.layout.card.Reveal", {
	extend : "Ext.fx.layout.card.Style",
	alias : "fx.layout.card.reveal",
	config : {
		inAnimation : {
			easing : "ease-out",
			from : {
				opacity : 0.99
			},
			to : {
				opacity : 1
			}
		},
		outAnimation : {
			before : {
				"z-index" : 100
			},
			after : {
				"z-index" : 0
			},
			type : "slide",
			easing : "ease-out",
			out : true
		}
	},
	updateReverse : function (a) {
		this.getInAnimation().setReverse(a);
		this.getOutAnimation().setReverse(a)
	}
});
Ext.define("Ext.fx.layout.card.Fade", {
	extend : "Ext.fx.layout.card.Style",
	alias : "fx.layout.card.fade",
	config : {
		reverse : null,
		inAnimation : {
			type : "fade",
			easing : "ease-out"
		},
		outAnimation : {
			type : "fade",
			easing : "ease-out",
			out : true
		}
	}
});
Ext.define("Ext.fx.layout.card.Flip", {
	extend : "Ext.fx.layout.card.Style",
	alias : "fx.layout.card.flip",
	config : {
		duration : 500,
		inAnimation : {
			type : "flip",
			half : true,
			easing : "ease-out",
			before : {
				"backface-visibility" : "hidden"
			},
			after : {
				"backface-visibility" : null
			}
		},
		outAnimation : {
			type : "flip",
			half : true,
			easing : "ease-in",
			before : {
				"backface-visibility" : "hidden"
			},
			after : {
				"backface-visibility" : null
			},
			out : true
		}
	},
	updateDuration : function (d) {
		var c = d / 2,
		b = this.getInAnimation(),
		a = this.getOutAnimation();
		b.setDelay(c);
		b.setDuration(c);
		a.setDuration(c)
	}
});
Ext.define("Ext.fx.layout.card.Pop", {
	extend : "Ext.fx.layout.card.Style",
	alias : "fx.layout.card.pop",
	config : {
		duration : 500,
		inAnimation : {
			type : "pop",
			easing : "ease-out"
		},
		outAnimation : {
			type : "pop",
			easing : "ease-in",
			out : true
		}
	},
	updateDuration : function (d) {
		var c = d / 2,
		b = this.getInAnimation(),
		a = this.getOutAnimation();
		b.setDelay(c);
		b.setDuration(c);
		a.setDuration(c)
	}
});
Ext.define("Ext.fx.layout.Card", {
	requires : ["Ext.fx.layout.card.Slide", "Ext.fx.layout.card.Cover", "Ext.fx.layout.card.Reveal", "Ext.fx.layout.card.Fade", "Ext.fx.layout.card.Flip", "Ext.fx.layout.card.Pop", "Ext.fx.layout.card.Scroll"],
	constructor : function (b) {
		var a = Ext.fx.layout.card.Abstract,
		c;
		if (!b) {
			return null
		}
		if (typeof b == "string") {
			c = b;
			b = {}
			
		} else {
			if (b.type) {
				c = b.type
			}
		}
		b.elementBox = false;
		if (c) {
			if (Ext.os.is.Android2) {
				if (c != "fade") {
					c = "scroll"
				}
			} else {
				if (c === "slide" && Ext.browser.is.ChromeMobile) {
					c = "scroll"
				}
			}
			a = Ext.ClassManager.getByAlias("fx.layout.card." + c)
		}
		return Ext.factory(b, a)
	}
});
Ext.define("Ext.layout.Card", {
	extend : "Ext.layout.Fit",
	alternateClassName : "Ext.layout.CardLayout",
	isCard : true,
	requires : ["Ext.fx.layout.Card"],
	alias : "layout.card",
	cls : Ext.baseCSSPrefix + "layout-card",
	itemCls : Ext.baseCSSPrefix + "layout-card-item",
	constructor : function () {
		this.callParent(arguments);
		this.container.onInitialized(this.onContainerInitialized, this)
	},
	applyAnimation : function (a) {
		return new Ext.fx.layout.Card(a)
	},
	updateAnimation : function (b, a) {
		if (b && b.isAnimation) {
			b.setLayout(this)
		}
		if (a) {
			a.destroy()
		}
	},
	doItemAdd : function (b, a) {
		if (b.isInnerItem()) {
			b.hide()
		}
		this.callParent(arguments)
	},
	getInnerItemsContainer : function () {
		var a = this.innerItemsContainer;
		if (!a) {
			this.innerItemsContainer = a = Ext.Element.create({
					className : this.cls + "-container"
				});
			this.container.innerElement.append(a)
		}
		return a
	},
	doItemRemove : function (c, a, b) {
		this.callParent(arguments);
		if (!b && c.isInnerItem()) {
			c.show()
		}
	},
	onContainerInitialized : function (a) {
		var b = a.getActiveItem();
		if (b) {
			b.show()
		}
		a.on("activeitemchange", "onContainerActiveItemChange", this)
	},
	onContainerActiveItemChange : function (a) {
		this.relayEvent(arguments, "doActiveItemChange")
	},
	doActiveItemChange : function (b, c, a) {
		if (a) {
			a.hide()
		}
		if (c) {
			c.show()
		}
	},
	doItemDockedChange : function (b, c) {
		var a = b.element;
		if (c) {
			a.removeCls(this.itemCls)
		} else {
			a.addCls(this.itemCls)
		}
		this.callParent(arguments)
	}
});
Ext.define("Ext.layout.Layout", {
	requires : ["Ext.layout.Fit", "Ext.layout.Card", "Ext.layout.HBox", "Ext.layout.VBox"],
	constructor : function (a, b) {
		var c = Ext.layout.Default,
		d,
		e;
		if (typeof b == "string") {
			d = b;
			b = {}
			
		} else {
			if ("type" in b) {
				d = b.type
			}
		}
		if (d) {
			c = Ext.ClassManager.getByAlias("layout." + d)
		}
		return new c(a, b)
	}
});
Ext.define("Ext.Container", {
	extend : "Ext.Component",
	alternateClassName : "Ext.lib.Container",
	requires : ["Ext.layout.Layout", "Ext.ItemCollection", "Ext.behavior.Scrollable", "Ext.Mask"],
	xtype : "container",
	eventedConfig : {
		activeItem : 0
	},
	config : {
		layout : null,
		control : {},
		defaults : null,
		items : null,
		autoDestroy : true,
		defaultType : null,
		scrollable : null,
		useBodyElement : null,
		masked : null,
		modal : null,
		hideOnMaskTap : null
	},
	isContainer : true,
	delegateListeners : {
		delegate : "> component",
		centeredchange : "onItemCenteredChange",
		dockedchange : "onItemDockedChange",
		floatingchange : "onItemFloatingChange"
	},
	constructor : function (a) {
		var b = this;
		b._items = b.items = new Ext.ItemCollection();
		b.innerItems = [];
		b.onItemAdd = b.onFirstItemAdd;
		b.callParent(arguments)
	},
	getElementConfig : function () {
		return {
			reference : "element",
			className : "x-container",
			children : [{
					reference : "innerElement",
					className : "x-inner"
				}
			]
		}
	},
	applyMasked : function (a, b) {
		b = Ext.factory(a, Ext.Mask, b);
		if (b) {
			this.add(b)
		}
		return b
	},
	mask : function (a) {
		this.setMasked(a || true)
	},
	unmask : function () {
		this.setMasked(false)
	},
	applyModal : function (a, b) {
		if (!a && !b) {
			return
		}
		return Ext.factory(a, Ext.Mask, b)
	},
	updateModal : function (c, a) {
		var b = {
			painted : "refreshModalMask",
			erased : "destroyModalMask"
		};
		if (c) {
			this.on(b);
			c.on("destroy", "onModalDestroy", this);
			if (this.getTop() === null && this.getBottom() === null && this.getRight() === null && this.getLeft() === null && !this.getCentered()) {
				this.setTop(0);
				this.setLeft(0)
			}
			if (this.isPainted()) {
				this.refreshModalMask()
			}
		} else {
			if (a) {
				a.un("destroy", "onModalDestroy", this);
				this.un(b)
			}
		}
	},
	onModalDestroy : function () {
		this.setModal(null)
	},
	refreshModalMask : function () {
		var b = this.getModal(),
		a = this.getParent();
		if (!this.painted) {
			this.painted = true;
			if (b) {
				a.insertBefore(b, this);
				b.setZIndex(this.getZIndex() - 1);
				if (this.getHideOnMaskTap()) {
					b.on("tap", "hide", this, {
						single : true
					})
				}
			}
		}
	},
	destroyModalMask : function () {
		var b = this.getModal(),
		a = this.getParent();
		if (this.painted) {
			this.painted = false;
			if (b) {
				b.un("tap", "hide", this);
				a.remove(b, false)
			}
		}
	},
	updateZIndex : function (b) {
		var a = this.getModal();
		this.callParent(arguments);
		if (a) {
			a.setZIndex(b - 1)
		}
	},
	updateBaseCls : function (a, b) {
		var c = this,
		d = c.getUi();
		if (a) {
			this.element.addCls(a);
			this.innerElement.addCls(a, null, "inner");
			if (d) {
				this.element.addCls(a, null, d)
			}
		}
		if (b) {
			this.element.removeCls(b);
			this.innerElement.removeCls(a, null, "inner");
			if (d) {
				this.element.removeCls(b, null, d)
			}
		}
	},
	updateUseBodyElement : function (a) {
		if (a) {
			this.bodyElement = this.innerElement.wrap({
					cls : "x-body"
				});
			this.referenceList.push("bodyElement")
		}
	},
	applyItems : function (a, b) {
		if (a) {
			this.getDefaultType();
			this.getDefaults();
			if (this.initialized && b.length > 0) {
				this.removeAll()
			}
			this.add(a)
		}
	},
	applyControl : function (c) {
		var a,
		b,
		e,
		d;
		for (a in c) {
			d = c[a];
			for (b in d) {
				e = d[b];
				if (Ext.isObject(e)) {
					e.delegate = a
				}
			}
			d.delegate = a;
			this.addListener(d)
		}
		return c
	},
	onFirstItemAdd : function () {
		delete this.onItemAdd;
		this.setLayout(new Ext.layout.Layout(this, this.getLayout() || "default"));
		if (this.innerHtmlElement && !this.getHtml()) {
			this.innerHtmlElement.destroy();
			delete this.innerHtmlElement
		}
		this.on(this.delegateListeners);
		return this.onItemAdd.apply(this, arguments)
	},
	updateDefaultType : function (a) {
		this.defaultItemClass = Ext.ClassManager.getByAlias("widget." + a)
	},
	applyDefaults : function (a) {
		if (a) {
			this.factoryItem = this.factoryItemWithDefaults;
			return a
		}
	},
	factoryItem : function (a) {
		return Ext.factory(a, this.defaultItemClass)
	},
	factoryItemWithDefaults : function (c) {
		var b = this,
		d = b.getDefaults(),
		a;
		if (!d) {
			return Ext.factory(c, b.defaultItemClass)
		}
		if (c.isComponent) {
			a = c;
			if (d && c.isInnerItem() && !b.has(a)) {
				a.setConfig(d, true)
			}
		} else {
			if (d && !c.ignoreDefaults) {
				if (!(c.hasOwnProperty("left") && c.hasOwnProperty("right") && c.hasOwnProperty("top") && c.hasOwnProperty("bottom") && c.hasOwnProperty("docked") && c.hasOwnProperty("centered"))) {
					c = Ext.mergeIf({}, c, d)
				}
			}
			a = Ext.factory(c, b.defaultItemClass)
		}
		return a
	},
	add : function (a) {
		var e = this,
		b,
		d,
		c,
		f;
		a = Ext.Array.from(a);
		d = a.length;
		for (b = 0; b < d; b++) {
			c = e.factoryItem(a[b]);
			this.doAdd(c);
			if (!f && !this.getActiveItem() && this.innerItems.length > 0 && c.isInnerItem()) {
				f = c
			}
		}
		if (f) {
			this.setActiveItem(f)
		}
		return c
	},
	doAdd : function (d) {
		var c = this,
		a = c.getItems(),
		b;
		if (!a.has(d)) {
			b = a.length;
			a.add(d);
			if (d.isInnerItem()) {
				c.insertInner(d)
			}
			d.setParent(c);
			c.onItemAdd(d, b)
		}
	},
	remove : function (d, b) {
		var c = this,
		a = c.indexOf(d),
		e = c.getInnerItems();
		if (b === undefined) {
			b = c.getAutoDestroy()
		}
		if (a !== -1) {
			if (!c.removingAll && e.length > 1 && d === c.getActiveItem()) {
				c.on({
					activeitemchange : "doRemove",
					scope : c,
					single : true,
					order : "after",
					args : [d, a, b]
				});
				c.doResetActiveItem(e.indexOf(d))
			} else {
				c.doRemove(d, a, b);
				if (e.length === 0) {
					c.setActiveItem(null)
				}
			}
		}
		return c
	},
	doResetActiveItem : function (a) {
		if (a === 0) {
			this.setActiveItem(1)
		} else {
			this.setActiveItem(0)
		}
	},
	doRemove : function (d, a, b) {
		var c = this;
		c.items.remove(d);
		if (d.isInnerItem()) {
			c.removeInner(d)
		}
		c.onItemRemove(d, a, b);
		d.setParent(null);
		if (b) {
			d.destroy()
		}
	},
	removeAll : function (c, f) {
		var a = this.items,
		e = a.length,
		b = 0,
		d;
		if (c === undefined) {
			c = this.getAutoDestroy()
		}
		f = Boolean(f);
		this.removingAll = true;
		for (; b < e; b++) {
			d = a.getAt(b);
			if (d && (f || d.isInnerItem())) {
				this.doRemove(d, b, c);
				b--;
				e--
			}
		}
		this.removingAll = false;
		return this
	},
	getAt : function (a) {
		return this.items.getAt(a)
	},
	removeAt : function (a) {
		var b = this.getAt(a);
		if (b) {
			this.remove(b)
		}
		return this
	},
	removeInnerAt : function (a) {
		var b = this.getInnerItems()[a];
		if (b) {
			this.remove(b)
		}
		return this
	},
	has : function (a) {
		return this.getItems().indexOf(a) != -1
	},
	hasInnerItem : function (a) {
		return this.innerItems.indexOf(a) != -1
	},
	indexOf : function (a) {
		return this.getItems().indexOf(a)
	},
	insertInner : function (d, b) {
		var a = this.getItems().items,
		f = this.innerItems,
		g = f.indexOf(d),
		c = -1,
		e;
		if (g !== -1) {
			f.splice(g, 1)
		}
		if (typeof b == "number") {
			do {
				e = a[++b]
			} while (e && !e.isInnerItem());
			if (e) {
				c = f.indexOf(e);
				f.splice(c, 0, d)
			}
		}
		if (c === -1) {
			f.push(d);
			c = f.length - 1
		}
		if (g !== -1) {
			this.onInnerItemMove(d, c, g)
		}
		return this
	},
	onInnerItemMove : Ext.emptyFn,
	removeInner : function (a) {
		Ext.Array.remove(this.innerItems, a);
		return this
	},
	insert : function (a, d) {
		var c = this,
		b;
		if (Ext.isArray(d)) {
			for (b = d.length - 1; b >= 0; b--) {
				c.insert(a, d[b])
			}
			return c
		}
		d = this.factoryItem(d);
		this.doInsert(a, d);
		return d
	},
	doInsert : function (d, f) {
		var e = this,
		b = e.items,
		c = b.length,
		a,
		g;
		g = f.isInnerItem();
		if (d > c) {
			d = c
		}
		if (b[d - 1] === f) {
			return e
		}
		a = e.indexOf(f);
		if (a !== -1) {
			if (a < d) {
				d -= 1
			}
			b.removeAt(a)
		} else {
			f.setParent(e)
		}
		b.insert(d, f);
		if (g) {
			e.insertInner(f, d)
		}
		if (a !== -1) {
			e.onItemMove(f, d, a)
		} else {
			e.onItemAdd(f, d)
		}
	},
	insertFirst : function (a) {
		return this.insert(0, a)
	},
	insertLast : function (a) {
		return this.insert(this.getItems().length, a)
	},
	insertBefore : function (c, a) {
		var b = this.indexOf(a);
		if (b !== -1) {
			this.insert(b, c)
		}
		return this
	},
	insertAfter : function (c, a) {
		var b = this.indexOf(a);
		if (b !== -1) {
			this.insert(b + 1, c)
		}
		return this
	},
	onItemAdd : function (b, a) {
		this.doItemLayoutAdd(b, a);
		if (this.initialized) {
			this.fireEvent("add", this, b, a)
		}
	},
	doItemLayoutAdd : function (c, a) {
		var b = this.getLayout();
		if (this.isRendered() && c.setRendered(true)) {
			c.fireAction("renderedchange", [this, c, true], "onItemAdd", b, {
				args : [c, a]
			})
		} else {
			b.onItemAdd(c, a)
		}
	},
	onItemRemove : function (b, a) {
		this.doItemLayoutRemove(b, a);
		this.fireEvent("remove", this, b, a)
	},
	doItemLayoutRemove : function (c, a) {
		var b = this.getLayout();
		if (this.isRendered() && c.setRendered(false)) {
			c.fireAction("renderedchange", [this, c, false], "onItemRemove", b, {
				args : [c, a, undefined]
			})
		} else {
			b.onItemRemove(c, a)
		}
	},
	onItemMove : function (b, c, a) {
		if (b.isDocked()) {
			b.setDocked(null)
		}
		this.doItemLayoutMove(b, c, a);
		this.fireEvent("move", this, b, c, a)
	},
	doItemLayoutMove : function (b, c, a) {
		this.getLayout().onItemMove(b, c, a)
	},
	onItemCenteredChange : function (b, a) {
		if (!b.isFloating() && !b.isDocked()) {
			if (a) {
				this.removeInner(b)
			} else {
				this.insertInner(b, this.indexOf(b))
			}
		}
		this.getLayout().onItemCenteredChange(b, a)
	},
	onItemFloatingChange : function (a, b) {
		if (!a.isCentered() && !a.isDocked()) {
			if (b) {
				this.removeInner(a)
			} else {
				this.insertInner(a, this.indexOf(a))
			}
		}
		this.getLayout().onItemFloatingChange(a, b)
	},
	onItemDockedChange : function (a, c, b) {
		if (!a.isCentered() && !a.isFloating()) {
			if (c) {
				this.removeInner(a)
			} else {
				this.insertInner(a, this.indexOf(a))
			}
		}
		this.getLayout().onItemDockedChange(a, c, b)
	},
	getInnerItems : function () {
		return this.innerItems
	},
	getDockedItems : function () {
		var a = this.getItems().items,
		c = [],
		e = a.length,
		d,
		b;
		for (b = 0; b < e; b++) {
			d = a[b];
			if (d.isDocked()) {
				c.push(d)
			}
		}
		return c
	},
	applyActiveItem : function (c, a) {
		var b = this.getInnerItems();
		this.getItems();
		if (!c && b.length === 0) {
			return 0
		} else {
			if (typeof c == "number") {
				c = Math.max(0, Math.min(c, b.length - 1));
				c = b[c];
				if (c) {
					return c
				} else {
					if (a) {
						return null
					}
				}
			} else {
				if (c) {
					if (!c.isComponent) {
						c = this.factoryItem(c)
					}
					if (!this.has(c)) {
						this.add(c)
					}
					return c
				}
			}
		}
	},
	animateActiveItem : function (d, c) {
		var b = this.getLayout(),
		a;
		if (this.activeItemAnimation) {
			this.activeItemAnimation.destroy()
		}
		this.activeItemAnimation = c = new Ext.fx.layout.Card(c);
		if (c && b.isCard) {
			c.setLayout(b);
			a = b.getAnimation();
			if (a) {
				a.disable();
				c.on("animationend", function () {
					a.enable();
					c.destroy()
				}, this)
			}
		}
		return this.setActiveItem(d)
	},
	doSetActiveItem : function (b, a) {
		if (a) {
			a.fireEvent("deactivate", a, this, b)
		}
		if (b) {
			b.fireEvent("activate", b, this, a)
		}
	},
	setRendered : function (d) {
		if (this.callParent(arguments)) {
			var a = this.items.items,
			b,
			c;
			for (b = 0, c = a.length; b < c; b++) {
				a[b].setRendered(d)
			}
			return true
		}
		return false
	},
	getScrollableBehavior : function () {
		var a = this.scrollableBehavior;
		if (!a) {
			a = this.scrollableBehavior = new Ext.behavior.Scrollable(this)
		}
		return a
	},
	applyScrollable : function (a) {
		this.getScrollableBehavior().setConfig(a)
	},
	getScrollable : function () {
		return this.getScrollableBehavior().getScrollView()
	},
	getRefItems : function (a) {
		var b = this.getItems().items.slice(),
		e = b.length,
		c,
		d;
		if (a) {
			for (c = 0; c < e; c++) {
				d = b[c];
				if (d.getRefItems) {
					b = b.concat(d.getRefItems(true))
				}
			}
		}
		return b
	},
	getComponent : function (a) {
		if (Ext.isObject(a)) {
			a = a.getItemId()
		}
		return this.getItems().get(a)
	},
	getDockedComponent : function (a) {
		if (Ext.isObject(a)) {
			a = a.getItemId()
		}
		var c = this.getDockedItems(),
		e = c.length,
		d,
		b;
		if (Ext.isNumber(a)) {
			return c[a]
		}
		for (b = 0; b < e; b++) {
			d = c[b];
			if (d.id == a) {
				return d
			}
		}
		return false
	},
	query : function (a) {
		return Ext.ComponentQuery.query(a, this)
	},
	child : function (a) {
		return this.query("> " + a)[0] || null
	},
	down : function (a) {
		return this.query(a)[0] || null
	},
	destroy : function () {
		var a = this.getModal();
		if (a) {
			a.destroy()
		}
		this.removeAll(true, true);
		Ext.destroy(this.getScrollable(), this.bodyElement);
		this.callParent()
	}
}, function () {
	this.addMember("defaultItemClass", this)
});
Ext.define("Ext.viewport.Default", {
	extend : "Ext.Container",
	xtype : "viewport",
	PORTRAIT : "portrait",
	LANDSCAPE : "landscape",
	requires : ["Ext.LoadMask"],
	config : {
		autoMaximize : false,
		autoBlurInput : true,
		preventPanning : true,
		preventZooming : false,
		autoRender : true,
		layout : "card",
		width : "100%",
		height : "100%"
	},
	isReady : false,
	isViewport : true,
	isMaximizing : false,
	id : "ext-viewport",
	isInputRegex : /^(input|textarea|select|a)$/i,
	focusedElement : null,
	fullscreenItemCls : Ext.baseCSSPrefix + "fullscreen",
	constructor : function (a) {
		var b = Ext.Function.bind;
		this.doPreventPanning = b(this.doPreventPanning, this);
		this.doPreventZooming = b(this.doPreventZooming, this);
		this.doBlurInput = b(this.doBlurInput, this);
		this.maximizeOnEvents = ["ready", "orientationchange"];
		this.orientation = this.determineOrientation();
		this.windowWidth = this.getWindowWidth();
		this.windowHeight = this.getWindowHeight();
		this.windowOuterHeight = this.getWindowOuterHeight();
		if (!this.stretchHeights) {
			this.stretchHeights = {}
			
		}
		this.callParent([a]);
		if (this.supportsOrientation()) {
			this.addWindowListener("orientationchange", b(this.onOrientationChange, this))
		} else {
			this.addWindowListener("resize", b(this.onResize, this))
		}
		document.addEventListener("focus", b(this.onElementFocus, this), true);
		document.addEventListener("blur", b(this.onElementBlur, this), true);
		Ext.onDocumentReady(this.onDomReady, this);
		this.on("ready", this.onReady, this, {
			single : true
		});
		this.getEventDispatcher().addListener("component", "*", "fullscreen", "onItemFullscreenChange", this);
		return this
	},
	onDomReady : function () {
		this.isReady = true;
		this.updateSize();
		this.fireEvent("ready", this)
	},
	onReady : function () {
		if (this.getAutoRender()) {
			this.render()
		}
	},
	onElementFocus : function (a) {
		this.focusedElement = a.target
	},
	onElementBlur : function () {
		this.focusedElement = null
	},
	render : function () {
		if (!this.rendered) {
			var a = Ext.getBody(),
			b = Ext.baseCSSPrefix,
			h = [],
			d = Ext.os,
			g = d.name.toLowerCase(),
			f = Ext.browser.name.toLowerCase(),
			e = d.version.getMajor(),
			c = this.getOrientation();
			this.renderTo(a);
			h.push(b + d.deviceType.toLowerCase());
			if (d.is.iPad) {
				h.push(b + "ipad")
			}
			h.push(b + g);
			h.push(b + f);
			if (e) {
				h.push(b + g + "-" + e)
			}
			if (d.is.BlackBerry) {
				h.push(b + "bb")
			}
			if (Ext.browser.is.Standalone) {
				h.push(b + "standalone")
			}
			h.push(b + c);
			a.addCls(h)
		}
	},
	applyAutoBlurInput : function (a) {
		var b = (Ext.feature.has.Touch) ? "touchstart" : "mousedown";
		if (a) {
			this.addWindowListener(b, this.doBlurInput, false)
		} else {
			this.removeWindowListener(b, this.doBlurInput, false)
		}
		return a
	},
	applyAutoMaximize : function (a) {
		if (Ext.browser.is.WebView) {
			a = false
		}
		if (a) {
			this.on("ready", "doAutoMaximizeOnReady", this, {
				single : true
			});
			this.on("orientationchange", "doAutoMaximizeOnOrientationChange", this)
		} else {
			this.un("ready", "doAutoMaximizeOnReady", this);
			this.un("orientationchange", "doAutoMaximizeOnOrientationChange", this)
		}
		return a
	},
	applyPreventPanning : function (a) {
		if (a) {
			this.addWindowListener("touchmove", this.doPreventPanning, false)
		} else {
			this.removeWindowListener("touchmove", this.doPreventPanning, false)
		}
		return a
	},
	applyPreventZooming : function (a) {
		var b = (Ext.feature.has.Touch) ? "touchstart" : "mousedown";
		if (a) {
			this.addWindowListener(b, this.doPreventZooming, false)
		} else {
			this.removeWindowListener(b, this.doPreventZooming, false)
		}
		return a
	},
	doAutoMaximizeOnReady : function () {
		var a = arguments[arguments.length - 1];
		a.pause();
		this.isMaximizing = true;
		this.on("maximize", function () {
			this.isMaximizing = false;
			this.updateSize();
			a.resume();
			this.fireEvent("ready", this)
		}, this, {
			single : true
		});
		this.maximize()
	},
	doAutoMaximizeOnOrientationChange : function () {
		var a = arguments[arguments.length - 1],
		b = a.firingArguments;
		a.pause();
		this.isMaximizing = true;
		this.on("maximize", function () {
			this.isMaximizing = false;
			this.updateSize();
			b[1] = this.windowWidth;
			b[2] = this.windowHeight;
			a.resume()
		}, this, {
			single : true
		});
		this.maximize()
	},
	doBlurInput : function (b) {
		var a = b.target,
		c = this.focusedElement;
		if (c && !this.isInputRegex.test(a.tagName)) {
			delete this.focusedElement;
			c.blur()
		}
	},
	doPreventPanning : function (a) {
		a.preventDefault()
	},
	doPreventZooming : function (b) {
		if ("button" in b && b.button !== 0) {
			return
		}
		var a = b.target;
		if (a && a.nodeType === 1 && !this.isInputRegex.test(a.tagName)) {
			b.preventDefault()
		}
	},
	addWindowListener : function (b, c, a) {
		window.addEventListener(b, c, Boolean(a))
	},
	removeWindowListener : function (b, c, a) {
		window.removeEventListener(b, c, Boolean(a))
	},
	doAddListener : function (a, d, c, b) {
		if (a === "ready" && this.isReady && !this.isMaximizing) {
			d.call(c);
			return this
		}
		this.mixins.observable.doAddListener.apply(this, arguments)
	},
	supportsOrientation : function () {
		return Ext.feature.has.Orientation
	},
	onResize : function () {
		var c = this.windowWidth,
		f = this.windowHeight,
		e = this.getWindowWidth(),
		a = this.getWindowHeight(),
		d = this.getOrientation(),
		b = this.determineOrientation();
		if ((c !== e || f !== a) && d !== b) {
			this.fireOrientationChangeEvent(b, d)
		}
	},
	onOrientationChange : function () {
		var b = this.getOrientation(),
		a = this.determineOrientation();
		if (a !== b) {
			this.fireOrientationChangeEvent(a, b)
		}
	},
	fireOrientationChangeEvent : function (b, c) {
		var a = Ext.baseCSSPrefix;
		Ext.getBody().replaceCls(a + c, a + b);
		this.orientation = b;
		this.updateSize();
		this.fireEvent("orientationchange", this, b, this.windowWidth, this.windowHeight)
	},
	updateSize : function (b, a) {
		this.windowWidth = b !== undefined ? b : this.getWindowWidth();
		this.windowHeight = a !== undefined ? a : this.getWindowHeight();
		return this
	},
	waitUntil : function (h, e, g, a, f) {
		if (!a) {
			a = 50
		}
		if (!f) {
			f = 2000
		}
		var c = this,
		b = 0;
		setTimeout(function d() {
			b += a;
			if (h.call(c) === true) {
				if (e) {
					e.call(c)
				}
			} else {
				if (b >= f) {
					if (g) {
						g.call(c)
					}
				} else {
					setTimeout(d, a)
				}
			}
		}, a)
	},
	maximize : function () {
		this.fireMaximizeEvent()
	},
	fireMaximizeEvent : function () {
		this.updateSize();
		this.fireEvent("maximize", this)
	},
	doSetHeight : function (a) {
		Ext.getBody().setHeight(a);
		this.callParent(arguments)
	},
	doSetWidth : function (a) {
		Ext.getBody().setWidth(a);
		this.callParent(arguments)
	},
	scrollToTop : function () {
		window.scrollTo(0, -1)
	},
	getWindowWidth : function () {
		return window.innerWidth
	},
	getWindowHeight : function () {
		return window.innerHeight
	},
	getWindowOuterHeight : function () {
		return window.outerHeight
	},
	getWindowOrientation : function () {
		return window.orientation
	},
	getOrientation : function () {
		return this.orientation
	},
	getSize : function () {
		return {
			width : this.windowWidth,
			height : this.windowHeight
		}
	},
	determineOrientation : function () {
		var b = this.PORTRAIT,
		a = this.LANDSCAPE;
		if (this.supportsOrientation()) {
			if (this.getWindowOrientation() % 180 === 0) {
				return b
			}
			return a
		} else {
			if (this.getWindowHeight() >= this.getWindowWidth()) {
				return b
			}
			return a
		}
	},
	onItemFullscreenChange : function (a) {
		a.addCls(this.fullscreenItemCls);
		this.add(a)
	}
});
Ext.define("Ext.viewport.Ios", {
	extend : "Ext.viewport.Default",
	isFullscreen : function () {
		return this.isHomeScreen()
	},
	isHomeScreen : function () {
		return window.navigator.standalone === true
	},
	constructor : function () {
		this.callParent(arguments);
		if (this.getAutoMaximize() && !this.isFullscreen()) {
			this.addWindowListener("touchstart", Ext.Function.bind(this.onTouchStart, this))
		}
	},
	maximize : function () {
		if (this.isFullscreen()) {
			return this.callParent()
		}
		var c = this.stretchHeights,
		b = this.orientation,
		d = this.getWindowHeight(),
		a = c[b];
		if (window.scrollY > 0) {
			this.scrollToTop();
			if (!a) {
				c[b] = a = this.getWindowHeight()
			}
			this.setHeight(a);
			this.fireMaximizeEvent()
		} else {
			if (!a) {
				a = this.getScreenHeight()
			}
			this.setHeight(a);
			this.waitUntil(function () {
				this.scrollToTop();
				return d !== this.getWindowHeight()
			}, function () {
				if (!c[b]) {
					a = c[b] = this.getWindowHeight();
					this.setHeight(a)
				}
				this.fireMaximizeEvent()
			}, function () {
				a = c[b] = this.getWindowHeight();
				this.setHeight(a);
				this.fireMaximizeEvent()
			}, 50, 1000)
		}
	},
	getScreenHeight : function () {
		return window.screen[this.orientation === this.PORTRAIT ? "height" : "width"]
	},
	onElementFocus : function () {
		if (this.getAutoMaximize() && !this.isFullscreen()) {
			clearTimeout(this.scrollToTopTimer)
		}
		this.callParent(arguments)
	},
	onElementBlur : function () {
		if (this.getAutoMaximize() && !this.isFullscreen()) {
			this.scrollToTopTimer = setTimeout(this.scrollToTop, 500)
		}
		this.callParent(arguments)
	},
	onTouchStart : function () {
		if (this.focusedElement === null) {
			this.scrollToTop()
		}
	},
	scrollToTop : function () {
		window.scrollTo(0, 0)
	}
}, function () {
	if (!Ext.os.is.iOS) {
		return
	}
	if (Ext.os.version.lt("3.2")) {
		this.override({
			constructor : function () {
				var a = this.stretchHeights = {};
				a[this.PORTRAIT] = 416;
				a[this.LANDSCAPE] = 268;
				return this.callOverridden(arguments)
			}
		})
	}
	if (Ext.os.version.lt("5")) {
		this.override({
			fieldMaskClsTest : "-field-mask",
			doPreventZooming : function (b) {
				var a = b.target;
				if (a && a.nodeType === 1 && !this.isInputRegex.test(a.tagName) && a.className.indexOf(this.fieldMaskClsTest) == -1) {
					b.preventDefault()
				}
			}
		})
	}
	if (Ext.os.is.iPad) {
		this.override({
			isFullscreen : function () {
				return true
			}
		})
	}
});
Ext.define("Ext.viewport.Android", {
	extend : "Ext.viewport.Default",
	constructor : function () {
		this.on("orientationchange", "doFireOrientationChangeEvent", this, {
			prepend : true
		});
		this.on("orientationchange", "hideKeyboardIfNeeded", this, {
			prepend : true
		});
		return this.callParent(arguments)
	},
	getDummyInput : function () {
		var a = this.dummyInput,
		c = this.focusedElement,
		b = Ext.fly(c).getPageBox();
		if (!a) {
			this.dummyInput = a = document.createElement("input");
			a.style.position = "absolute";
			a.style.opacity = "0";
			document.body.appendChild(a)
		}
		a.style.left = b.left + "px";
		a.style.top = b.top + "px";
		a.style.display = "";
		return a
	},
	doBlurInput : function (c) {
		var b = c.target,
		d = this.focusedElement,
		a;
		if (d && !this.isInputRegex.test(b.tagName)) {
			a = this.getDummyInput();
			delete this.focusedElement;
			a.focus();
			setTimeout(function () {
				a.style.display = "none"
			}, 100)
		}
	},
	hideKeyboardIfNeeded : function () {
		var a = arguments[arguments.length - 1],
		b = this.focusedElement;
		if (b) {
			delete this.focusedElement;
			a.pause();
			if (Ext.os.version.lt("4")) {
				b.style.display = "none"
			} else {
				b.blur()
			}
			setTimeout(function () {
				b.style.display = "";
				a.resume()
			}, 1000)
		}
	},
	doFireOrientationChangeEvent : function () {
		var a = arguments[arguments.length - 1];
		this.orientationChanging = true;
		a.pause();
		this.waitUntil(function () {
			return this.getWindowOuterHeight() !== this.windowOuterHeight
		}, function () {
			this.windowOuterHeight = this.getWindowOuterHeight();
			this.updateSize();
			a.firingArguments[1] = this.windowWidth;
			a.firingArguments[2] = this.windowHeight;
			a.resume();
			this.orientationChanging = false
		}, function () {});
		return this
	},
	applyAutoMaximize : function (a) {
		a = this.callParent(arguments);
		this.on("add", "fixSize", this, {
			single : true
		});
		if (!a) {
			this.on("ready", "fixSize", this, {
				single : true
			});
			this.onAfter("orientationchange", "doFixSize", this)
		} else {
			this.un("ready", "fixSize", this);
			this.unAfter("orientationchange", "doFixSize", this)
		}
	},
	fixSize : function () {
		this.doFixSize()
	},
	doFixSize : function () {
		this.setHeight(this.getWindowHeight())
	},
	getActualWindowOuterHeight : function () {
		return Math.round(this.getWindowOuterHeight() / window.devicePixelRatio)
	},
	maximize : function () {
		var c = this.stretchHeights,
		b = this.orientation,
		a;
		a = c[b];
		if (!a) {
			c[b] = a = this.getActualWindowOuterHeight()
		}
		if (!this.addressBarHeight) {
			this.addressBarHeight = a - this.getWindowHeight()
		}
		this.setHeight(a);
		var d = Ext.Function.bind(this.isHeightMaximized, this, [a]);
		this.scrollToTop();
		this.waitUntil(d, this.fireMaximizeEvent, this.fireMaximizeEvent)
	},
	isHeightMaximized : function (a) {
		this.scrollToTop();
		return this.getWindowHeight() === a
	}
}, function () {
	if (!Ext.os.is.Android) {
		return
	}
	var a = Ext.os.version,
	b = Ext.browser.userAgent,
	c = /(htc|desire|incredible|ADR6300)/i.test(b) && a.lt("2.3");
	if (c) {
		this.override({
			constructor : function (d) {
				if (!d) {
					d = {}
					
				}
				d.autoMaximize = false;
				this.watchDogTick = Ext.Function.bind(this.watchDogTick, this);
				setInterval(this.watchDogTick, 1000);
				return this.callParent([d])
			},
			watchDogTick : function () {
				this.watchDogLastTick = Ext.Date.now()
			},
			doPreventPanning : function () {
				var e = Ext.Date.now(),
				f = this.watchDogLastTick,
				d = e - f;
				if (d >= 2000) {
					return
				}
				return this.callParent(arguments)
			},
			doPreventZooming : function () {
				var e = Ext.Date.now(),
				f = this.watchDogLastTick,
				d = e - f;
				if (d >= 2000) {
					return
				}
				return this.callParent(arguments)
			}
		})
	}
	if (a.match("2")) {
		this.override({
			onReady : function () {
				this.addWindowListener("resize", Ext.Function.bind(this.onWindowResize, this));
				this.callParent(arguments)
			},
			scrollToTop : function () {
				document.body.scrollTop = 100
			},
			onWindowResize : function () {
				var e = this.windowWidth,
				g = this.windowHeight,
				f = this.getWindowWidth(),
				d = this.getWindowHeight();
				if (this.getAutoMaximize() && !this.isMaximizing && !this.orientationChanging && window.scrollY === 0 && e === f && d < g && ((d >= g - this.addressBarHeight) || !this.focusedElement)) {
					this.scrollToTop()
				}
			},
			fixSize : function () {
				var d = this.getOrientation(),
				f = window.outerHeight,
				g = window.outerWidth,
				e;
				if (d === "landscape" && (f < g) || d === "portrait" && (f >= g)) {
					e = this.getActualWindowOuterHeight()
				} else {
					e = this.getWindowHeight()
				}
				this.waitUntil(function () {
					return e > this.getWindowHeight()
				}, this.doFixSize, this.doFixSize, 50, 1000)
			}
		})
	} else {
		if (a.gtEq("3.1")) {
			this.override({
				isHeightMaximized : function (d) {
					this.scrollToTop();
					return this.getWindowHeight() === d - 1
				}
			})
		} else {
			if (a.match("3")) {
				this.override({
					isHeightMaximized : function () {
						this.scrollToTop();
						return true
					}
				})
			}
		}
	}
	if (a.gtEq("4")) {
		this.override({
			doBlurInput : Ext.emptyFn
		})
	}
});
Ext.define("Ext.viewport.Viewport", {
	requires : ["Ext.viewport.Ios", "Ext.viewport.Android"],
	constructor : function (b) {
		var c = Ext.os.name,
		d,
		a;
		switch (c) {
		case "Android":
			d = "Android";
			break;
		case "iOS":
			d = "Ios";
			break;
		default:
			d = "Default"
		}
		a = Ext.create("Ext.viewport." + d, b);
		return a
	}
});
Ext.define("Ext.app.Controller", {
	mixins : {
		observable : "Ext.mixin.Observable"
	},
	config : {
		refs : {},
		routes : {},
		control : {},
		before : {},
		application : {},
		stores : [],
		models : [],
		views : []
	},
	constructor : function (a) {
		this.initConfig(a);
		this.mixins.observable.constructor.call(this, a)
	},
	init : Ext.emptyFn,
	launch : Ext.emptyFn,
	redirectTo : function (a) {
		return this.getApplication().redirectTo(a)
	},
	execute : function (b, a) {
		b.setBeforeFilters(this.getBefore()[b.getAction()]);
		b.execute()
	},
	applyBefore : function (e) {
		var d,
		a,
		c,
		b;
		for (a in e) {
			d = Ext.Array.from(e[a]);
			c = d.length;
			for (b = 0; b < c; b++) {
				d[b] = this[d[b]]
			}
			e[a] = d
		}
		return e
	},
	applyControl : function (a) {
		this.control(a, this);
		return a
	},
	applyRefs : function (a) {
		this.ref(a);
		return a
	},
	applyRoutes : function (a) {
		var f = this instanceof Ext.app.Application ? this : this.getApplication(),
		c = f.getRouter(),
		b,
		e,
		d;
		for (e in a) {
			b = a[e];
			d = {
				controller : this.$className
			};
			if (Ext.isString(b)) {
				d.action = b
			} else {
				Ext.apply(d, b)
			}
			c.connect(e, d)
		}
		return a
	},
	applyStores : function (a) {
		return this.getFullyQualified(a, "store")
	},
	applyModels : function (a) {
		return this.getFullyQualified(a, "model")
	},
	applyViews : function (a) {
		return this.getFullyQualified(a, "view")
	},
	getFullyQualified : function (b, e) {
		var f = b.length,
		a = this.getApplication().getName(),
		c,
		d;
		for (d = 0; d < f; d++) {
			c = b[d];
			if (Ext.isString(c) && (Ext.Loader.getPrefix(c) === "" || c === a)) {
				b[d] = a + "." + e + "." + c
			}
		}
		return b
	},
	control : function (a) {
		this.getApplication().control(a, this)
	},
	ref : function (b) {
		var e,
		c,
		a,
		d;
		for (e in b) {
			a = b[e];
			c = "get" + Ext.String.capitalize(e);
			if (!this[c]) {
				if (Ext.isString(b[e])) {
					d = {
						ref : e,
						selector : a
					}
				} else {
					d = b[e]
				}
				this[c] = Ext.Function.pass(this.getRef, [e, d], this)
			}
			this.references = this.references || [];
			this.references.push(e.toLowerCase())
		}
	},
	getRef : function (d, e, a) {
		this.refCache = this.refCache || {};
		e = e || {};
		a = a || {};
		Ext.apply(e, a);
		if (e.forceCreate) {
			return Ext.ComponentManager.create(e, "component")
		}
		var c = this,
		b = c.refCache[d];
		if (!b) {
			c.refCache[d] = b = Ext.ComponentQuery.query(e.selector)[0];
			if (!b && e.autoCreate) {
				c.refCache[d] = b = Ext.ComponentManager.create(e, "component")
			}
			if (b) {
				b.on("destroy", function () {
					c.refCache[d] = null
				})
			}
		}
		return b
	},
	hasRef : function (a) {
		return this.references && this.references.indexOf(a.toLowerCase()) !== -1
	},
}, function () {});
Ext.define("Ext.app.History", {
	mixins : ["Ext.mixin.Observable"],
	config : {
		actions : [],
		updateUrl : true,
		token : ""
	},
	constructor : function (a) {
		if (Ext.feature.has.History) {
			window.addEventListener("hashchange", Ext.bind(this.detectStateChange, this))
		} else {
			setInterval(Ext.bind(this.detectStateChange, this), 50)
		}
		this.initConfig(a)
	},
	add : function (c, a) {
		this.getActions().push(Ext.factory(c, Ext.app.Action));
		var b = c.getUrl();
		if (this.getUpdateUrl()) {
			this.setToken(b);
			window.location.hash = b
		}
		if (a !== true) {
			this.fireEvent("change", b)
		}
		this.setToken(b)
	},
	back : function () {
		this.getActions().pop().run()
	},
	applyToken : function (a) {
		return a[0] == "#" ? a.substr(1) : a
	},
	detectStateChange : function () {
		var b = this.applyToken(window.location.hash),
		a = this.getToken();
		if (b != a) {
			this.onStateChange();
			this.setToken(b)
		}
	},
	onStateChange : function () {
		this.fireEvent("change", window.location.hash.substr(1))
	}
});
Ext.define("Ext.app.Profile", {
	mixins : {
		observable : "Ext.mixin.Observable"
	},
	config : {
		namespace : "auto",
		name : "auto",
		controllers : [],
		models : [],
		views : [],
		stores : [],
		application : null
	},
	constructor : function (a) {
		this.initConfig(a);
		this.mixins.observable.constructor.apply(this, arguments)
	},
	isActive : function () {
		return false
	},
	launch : Ext.emptyFn,
	applyNamespace : function (a) {
		if (a == "auto") {
			a = this.getName()
		}
		return a.toLowerCase()
	},
	applyName : function (a) {
		if (a == "auto") {
			var b = this.$className.split(".");
			a = b[b.length - 1]
		}
		return a
	},
	getDependencies : function () {
		var c = [],
		g = Ext.String.format,
		b = this.getApplication().getName(),
		d = this.getNamespace(),
		f = {
			model : this.getModels(),
			view : this.getViews(),
			controller : this.getControllers(),
			store : this.getStores()
		},
		e,
		h,
		a;
		for (e in f) {
			h = [];
			Ext.each(f[e], function (i) {
				if (Ext.isString(i)) {
					if (Ext.isString(i) && (Ext.Loader.getPrefix(i) === "" || i === b)) {
						i = b + "." + e + "." + d + "." + i
					}
					h.push(i);
					c.push(i)
				}
			}, this);
			f[e] = h
		}
		f.all = c;
		return f
	}
});
Ext.define("Ext.app.Action", {
	config : {
		scope : null,
		application : null,
		controller : null,
		action : null,
		args : [],
		url : undefined,
		data : {},
		title : null,
		beforeFilters : [],
		currentFilterIndex : -1
	},
	constructor : function (a) {
		this.initConfig(a);
		this.getUrl()
	},
	execute : function () {
		this.resume()
	},
	resume : function () {
		var b = this.getCurrentFilterIndex() + 1,
		c = this.getBeforeFilters(),
		a = this.getController(),
		d = c[b];
		if (d) {
			this.setCurrentFilterIndex(b);
			d.call(a, this)
		} else {
			a[this.getAction()].apply(a, this.getArgs())
		}
	},
	applyUrl : function (a) {
		if (a === null || a === undefined) {
			a = this.urlEncode()
		}
		return a
	},
	applyController : function (a) {
		var c = this.getApplication(),
		b = c.getCurrentProfile();
		if (Ext.isString(a)) {
			a = c.getController(a, b ? b.getNamespace() : null)
		}
		return a
	},
	urlEncode : function () {
		var a = this.getController(),
		b;
		if (a instanceof Ext.app.Controller) {
			b = a.$className.split(".");
			a = b[b.length - 1]
		}
		return a + "/" + this.getAction()
	}
});
Ext.define("Ext.app.Route", {
	config : {
		conditions : {},
		url : null,
		controller : null,
		action : null,
		initialized : false
	},
	constructor : function (a) {
		this.initConfig(a)
	},
	recognize : function (b) {
		if (!this.getInitialized()) {
			this.initialize()
		}
		if (this.recognizes(b)) {
			var c = this.matchesFor(b),
			a = b.match(this.matcherRegex);
			a.shift();
			return Ext.applyIf(c, {
				controller : this.getController(),
				action : this.getAction(),
				historyUrl : b,
				args : a
			})
		}
	},
	initialize : function () {
		this.paramMatchingRegex = new RegExp(/:([0-9A-Za-z\_]*)/g);
		this.paramsInMatchString = this.getUrl().match(this.paramMatchingRegex) || [];
		this.matcherRegex = this.createMatcherRegex(this.getUrl());
		this.setInitialized(true)
	},
	recognizes : function (a) {
		return this.matcherRegex.test(a)
	},
	matchesFor : function (b) {
		var f = {},
		e = this.paramsInMatchString,
		a = b.match(this.matcherRegex),
		d = e.length,
		c;
		a.shift();
		for (c = 0; c < d; c++) {
			f[e[c].replace(":", "")] = a[c]
		}
		return f
	},
	argsFor : function (c) {
		var b = [],
		f = this.paramsInMatchString,
		a = c.match(this.matcherRegex),
		e = f.length,
		d;
		a.shift();
		for (d = 0; d < e; d++) {
			b.push(f[d].replace(":", ""));
			params[f[d].replace(":", "")] = a[d]
		}
		return params
	},
	urlFor : function (b) {
		var a = this.getUrl();
		for (var c in b) {
			a = a.replace(":" + c, b[c])
		}
		return a
	},
	createMatcherRegex : function (a) {
		var e = this.paramsInMatchString,
		d = e.length,
		b,
		c,
		f;
		for (b = 0; b < d; b++) {
			c = this.getConditions()[e[b]];
			f = Ext.util.Format.format("({0})", c || "[%a-zA-Z0-9-\\_\\s,]+");
			a = a.replace(new RegExp(e[b]), f)
		}
		return new RegExp("^" + a + "$")
	}
});
Ext.define("Ext.app.Router", {
	requires : ["Ext.app.Route"],
	config : {
		routes : [],
		defaults : {
			action : "index"
		}
	},
	constructor : function (a) {
		this.initConfig(a)
	},
	connect : function (b, c) {
		c = Ext.apply({
				url : b
			}, c || {}, this.getDefaults());
		var a = Ext.create("Ext.app.Route", c);
		this.getRoutes().push(a);
		return a
	},
	recognize : function (c) {
		var b = this.getRoutes(),
		e = b.length,
		d,
		a;
		for (d = 0; d < e; d++) {
			a = b[d].recognize(c);
			if (a !== undefined) {
				return a
			}
		}
		return undefined
	},
	draw : function (a) {
		a.call(this, this)
	},
	clear : function () {
		this.setRoutes([])
	}
}, function () {});
Ext.define("Ext.app.Application", {
	extend : "Ext.app.Controller",
	requires : ["Ext.app.History", "Ext.app.Profile", "Ext.app.Router", "Ext.app.Action"],
	config : {
		profiles : [],
		controllers : [],
		history : {},
		name : null,
		appFolder : "app",
		router : {},
		controllerInstances : [],
		profileInstances : [],
		currentProfile : null,
		launch : Ext.emptyFn,
		enableLoader : true,
		requires : []
	},
	constructor : function (a) {
		a = a || {};
		Ext.applyIf(a, {
			application : this
		});
		this.initConfig(a);
		for (var b in a) {
			this[b] = a[b]
		}
		Ext.require(this.getRequires(), function () {
			if (this.getEnableLoader() !== false) {
				Ext.require(this.getProfiles(), this.onProfilesLoaded, this)
			}
		}, this)
	},
	dispatch : function (e, d) {
		e = e || {};
		Ext.applyIf(e, {
			application : this
		});
		e = Ext.factory(e, Ext.app.Action);
		if (e) {
			var c = this.getCurrentProfile(),
			b = c ? c.getNamespace() : undefined,
			a = this.getController(e.getController(), b);
			if (a) {
				if (d !== false) {
					this.getHistory().add(e, true)
				}
				a.execute(e)
			}
		}
	},
	redirectTo : function (c) {
		if (Ext.data && Ext.data.Model && c instanceof Ext.data.Model) {
			var a = c;
			c = a.toUrl()
		}
		var b = this.getRouter().recognize(c);
		if (b) {
			b.url = c;
			if (a) {
				b.data = {};
				b.data.record = a
			}
			return this.dispatch(b)
		}
	},
	control : function (h, d) {
		d = d || this;
		var i = this.getEventDispatcher(),
		g = (d) ? d.getRefs() : {},
		c,
		e,
		b,
		f,
		a;
		for (c in h) {
			if (h.hasOwnProperty(c)) {
				f = h[c];
				a = g[c];
				if (a) {
					c = a.selector || a
				}
				for (e in f) {
					b = f[e];
					if (Ext.isString(b)) {
						b = d[b]
					}
					i.addListener("component", c, e, b, d)
				}
			}
		}
	},
	getController : function (b, d) {
		var f = this.getControllerInstances(),
		a = this.getName(),
		e = Ext.String.format,
		c;
		if (b instanceof Ext.app.Controller) {
			return b
		}
		if (f[b]) {
			return f[b]
		} else {
			c = e("{0}.controller.{1}", a, b);
			d = e("{0}.controller.{1}.{2}", a, d, b);
			return f[d] || f[c]
		}
	},
	onProfilesLoaded : function () {
		var b = this.getProfiles(),
		e = b.length,
		g = [],
		d = this.gatherDependencies(),
		f,
		c,
		a;
		for (c = 0; c < e; c++) {
			g[c] = Ext.create(b[c], {
					application : this
				});
			a = g[c].getDependencies();
			d = d.concat(a.all);
			if (g[c].isActive() && !f) {
				f = g[c];
				this.setCurrentProfile(f);
				this.setControllers(this.getControllers().concat(a.controller));
				this.setModels(this.getModels().concat(a.model));
				this.setViews(this.getViews().concat(a.view));
				this.setStores(this.getStores().concat(a.store))
			}
		}
		this.setProfileInstances(g);
		Ext.require(d, this.loadControllerDependencies, this)
	},
	loadControllerDependencies : function () {
		this.instantiateControllers();
		var g = this.getControllerInstances(),
		f = [],
		c = [],
		e,
		b,
		a,
		d;
		for (d in g) {
			b = g[d];
			a = b.getStores();
			c = c.concat(a);
			f = f.concat(b.getModels().concat(b.getViews()).concat(a))
		}
		this.setStores(this.getStores().concat(c));
		Ext.require(f, this.onDependenciesLoaded, this)
	},
	onDependenciesLoaded : function () {
		var c = this,
		b = this.getCurrentProfile(),
		e = this.getLaunch(),
		d,
		a;
		this.instantiateStores();
		d = this.getControllerInstances();
		for (a in d) {
			d[a].init(this)
		}
		if (b) {
			b.launch()
		}
		e.call(c);
		for (a in d) {
			d[a].launch(this)
		}
		c.redirectTo(window.location.hash.substr(1))
	},
	gatherDependencies : function () {
		var a = this.getModels().concat(this.getViews()).concat(this.getControllers());
		Ext.each(this.getStores(), function (b) {
			if (Ext.isString(b)) {
				a.push(b)
			}
		}, this);
		return a
	},
	instantiateStores : function () {
		var b = this.getStores(),
		f = b.length,
		c,
		a,
		d,
		g,
		e;
		for (e = 0; e < f; e++) {
			c = b[e];
			if (Ext.data && Ext.data.Store && !(c instanceof Ext.data.Store)) {
				if (Ext.isString(c)) {
					d = c;
					a = Ext.ClassManager.classes[c];
					c = {
						xclass : c
					};
					if (a.prototype.defaultConfig.storeId === undefined) {
						g = d.split(".");
						c.id = g[g.length - 1]
					}
				}
				b[e] = Ext.factory(c, Ext.data.Store)
			}
		}
		this.setStores(b)
	},
	instantiateControllers : function () {
		var e = this.getControllers(),
		d = {},
		c = e.length,
		a,
		b;
		for (b = 0; b < c; b++) {
			a = e[b];
			d[a] = Ext.create(a, {
					application : this
				})
		}
		return this.setControllerInstances(d)
	},
	applyControllers : function (a) {
		return this.getFullyQualified(a, "controller")
	},
	applyProfiles : function (a) {
		return this.getFullyQualified(a, "profile")
	},
	applyName : function (a) {
		var b;
		if (a && a.match(/ /g)) {
			b = a;
			a = a.replace(/ /g, "")
		}
		return a
	},
	updateName : function (a) {
		Ext.ClassManager.setNamespace(a + ".app", this);
		if (!Ext.Loader.config.paths[a]) {
			Ext.Loader.setPath(a, this.getAppFolder())
		}
	},
	applyRouter : function (a) {
		return Ext.factory(a, Ext.app.Router, this.getRouter())
	},
	applyHistory : function (a) {
		var b = Ext.factory(a, Ext.app.History, this.getHistory());
		b.on("change", this.onHistoryChange, this);
		return b
	},
	onHistoryChange : function (a) {
		this.dispatch(this.getRouter().recognize(a), false)
	}
}, function () {});
Ext.define("Ext.Img", {
	extend : "Ext.Component",
	xtype : ["image", "img"],
	config : {
		src : null,
		baseCls : Ext.baseCSSPrefix + "img",
		mode : "background"
	},
	beforeInitialize : function () {
		var a = this;
		a.onLoad = Ext.Function.bind(a.onLoad, a);
		a.onError = Ext.Function.bind(a.onError, a)
	},
	initialize : function () {
		var a = this;
		a.callParent();
		a.relayEvents(a.renderElement, "*");
		a.element.on({
			tap : "onTap",
			scope : a
		})
	},
	hide : function () {
		this.callParent();
		this.hiddenSrc = this.hiddenSrc || this.getSrc();
		this.setSrc(null)
	},
	show : function () {
		this.callParent();
		if (this.hiddenSrc) {
			this.setSrc(this.hiddenSrc);
			delete this.hiddenSrc
		}
	},
	updateMode : function (a) {
		if (a === "background") {
			if (this.imageElement) {
				this.imageElement.destroy();
				delete this.imageElement;
				this.updateSrc(this.getSrc())
			}
		} else {
			this.imageElement = this.element.createChild({
					tag : "img"
				})
		}
	},
	onTap : function (a) {
		this.fireEvent("tap", this, a)
	},
	onAfterRender : function () {
		this.updateSrc(this.getSrc())
	},
	updateSrc : function (a) {
		var b = this,
		c;
		if (b.getMode() === "background") {
			c = this.imageObject || new Image()
		} else {
			c = b.imageElement.dom
		}
		this.imageObject = c;
		c.setAttribute("src", Ext.isString(a) ? a : "");
		c.addEventListener("load", b.onLoad, false);
		c.addEventListener("error", b.onError, false)
	},
	detachListeners : function () {
		var a = this.imageObject;
		if (a) {
			a.removeEventListener("load", this.onLoad, false);
			a.removeEventListener("error", this.onError, false)
		}
	},
	onLoad : function (a) {
		this.detachListeners();
		if (this.getMode() === "background") {
			this.element.dom.style.backgroundImage = 'url("' + this.imageObject.src + '")'
		}
		this.fireEvent("load", this, a)
	},
	onError : function (a) {
		this.detachListeners();
		this.fireEvent("error", this, a)
	},
	doSetWidth : function (b) {
		var a = (this.getMode() === "background") ? this.element : this.imageElement;
		a.setWidth(b);
		this.callParent(arguments)
	},
	doSetHeight : function (b) {
		var a = (this.getMode() === "background") ? this.element : this.imageElement;
		a.setHeight(b);
		this.callParent(arguments)
	},
	destroy : function () {
		this.detachListeners();
		Ext.destroy(this.imageObject);
		delete this.imageObject;
		this.callParent()
	}
});
Ext.define("Ext.Label", {
	extend : "Ext.Component",
	xtype : "label",
	config : {}
	
});
Ext.define("Ext.Decorator", {
	extend : "Ext.Component",
	isDecorator : true,
	config : {
		component : {}
		
	},
	statics : {
		generateProxySetter : function (a) {
			return function (c) {
				var b = this.getComponent();
				b[a].call(b, c);
				return this
			}
		},
		generateProxyGetter : function (a) {
			return function () {
				var b = this.getComponent();
				return b[a].call(b)
			}
		}
	},
	onClassExtended : function (c, e) {
		if (!e.hasOwnProperty("proxyConfig")) {
			return
		}
		var f = Ext.Class,
		i = e.proxyConfig,
		d = e.config;
		e.config = (d) ? Ext.applyIf(d, i) : i;
		var b,
		h,
		g,
		a;
		for (b in i) {
			if (i.hasOwnProperty(b)) {
				h = f.getConfigNameMap(b);
				g = h.set;
				a = h.get;
				e[g] = this.generateProxySetter(g);
				e[a] = this.generateProxyGetter(a)
			}
		}
	},
	applyComponent : function (a) {
		return Ext.factory(a, Ext.Component)
	},
	updateComponent : function (a, b) {
		if (b) {
			if (this.isRendered() && b.setRendered(false)) {
				b.fireAction("renderedchange", [this, b, false], "doUnsetComponent", this, {
					args : [b]
				})
			} else {
				this.doUnsetComponent(b)
			}
		}
		if (a) {
			if (this.isRendered() && a.setRendered(true)) {
				a.fireAction("renderedchange", [this, a, true], "doSetComponent", this, {
					args : [a]
				})
			} else {
				this.doSetComponent(a)
			}
		}
	},
	doUnsetComponent : function (a) {
		if (a.renderElement.dom) {
			this.innerElement.dom.removeChild(a.renderElement.dom)
		}
	},
	doSetComponent : function (a) {
		if (a.renderElement.dom) {
			this.innerElement.dom.appendChild(a.renderElement.dom)
		}
	},
	setRendered : function (b) {
		var a;
		if (this.callParent(arguments)) {
			a = this.getComponent();
			if (a) {
				a.setRendered(b)
			}
			return true
		}
		return false
	},
	setDisabled : function (a) {
		this.callParent(arguments);
		this.getComponent().setDisabled(a)
	},
	destroy : function () {
		Ext.destroy(this.getComponent());
		this.callParent()
	}
});
Ext.define("Ext.field.Input", {
	extend : "Ext.Component",
	xtype : "input",
	tag : "input",
	cachedConfig : {
		cls : Ext.baseCSSPrefix + "form-field",
		focusCls : Ext.baseCSSPrefix + "field-focus",
		maskCls : Ext.baseCSSPrefix + "field-mask",
		useMask : "auto",
		type : "text",
		checked : false
	},
	config : {
		baseCls : Ext.baseCSSPrefix + "field-input",
		name : null,
		value : null,
		isFocused : false,
		tabIndex : null,
		placeHolder : null,
		minValue : null,
		maxValue : null,
		stepValue : null,
		maxLength : null,
		autoComplete : null,
		autoCapitalize : null,
		autoCorrect : null,
		readOnly : null,
		maxRows : null,
		startValue : false
	},
	getTemplate : function () {
		var a = [{
				reference : "input",
				tag : this.tag
			}, {
				reference : "clearIcon",
				cls : "x-clear-icon"
			}
		];
		a.push({
			reference : "mask",
			classList : [this.config.maskCls]
		});
		return a
	},
	initElement : function () {
		var a = this;
		a.callParent();
		a.input.on({
			scope : a,
			keyup : "onKeyUp",
			focus : "onFocus",
			blur : "onBlur",
			paste : "onPaste"
		});
		a.mask.on({
			tap : "onMaskTap",
			scope : a
		});
		if (a.clearIcon) {
			a.clearIcon.on({
				tap : "onClearIconTap",
				scope : a
			})
		}
	},
	applyUseMask : function (a) {
		if (a === "auto") {
			a = Ext.os.is.iOS && Ext.os.version.lt("5")
		}
		return Boolean(a)
	},
	updateUseMask : function (a) {
		this.mask[a ? "show" : "hide"]()
	},
	updateFieldAttribute : function (b, c) {
		var a = this.input;
		if (c) {
			a.dom.setAttribute(b, c)
		} else {
			a.dom.removeAttribute(b)
		}
	},
	updateCls : function (b, a) {
		this.input.addCls(Ext.baseCSSPrefix + "input-el");
		this.input.replaceCls(a, b)
	},
	updateType : function (a, c) {
		var b = Ext.baseCSSPrefix + "input-";
		this.input.replaceCls(b + c, b + a);
		this.updateFieldAttribute("type", a)
	},
	updateName : function (a) {
		this.updateFieldAttribute("name", a)
	},
	getValue : function () {
		var a = this.input;
		if (a) {
			this._value = a.dom.value
		}
		return this._value
	},
	applyValue : function (a) {
		return (Ext.isEmpty(a)) ? "" : a
	},
	updateValue : function (b) {
		var a = this.input;
		if (a) {
			a.dom.value = b
		}
	},
	setValue : function (b) {
		var a = this._value;
		this.updateValue(this.applyValue(b));
		b = this.getValue();
		if (String(b) != String(a) && this.initialized) {
			this.onChange(this, b, a)
		}
		return this
	},
	updateTabIndex : function (a) {
		this.updateFieldAttribute("tabIndex", a)
	},
	testAutoFn : function (a) {
		return [true, "on"].indexOf(a) !== -1
	},
	updateMaxLength : function (a) {
		this.updateFieldAttribute("maxlength", a)
	},
	updatePlaceHolder : function (a) {
		this.updateFieldAttribute("placeholder", a)
	},
	applyAutoComplete : function (a) {
		return this.testAutoFn(a)
	},
	updateAutoComplete : function (a) {
		var b = a ? "on" : "off";
		this.updateFieldAttribute("autocomplete", b)
	},
	applyAutoCapitalize : function (a) {
		return this.testAutoFn(a)
	},
	updateAutoCapitalize : function (b) {
		var a = b ? "on" : "off";
		this.updateFieldAttribute("autocapitalize", a)
	},
	applyAutoCorrect : function (a) {
		return this.testAutoFn(a)
	},
	updateAutoCorrect : function (a) {
		var b = a ? "on" : "off";
		this.updateFieldAttribute("autocorrect", b)
	},
	updateMinValue : function (a) {
		this.updateFieldAttribute("min", a)
	},
	updateMaxValue : function (a) {
		this.updateFieldAttribute("max", a)
	},
	updateStepValue : function (a) {
		this.updateFieldAttribute("step", a)
	},
	checkedRe : /^(true|1|on)/i,
	getChecked : function () {
		var a = this.input,
		b;
		if (a) {
			b = a.dom.checked;
			this._checked = b
		}
		return b
	},
	applyChecked : function (a) {
		return !!this.checkedRe.test(String(a))
	},
	setChecked : function (a) {
		this.updateChecked(this.applyChecked(a));
		this._checked = a
	},
	updateChecked : function (a) {
		this.input.dom.checked = a
	},
	updateReadOnly : function (a) {
		this.updateFieldAttribute("readonly", a)
	},
	updateMaxRows : function (a) {
		this.updateFieldAttribute("rows", a)
	},
	doSetDisabled : function (a) {
		this.callParent(arguments);
		this.input.dom.disabled = a;
		if (!a) {
			this.blur()
		}
	},
	isDirty : function () {
		if (this.getDisabled()) {
			return false
		}
		return String(this.getValue()) !== String(this.originalValue)
	},
	reset : function () {
		this.setValue(this.originalValue)
	},
	onMaskTap : function (a) {
		this.fireAction("masktap", [this, a], "doMaskTap")
	},
	doMaskTap : function (a, b) {
		if (a.getDisabled()) {
			return false
		}
		a.maskCorrectionTimer = Ext.defer(a.showMask, 1000, a);
		a.hideMask()
	},
	showMask : function (a) {
		if (this.mask) {
			this.mask.setStyle("display", "block")
		}
	},
	hideMask : function (a) {
		if (this.mask) {
			this.mask.setStyle("display", "none")
		}
	},
	focus : function () {
		var b = this,
		a = b.input;
		if (a && a.dom.focus) {
			a.dom.focus()
		}
		return b
	},
	blur : function () {
		var b = this,
		a = this.input;
		if (a && a.dom.blur) {
			a.dom.blur()
		}
		return b
	},
	select : function () {
		var b = this,
		a = b.input;
		if (a && a.dom.setSelectionRange) {
			a.dom.setSelectionRange(0, 9999)
		}
		return b
	},
	onFocus : function (a) {
		this.fireAction("focus", [a], "doFocus")
	},
	doFocus : function (b) {
		var a = this;
		if (a.mask) {
			if (a.maskCorrectionTimer) {
				clearTimeout(a.maskCorrectionTimer)
			}
			a.hideMask()
		}
		if (!a.getIsFocused()) {
			a.setIsFocused(true);
			a.setStartValue(a.getValue())
		}
	},
	onBlur : function (a) {
		this.fireAction("blur", [a], "doBlur")
	},
	doBlur : function (d) {
		var b = this,
		c = b.getValue(),
		a = b.getStartValue();
		b.setIsFocused(false);
		if (String(c) != String(a)) {
			b.onChange(b, c, a)
		}
		b.showMask()
	},
	onClearIconTap : function (a) {
		this.fireEvent("clearicontap", this, a);
		if (Ext.os.is.Android) {
			this.focus()
		}
	},
	onClick : function (a) {
		this.fireEvent("click", a)
	},
	onChange : function (b, c, a) {
		this.fireEvent("change", b, c, a)
	},
	onKeyUp : function (a) {
		this.fireEvent("keyup", a)
	},
	onPaste : function (a) {
		this.fireEvent("paste", a)
	},
	onMouseDown : function (a) {
		this.fireEvent("mousedown", a)
	}
});
Ext.define("Ext.util.LineSegment", {
	requires : ["Ext.util.Point"],
	constructor : function (b, a) {
		var c = Ext.util.Point;
		this.point1 = c.from(b);
		this.point2 = c.from(a)
	},
	intersects : function (l) {
		var o = this.point1,
		m = this.point2,
		i = l.point1,
		f = l.point2,
		c = o.x,
		b = m.x,
		a = i.x,
		q = f.x,
		p = o.y,
		n = m.y,
		k = i.y,
		h = f.y,
		g = (c - b) * (k - h) - (p - n) * (a - q),
		j,
		e;
		if (g == 0) {
			return null
		}
		j = ((a - q) * (c * n - p * b) - (c - b) * (a * h - k * q)) / g;
		e = ((k - h) * (c * n - p * b) - (p - n) * (a * h - k * q)) / g;
		if (j < Math.min(c, b) || j > Math.max(c, b) || j < Math.min(a, q) || j > Math.max(a, q) || e < Math.min(p, n) || e > Math.max(p, n) || e < Math.min(k, h) || e > Math.max(k, h)) {
			return null
		}
		return new Ext.util.Point(j, e)
	},
	toString : function () {
		return this.point1.toString() + " " + this.point2.toString()
	}
});
Ext.define("Ext.data.Operation", {
	config : {
		synchronous : true,
		action : null,
		filters : null,
		sorters : null,
		grouper : null,
		start : null,
		limit : null,
		batch : null,
		callback : null,
		scope : null,
		resultSet : null,
		records : null,
		request : null,
		response : null,
		withCredentials : null,
		params : null,
		url : null,
		page : null,
		node : null,
		model : undefined,
		addRecords : false
	},
	started : false,
	running : false,
	complete : false,
	success : undefined,
	exception : false,
	error : undefined,
	constructor : function (a) {
		this.initConfig(a)
	},
	applyModel : function (a) {
		if (typeof a == "string") {
			a = Ext.data.ModelManager.getModel(a);
			if (!a) {
				Ext.Logger.error("Model with name " + arguments[0] + " doesnt exist.")
			}
		}
		if (a && !a.prototype.isModel && Ext.isObject(a)) {
			a = Ext.data.ModelManager.registerType(a.storeId || a.id || Ext.id(), a)
		}
		return a
	},
	getRecords : function () {
		var a = this.getResultSet();
		return this._records || (a ? a.getRecords() : [])
	},
	setStarted : function () {
		this.started = true;
		this.running = true
	},
	setCompleted : function () {
		this.complete = true;
		this.running = false
	},
	setSuccessful : function () {
		this.success = true
	},
	setException : function (a) {
		this.exception = true;
		this.success = false;
		this.running = false;
		this.error = a
	},
	hasException : function () {
		return this.exception === true
	},
	getError : function () {
		return this.error
	},
	isStarted : function () {
		return this.started === true
	},
	isRunning : function () {
		return this.running === true
	},
	isComplete : function () {
		return this.complete === true
	},
	wasSuccessful : function () {
		return this.isComplete() && this.success === true
	},
	allowWrite : function () {
		return this.getAction() != "read"
	},
	process : function (d, b, c, a) {
		if (b.getSuccess() !== false) {
			this.setResponse(a);
			this.setResultSet(b);
			this.setCompleted();
			this.setSuccessful()
		} else {
			return false
		}
		return this["process" + Ext.String.capitalize(d)].call(this, b, c, a)
	},
	processRead : function (d) {
		var b = d.getRecords(),
		g = [],
		f = this.getModel(),
		e = b.length,
		c,
		a;
		for (c = 0; c < e; c++) {
			a = b[c];
			g.push(new f(a.data, a.id, a.node))
		}
		this.setRecords(g);
		return true
	},
	processCreate : function (e) {
		var c = e.getRecords(),
		b = this.getRecords(),
		f = c.length,
		d,
		a,
		g;
		for (d = 0; d < f; d++) {
			g = c[d];
			if (g.clientId === null && b.length == 1 && c.length == 1) {
				a = b[d]
			} else {
				a = this.findCurrentRecord(g.clientId)
			}
			if (a) {
				this.updateRecord(a, g)
			}
		}
		return true
	},
	processUpdate : function (e) {
		var c = e.getRecords(),
		b = this.getRecords(),
		f = c.length,
		d,
		a,
		g;
		for (d = 0; d < f; d++) {
			g = c[d];
			a = b[d];
			if (a) {
				this.updateRecord(a, g)
			}
		}
		return true
	},
	processDestroy : function (d) {
		var b = d.getRecords(),
		e = b.length,
		c,
		a,
		f;
		for (c = 0; c < e; c++) {
			f = b[c];
			a = this.findCurrentRecord(f.id);
			if (a) {
				a.setIsErased(true);
				a.notifyStores("afterErase", a)
			}
		}
	},
	findCurrentRecord : function (a) {
		var c = this.getRecords(),
		e = c.length,
		d,
		b;
		for (d = 0; d < e; d++) {
			b = c[d];
			if (b.getId() === a) {
				return b
			}
		}
	},
	updateRecord : function (b, d) {
		var a = d.data,
		c = d.id;
		b.beginEdit();
		b.set(a);
		if (c !== null) {
			b.setId(c)
		}
		b.endEdit(true);
		b.commit()
	}
});
Ext.define("Ext.util.Grouper", {
	extend : "Ext.util.Sorter",
	isGrouper : true,
	config : {
		groupFn : null,
		sortProperty : null,
		sorterFn : function (d, c) {
			var e = this.getSortProperty(),
			g,
			b,
			f,
			a;
			g = this.getGroupFn();
			b = g.call(this, d);
			f = g.call(this, c);
			if (e) {
				if (b !== f) {
					return this.defaultSortFn.call(this, d, c)
				} else {
					return 0
				}
			}
			return (b > f) ? 1 : ((b < f) ? -1 : 0)
		}
	},
	defaultSortFn : function (e, c) {
		var g = this,
		f = g._transform,
		b = g._root,
		d,
		a,
		h = g._sortProperty;
		if (b !== null) {
			e = e[b];
			c = c[b]
		}
		d = e[h];
		a = c[h];
		if (f) {
			d = f(d);
			a = f(a)
		}
		return d > a ? 1 : (d < a ? -1 : 0)
	},
	updateProperty : function (a) {
		this.setGroupFn(this.standardGroupFn)
	},
	standardGroupFn : function (b) {
		var a = this.getRoot(),
		d = this.getProperty(),
		c = b;
		if (a) {
			c = b[a]
		}
		return c[d]
	},
	getGroupString : function (a) {
		var b = this.getGroupFn().call(this, a);
		return typeof b != "undefined" ? b.toString() : ""
	}
});
Ext.define("Ext.dataview.IndexBar", {
	extend : "Ext.Component",
	alternateClassName : "Ext.IndexBar",
	config : {
		baseCls : Ext.baseCSSPrefix + "indexbar",
		direction : "vertical",
		letters : ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
		ui : "alphabet",
		listPrefix : null
	},
	itemCls : Ext.baseCSSPrefix + "",
	updateDirection : function (a, c) {
		var b = this.getBaseCls();
		this.element.replaceCls(b + "-" + c, b + "-" + a)
	},
	getElementConfig : function () {
		return {
			reference : "wrapper",
			classList : ["x-centered", "x-indexbar-wrapper"],
			children : [this.callParent()]
		}
	},
	updateLetters : function (c) {
		this.innerElement.setHtml("");
		if (c) {
			var b = c.length,
			a;
			for (a = 0; a < b; a++) {
				this.innerElement.createChild({
					html : c[a]
				})
			}
		}
	},
	updateListPrefix : function (a) {
		if (a && a.length) {
			this.innerElement.createChild({
				html : a
			}, 0)
		}
	},
	initialize : function () {
		this.callParent();
		this.innerElement.on({
			touchstart : this.onTouchStart,
			touchend : this.onTouchEnd,
			touchmove : this.onTouchMove,
			scope : this
		})
	},
	onTouchStart : function (b, a) {
		b.stopPropagation();
		this.innerElement.addCls(this.getBaseCls() + "-pressed");
		this.pageBox = this.innerElement.getPageBox();
		this.onTouchMove(b)
	},
	onTouchEnd : function (b, a) {
		this.innerElement.removeCls(this.getBaseCls() + "-pressed")
	},
	onTouchMove : function (c) {
		var a = Ext.util.Point.fromEvent(c),
		b,
		d = this.pageBox;
		if (!d) {
			d = this.pageBox = this.el.getPageBox()
		}
		if (this.getDirection() === "vertical") {
			if (a.y > d.bottom || a.y < d.top) {
				return
			}
			b = Ext.Element.fromPoint(d.left + (d.width / 2), a.y)
		} else {
			if (a.x > d.right || a.x < d.left) {
				return
			}
			b = Ext.Element.fromPoint(a.x, d.top + (d.height / 2))
		}
		if (b) {
			this.fireEvent("index", this, b.dom.innerHTML, b)
		}
	},
	destroy : function () {
		var c = this,
		d = Array.prototype.slice.call(c.innerElement.dom.childNodes),
		b = d.length,
		a = 0;
		for (; a < b; a++) {
			Ext.removeNode(d[a])
		}
		this.callParent()
	}
}, function () {});
Ext.define("Ext.dataview.ListItemHeader", {
	extend : "Ext.Component",
	xtype : "listitemheader",
	config : {
		baseCls : Ext.baseCSSPrefix + "list-header",
		docked : "top"
	}
});
Ext.define("Ext.Button", {
	extend : "Ext.Component",
	xtype : "button",
	cachedConfig : {
		pressedCls : Ext.baseCSSPrefix + "button-pressing",
		badgeCls : Ext.baseCSSPrefix + "badge",
		hasBadgeCls : Ext.baseCSSPrefix + "hasbadge",
		labelCls : Ext.baseCSSPrefix + "button-label",
		iconMaskCls : Ext.baseCSSPrefix + "icon-mask",
		iconCls : null
	},
	config : {
		badgeText : null,
		text : null,
		icon : null,
		iconAlign : "left",
		pressedDelay : 0,
		iconMask : null,
		handler : null,
		scope : null,
		autoEvent : null,
		ui : "normal",
		baseCls : Ext.baseCSSPrefix + "button"
	},
	template : [{
			tag : "span",
			reference : "badgeElement",
			hidden : true
		}, {
			tag : "span",
			className : Ext.baseCSSPrefix + "button-icon",
			reference : "iconElement",
			hidden : true
		}, {
			tag : "span",
			reference : "textElement",
			hidden : true
		}
	],
	initialize : function () {
		this.callParent();
		this.element.on({
			scope : this,
			tap : "onTap",
			touchstart : "onPress",
			touchend : "onRelease"
		})
	},
	updateBadgeText : function (c) {
		var a = this.element,
		b = this.badgeElement;
		if (c) {
			b.show();
			b.setText(c)
		} else {
			b.hide()
		}
		a[(c) ? "addCls" : "removeCls"](this.getHasBadgeCls())
	},
	updateText : function (b) {
		var a = this.textElement;
		if (a) {
			if (b) {
				a.show();
				a.setHtml(b)
			} else {
				a.hide()
			}
		}
	},
	updateHtml : function (b) {
		var a = this.textElement;
		if (b) {
			a.show();
			a.setHtml(b)
		} else {
			a.hide()
		}
	},
	updateBadgeCls : function (b, a) {
		this.badgeElement.replaceCls(a, b)
	},
	updateHasBadgeCls : function (b, c) {
		var a = this.element;
		if (a.hasCls(c)) {
			a.replaceCls(c, b)
		}
	},
	updateLabelCls : function (b, a) {
		this.textElement.replaceCls(a, b)
	},
	updatePressedCls : function (b, c) {
		var a = this.element;
		if (a.hasCls(c)) {
			a.replaceCls(c, b)
		}
	},
	updateIcon : function (b) {
		var c = this,
		a = c.iconElement;
		if (b) {
			c.showIconElement();
			a.setStyle("background-image", b ? "url(" + b + ")" : "");
			c.refreshIconAlign();
			c.refreshIconMask()
		} else {
			c.hideIconElement();
			c.setIconAlign(false)
		}
	},
	updateIconCls : function (c, a) {
		var d = this,
		b = d.iconElement;
		if (c) {
			d.showIconElement();
			b.replaceCls(a, c);
			d.refreshIconAlign();
			d.refreshIconMask()
		} else {
			d.hideIconElement();
			d.setIconAlign(false)
		}
	},
	updateIconAlign : function (d, c) {
		var b = this.element,
		a = Ext.baseCSSPrefix + "iconalign-";
		if (!this.getText()) {
			d = "center"
		}
		b.removeCls(a + "center");
		b.removeCls(a + c);
		if (this.getIcon() || this.getIconCls()) {
			b.addCls(a + d)
		}
	},
	refreshIconAlign : function () {
		this.updateIconAlign(this.getIconAlign())
	},
	updateIconMaskCls : function (c, b) {
		var a = this.iconElement;
		if (this.getIconMask()) {
			a.replaceCls(b, c)
		}
	},
	updateIconMask : function (a) {
		this.iconElement[a ? "addCls" : "removeCls"](this.getIconMaskCls())
	},
	refreshIconMask : function () {
		this.updateIconMask(this.getIconMask())
	},
	applyAutoEvent : function (b) {
		var a = this;
		if (typeof b == "string") {
			b = {
				name : b,
				scope : a.scope || a
			}
		}
		return b
	},
	updateAutoEvent : function (c) {
		var a = c.name,
		b = c.scope;
		this.setHandler(function () {
			b.fireEvent(a, b, this)
		});
		this.setScope(b)
	},
	hideIconElement : function () {
		this.iconElement.hide()
	},
	showIconElement : function () {
		this.iconElement.show()
	},
	applyUi : function (a) {
		if (a && Ext.isString(a)) {
			var b = a.split("-");
			if (b && (b[1] == "back" || b[1] == "forward")) {
				return b
			}
		}
		return a
	},
	getUi : function () {
		var a = this._ui;
		if (Ext.isArray(a)) {
			return a.join("-")
		}
		return a
	},
	applyPressedDelay : function (a) {
		if (Ext.isNumber(a)) {
			return a
		}
		return (a) ? 100 : 0
	},
	onPress : function () {
		var c = this,
		a = c.element,
		d = c.getPressedDelay(),
		b = c.getPressedCls();
		if (!c.getDisabled()) {
			if (d > 0) {
				c.pressedTimeout = setTimeout(function () {
						delete c.pressedTimeout;
						if (a) {
							a.addCls(b)
						}
					}, d)
			} else {
				a.addCls(b)
			}
		}
	},
	onRelease : function (a) {
		this.fireAction("release", [this, a], "doRelease")
	},
	doRelease : function (a, b) {
		if (!a.getDisabled()) {
			if (a.hasOwnProperty("pressedTimeout")) {
				clearTimeout(a.pressedTimeout);
				delete a.pressedTimeout
			} else {
				a.element.removeCls(a.getPressedCls())
			}
		}
	},
	onTap : function (a) {
		if (this.getDisabled()) {
			return false
		}
		this.fireAction("tap", [this, a], "doTap")
	},
	doTap : function (c, d) {
		var b = c.getHandler(),
		a = c.getScope() || c;
		if (!b) {
			return
		}
		if (typeof b == "string") {
			b = a[b]
		}
		d.preventDefault();
		b.apply(a, arguments)
	}
}, function () {});
Ext.define("Ext.Title", {
	extend : "Ext.Component",
	xtype : "title",
	config : {
		baseCls : "x-title",
		title : ""
	},
	updateTitle : function (a) {
		this.setHtml(a)
	}
});
Ext.define("Ext.Spacer", {
	extend : "Ext.Component",
	alias : "widget.spacer",
	config : {},
	constructor : function (a) {
		a = a || {};
		if (!a.width) {
			a.flex = 1
		}
		this.callParent([a])
	}
});
Ext.define("Ext.data.identifier.Simple", {
	alias : "data.identifier.simple",
	statics : {
		AUTO_ID : 1
	},
	config : {
		prefix : "ext-record-"
	},
	constructor : function (a) {
		this.initConfig(a)
	},
	generate : function (a) {
		return this._prefix + this.self.AUTO_ID++
	}
});
Ext.define("Ext.mixin.Sortable", {
	extend : "Ext.mixin.Mixin",
	requires : ["Ext.util.Sorter"],
	mixinConfig : {
		id : "sortable"
	},
	config : {
		sorters : null,
		defaultSortDirection : "ASC",
		sortRoot : null
	},
	dirtySortFn : false,
	sortFn : null,
	sorted : false,
	applySorters : function (a, b) {
		if (!b) {
			b = this.createSortersCollection()
		}
		b.clear();
		this.sorted = false;
		if (a) {
			this.addSorters(a)
		}
		return b
	},
	createSortersCollection : function () {
		this._sorters = Ext.create("Ext.util.Collection", function (a) {
				return a.getId()
			});
		return this._sorters
	},
	addSorter : function (b, a) {
		this.addSorters([b], a)
	},
	addSorters : function (c, a) {
		var b = this.getSorters();
		return this.insertSorters(b ? b.length : 0, c, a)
	},
	insertSorter : function (a, c, b) {
		return this.insertSorters(a, [c], b)
	},
	insertSorters : function (e, h, a) {
		if (!Ext.isArray(h)) {
			h = [h]
		}
		var f = h.length,
		j = a || this.getDefaultSortDirection(),
		c = this.getSortRoot(),
		k = this.getSorters(),
		l = [],
		g,
		b,
		m,
		d;
		if (!k) {
			k = this.createSortersCollection()
		}
		for (b = 0; b < f; b++) {
			m = h[b];
			g = {
				direction : j,
				root : c
			};
			if (typeof m === "string") {
				d = k.get(m);
				if (!d) {
					g.property = m
				} else {
					if (a) {
						d.setDirection(a)
					} else {
						d.toggle()
					}
					continue
				}
			} else {
				if (Ext.isFunction(m)) {
					g.sorterFn = m
				} else {
					if (Ext.isObject(m)) {
						if (!m.isSorter) {
							if (m.fn) {
								m.sorterFn = m.fn;
								delete m.fn
							}
							g = Ext.apply(g, m)
						} else {
							l.push(m);
							if (!m.getRoot()) {
								m.setRoot(c)
							}
							continue
						}
					}
				}
			}
			m = Ext.create("Ext.util.Sorter", g);
			l.push(m)
		}
		for (b = 0, f = l.length; b < f; b++) {
			k.insert(e + b, l[b])
		}
		this.dirtySortFn = true;
		if (k.length) {
			this.sorted = true
		}
		return k
	},
	removeSorter : function (a) {
		return this.removeSorters([a])
	},
	removeSorters : function (d) {
		if (!Ext.isArray(d)) {
			d = [d]
		}
		var b = d.length,
		c = this.getSorters(),
		a,
		e;
		for (a = 0; a < b; a++) {
			e = d[a];
			if (typeof e === "string") {
				c.removeAtKey(e)
			} else {
				if (typeof e === "function") {
					c.each(function (f) {
						if (f.getSorterFn() === e) {
							c.remove(f)
						}
					})
				} else {
					if (e.isSorter) {
						c.remove(e)
					}
				}
			}
		}
		if (!c.length) {
			this.sorted = false
		}
	},
	updateSortFn : function () {
		var a = this.getSorters().items;
		this.sortFn = function (d, c) {
			var f = a.length,
			b,
			e;
			for (e = 0; e < f; e++) {
				b = a[e].sort.call(this, d, c);
				if (b !== 0) {
					break
				}
			}
			return b
		};
		this.dirtySortFn = false;
		return this.sortFn
	},
	getSortFn : function () {
		if (this.dirtySortFn) {
			return this.updateSortFn()
		}
		return this.sortFn
	},
	sort : function (a) {
		Ext.Array.sort(a, this.getSortFn());
		return a
	},
	findInsertionIndex : function (b, e, g) {
		var h = 0,
		a = b.length - 1,
		d = g || this.getSortFn(),
		c,
		f;
		while (h <= a) {
			c = (h + a) >> 1;
			f = d(e, b[c]);
			if (f >= 0) {
				h = c + 1
			} else {
				if (f < 0) {
					a = c - 1
				}
			}
		}
		return h
	}
});
Ext.define("Ext.mixin.Filterable", {
	extend : "Ext.mixin.Mixin",
	requires : ["Ext.util.Filter"],
	mixinConfig : {
		id : "filterable"
	},
	config : {
		filters : null,
		filterRoot : null
	},
	dirtyFilterFn : false,
	filterFn : null,
	filtered : false,
	applyFilters : function (a, b) {
		if (!b) {
			b = this.createFiltersCollection()
		}
		b.clear();
		this.filtered = false;
		this.dirtyFilterFn = true;
		if (a) {
			this.addFilters(a)
		}
		return b
	},
	createFiltersCollection : function () {
		this._filters = Ext.create("Ext.util.Collection", function (a) {
				return a.getId()
			});
		return this._filters
	},
	addFilter : function (a) {
		this.addFilters([a])
	},
	addFilters : function (b) {
		var a = this.getFilters();
		return this.insertFilters(a ? a.length : 0, b)
	},
	insertFilter : function (a, b) {
		return this.insertFilters(a, [b])
	},
	insertFilters : function (h, c) {
		if (!Ext.isArray(c)) {
			c = [c]
		}
		var j = c.length,
		a = this.getFilterRoot(),
		d = this.getFilters(),
		e = [],
		f,
		g,
		b;
		if (!d) {
			d = this.createFiltersCollection()
		}
		for (g = 0; g < j; g++) {
			b = c[g];
			f = {
				root : a
			};
			if (Ext.isFunction(b)) {
				f.filterFn = b
			} else {
				if (Ext.isObject(b)) {
					if (!b.isFilter) {
						if (b.fn) {
							b.filterFn = b.fn;
							delete b.fn
						}
						f = Ext.apply(f, b)
					} else {
						e.push(b);
						if (!b.getRoot()) {
							b.setRoot(a)
						}
						continue
					}
				}
			}
			b = Ext.create("Ext.util.Filter", f);
			e.push(b)
		}
		for (g = 0, j = e.length; g < j; g++) {
			d.insert(h + g, e[g])
		}
		this.dirtyFilterFn = true;
		if (d.length) {
			this.filtered = true
		}
		return d
	},
	removeFilters : function (e) {
		if (!Ext.isArray(e)) {
			e = [e]
		}
		var d = e.length,
		c = this.getFilters(),
		a,
		b;
		for (a = 0; a < d; a++) {
			b = e[a];
			if (typeof b === "string") {
				c.each(function (f) {
					if (f.getProperty() === b) {
						c.remove(f)
					}
				})
			} else {
				if (typeof b === "function") {
					c.each(function (f) {
						if (f.getFilterFn() === b) {
							c.remove(f)
						}
					})
				} else {
					if (b.isFilter) {
						c.remove(b)
					} else {
						if (b.property !== undefined && b.value !== undefined) {
							c.each(function (f) {
								if (f.getProperty() === b.property && f.getValue() === b.value) {
									c.remove(f)
								}
							})
						}
					}
				}
			}
		}
		if (!c.length) {
			this.filtered = false
		}
	},
	updateFilterFn : function () {
		var a = this.getFilters().items;
		this.filterFn = function (h) {
			var f = true,
			g = a.length,
			b;
			for (b = 0; b < g; b++) {
				var e = a[b],
				d = e.getFilterFn(),
				c = e.getScope() || this;
				f = f && d.call(c, h)
			}
			return f
		};
		this.dirtyFilterFn = false;
		return this.filterFn
	},
	filter : function (a) {
		return this.getFilters().length ? Ext.Array.filter(a, this.getFilterFn()) : a
	},
	isFiltered : function (a) {
		return this.getFilters().length ? !this.getFilterFn()(a) : false
	},
	getFilterFn : function () {
		if (this.dirtyFilterFn) {
			return this.updateFilterFn()
		}
		return this.filterFn
	}
});
Ext.define("Ext.mixin.Selectable", {
	extend : "Ext.mixin.Mixin",
	mixinConfig : {
		id : "selectable",
		hooks : {
			updateStore : "updateStore"
		}
	},
	config : {
		disableSelection : null,
		mode : "SINGLE",
		allowDeselect : false,
		lastSelected : null,
		lastFocused : null,
		deselectOnContainerClick : true
	},
	modes : {
		SINGLE : true,
		SIMPLE : true,
		MULTI : true
	},
	selectableEventHooks : {
		addrecords : "onSelectionStoreAdd",
		removerecords : "onSelectionStoreRemove",
		updaterecord : "onSelectionStoreUpdate",
		load : "refreshSelection",
		refresh : "refreshSelection"
	},
	constructor : function () {
		this.selected = new Ext.util.MixedCollection();
		this.callParent(arguments)
	},
	applyMode : function (a) {
		a = a ? a.toUpperCase() : "SINGLE";
		return this.modes[a] ? a : "SINGLE"
	},
	updateStore : function (a, c) {
		var b = this,
		d = Ext.apply({}, b.selectableEventHooks, {
				scope : b
			});
		if (c && Ext.isObject(c) && c.isStore) {
			if (c.autoDestroy) {
				c.destroy()
			} else {
				c.un(d)
			}
		}
		if (a) {
			a.on(d);
			b.refreshSelection()
		}
	},
	selectAll : function (a) {
		var e = this,
		c = e.getStore().getRange(),
		d = c.length,
		b = 0;
		for (; b < d; b++) {
			e.select(c[b], true, a)
		}
	},
	deselectAll : function (c) {
		var b = this,
		a = b.getStore().getRange();
		b.deselect(a, c);
		b.selected.clear();
		b.setLastSelected(null);
		b.setLastFocused(null)
	},
	selectWithEvent : function (a) {
		var c = this,
		b = c.isSelected(a);
		switch (c.getMode()) {
		case "MULTI":
		case "SIMPLE":
			if (b) {
				c.deselect(a)
			} else {
				c.select(a, true)
			}
			break;
		case "SINGLE":
			if (c.getAllowDeselect() && b) {
				c.deselect(a)
			} else {
				c.select(a, false)
			}
			break
		}
	},
	selectRange : function (c, g, h) {
		var f = this,
		b = f.getStore(),
		a = [],
		e,
		d;
		if (f.getDisableSelection()) {
			return
		}
		if (c > g) {
			e = g;
			g = c;
			c = e
		}
		for (d = c; d <= g; d++) {
			a.push(b.getAt(d))
		}
		this.doMultiSelect(a, h)
	},
	select : function (c, e, b) {
		var d = this,
		a;
		if (d.getDisableSelection()) {
			return
		}
		if (typeof c === "number") {
			c = [d.getStore().getAt(c)]
		}
		if (!c) {
			return
		}
		if (d.getMode() == "SINGLE" && c) {
			a = c.length ? c[0] : c;
			d.doSingleSelect(a, b)
		} else {
			d.doMultiSelect(c, e, b)
		}
	},
	doSingleSelect : function (a, b) {
		var d = this,
		c = d.selected;
		if (d.getDisableSelection()) {
			return
		}
		if (d.isSelected(a)) {
			return
		}
		if (c.getCount() > 0) {
			d.deselect(d.getLastSelected(), b)
		}
		c.add(a);
		d.setLastSelected(a);
		d.onItemSelect(a, b);
		d.setLastFocused(a);
		if (!b) {
			d.fireSelectionChange([a])
		}
	},
	doMultiSelect : function (a, j, h) {
		if (a === null || this.getDisableSelection()) {
			return
		}
		a = !Ext.isArray(a) ? [a] : a;
		var f = this,
		b = f.selected,
		e = a.length,
		g = false,
		c = 0,
		d;
		if (!j && b.getCount() > 0) {
			g = true;
			f.deselect(f.getSelection(), true)
		}
		for (; c < e; c++) {
			d = a[c];
			if (j && f.isSelected(d)) {
				continue
			}
			g = true;
			f.setLastSelected(d);
			b.add(d);
			if (!h) {
				f.setLastFocused(d)
			}
			f.onItemSelect(d, h)
		}
		if (g && !h) {
			this.fireSelectionChange(a)
		}
	},
	deselect : function (a, j) {
		var f = this;
		if (f.getDisableSelection()) {
			return
		}
		a = Ext.isArray(a) ? a : [a];
		var b = f.selected,
		g = false,
		c = 0,
		h = f.getStore(),
		e = a.length,
		d;
		for (; c < e; c++) {
			d = a[c];
			if (typeof d === "number") {
				d = h.getAt(d)
			}
			if (b.remove(d)) {
				if (f.getLastSelected() == d) {
					f.setLastSelected(b.last())
				}
				g = true
			}
			if (d) {
				f.onItemDeselect(d, j)
			}
		}
		if (g && !j) {
			f.fireSelectionChange(a)
		}
	},
	updateLastFocused : function (b, a) {
		this.onLastFocusChanged(a, b)
	},
	fireSelectionChange : function (a) {
		var b = this;
		b.fireAction("selectionchange", [b, a], "getSelection")
	},
	getSelection : function () {
		return this.selected.getRange()
	},
	isSelected : function (a) {
		a = Ext.isNumber(a) ? this.getStore().getAt(a) : a;
		return this.selected.indexOf(a) !== -1
	},
	hasSelection : function () {
		return this.selected.getCount() > 0
	},
	refreshSelection : function () {
		var b = this,
		a = b.getSelection();
		b.deselectAll(true);
		if (a.length) {
			b.select(a, false, true)
		}
	},
	onSelectionStoreRemove : function (c, b) {
		var g = this,
		e = g.selected,
		f = b.length,
		a,
		d;
		if (g.getDisableSelection()) {
			return
		}
		for (d = 0; d < f; d++) {
			a = b[d];
			if (e.remove(a)) {
				if (g.getLastSelected() == a) {
					g.setLastSelected(null)
				}
				if (g.getLastFocused() == a) {
					g.setLastFocused(null)
				}
				g.fireSelectionChange([a])
			}
		}
	},
	getSelectionCount : function () {
		return this.selected.getCount()
	},
	onSelectionStoreAdd : Ext.emptyFn,
	onSelectionStoreUpdate : Ext.emptyFn,
	onItemSelect : Ext.emptyFn,
	onItemDeselect : Ext.emptyFn,
	onLastFocusChanged : Ext.emptyFn,
	onEditorKey : Ext.emptyFn
}, function () {});
Ext.define("Ext.dataview.element.Container", {
	extend : "Ext.Component",
	doInitialize : function () {
		this.element.on({
			touchstart : "onItemTouchStart",
			touchend : "onItemTouchEnd",
			tap : "onItemTap",
			taphold : "onItemTapHold",
			touchmove : "onItemTouchMove",
			singletap : "onItemSingleTap",
			doubletap : "onItemDoubleTap",
			swipe : "onItemSwipe",
			delegate : "> div",
			scope : this
		})
	},
	initialize : function () {
		this.callParent();
		this.doInitialize()
	},
	updateBaseCls : function (a, b) {
		var c = this;
		c.callParent([a + "-container", b])
	},
	onItemTouchStart : function (d) {
		var b = this,
		c = d.getTarget(),
		a = b.getViewItems().indexOf(c);
		Ext.get(c).on({
			touchmove : "onItemTouchMove",
			scope : b,
			single : true
		});
		b.fireEvent("itemtouchstart", b, Ext.get(c), a, d)
	},
	onItemTouchEnd : function (d) {
		var b = this,
		c = d.getTarget(),
		a = b.getViewItems().indexOf(c);
		Ext.get(c).un({
			touchmove : "onItemTouchMove",
			scope : b
		});
		b.fireEvent("itemtouchend", b, Ext.get(c), a, d)
	},
	onItemTouchMove : function (d) {
		var b = this,
		c = d.getTarget(),
		a = b.getViewItems().indexOf(c);
		b.fireEvent("itemtouchmove", b, Ext.get(c), a, d)
	},
	onItemTap : function (d) {
		var b = this,
		c = d.getTarget(),
		a = b.getViewItems().indexOf(c);
		b.fireEvent("itemtap", b, Ext.get(c), a, d)
	},
	onItemTapHold : function (d) {
		var b = this,
		c = d.getTarget(),
		a = b.getViewItems().indexOf(c);
		b.fireEvent("itemtaphold", b, Ext.get(c), a, d)
	},
	onItemDoubleTap : function (d) {
		var b = this,
		c = d.getTarget(),
		a = b.getViewItems().indexOf(c);
		b.fireEvent("itemdoubletap", b, Ext.get(c), a, d)
	},
	onItemSingleTap : function (d) {
		var b = this,
		c = d.getTarget(),
		a = b.getViewItems().indexOf(c);
		b.fireEvent("itemsingletap", b, Ext.get(c), a, d)
	},
	onItemSwipe : function (d) {
		var b = this,
		c = d.getTarget(),
		a = b.getViewItems().indexOf(c);
		b.fireEvent("itemswipe", b, Ext.get(c), a, d)
	},
	updateListItem : function (b, d) {
		var c = this,
		a = c.dataview,
		e = a.prepareData(b.getData(true), a.getStore().indexOf(b), b);
		d.innerHTML = c.dataview.getItemTpl().apply(e)
	},
	addListItem : function (e, c) {
		var h = this,
		d = h.dataview,
		a = d.prepareData(c.getData(true), d.getStore().indexOf(c), c),
		b = h.element,
		i = b.dom.childNodes,
		g = i.length,
		f;
		f = Ext.Element.create(this.getItemElementConfig(e, a));
		if (!g || e == g) {
			f.appendTo(b)
		} else {
			f.insertBefore(i[e])
		}
	},
	getItemElementConfig : function (c, e) {
		var b = this.dataview,
		d = b.getItemCls(),
		a = b.getBaseCls() + "-item";
		if (d) {
			a += " " + d
		}
		return {
			cls : a,
			html : b.getItemTpl().apply(e)
		}
	},
	doRemoveItemCls : function (a) {
		var d = this.getViewItems(),
		c = d.length,
		b = 0;
		for (; b < c; b++) {
			Ext.fly(d[b]).removeCls(a)
		}
	},
	doAddItemCls : function (a) {
		var d = this.getViewItems(),
		c = d.length,
		b = 0;
		for (; b < c; b++) {
			Ext.fly(d[b]).addCls(a)
		}
	},
	moveItemsToCache : function (f, e) {
		var d = this,
		a = d.getViewItems(),
		b = e - f,
		c;
		for (; b >= 0; b--) {
			c = a[f + b];
			c.parentNode.removeChild(c)
		}
		if (d.getViewItems().length == 0) {
			this.dataview.showEmptyText()
		}
	},
	moveItemsFromCache : function (d) {
		var g = this,
		b = g.dataview,
		c = b.getStore(),
		f = d.length,
		e,
		a;
		if (f) {
			b.hideEmptyText()
		}
		for (e = 0; e < f; e++) {
			d[e]._tmpIndex = c.indexOf(d[e])
		}
		Ext.Array.sort(d, function (i, h) {
			return i._tmpIndex > h._tmpIndex ? 1 : -1
		});
		for (e = 0; e < f; e++) {
			a = d[e];
			g.addListItem(a._tmpIndex, a);
			delete a._tmpIndex
		}
	},
	getViewItems : function () {
		return Array.prototype.slice.call(this.element.dom.childNodes)
	},
	destroy : function () {
		var c = this.getViewItems(),
		b = c.length,
		a = 0;
		for (; a < b; a++) {
			Ext.removeNode(c[a])
		}
		this.callParent()
	}
});
Ext.define("Ext.data.SortTypes", {
	singleton : true,
	stripTagsRE : /<\/?[^>]+>/gi,
	none : function (a) {
		return a
	},
	asText : function (a) {
		return String(a).replace(this.stripTagsRE, "")
	},
	asUCText : function (a) {
		return String(a).toUpperCase().replace(this.stripTagsRE, "")
	},
	asUCString : function (a) {
		return String(a).toUpperCase()
	},
	asDate : function (a) {
		if (!a) {
			return 0
		}
		if (Ext.isDate(a)) {
			return a.getTime()
		}
		return Date.parse(String(a))
	},
	asFloat : function (a) {
		a = parseFloat(String(a).replace(/,/g, ""));
		return isNaN(a) ? 0 : a
	},
	asInt : function (a) {
		a = parseInt(String(a).replace(/,/g, ""), 10);
		return isNaN(a) ? 0 : a
	}
});
Ext.define("Ext.util.Inflector", {
	singleton : true,
	plurals : [[(/(quiz)$/i), "$1zes"], [(/^(ox)$/i), "$1en"], [(/([m|l])ouse$/i), "$1ice"], [(/(matr|vert|ind)ix|ex$/i), "$1ices"], [(/(x|ch|ss|sh)$/i), "$1es"], [(/([^aeiouy]|qu)y$/i), "$1ies"], [(/(hive)$/i), "$1s"], [(/(?:([^f])fe|([lr])f)$/i), "$1$2ves"], [(/sis$/i), "ses"], [(/([ti])um$/i), "$1a"], [(/(buffal|tomat|potat)o$/i), "$1oes"], [(/(bu)s$/i), "$1ses"], [(/(alias|status|sex)$/i), "$1es"], [(/(octop|vir)us$/i), "$1i"], [(/(ax|test)is$/i), "$1es"], [(/^person$/), "people"], [(/^man$/), "men"], [(/^(child)$/), "$1ren"], [(/s$/i), "s"], [(/$/), "s"]],
	singulars : [[(/(quiz)zes$/i), "$1"], [(/(matr)ices$/i), "$1ix"], [(/(vert|ind)ices$/i), "$1ex"], [(/^(ox)en/i), "$1"], [(/(alias|status)es$/i), "$1"], [(/(octop|vir)i$/i), "$1us"], [(/(cris|ax|test)es$/i), "$1is"], [(/(shoe)s$/i), "$1"], [(/(o)es$/i), "$1"], [(/(bus)es$/i), "$1"], [(/([m|l])ice$/i), "$1ouse"], [(/(x|ch|ss|sh)es$/i), "$1"], [(/(m)ovies$/i), "$1ovie"], [(/(s)eries$/i), "$1eries"], [(/([^aeiouy]|qu)ies$/i), "$1y"], [(/([lr])ves$/i), "$1f"], [(/(tive)s$/i), "$1"], [(/(hive)s$/i), "$1"], [(/([^f])ves$/i), "$1fe"], [(/(^analy)ses$/i), "$1sis"], [(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i), "$1$2sis"], [(/([ti])a$/i), "$1um"], [(/(n)ews$/i), "$1ews"], [(/people$/i), "person"], [(/s$/i), ""]],
	uncountable : ["sheep", "fish", "series", "species", "money", "rice", "information", "equipment", "grass", "mud", "offspring", "deer", "means"],
	singular : function (b, a) {
		this.singulars.unshift([b, a])
	},
	plural : function (b, a) {
		this.plurals.unshift([b, a])
	},
	clearSingulars : function () {
		this.singulars = []
	},
	clearPlurals : function () {
		this.plurals = []
	},
	isTransnumeral : function (a) {
		return Ext.Array.indexOf(this.uncountable, a) != -1
	},
	pluralize : function (f) {
		if (this.isTransnumeral(f)) {
			return f
		}
		var e = this.plurals,
		d = e.length,
		a,
		c,
		b;
		for (b = 0; b < d; b++) {
			a = e[b];
			c = a[0];
			if (c == f || (c.test && c.test(f))) {
				return f.replace(c, a[1])
			}
		}
		return f
	},
	singularize : function (f) {
		if (this.isTransnumeral(f)) {
			return f
		}
		var e = this.singulars,
		d = e.length,
		a,
		c,
		b;
		for (b = 0; b < d; b++) {
			a = e[b];
			c = a[0];
			if (c == f || (c.test && c.test(f))) {
				return f.replace(c, a[1])
			}
		}
		return f
	},
	classify : function (a) {
		return Ext.String.capitalize(this.singularize(a))
	},
	ordinalize : function (d) {
		var b = parseInt(d, 10),
		c = b % 10,
		a = b % 100;
		if (11 <= a && a <= 13) {
			return d + "th"
		} else {
			switch (c) {
			case 1:
				return d + "st";
			case 2:
				return d + "nd";
			case 3:
				return d + "rd";
			default:
				return d + "th"
			}
		}
	}
}, function () {
	var b = {
		alumnus : "alumni",
		cactus : "cacti",
		focus : "foci",
		nucleus : "nuclei",
		radius : "radii",
		stimulus : "stimuli",
		ellipsis : "ellipses",
		paralysis : "paralyses",
		oasis : "oases",
		appendix : "appendices",
		index : "indexes",
		beau : "beaux",
		bureau : "bureaux",
		tableau : "tableaux",
		woman : "women",
		child : "children",
		man : "men",
		corpus : "corpora",
		criterion : "criteria",
		curriculum : "curricula",
		genus : "genera",
		memorandum : "memoranda",
		phenomenon : "phenomena",
		foot : "feet",
		goose : "geese",
		tooth : "teeth",
		antenna : "antennae",
		formula : "formulae",
		nebula : "nebulae",
		vertebra : "vertebrae",
		vita : "vitae"
	},
	a;
	for (a in b) {
		this.plural(a, b[a]);
		this.singular(b[a], a)
	}
});
Ext.define("Ext.data.Error", {
	config : {
		field : null,
		message : ""
	},
	constructor : function (a) {
		this.initConfig(a)
	}
});
Ext.define("Ext.dataview.component.DataItem", {
	extend : "Ext.Container",
	xtype : "dataitem",
	config : {
		baseCls : Ext.baseCSSPrefix + "data-item",
		defaultType : "component",
		record : null,
		itemCls : null,
		dataMap : {},
		items : [{
				xtype : "component"
			}
		]
	},
	updateBaseCls : function (a, b) {
		var c = this;
		c.callParent(arguments)
	},
	updateItemCls : function (b, a) {
		if (a) {
			this.removeCls(a)
		}
		if (b) {
			this.addCls(b)
		}
	},
	updateRecord : function (d) {
		if (!d) {
			return
		}
		this._record = d;
		var h = this,
		c = h.config.dataview,
		b = c.prepareData(d.getData(true), c.getStore().indexOf(d), d),
		e = h.getItems(),
		k = e.first(),
		i = h.getDataMap(),
		f,
		j,
		g,
		a;
		if (!k) {
			return
		}
		for (f in i) {
			g = i[f];
			j = h[f]();
			if (j) {
				for (a in g) {
					if (j[a]) {
						j[a](b[g[a]])
					}
				}
			}
		}
		h.fireEvent("updatedata", h, b);
		k.updateData(b)
	}
});
Ext.define("Ext.util.HashMap", {
	mixins : {
		observable : "Ext.mixin.Observable"
	},
	constructor : function (a) {
		this.callParent();
		this.mixins.observable.constructor.call(this);
		this.clear(true)
	},
	getCount : function () {
		return this.length
	},
	getData : function (a, b) {
		if (b === undefined) {
			b = a;
			a = this.getKey(b)
		}
		return [a, b]
	},
	getKey : function (a) {
		return a.id
	},
	add : function (a, d) {
		var b = this,
		c;
		if (b.containsKey(a)) {
			throw new Error("This key already exists in the HashMap")
		}
		c = this.getData(a, d);
		a = c[0];
		d = c[1];
		b.map[a] = d;
		++b.length;
		b.fireEvent("add", b, a, d);
		return d
	},
	replace : function (b, d) {
		var c = this,
		e = c.map,
		a;
		if (!c.containsKey(b)) {
			c.add(b, d)
		}
		a = e[b];
		e[b] = d;
		c.fireEvent("replace", c, b, d, a);
		return d
	},
	remove : function (b) {
		var a = this.findKey(b);
		if (a !== undefined) {
			return this.removeByKey(a)
		}
		return false
	},
	removeByKey : function (a) {
		var b = this,
		c;
		if (b.containsKey(a)) {
			c = b.map[a];
			delete b.map[a];
			--b.length;
			b.fireEvent("remove", b, a, c);
			return true
		}
		return false
	},
	get : function (a) {
		return this.map[a]
	},
	clear : function (a) {
		var b = this;
		b.map = {};
		b.length = 0;
		if (a !== true) {
			b.fireEvent("clear", b)
		}
		return b
	},
	containsKey : function (a) {
		return this.map[a] !== undefined
	},
	contains : function (a) {
		return this.containsKey(this.findKey(a))
	},
	getKeys : function () {
		return this.getArray(true)
	},
	getValues : function () {
		return this.getArray(false)
	},
	getArray : function (d) {
		var a = [],
		b,
		c = this.map;
		for (b in c) {
			if (c.hasOwnProperty(b)) {
				a.push(d ? b : c[b])
			}
		}
		return a
	},
	each : function (d, c) {
		var a = Ext.apply({}, this.map),
		b,
		e = this.length;
		c = c || this;
		for (b in a) {
			if (a.hasOwnProperty(b)) {
				if (d.call(c, b, a[b], e) === false) {
					break
				}
			}
		}
		return this
	},
	clone : function () {
		var c = new Ext.util.HashMap(),
		b = this.map,
		a;
		c.suspendEvents();
		for (a in b) {
			if (b.hasOwnProperty(a)) {
				c.add(a, b[a])
			}
		}
		c.resumeEvents();
		return c
	},
	findKey : function (b) {
		var a,
		c = this.map;
		for (a in c) {
			if (c.hasOwnProperty(a) && c[a] === b) {
				return a
			}
		}
		return undefined
	}
});
Ext.define("Ext.data.Request", {
	config : {
		action : null,
		params : null,
		method : "GET",
		url : null,
		operation : null,
		proxy : null,
		disableCaching : false,
		headers : {},
		callbackKey : null,
		jsonP : null,
		jsonData : null,
		xmlData : null,
		withCredentials : null,
		callback : null,
		scope : null,
		timeout : 30000,
		records : null,
		directFn : null,
		args : null
	},
	constructor : function (a) {
		this.initConfig(a)
	}
});
Ext.define("Ext.data.Connection", {
	mixins : {
		observable : "Ext.mixin.Observable"
	},
	statics : {
		requestId : 0
	},
	config : {
		url : null,
		async : true,
		method : null,
		username : "",
		password : "",
		disableCaching : true,
		disableCachingParam : "_dc",
		timeout : 30000,
		extraParams : null,
		defaultHeaders : null,
		useDefaultHeader : true,
		defaultPostHeader : "application/x-www-form-urlencoded; charset=UTF-8",
		useDefaultXhrHeader : true,
		defaultXhrHeader : "XMLHttpRequest",
		autoAbort : false
	},
	textAreaRe : /textarea/i,
	multiPartRe : /multipart\/form-data/i,
	lineBreakRe : /\r\n/g,
	constructor : function (a) {
		this.initConfig(a);
		this.requests = {}
		
	},
	request : function (j) {
		j = j || {};
		var f = this,
		i = j.scope || window,
		e = j.username || f.getUsername(),
		g = j.password || f.getPassword() || "",
		b,
		c,
		d,
		a,
		h;
		if (f.fireEvent("beforerequest", f, j) !== false) {
			c = f.setOptions(j, i);
			if (this.isFormUpload(j) === true) {
				this.upload(j.form, c.url, c.data, j);
				return null
			}
			if (j.autoAbort === true || f.getAutoAbort()) {
				f.abort()
			}
			h = this.getXhrInstance();
			b = j.async !== false ? (j.async || f.getAsync()) : false;
			if (e) {
				h.open(c.method, c.url, b, e, g)
			} else {
				h.open(c.method, c.url, b)
			}
			a = f.setupHeaders(h, j, c.data, c.params);
			d = {
				id : ++this.self.requestId,
				xhr : h,
				headers : a,
				options : j,
				async : b,
				timeout : setTimeout(function () {
					d.timedout = true;
					f.abort(d)
				}, j.timeout || f.getTimeout())
			};
			f.requests[d.id] = d;
			if (b) {
				h.onreadystatechange = Ext.Function.bind(f.onStateChange, f, [d])
			}
			h.send(c.data);
			if (!b) {
				return this.onComplete(d)
			}
			return d
		} else {
			Ext.callback(j.callback, j.scope, [j, undefined, undefined]);
			return null
		}
	},
	upload : function (e, c, i, k) {
		e = Ext.getDom(e);
		k = k || {};
		var d = Ext.id(),
		g = document.createElement("iframe"),
		j = [],
		h = "multipart/form-data",
		f = {
			target : e.target,
			method : e.method,
			encoding : e.encoding,
			enctype : e.enctype,
			action : e.action
		},
		b = function (l, m) {
			a = document.createElement("input");
			Ext.fly(a).set({
				type : "hidden",
				value : m,
				name : l
			});
			e.appendChild(a);
			j.push(a)
		},
		a;
		Ext.fly(g).set({
			id : d,
			name : d,
			cls : Ext.baseCSSPrefix + "hide-display",
			src : Ext.SSL_SECURE_URL
		});
		document.body.appendChild(g);
		if (document.frames) {
			document.frames[d].name = d
		}
		Ext.fly(e).set({
			target : d,
			method : "POST",
			enctype : h,
			encoding : h,
			action : c || f.action
		});
		if (i) {
			Ext.iterate(Ext.Object.fromQueryString(i), function (l, m) {
				if (Ext.isArray(m)) {
					Ext.each(m, function (n) {
						b(l, n)
					})
				} else {
					b(l, m)
				}
			})
		}
		Ext.fly(g).on("load", Ext.Function.bind(this.onUploadComplete, this, [g, k]), null, {
			single : true
		});
		e.submit();
		Ext.fly(e).set(f);
		Ext.each(j, function (l) {
			Ext.removeNode(l)
		})
	},
	onUploadComplete : function (h, b) {
		var c = this,
		a = {
			responseText : "",
			responseXML : null
		},
		g,
		f;
		try {
			g = h.contentWindow.document || h.contentDocument || window.frames[id].document;
			if (g) {
				if (g.body) {
					if (this.textAreaRe.test((f = g.body.firstChild || {}).tagName)) {
						a.responseText = f.value
					} else {
						a.responseText = g.body.innerHTML
					}
				}
				a.responseXML = g.XMLDocument || g
			}
		} catch (d) {}
		
		c.fireEvent("requestcomplete", c, a, b);
		Ext.callback(b.success, b.scope, [a, b]);
		Ext.callback(b.callback, b.scope, [b, true, a]);
		setTimeout(function () {
			Ext.removeNode(h)
		}, 100)
	},
	isFormUpload : function (a) {
		var b = this.getForm(a);
		if (b) {
			return (a.isUpload || (this.multiPartRe).test(b.getAttribute("enctype")))
		}
		return false
	},
	getForm : function (a) {
		return Ext.getDom(a.form) || null
	},
	setOptions : function (k, j) {
		var h = this,
		e = k.params || {},
		g = h.getExtraParams(),
		d = k.urlParams,
		c = k.url || h.getUrl(),
		i = k.jsonData,
		b,
		a,
		f;
		if (Ext.isFunction(e)) {
			e = e.call(j, k)
		}
		if (Ext.isFunction(c)) {
			c = c.call(j, k)
		}
		c = this.setupUrl(k, c);
		f = k.rawData || k.xmlData || i || null;
		if (i && !Ext.isPrimitive(i)) {
			f = Ext.encode(f)
		}
		if (Ext.isObject(e)) {
			e = Ext.Object.toQueryString(e)
		}
		if (Ext.isObject(g)) {
			g = Ext.Object.toQueryString(g)
		}
		e = e + ((g) ? ((e) ? "&" : "") + g : "");
		d = Ext.isObject(d) ? Ext.Object.toQueryString(d) : d;
		e = this.setupParams(k, e);
		b = (k.method || h.getMethod() || ((e || f) ? "POST" : "GET")).toUpperCase();
		this.setupMethod(k, b);
		a = k.disableCaching !== false ? (k.disableCaching || h.getDisableCaching()) : false;
		if (b === "GET" && a) {
			c = Ext.urlAppend(c, (k.disableCachingParam || h.getDisableCachingParam()) + "=" + (new Date().getTime()))
		}
		if ((b == "GET" || f) && e) {
			c = Ext.urlAppend(c, e);
			e = null
		}
		if (d) {
			c = Ext.urlAppend(c, d)
		}
		return {
			url : c,
			method : b,
			data : f || e || null
		}
	},
	setupUrl : function (b, a) {
		var c = this.getForm(b);
		if (c) {
			a = a || c.action
		}
		return a
	},
	setupParams : function (a, d) {
		var c = this.getForm(a),
		b;
		if (c && !this.isFormUpload(a)) {
			b = Ext.Element.serializeForm(c);
			d = d ? (d + "&" + b) : b
		}
		return d
	},
	setupMethod : function (a, b) {
		if (this.isFormUpload(a)) {
			return "POST"
		}
		return b
	},
	setupHeaders : function (l, m, d, c) {
		var h = this,
		b = Ext.apply({}, m.headers || {}, h.getDefaultHeaders() || {}),
		k = h.getDefaultPostHeader(),
		i = m.jsonData,
		a = m.xmlData,
		j,
		f;
		if (!b["Content-Type"] && (d || c)) {
			if (d) {
				if (m.rawData) {
					k = "text/plain"
				} else {
					if (a && Ext.isDefined(a)) {
						k = "text/xml"
					} else {
						if (i && Ext.isDefined(i)) {
							k = "application/json"
						}
					}
				}
			}
			b["Content-Type"] = k
		}
		if (((h.getUseDefaultXhrHeader() && m.useDefaultXhrHeader !== false) || m.useDefaultXhrHeader) && !b["X-Requested-With"]) {
			b["X-Requested-With"] = h.getDefaultXhrHeader()
		}
		try {
			for (j in b) {
				if (b.hasOwnProperty(j)) {
					f = b[j];
					l.setRequestHeader(j, f)
				}
			}
		} catch (g) {
			h.fireEvent("exception", j, f)
		}
		if (m.withCredentials) {
			l.withCredentials = m.withCredentials
		}
		return b
	},
	getXhrInstance : (function () {
		var b = [function () {
				return new XMLHttpRequest()
			}, function () {
				return new ActiveXObject("MSXML2.XMLHTTP.3.0")
			}, function () {
				return new ActiveXObject("MSXML2.XMLHTTP")
			}, function () {
				return new ActiveXObject("Microsoft.XMLHTTP")
			}
		],
		c = 0,
		a = b.length,
		f;
		for (; c < a; ++c) {
			try {
				f = b[c];
				f();
				break
			} catch (d) {}
			
		}
		return f
	})(),
	isLoading : function (a) {
		if (!(a && a.xhr)) {
			return false
		}
		var b = a.xhr.readyState;
		return !(b === 0 || b == 4)
	},
	abort : function (b) {
		var a = this,
		d = a.requests,
		c;
		if (b && a.isLoading(b)) {
			b.xhr.onreadystatechange = null;
			b.xhr.abort();
			a.clearTimeout(b);
			if (!b.timedout) {
				b.aborted = true
			}
			a.onComplete(b);
			a.cleanup(b)
		} else {
			if (!b) {
				for (c in d) {
					if (d.hasOwnProperty(c)) {
						a.abort(d[c])
					}
				}
			}
		}
	},
	abortAll : function () {
		this.abort()
	},
	onStateChange : function (a) {
		if (a.xhr.readyState == 4) {
			this.clearTimeout(a);
			this.onComplete(a);
			this.cleanup(a)
		}
	},
	clearTimeout : function (a) {
		clearTimeout(a.timeout);
		delete a.timeout
	},
	cleanup : function (a) {
		a.xhr = null;
		delete a.xhr
	},
	onComplete : function (f) {
		var d = this,
		c = f.options,
		a,
		h,
		b;
		try {
			a = d.parseStatus(f.xhr.status, f.xhr);
			if (f.timedout) {
				a.success = false
			}
		} catch (g) {
			a = {
				success : false,
				isException : false
			}
		}
		h = a.success;
		if (h) {
			b = d.createResponse(f);
			d.fireEvent("requestcomplete", d, b, c);
			Ext.callback(c.success, c.scope, [b, c])
		} else {
			if (a.isException || f.aborted || f.timedout) {
				b = d.createException(f)
			} else {
				b = d.createResponse(f)
			}
			d.fireEvent("requestexception", d, b, c);
			Ext.callback(c.failure, c.scope, [b, c])
		}
		Ext.callback(c.callback, c.scope, [c, h, b]);
		delete d.requests[f.id];
		return b
	},
	parseStatus : function (a, d) {
		a = a == 1223 ? 204 : a;
		var c = (a >= 200 && a < 300) || a == 304 || (a == 0 && d.responseText.length > 0),
		b = false;
		if (!c) {
			switch (a) {
			case 12002:
			case 12029:
			case 12030:
			case 12031:
			case 12152:
			case 13030:
				b = true;
				break
			}
		}
		return {
			success : c,
			isException : b
		}
	},
	createResponse : function (c) {
		var g = c.xhr,
		a = {},
		h,
		d,
		i,
		e,
		f,
		b;
		if (c.timedout || c.aborted) {
			c.success = false;
			h = []
		} else {
			h = g.getAllResponseHeaders().replace(this.lineBreakRe, "\n").split("\n")
		}
		d = h.length;
		while (d--) {
			i = h[d];
			e = i.indexOf(":");
			if (e >= 0) {
				f = i.substr(0, e).toLowerCase();
				if (i.charAt(e + 1) == " ") {
					++e
				}
				a[f] = i.substr(e + 1)
			}
		}
		c.xhr = null;
		delete c.xhr;
		b = {
			request : c,
			requestId : c.id,
			status : g.status,
			statusText : g.statusText,
			getResponseHeader : function (j) {
				return a[j.toLowerCase()]
			},
			getAllResponseHeaders : function () {
				return a
			},
			responseText : g.responseText,
			responseXML : g.responseXML
		};
		g = null;
		return b
	},
	createException : function (a) {
		return {
			request : a,
			requestId : a.id,
			status : a.aborted ? -1 : 0,
			statusText : a.aborted ? "transaction aborted" : "communication failure",
			aborted : a.aborted,
			timedout : a.timedout
		}
	}
});
Ext.define("Ext.data.Batch", {
	mixins : {
		observable : "Ext.mixin.Observable"
	},
	config : {
		autoStart : false,
		pauseOnException : true,
		proxy : null
	},
	current : -1,
	total : 0,
	isRunning : false,
	isComplete : false,
	hasException : false,
	constructor : function (a) {
		var b = this;
		b.initConfig(a);
		b.operations = []
	},
	add : function (a) {
		this.total++;
		a.setBatch(this);
		this.operations.push(a)
	},
	start : function () {
		this.hasException = false;
		this.isRunning = true;
		this.runNextOperation()
	},
	runNextOperation : function () {
		this.runOperation(this.current + 1)
	},
	pause : function () {
		this.isRunning = false
	},
	runOperation : function (d) {
		var e = this,
		c = e.operations,
		b = c[d],
		a;
		if (b === undefined) {
			e.isRunning = false;
			e.isComplete = true;
			e.fireEvent("complete", e, c[c.length - 1])
		} else {
			e.current = d;
			a = function (f) {
				var g = f.hasException();
				if (g) {
					e.hasException = true;
					e.fireEvent("exception", e, f)
				} else {
					e.fireEvent("operationcomplete", e, f)
				}
				if (g && e.getPauseOnException()) {
					e.pause()
				} else {
					f.setCompleted();
					e.runNextOperation()
				}
			};
			b.setStarted();
			e.getProxy()[b.getAction()](b, a, e)
		}
	}
});
Ext.define("Ext.data.writer.Writer", {
	alias : "writer.base",
	alternateClassName : ["Ext.data.DataWriter", "Ext.data.Writer"],
	config : {
		writeAllFields : true,
		nameProperty : "name"
	},
	constructor : function (a) {
		this.initConfig(a)
	},
	write : function (e) {
		var c = e.getOperation(),
		b = c.getRecords() || [],
		a = b.length,
		d = 0,
		f = [];
		for (; d < a; d++) {
			f.push(this.getRecordData(b[d]))
		}
		return this.writeRecords(e, f)
	},
	writeDate : function (c, b) {
		var a = c.dateFormat || "timestamp";
		switch (a) {
		case "timestamp":
			return b.getTime() / 1000;
		case "time":
			return b.getTime();
		default:
			return Ext.Date.format(b, a)
		}
	},
	getRecordData : function (e) {
		var j = e.phantom === true,
		b = this.getWriteAllFields() || j,
		c = this.getNameProperty(),
		f = e.getFields(),
		d = {},
		h,
		a,
		g,
		k,
		i;
		if (b) {
			f.each(function (l) {
				if (l.getPersist()) {
					a = l.config[c] || l.getName();
					i = e.get(l.getName());
					if (l.getType().type == "date") {
						i = this.writeDate(l, i)
					}
					d[a] = i
				}
			}, this)
		} else {
			h = e.getChanges();
			for (k in h) {
				if (h.hasOwnProperty(k)) {
					g = f.get(k);
					if (g.getPersist()) {
						a = g.config[c] || g.getName();
						i = h[k];
						if (g.getType().type == "date") {
							i = this.writeDate(g, i)
						}
						d[a] = i
					}
				}
			}
			if (!j) {
				d[e.getIdProperty()] = e.getId()
			}
		}
		return d
	}
});
Ext.define("Ext.data.ResultSet", {
	config : {
		loaded : true,
		count : null,
		total : null,
		success : false,
		records : null,
		message : null
	},
	constructor : function (a) {
		this.initConfig(a)
	},
	applyCount : function (a) {
		if (!a && a !== 0) {
			return this.getRecords().length
		}
		return a
	},
	updateRecords : function (a) {
		this.setCount(a.length)
	}
});
Ext.define("Ext.field.Field", {
	extend : "Ext.Decorator",
	alternateClassName : "Ext.form.Field",
	xtype : "field",
	requires : ["Ext.field.Input"],
	isField : true,
	isFormField : true,
	config : {
		baseCls : Ext.baseCSSPrefix + "field",
		label : null,
		labelAlign : "left",
		labelWidth : "30%",
		labelWrap : false,
		clearIcon : null,
		required : false,
		inputType : null,
		name : null,
		value : null,
		tabIndex : null
	},
	cachedConfig : {
		labelCls : null,
		requiredCls : Ext.baseCSSPrefix + "field-required",
		inputCls : null,
		bubbleEvents : ["action"]
	},
	getElementConfig : function () {
		var a = Ext.baseCSSPrefix;
		return {
			reference : "element",
			className : "x-container",
			children : [{
					reference : "label",
					cls : a + "form-label",
					children : [{
							reference : "labelspan",
							tag : "span"
						}
					]
				}, {
					reference : "innerElement",
					cls : a + "component-outer"
				}
			]
		}
	},
	updateLabel : function (b, d) {
		var a = this.renderElement,
		c = Ext.baseCSSPrefix;
		if (b) {
			this.labelspan.setHtml(b);
			a.addCls(c + "field-labeled")
		} else {
			a.removeCls(c + "field-labeled")
		}
	},
	updateLabelAlign : function (b, c) {
		var a = this.renderElement,
		d = Ext.baseCSSPrefix;
		if (b) {
			a.addCls(d + "label-align-" + b);
			if (b == "top" || b == "bottom") {
				this.label.setWidth("100%")
			} else {
				this.updateLabelWidth(this.getLabelWidth())
			}
		}
		if (c) {
			a.removeCls(d + "label-align-" + c)
		}
	},
	updateLabelCls : function (a, b) {
		if (a) {
			this.label.addCls(a)
		}
		if (b) {
			this.label.removeCls(b)
		}
	},
	updateLabelWidth : function (b) {
		var a = this.getLabelAlign();
		if (b) {
			if (a == "top" || a == "bottom") {
				this.label.setWidth("100%")
			} else {
				this.label.setWidth(b)
			}
		}
	},
	updateLabelWrap : function (b, c) {
		var a = Ext.baseCSSPrefix + "form-label-nowrap";
		if (!b) {
			this.addCls(a)
		} else {
			this.removeCls(a)
		}
	},
	updateRequired : function (a) {
		this.renderElement[a ? "addCls" : "removeCls"](this.getRequiredCls())
	},
	updateRequiredCls : function (a, b) {
		if (this.getRequired()) {
			this.renderElement.replaceCls(b, a)
		}
	},
	initialize : function () {
		var a = this;
		a.callParent();
		a.doInitValue()
	},
	doInitValue : function () {
		this.originalValue = this.getInitialConfig().value
	},
	reset : function () {
		this.setValue(this.originalValue);
		return this
	},
	isDirty : function () {
		return false
	}
}, function () {});
Ext.define("Ext.field.Text", {
	extend : "Ext.field.Field",
	xtype : "textfield",
	alternateClassName : "Ext.form.Text",
	config : {
		ui : "text",
		clearIcon : true,
		placeHolder : null,
		maxLength : null,
		autoComplete : null,
		autoCapitalize : null,
		autoCorrect : null,
		readOnly : null,
		component : {
			xtype : "input",
			type : "text"
		}
	},
	initialize : function () {
		var a = this;
		a.callParent();
		a.getComponent().on({
			scope : this,
			keyup : "onKeyUp",
			change : "onChange",
			focus : "onFocus",
			blur : "onBlur",
			paste : "onPaste",
			mousedown : "onMouseDown",
			clearicontap : "onClearIconTap"
		});
		a.originalValue = a.originalValue || "";
		a.getComponent().originalValue = a.originalValue;
		a.syncEmptyCls()
	},
	syncEmptyCls : function () {
		var b = (this._value) ? this._value.length : false,
		a = Ext.baseCSSPrefix + "empty";
		if (b) {
			this.removeCls(a)
		} else {
			this.addCls(a)
		}
	},
	updateValue : function (b) {
		var a = this.getComponent();
		if (a) {
			a.setValue(b)
		}
		this[b ? "showClearIcon" : "hideClearIcon"]();
		this.syncEmptyCls()
	},
	getValue : function () {
		var a = this;
		a._value = a.getComponent().getValue();
		a.syncEmptyCls();
		return a._value
	},
	updatePlaceHolder : function (a) {
		this.getComponent().setPlaceHolder(a)
	},
	updateMaxLength : function (a) {
		this.getComponent().setMaxLength(a)
	},
	updateAutoComplete : function (a) {
		this.getComponent().setAutoComplete(a)
	},
	updateAutoCapitalize : function (a) {
		this.getComponent().setAutoCapitalize(a)
	},
	updateAutoCorrect : function (a) {
		this.getComponent().setAutoCorrect(a)
	},
	updateReadOnly : function (a) {
		if (a) {
			this.hideClearIcon()
		} else {
			this.showClearIcon()
		}
		this.getComponent().setReadOnly(a)
	},
	updateInputType : function (a) {
		var b = this.getComponent();
		if (b) {
			b.setType(a)
		}
	},
	updateName : function (a) {
		var b = this.getComponent();
		if (b) {
			b.setName(a)
		}
	},
	updateTabIndex : function (b) {
		var a = this.getComponent();
		if (a) {
			a.setTabIndex(b)
		}
	},
	updateInputCls : function (a, b) {
		var c = this.getComponent();
		if (c) {
			c.replaceCls(b, a)
		}
	},
	doSetDisabled : function (b) {
		var c = this;
		c.callParent(arguments);
		var a = c.getComponent();
		if (a) {
			a.setDisabled(b)
		}
		if (b) {
			c.hideClearIcon()
		} else {
			c.showClearIcon()
		}
	},
	showClearIcon : function () {
		var a = this;
		if (!a.getDisabled() && !a.getReadOnly() && a.getValue() && a.getClearIcon()) {
			a.element.addCls(Ext.baseCSSPrefix + "field-clearable")
		}
		return a
	},
	hideClearIcon : function () {
		if (this.getClearIcon()) {
			this.element.removeCls(Ext.baseCSSPrefix + "field-clearable")
		}
	},
	onKeyUp : function (a) {
		this.fireAction("keyup", [this, a], "doKeyUp")
	},
	doKeyUp : function (a, c) {
		var b = a.getValue();
		a[b ? "showClearIcon" : "hideClearIcon"]();
		if (c.browserEvent.keyCode === 13) {
			a.fireAction("action", [a, c], "doAction")
		}
	},
	doAction : function () {
		this.blur()
	},
	onClearIconTap : function (a) {
		this.fireAction("clearicontap", [this, a], "doClearIconTap")
	},
	doClearIconTap : function (a, b) {
		a.setValue("");
		a.getValue()
	},
	onChange : function (b, c, a) {
		b.fireEvent("change", this, c, a)
	},
	onFocus : function (a) {
		this.isFocused = true;
		this.fireEvent("focus", this, a)
	},
	onBlur : function (b) {
		var a = this;
		this.isFocused = false;
		a.fireEvent("blur", a, b);
		setTimeout(function () {
			a.isFocused = false
		}, 50)
	},
	onPaste : function (a) {
		this.fireEvent("paste", this, a)
	},
	onMouseDown : function (a) {
		this.fireEvent("mousedown", this, a)
	},
	focus : function () {
		this.getComponent().focus();
		return this
	},
	blur : function () {
		this.getComponent().blur();
		return this
	},
	select : function () {
		this.getComponent().select();
		return this
	},
	reset : function () {
		this.getComponent().reset();
		this.getValue();
		this[this._value ? "showClearIcon" : "hideClearIcon"]()
	},
	isDirty : function () {
		var a = this.getComponent();
		if (a) {
			return a.isDirty()
		}
		return false
	}
});
Ext.define("Ext.field.Number", {
	extend : "Ext.field.Text",
	xtype : "numberfield",
	alternateClassName : "Ext.form.Number",
	config : {
		component : {
			type : "number"
		},
		ui : "number"
	},
	proxyConfig : {
		minValue : null,
		maxValue : null,
		stepValue : null
	},
	applyValue : function (b) {
		var a = this.getMinValue(),
		c = this.getMaxValue();
		if (Ext.isNumber(a)) {
			b = Math.max(b, a)
		}
		if (Ext.isNumber(c)) {
			b = Math.min(b, c)
		}
		b = parseFloat(b);
		return (isNaN(b)) ? "" : b
	},
	getValue : function () {
		var a = parseFloat(this.callParent(), 10);
		return (isNaN(a)) ? null : a
	},
	doClearIconTap : function (a, b) {
		a.getComponent().setValue("");
		a.getValue();
		a.hideClearIcon()
	}
});
Ext.define("Ext.Panel", {
	extend : "Ext.Container",
	requires : ["Ext.util.LineSegment"],
	alternateClassName : "Ext.lib.Panel",
	xtype : "panel",
	isPanel : true,
	config : {
		baseCls : Ext.baseCSSPrefix + "panel",
		bodyPadding : null,
		bodyMargin : null,
		bodyBorder : null
	},
	getElementConfig : function () {
		var a = this.callParent();
		a.children.push({
			reference : "tipElement",
			className : "x-anchor",
			hidden : true
		});
		return a
	},
	applyBodyPadding : function (a) {
		if (a === true) {
			a = 5
		}
		if (a) {
			a = Ext.dom.Element.unitizeBox(a)
		}
		return a
	},
	updateBodyPadding : function (a) {
		this.element.setStyle("padding", a)
	},
	applyBodyMargin : function (a) {
		if (a === true) {
			a = 5
		}
		if (a) {
			a = Ext.dom.Element.unitizeBox(a)
		}
		return a
	},
	updateBodyMargin : function (a) {
		this.element.setStyle("margin", a)
	},
	applyBodyBorder : function (a) {
		if (a === true) {
			a = 1
		}
		if (a) {
			a = Ext.dom.Element.unitizeBox(a)
		}
		return a
	},
	updateBodyBorder : function (a) {
		this.element.setStyle("border-width", a)
	},
	alignTo : function (m) {
		var w = this.tipElement;
		w.hide();
		if (this.currentTipPosition) {
			w.removeCls("x-anchor-" + this.currentTipPosition)
		}
		this.callParent(arguments);
		var f = Ext.util.LineSegment,
		d = m.isComponent ? m.renderElement : m,
		a = this.renderElement,
		n = d.getPageBox(),
		k = a.getPageBox(),
		b = k.left,
		t = k.top,
		C = k.right,
		h = k.bottom,
		j = b + (k.width / 2),
		i = t + (k.height / 2),
		o = {
			x : b,
			y : t
		},
		l = {
			x : C,
			y : t
		},
		B = {
			x : b,
			y : h
		},
		D = {
			x : C,
			y : h
		},
		y = {
			x : j,
			y : i
		},
		s = n.left + (n.width / 2),
		q = n.top + (n.height / 2),
		v = {
			x : s,
			y : q
		},
		c = new f(y, v),
		g = 0,
		A = 0,
		e,
		z,
		r,
		p,
		x,
		u;
		w.setVisibility(false);
		w.show();
		e = w.getSize();
		z = e.width;
		r = e.height;
		if (c.intersects(new f(o, l))) {
			x = Math.min(Math.max(s, b), C - (z / 2));
			u = t;
			A = r + 10;
			p = "top"
		} else {
			if (c.intersects(new f(o, B))) {
				x = b;
				u = Math.min(Math.max(q + (z / 2), t), h);
				g = r + 10;
				p = "left"
			} else {
				if (c.intersects(new f(B, D))) {
					x = Math.min(Math.max(s, b), C - (z / 2));
					u = h;
					A = -r - 10;
					p = "bottom"
				} else {
					if (c.intersects(new f(l, D))) {
						x = C;
						u = Math.min(Math.max(q - (z / 2), t), h);
						g = -r - 10;
						p = "right"
					}
				}
			}
		}
		if (x || u) {
			this.currentTipPosition = p;
			w.addCls("x-anchor-" + p);
			w.setLeft(x - b);
			w.setTop(u - t);
			w.setVisibility(true);
			this.setLeft(this.getLeft() + g);
			this.setTop(this.getTop() + A)
		}
	}
});
Ext.define("Ext.Sheet", {
	extend : "Ext.Panel",
	xtype : "sheet",
	requires : ["Ext.fx.Animation"],
	config : {
		baseCls : Ext.baseCSSPrefix + "sheet",
		modal : true,
		centered : true,
		stretchX : null,
		stretchY : null,
		enter : "bottom",
		exit : "bottom",
		showAnimation : !Ext.os.is.Android2 ? {
			type : "slideIn",
			duration : 250,
			easing : "ease-out"
		}
		 : null,
		hideAnimation : !Ext.os.is.Android2 ? {
			type : "slideOut",
			duration : 250,
			easing : "ease-in"
		}
		 : null
	},
	applyHideAnimation : function (b) {
		var a = this.getExit(),
		d = a;
		if (a === null) {
			return null
		}
		if (b === true) {
			b = {
				type : "slideOut"
			}
		}
		if (Ext.isString(b)) {
			b = {
				type : b
			}
		}
		var c = Ext.factory(b, Ext.fx.Animation);
		if (c) {
			if (a == "bottom") {
				d = "down"
			}
			if (a == "top") {
				d = "up"
			}
			c.setDirection(d)
		}
		return c
	},
	applyShowAnimation : function (a) {
		var d = this.getEnter(),
		c = d;
		if (d === null) {
			return null
		}
		if (a === true) {
			a = {
				type : "slideIn"
			}
		}
		if (Ext.isString(a)) {
			a = {
				type : a
			}
		}
		var b = Ext.factory(a, Ext.fx.Animation);
		if (b) {
			if (d == "bottom") {
				c = "down"
			}
			if (d == "top") {
				c = "up"
			}
			b.setBefore({
				display : null
			});
			b.setReverse(true);
			b.setDirection(c)
		}
		return b
	},
	updateStretchX : function (a) {
		this.getLeft();
		this.getRight();
		if (a) {
			this.setLeft(0);
			this.setRight(0)
		}
	},
	updateStretchY : function (a) {
		this.getTop();
		this.getBottom();
		if (a) {
			this.setTop(0);
			this.setBottom(0)
		}
	}
});
Ext.define("Ext.Toolbar", {
	extend : "Ext.Container",
	xtype : "toolbar",
	requires : ["Ext.Button", "Ext.Title", "Ext.Spacer"],
	isToolbar : true,
	config : {
		baseCls : Ext.baseCSSPrefix + "toolbar",
		ui : "dark",
		title : null,
		defaultType : "button",
		layout : {
			type : "hbox",
			align : "center"
		}
	},
	constructor : function (a) {
		a = a || {};
		if (a.docked == "left" || a.docked == "right") {
			a.layout = {
				type : "vbox",
				align : "stretch"
			}
		}
		this.callParent([a])
	},
	applyTitle : function (a) {
		if (typeof a == "string") {
			a = {
				title : a,
				centered : true
			}
		}
		return Ext.factory(a, Ext.Title, this.getTitle())
	},
	updateTitle : function (b, a) {
		if (b) {
			this.add(b);
			this.getLayout().setItemFlex(b, 1)
		}
		if (a) {
			a.destroy()
		}
	},
	showTitle : function () {
		var a = this.getTitle();
		if (a) {
			a.show()
		}
	},
	hideTitle : function () {
		var a = this.getTitle();
		if (a) {
			a.hide()
		}
	}
}, function () {});
Ext.define("Ext.util.Collection", {
	config : {
		autoFilter : true,
		autoSort : true
	},
	mixins : {
		sortable : "Ext.mixin.Sortable",
		filterable : "Ext.mixin.Filterable"
	},
	constructor : function (b, a) {
		var c = this;
		c.all = [];
		c.items = [];
		c.keys = [];
		c.indices = {};
		c.map = {};
		c.length = 0;
		if (b) {
			c.getKey = b
		}
		this.initConfig(a)
	},
	updateAutoSort : function (a, b) {
		if (b === false && a && this.items.length) {
			this.sort()
		}
	},
	updateAutoFilter : function (b, a) {
		if (a === false && b && this.all.length) {
			this.filter()
		}
	},
	insertSorters : function () {
		this.mixins.sortable.insertSorters.apply(this, arguments);
		if (this.getAutoSort() && this.items.length) {
			this.sort()
		}
		return this
	},
	removeSorters : function (a) {
		this.mixins.sortable.removeSorters.call(this, a);
		if (this.sorted && this.getAutoSort() && this.items.length) {
			this.sort()
		}
		return this
	},
	applyFilters : function (a) {
		var b = this.mixins.filterable.applyFilters.call(this, a);
		if (!a && this.all.length && this.getAutoFilter()) {
			this.filter()
		}
		return b
	},
	addFilters : function (a) {
		this.mixins.filterable.addFilters.call(this, a);
		if (this.items.length && this.getAutoFilter()) {
			this.filter()
		}
		return this
	},
	removeFilters : function (a) {
		this.mixins.filterable.removeFilters.call(this, a);
		if (this.filtered && this.all.length && this.getAutoFilter()) {
			this.filter()
		}
		return this
	},
	filter : function (c, b, d, a) {
		if (c) {
			if (Ext.isString(c)) {
				this.addFilters({
					property : c,
					value : b,
					anyMatch : d,
					caseSensitive : a
				});
				return this.items
			} else {
				this.addFilters(c);
				return this.items
			}
		}
		this.items = this.mixins.filterable.filter.call(this, this.all.slice());
		this.updateAfterFilter();
		if (this.sorted && this.getAutoSort()) {
			this.sort()
		}
	},
	updateAfterFilter : function () {
		var a = this.items,
		f = this.keys,
		g = this.indices = {},
		e = a.length,
		c,
		d,
		b;
		f.length = 0;
		for (c = 0; c < e; c++) {
			d = a[c];
			b = this.getKey(d);
			g[b] = c;
			f[c] = b
		}
		this.length = a.length;
		this.dirtyIndices = false
	},
	sort : function (e, a) {
		var d = this.items,
		h = this.keys,
		g = this.indices,
		c = d.length,
		b,
		j,
		f;
		if (e) {
			this.addSorters(e, a);
			return this.items
		}
		for (b = 0; b < c; b++) {
			d[b]._current_key = h[b]
		}
		this.handleSort(d);
		for (b = 0; b < c; b++) {
			j = d[b];
			f = j._current_key;
			h[b] = f;
			g[f] = b;
			delete j._current_key
		}
		this.dirtyIndices = true
	},
	handleSort : function (a) {
		this.mixins.sortable.sort.call(this, a)
	},
	add : function (i, k) {
		var g = this,
		d = this.filtered,
		e = this.sorted,
		h = this.all,
		f = this.items,
		l = this.keys,
		j = this.indices,
		a = this.mixins.filterable,
		b = f.length,
		c = b;
		if (arguments.length == 1) {
			k = i;
			i = g.getKey(k)
		}
		if (typeof i != "undefined" && i !== null) {
			if (typeof g.map[i] != "undefined") {
				return g.replace(i, k)
			}
			g.map[i] = k
		}
		h.push(k);
		if (d && this.getAutoFilter() && a.isFiltered.call(g, k)) {
			return null
		}
		g.length++;
		if (e && this.getAutoSort()) {
			c = this.findInsertionIndex(f, k)
		}
		if (c !== b) {
			this.dirtyIndices = true;
			Ext.Array.splice(l, c, 0, i);
			Ext.Array.splice(f, c, 0, k)
		} else {
			j[i] = b;
			l.push(i);
			f.push(k)
		}
		return k
	},
	getKey : function (a) {
		return a.id
	},
	replace : function (d, m) {
		var i = this,
		g = i.sorted,
		f = i.filtered,
		b = i.mixins.filterable,
		h = i.items,
		n = i.keys,
		k = i.all,
		c = i.map,
		l = null,
		a = h.length,
		o,
		e,
		j;
		if (arguments.length == 1) {
			m = d;
			d = j = i.getKey(m)
		} else {
			j = i.getKey(m)
		}
		o = c[d];
		if (typeof d == "undefined" || d === null || typeof o == "undefined") {
			return i.add(j, m)
		}
		i.map[j] = m;
		if (j !== d) {
			delete i.map[d]
		}
		if (g && i.getAutoSort()) {
			Ext.Array.remove(h, o);
			Ext.Array.remove(n, d);
			Ext.Array.remove(k, o);
			k.push(m);
			i.dirtyIndices = true;
			if (f && i.getAutoFilter()) {
				if (b.isFiltered.call(i, m)) {
					if (a !== h.length) {
						i.length--
					}
					return null
				} else {
					if (a === h.length) {
						i.length++;
						l = m
					}
				}
			}
			e = this.findInsertionIndex(h, m);
			Ext.Array.splice(n, e, 0, j);
			Ext.Array.splice(h, e, 0, m)
		} else {
			if (f) {
				if (i.getAutoFilter() && b.isFiltered.call(i, m)) {
					if (h.indexOf(o) !== -1) {
						Ext.Array.remove(h, o);
						Ext.Array.remove(n, d);
						i.length--;
						i.dirtyIndices = true
					}
					return null
				} else {
					if (h.indexOf(o) === -1) {
						h.push(m);
						n.push(j);
						i.indices[j] = i.length;
						i.length++;
						return m
					}
				}
			}
			e = i.items.indexOf(o);
			n[e] = j;
			h[e] = m;
			this.dirtyIndices = true
		}
		return l
	},
	addAll : function (h) {
		var q = this,
		e = q.filtered,
		a = q.sorted,
		b = q.all,
		k = q.items,
		j = q.keys,
		p = q.map,
		l = q.getAutoFilter(),
		m = q.getAutoSort(),
		r = [],
		f = [],
		c = q.mixins.filterable,
		d = [],
		g,
		s,
		n,
		o;
		if (Ext.isObject(h)) {
			for (s in h) {
				if (h.hasOwnProperty(s)) {
					f.push(k[s]);
					r.push(s)
				}
			}
		} else {
			f = h;
			g = h.length;
			for (n = 0; n < g; n++) {
				r.push(q.getKey(h[n]))
			}
		}
		for (n = 0; n < g; n++) {
			s = r[n];
			o = f[n];
			if (typeof s != "undefined" && s !== null) {
				if (typeof p[s] != "undefined") {
					q.replace(s, o);
					continue
				}
				p[s] = o
			}
			b.push(o);
			if (e && l && c.isFiltered.call(q, o)) {
				continue
			}
			q.length++;
			j.push(s);
			k.push(o);
			d.push(o)
		}
		if (d.length) {
			q.dirtyIndices = true;
			if (a && m) {
				q.sort()
			}
			return d
		}
		return null
	},
	each : function (e, d) {
		var b = this.items.slice(),
		c = 0,
		a = b.length,
		f;
		for (; c < a; c++) {
			f = b[c];
			if (e.call(d || f, f, c, a) === false) {
				break
			}
		}
	},
	eachKey : function (d, c) {
		var f = this.keys,
		a = this.items,
		e = f.length,
		b;
		for (b = 0; b < e; b++) {
			d.call(c || window, f[b], a[b], b, e)
		}
	},
	findBy : function (e, d) {
		var f = this.keys,
		b = this.items,
		c = 0,
		a = b.length;
		for (; c < a; c++) {
			if (e.call(d || window, b[c], f[c])) {
				return b[c]
			}
		}
		return null
	},
	filterBy : function (e, d) {
		var h = this,
		c = new this.self(),
		g = h.keys,
		a = h.all,
		f = a.length,
		b;
		c.getKey = h.getKey;
		for (b = 0; b < f; b++) {
			if (e.call(d || h, a[b], h.getKey(a[b]))) {
				c.add(g[b], a[b])
			}
		}
		return c
	},
	insert : function (c, d, f) {
		var e = this,
		a = this.sorted,
		g = this.map,
		b = this.filtered;
		if (arguments.length == 2) {
			f = d;
			d = e.getKey(f)
		}
		if (c >= e.length || (a && e.getAutoSort())) {
			return e.add(d, f)
		}
		if (typeof d != "undefined" && d !== null) {
			if (typeof g[d] != "undefined") {
				e.replace(d, f);
				return false
			}
			g[d] = f
		}
		this.all.push(f);
		if (b && this.getAutoFilter() && this.mixins.filterable.isFiltered.call(e, f)) {
			return null
		}
		e.length++;
		Ext.Array.splice(e.items, c, 0, f);
		Ext.Array.splice(e.keys, c, 0, d);
		e.dirtyIndices = true;
		return f
	},
	insertAll : function (g, d) {
		if (g >= this.items.length || (this.sorted && this.getAutoSort())) {
			return this.addAll(d)
		}
		var s = this,
		h = this.filtered,
		a = this.sorted,
		b = this.all,
		m = this.items,
		l = this.keys,
		r = this.map,
		n = this.getAutoFilter(),
		o = this.getAutoSort(),
		t = [],
		j = [],
		f = [],
		c = this.mixins.filterable,
		e = false,
		k,
		u,
		p,
		q;
		if (a && this.getAutoSort()) {}
		
		if (Ext.isObject(d)) {
			for (u in d) {
				if (d.hasOwnProperty(u)) {
					j.push(m[u]);
					t.push(u)
				}
			}
		} else {
			j = d;
			k = d.length;
			for (p = 0; p < k; p++) {
				t.push(s.getKey(d[p]))
			}
		}
		for (p = 0; p < k; p++) {
			u = t[p];
			q = j[p];
			if (typeof u != "undefined" && u !== null) {
				if (typeof r[u] != "undefined") {
					s.replace(u, q);
					continue
				}
				r[u] = q
			}
			b.push(q);
			if (h && n && c.isFiltered.call(s, q)) {
				continue
			}
			s.length++;
			Ext.Array.splice(m, g + p, 0, q);
			Ext.Array.splice(l, g + p, 0, u);
			e = true;
			f.push(q)
		}
		if (e) {
			this.dirtyIndices = true;
			if (a && o) {
				this.sort()
			}
			return f
		}
		return null
	},
	remove : function (b) {
		var a = this.items.indexOf(b);
		if (a === -1) {
			Ext.Array.remove(this.all, b);
			return b
		}
		return this.removeAt(this.items.indexOf(b))
	},
	removeAll : function (a) {
		if (a) {
			var c = a.length,
			b;
			for (b = 0; b < c; b++) {
				this.remove(a[b])
			}
		}
		return this
	},
	removeAt : function (b) {
		var g = this,
		a = g.items,
		f = g.keys,
		d = g.all,
		e,
		c;
		if (b < g.length && b >= 0) {
			e = a[b];
			c = f[b];
			if (typeof c != "undefined") {
				delete g.map[c]
			}
			Ext.Array.erase(a, b, 1);
			Ext.Array.erase(f, b, 1);
			Ext.Array.remove(d, e);
			delete g.indices[c];
			g.length--;
			this.dirtyIndices = true;
			return e
		}
		return false
	},
	removeAtKey : function (a) {
		return this.removeAt(this.indexOfKey(a))
	},
	getCount : function () {
		return this.length
	},
	indexOf : function (b) {
		if (this.dirtyIndices) {
			this.updateIndices()
		}
		var a = this.indices[this.getKey(b)];
		return (a === undefined) ? -1 : a
	},
	indexOfKey : function (b) {
		if (this.dirtyIndices) {
			this.updateIndices()
		}
		var a = this.indices[b];
		return (a === undefined) ? -1 : a
	},
	updateIndices : function () {
		var a = this.items,
		e = a.length,
		f = this.indices = {},
		c,
		d,
		b;
		for (c = 0; c < e; c++) {
			d = a[c];
			b = this.getKey(d);
			f[b] = c
		}
		this.dirtyIndices = false
	},
	get : function (b) {
		var d = this,
		a = d.map[b],
		c;
		if (a !== undefined) {
			c = a
		} else {
			if (typeof b == "number") {
				c = d.items[b]
			}
		}
		return typeof c != "function" || d.getAllowFunctions() ? c : null
	},
	getAt : function (a) {
		return this.items[a]
	},
	getByKey : function (a) {
		return this.map[a]
	},
	contains : function (b) {
		var a = this.getKey(b);
		if (a) {
			return this.containsKey(a)
		} else {
			return Ext.Array.contains(this.items, b)
		}
	},
	containsKey : function (a) {
		return typeof this.map[a] != "undefined"
	},
	clear : function () {
		var a = this;
		a.length = 0;
		a.items.length = 0;
		a.keys.length = 0;
		a.all.length = 0;
		a.dirtyIndices = true;
		a.indices = {};
		a.map = {}
		
	},
	first : function () {
		return this.items[0]
	},
	last : function () {
		return this.items[this.length - 1]
	},
	getRange : function (f, a) {
		var e = this,
		c = e.items,
		b = [],
		d;
		if (c.length < 1) {
			return b
		}
		f = f || 0;
		a = Math.min(typeof a == "undefined" ? e.length - 1 : a, e.length - 1);
		if (f <= a) {
			for (d = f; d <= a; d++) {
				b[b.length] = c[d]
			}
		} else {
			for (d = f; d >= a; d--) {
				b[b.length] = c[d]
			}
		}
		return b
	},
	findIndexBy : function (d, c, h) {
		var g = this,
		f = g.keys,
		a = g.items,
		b = h || 0,
		e = a.length;
		for (; b < e; b++) {
			if (d.call(c || g, a[b], f[b])) {
				return b
			}
		}
		return -1
	},
	clone : function () {
		var e = this,
		f = new this.self(),
		d = e.keys,
		a = e.items,
		b = 0,
		c = a.length;
		for (; b < c; b++) {
			f.add(d[b], a[b])
		}
		f.getKey = e.getKey;
		return f
	}
});
Ext.define("Ext.data.StoreManager", {
	extend : "Ext.util.Collection",
	alternateClassName : ["Ext.StoreMgr", "Ext.data.StoreMgr", "Ext.StoreManager"],
	singleton : true,
	uses : ["Ext.data.ArrayStore"],
	register : function () {
		for (var a = 0, b; (b = arguments[a]); a++) {
			this.add(b)
		}
	},
	unregister : function () {
		for (var a = 0, b; (b = arguments[a]); a++) {
			this.remove(this.lookup(b))
		}
	},
	lookup : function (c) {
		if (Ext.isArray(c)) {
			var b = ["field1"],
			e = !Ext.isArray(c[0]),
			f = c,
			d,
			a;
			if (e) {
				f = [];
				for (d = 0, a = c.length; d < a; ++d) {
					f.push([c[d]])
				}
			} else {
				for (d = 2, a = c[0].length; d <= a; ++d) {
					b.push("field" + d)
				}
			}
			return Ext.create("Ext.data.ArrayStore", {
				data : f,
				fields : b,
				autoDestroy : true,
				autoCreated : true,
				expanded : e
			})
		}
		if (Ext.isString(c)) {
			return this.get(c)
		} else {
			if (c instanceof Ext.data.Store) {
				return c
			} else {
				return Ext.factory(c, Ext.data.Store, null, "store")
			}
		}
	},
	getKey : function (a) {
		return a.getStoreId()
	}
}, function () {
	Ext.regStore = function (c, b) {
		var a;
		if (Ext.isObject(c)) {
			b = c
		} else {
			if (b instanceof Ext.data.Store) {
				b.setStoreId(c)
			} else {
				b.storeId = c
			}
		}
		if (b instanceof Ext.data.Store) {
			a = b
		} else {
			a = Ext.create("Ext.data.Store", b)
		}
		return Ext.data.StoreManager.register(a)
	};
	Ext.getStore = function (a) {
		return Ext.data.StoreManager.lookup(a)
	}
});
Ext.define("Ext.dataview.element.List", {
	extend : "Ext.dataview.element.Container",
	updateBaseCls : function (a) {
		var b = this;
		b.itemClsShortCache = a + "-item";
		b.headerClsShortCache = a + "-header";
		b.headerClsCache = "." + b.headerClsShortCache;
		b.headerItemClsShortCache = a + "-header-item";
		b.footerClsShortCache = a + "-footer-item";
		b.footerClsCache = "." + b.footerClsShortCache;
		b.labelClsShortCache = a + "-item-label";
		b.labelClsCache = "." + b.labelClsShortCache;
		b.disclosureClsShortCache = a + "-disclosure";
		b.disclosureClsCache = "." + b.disclosureClsShortCache;
		b.iconClsShortCache = a + "-icon";
		b.iconClsCache = "." + b.iconClsShortCache;
		this.callParent(arguments)
	},
	hiddenDisplayCache : Ext.baseCSSPrefix + "hidden-display",
	getItemElementConfig : function (e, h) {
		var f = this,
		c = f.dataview,
		g = c.getItemCls(),
		b = f.itemClsShortCache,
		d,
		a;
		if (g) {
			b += " " + g
		}
		d = {
			cls : b,
			children : [{
					cls : f.labelClsShortCache,
					html : c.getItemTpl().apply(h)
				}
			]
		};
		if (c.getIcon()) {
			a = h.iconSrc;
			d.children.push({
				cls : f.iconClsShortCache,
				style : "background-image: " + a ? 'url("' + newSrc + '")' : ""
			})
		}
		if (c.getOnItemDisclosure()) {
			d.children.push({
				cls : f.disclosureClsShortCache + " " + ((h[c.getDisclosureProperty()] === false) ? f.hiddenDisplayCache : "")
			})
		}
		return d
	},
	updateListItem : function (d, k) {
		var h = this,
		e = h.dataview,
		j = Ext.fly(k),
		g = j.down(h.labelClsCache, true),
		c = e.prepareData(d.getData(true), e.getStore().indexOf(d), d),
		b = e.getDisclosureProperty(),
		a = c && c.hasOwnProperty(b),
		l = c && c.hasOwnProperty("iconSrc"),
		f,
		i;
		g.innerHTML = e.getItemTpl().apply(c);
		if (a) {
			f = j.down(h.disclosureClsCache);
			f[c[b] === false ? "removeCls" : "addCls"](h.hiddenDisplayCache)
		}
		if (e.getIcon()) {
			i = j.down(h.iconClsCache, true);
			i.style.backgroundImage = l ? 'url("' + l + '")' : ""
		}
	},
	doRemoveHeaders : function () {
		var e = this,
		a = e.headerItemClsShortCache,
		b = e.element.query(e.headerClsCache),
		f = b.length,
		c = 0,
		d;
		for (; c < f; c++) {
			d = b[c];
			Ext.fly(d.parentNode).removeCls(a);
			Ext.removeNode(d)
		}
	},
	doRemoveFooterCls : function () {
		var d = this,
		c = d.footerClsShortCache,
		a = d.element.query(d.footerClsCache),
		e = a.length,
		b = 0;
		for (; b < e; b++) {
			Ext.fly(a[b]).removeCls(c)
		}
	},
	doAddHeader : function (b, a) {
		b = Ext.fly(b);
		if (a) {
			b.insertFirst(Ext.Element.create({
					cls : this.headerClsShortCache,
					html : a
				}))
		}
		b.addCls(this.headerItemClsShortCache)
	},
	destroy : function () {
		this.doRemoveHeaders();
		this.callParent()
	}
});
Ext.define("Ext.data.Errors", {
	extend : "Ext.util.Collection",
	requires : "Ext.data.Error",
	isValid : function () {
		return this.length === 0
	},
	getByField : function (d) {
		var c = [],
		a,
		b;
		for (b = 0; b < this.length; b++) {
			a = this.items[b];
			if (a.getField() == d) {
				c.push(a)
			}
		}
		return c
	},
	add : function () {
		var a = arguments.length == 1 ? arguments[0] : arguments[1];
		if (!(a instanceof Ext.data.Error)) {
			a = Ext.create("Ext.data.Error", {
					field : a.field || a.name,
					message : a.error || a.message
				})
		}
		return this.callParent([a])
	}
});
Ext.define("Ext.dataview.component.Container", {
	extend : "Ext.Container",
	requires : ["Ext.dataview.component.DataItem"],
	constructor : function () {
		this.itemCache = [];
		this.callParent(arguments)
	},
	doInitialize : function () {
		this.innerElement.on({
			touchstart : "onItemTouchStart",
			touchend : "onItemTouchEnd",
			tap : "onItemTap",
			taphold : "onItemTapHold",
			touchmove : "onItemTouchMove",
			singletap : "onItemSingleTap",
			doubletap : "onItemDoubleTap",
			swipe : "onItemSwipe",
			delegate : "> ." + Ext.baseCSSPrefix + "data-item",
			scope : this
		})
	},
	initialize : function () {
		this.callParent();
		this.doInitialize()
	},
	onItemTouchStart : function (d) {
		var b = this,
		c = d.getTarget(),
		a = Ext.getCmp(c.id);
		a.on({
			touchmove : "onItemTouchMove",
			scope : b,
			single : true
		});
		b.fireEvent("itemtouchstart", b, a, b.indexOf(a), d)
	},
	onItemTouchMove : function (d) {
		var b = this,
		c = d.getTarget(),
		a = Ext.getCmp(c.id);
		b.fireEvent("itemtouchmove", b, a, b.indexOf(a), d)
	},
	onItemTouchEnd : function (d) {
		var b = this,
		c = d.getTarget(),
		a = Ext.getCmp(c.id);
		a.un({
			touchmove : "onItemTouchMove",
			scope : b
		});
		b.fireEvent("itemtouchend", b, a, b.indexOf(a), d)
	},
	onItemTap : function (d) {
		var b = this,
		c = d.getTarget(),
		a = Ext.getCmp(c.id);
		b.fireEvent("itemtap", b, a, b.indexOf(a), d)
	},
	onItemTapHold : function (d) {
		var b = this,
		c = d.getTarget(),
		a = Ext.getCmp(c.id);
		b.fireEvent("itemtaphold", b, a, b.indexOf(a), d)
	},
	onItemSingleTap : function (d) {
		var b = this,
		c = d.getTarget(),
		a = Ext.getCmp(c.id);
		b.fireEvent("itemsingletap", b, a, b.indexOf(a), d)
	},
	onItemDoubleTap : function (d) {
		var b = this,
		c = d.getTarget(),
		a = Ext.getCmp(c.id);
		b.fireEvent("itemdoubletap", b, a, b.indexOf(a), d)
	},
	onItemSwipe : function (d) {
		var b = this,
		c = d.getTarget(),
		a = Ext.getCmp(c.id);
		b.fireEvent("itemswipe", b, a, b.indexOf(a), d)
	},
	moveItemsToCache : function (j, k) {
		var h = this,
		c = h.dataview,
		a = c.getMaxItemCache(),
		g = h.getViewItems(),
		f = h.itemCache,
		e = f.length,
		l = c.getPressedCls(),
		d = c.getSelectedCls(),
		b = k - j,
		m;
		for (; b >= 0; b--) {
			m = g[j + b];
			if (e !== a) {
				h.remove(m, false);
				m.removeCls([l, d]);
				f.push(m);
				e++
			} else {
				m.destroy()
			}
		}
		if (h.getViewItems().length == 0) {
			this.dataview.showEmptyText()
		}
	},
	moveItemsFromCache : function (b) {
		var l = this,
		e = l.dataview,
		m = e.getStore(),
		k = b.length,
		a = e.getDefaultType(),
		h = e.getItemConfig(),
		g = l.itemCache,
		f = g.length,
		j = [],
		c,
		n,
		d;
		if (k) {
			e.hideEmptyText()
		}
		for (c = 0; c < k; c++) {
			b[c]._tmpIndex = m.indexOf(b[c])
		}
		Ext.Array.sort(b, function (o, i) {
			return o._tmpIndex > i._tmpIndex ? 1 : -1
		});
		for (c = 0; c < k; c++) {
			d = b[c];
			if (f) {
				f--;
				n = g.pop();
				this.updateListItem(d, n)
			} else {
				n = l.getDataItemConfig(a, d, h)
			}
			this.insert(d._tmpIndex, n);
			delete d._tmpIndex
		}
		return j
	},
	getViewItems : function () {
		return this.getInnerItems()
	},
	updateListItem : function (a, b) {
		if (b.updateRecord) {
			b.updateRecord(a)
		}
	},
	getDataItemConfig : function (e, b, c) {
		var a = this.dataview,
		d = {
			xtype : e,
			record : b,
			dataview : a,
			itemCls : a.getItemCls(),
			defaults : c
		};
		return Ext.merge(d, c)
	},
	doRemoveItemCls : function (a) {
		var b = this.getViewItems(),
		d = b.length,
		c = 0;
		for (; c < d; c++) {
			b[c].removeCls(a)
		}
	},
	doAddItemCls : function (a) {
		var b = this.getViewItems(),
		d = b.length,
		c = 0;
		for (; c < d; c++) {
			b[c].addCls(a)
		}
	},
	destroy : function () {
		var d = this,
		b = d.itemCache,
		c = b.length,
		a = 0;
		for (; a < c; a++) {
			b[a].destroy()
		}
		this.callParent()
	}
});
Ext.define("Ext.dataview.DataView", {
	extend : "Ext.Container",
	alternateClassName : "Ext.DataView",
	mixins : ["Ext.mixin.Selectable"],
	xtype : "dataview",
	requires : ["Ext.LoadMask", "Ext.data.StoreManager", "Ext.dataview.component.Container", "Ext.dataview.element.Container"],
	config : {
		store : null,
		baseCls : Ext.baseCSSPrefix + "dataview",
		emptyText : null,
		deferEmptyText : true,
		itemTpl : "<div>{text}</div>",
		pressedCls : "x-item-pressed",
		itemCls : null,
		selectedCls : "x-item-selected",
		triggerEvent : "itemtap",
		triggerCtEvent : "tap",
		deselectOnContainerClick : true,
		scrollable : true,
		inline : null,
		pressedDelay : 100,
		loadingText : "Loading...",
		useComponents : null,
		itemConfig : {},
		maxItemCache : 20,
		defaultType : "dataitem",
		scrollToTopOnRefresh : true
	},
	constructor : function (a) {
		var b = this;
		b.hasLoadedStore = false;
		b.mixins.selectable.constructor.apply(b, arguments);
		b.callParent(arguments)
	},
	updateItemCls : function (c, b) {
		var a = this.container;
		if (a) {
			if (b) {
				a.doRemoveItemCls(b)
			}
			if (c) {
				a.doAddItemCls(c)
			}
		}
	},
	storeEventHooks : {
		beforeload : "onBeforeLoad",
		load : "onLoad",
		refresh : "refresh",
		addrecords : "onStoreAdd",
		removerecords : "onStoreRemove",
		updaterecord : "onStoreUpdate"
	},
	initialize : function () {
		this.callParent();
		var b = this,
		a;
		b.on(b.getTriggerCtEvent(), b.onContainerTrigger, b);
		a = b.container = this.add(new Ext.dataview[b.getUseComponents() ? "component" : "element"].Container({
					baseCls : this.getBaseCls()
				}));
		a.dataview = b;
		b.on(b.getTriggerEvent(), b.onItemTrigger, b);
		a.on({
			itemtouchstart : "onItemTouchStart",
			itemtouchend : "onItemTouchEnd",
			itemtap : "onItemTap",
			itemtaphold : "onItemTapHold",
			itemtouchmove : "onItemTouchMove",
			itemsingletap : "onItemSingleTap",
			itemdoubletap : "onItemDoubleTap",
			itemswipe : "onItemSwipe",
			scope : b
		});
		if (this.getStore()) {
			this.refresh()
		}
	},
	applyInline : function (a) {
		if (Ext.isObject(a)) {
			a = Ext.apply({}, a)
		}
		return a
	},
	updateInline : function (c, b) {
		var a = this.getBaseCls();
		if (b) {
			this.removeCls([a + "-inlineblock", a + "-nowrap"])
		}
		if (c) {
			this.addCls(a + "-inlineblock");
			if (Ext.isObject(c) && c.wrap === false) {
				this.addCls(a + "-nowrap")
			} else {
				this.removeCls(a + "-nowrap")
			}
		}
	},
	prepareData : function (c, b, a) {
		c.xindex = b + 1;
		return c
	},
	onContainerTrigger : function (b) {
		var a = this;
		if (b.target != a.element.dom) {
			return
		}
		if (a.getDeselectOnContainerClick() && a.getStore()) {
			a.deselectAll()
		}
	},
	onItemTrigger : function (b, a) {
		this.selectWithEvent(this.getStore().getAt(a))
	},
	doAddPressedCls : function (a) {
		var c = this,
		b = c.container.getViewItems()[c.getStore().indexOf(a)];
		if (Ext.isElement(b)) {
			b = Ext.get(b)
		}
		if (b) {
			b.addCls(c.getPressedCls())
		}
	},
	onItemTouchStart : function (b, h, d, g) {
		var f = this,
		c = f.getStore(),
		a = c && c.getAt(d);
		f.fireAction("itemtouchstart", [f, d, h, a, g], "doItemTouchStart")
	},
	doItemTouchStart : function (c, b, e, a) {
		var d = c.getPressedDelay();
		if (a) {
			if (d > 0) {
				c.pressedTimeout = Ext.defer(c.doAddPressedCls, d, c, [a])
			} else {
				c.doAddPressedCls(a)
			}
		}
	},
	onItemTouchEnd : function (b, h, d, g) {
		var f = this,
		c = f.getStore(),
		a = c && c.getAt(d);
		if (this.hasOwnProperty("pressedTimeout")) {
			clearTimeout(this.pressedTimeout);
			delete this.pressedTimeout
		}
		if (a && h) {
			h.removeCls(f.getPressedCls())
		}
		f.fireEvent("itemtouchend", f, d, h, a, g)
	},
	onItemTouchMove : function (b, h, d, g) {
		var f = this,
		c = f.getStore(),
		a = c && c.getAt(d);
		if (f.hasOwnProperty("pressedTimeout")) {
			clearTimeout(f.pressedTimeout);
			delete f.pressedTimeout
		}
		if (a && h) {
			h.removeCls(f.getPressedCls())
		}
		f.fireEvent("itemtouchmove", f, d, h, a, g)
	},
	onItemTap : function (b, h, d, g) {
		var f = this,
		c = f.getStore(),
		a = c && c.getAt(d);
		f.fireEvent("itemtap", f, d, h, a, g)
	},
	onItemTapHold : function (b, h, d, g) {
		var f = this,
		c = f.getStore(),
		a = c && c.getAt(d);
		f.fireEvent("itemtaphold", f, d, h, a, g)
	},
	onItemSingleTap : function (b, h, d, g) {
		var f = this,
		c = f.getStore(),
		a = c && c.getAt(d);
		f.fireEvent("itemsingletap", f, d, h, a, g)
	},
	onItemDoubleTap : function (b, h, d, g) {
		var f = this,
		c = f.getStore(),
		a = c && c.getAt(d);
		f.fireEvent("itemdoubletap", f, d, h, a, g)
	},
	onItemSwipe : function (b, h, d, g) {
		var f = this,
		c = f.getStore(),
		a = c && c.getAt(d);
		f.fireEvent("itemswipe", f, d, h, a, g)
	},
	onItemSelect : function (a, b) {
		var c = this;
		if (b) {
			c.doItemSelect(c, a)
		} else {
			c.fireAction("select", [c, a], "doItemSelect")
		}
	},
	doItemSelect : function (c, a) {
		if (c.container && !c.isDestroyed) {
			var b = c.container.getViewItems()[c.getStore().indexOf(a)];
			if (Ext.isElement(b)) {
				b = Ext.get(b)
			}
			if (b) {
				b.removeCls(c.getPressedCls());
				b.addCls(c.getSelectedCls())
			}
		}
	},
	onItemDeselect : function (a, b) {
		var c = this;
		if (c.container && !c.isDestroyed) {
			if (b) {
				c.doItemDeselect(c, a)
			} else {
				c.fireAction("deselect", [c, a, b], "doItemDeselect")
			}
		}
	},
	doItemDeselect : function (c, a) {
		var b = c.container.getViewItems()[c.getStore().indexOf(a)];
		if (Ext.isElement(b)) {
			b = Ext.get(b)
		}
		if (b) {
			b.removeCls([c.getPressedCls(), c.getSelectedCls()])
		}
	},
	updateData : function (b) {
		var a = this.getStore();
		if (!a) {
			this.setStore(Ext.create("Ext.data.Store", {
					data : b
				}))
		} else {
			a.add(b)
		}
	},
	applyStore : function (b) {
		var d = this,
		e = Ext.apply({}, d.storeEventHooks, {
				scope : d
			}),
		c,
		a;
		if (b) {
			b = Ext.data.StoreManager.lookup(b);
			if (b && Ext.isObject(b) && b.isStore) {
				b.on(e);
				c = b.getProxy();
				if (c) {
					a = c.getReader();
					if (a) {
						a.on("exception", "handleException", this)
					}
				}
			}
		}
		return b
	},
	handleException : function () {
		this.setMasked(false)
	},
	updateStore : function (b, e) {
		var d = this,
		f = Ext.apply({}, d.storeEventHooks, {
				scope : d
			}),
		c,
		a;
		if (e && Ext.isObject(e) && e.isStore) {
			if (e.autoDestroy) {
				e.destroy()
			} else {
				e.un(f);
				c = e.getProxy();
				if (c) {
					a = c.getReader();
					if (a) {
						a.un("exception", "handleException", this)
					}
				}
			}
		}
		if (b) {
			if (b.isLoaded()) {
				this.hasLoadedStore = true
			}
			if (b.isLoading()) {
				d.onBeforeLoad()
			}
			if (d.container) {
				d.refresh()
			}
		}
	},
	onBeforeLoad : function () {
		var b = this.getScrollable();
		if (b) {
			b.getScroller().stopAnimation()
		}
		var a = this.getLoadingText();
		if (a) {
			this.setMasked({
				xtype : "loadmask",
				message : a
			});
			if (b) {
				b.getScroller().setDisabled(true)
			}
		}
		this.hideEmptyText()
	},
	updateEmptyText : function (c, d) {
		var b = this,
		a;
		if (d && b.emptyTextCmp) {
			b.remove(b.emptyTextCmp, true);
			delete b.emptyTextCmp
		}
		if (c) {
			b.emptyTextCmp = b.add({
					xtype : "component",
					cls : b.getBaseCls() + "-emptytext",
					html : c,
					hidden : true
				});
			a = b.getStore();
			if (a && b.hasLoadedStore && !a.getCount()) {
				this.showEmptyText()
			}
		}
	},
	onLoad : function (a) {
		var b = this.getScrollable();
		this.hasLoadedStore = true;
		this.setMasked(false);
		if (b) {
			b.getScroller().setDisabled(false)
		}
		if (!a.getCount()) {
			this.showEmptyText()
		}
	},
	refresh : function () {
		var b = this,
		a = b.container;
		if (!b.getStore()) {
			if (!b.hasLoadedStore && !b.getDeferEmptyText()) {
				b.showEmptyText()
			}
			return
		}
		if (a) {
			b.fireAction("refresh", [b], "doRefresh")
		}
	},
	applyItemTpl : function (a) {
		return (Ext.isObject(a) && a.isTemplate) ? a : new Ext.XTemplate(a)
	},
	onAfterRender : function () {
		var a = this;
		a.callParent(arguments);
		a.updateStore(a.getStore())
	},
	getViewItems : function () {
		return this.container.getViewItems()
	},
	doRefresh : function (f) {
		var a = f.container,
		j = f.getStore(),
		b = j.getRange(),
		e = a.getViewItems(),
		h = b.length,
		l = e.length,
		c = h - l,
		g = f.getScrollable(),
		d,
		k;
		if (this.getScrollToTopOnRefresh() && g) {
			g.getScroller().scrollToTop()
		}
		if (h < 1) {
			f.onStoreClear();
			return
		}
		if (c < 0) {
			a.moveItemsToCache(l + c, l - 1);
			e = a.getViewItems();
			l = e.length
		} else {
			if (c > 0) {
				a.moveItemsFromCache(j.getRange(l))
			}
		}
		for (d = 0; d < l; d++) {
			k = e[d];
			a.updateListItem(b[d], k)
		}
	},
	showEmptyText : function () {
		if (this.getEmptyText() && (this.hasLoadedStore || !this.getDeferEmptyText())) {
			this.emptyTextCmp.show()
		}
	},
	hideEmptyText : function () {
		if (this.getEmptyText()) {
			this.emptyTextCmp.hide()
		}
	},
	onStoreClear : function () {
		var c = this,
		a = c.container,
		b = a.getViewItems();
		a.moveItemsToCache(0, b.length - 1);
		this.showEmptyText()
	},
	onStoreAdd : function (b, a) {
		if (a) {
			this.container.moveItemsFromCache(a)
		}
	},
	onStoreRemove : function (c, b, f) {
		var a = this.container,
		e = b.length,
		d;
		for (d = 0; d < e; d++) {
			a.moveItemsToCache(f[d], f[d])
		}
	},
	onStoreUpdate : function (c, b, d, f) {
		var e = this,
		a = e.container;
		f = (typeof f === "undefined") ? d : f;
		if (f !== d) {
			a.moveItemsToCache(f, f);
			a.moveItemsFromCache([b]);
			if (e.isSelected(b)) {
				e.doItemSelect(e, b)
			}
		} else {
			a.updateListItem(b, a.getViewItems()[d])
		}
	}
});
Ext.define("Ext.dataview.List", {
	alternateClassName : "Ext.List",
	extend : "Ext.dataview.DataView",
	xtype : "list",
	requires : ["Ext.dataview.element.List", "Ext.dataview.IndexBar", "Ext.dataview.ListItemHeader"],
	config : {
		indexBar : false,
		icon : null,
		preventSelectionOnDisclose : true,
		baseCls : Ext.baseCSSPrefix + "list",
		pinHeaders : true,
		grouped : false,
		onItemDisclosure : null,
		disclosureProperty : "disclosure",
		ui : "normal"
	},
	constructor : function () {
		this.translateHeader = (Ext.os.is.Android2) ? this.translateHeaderCssPosition : this.translateHeaderTransform;
		this.callParent(arguments)
	},
	onItemTrigger : function (c, b, f, a, d) {
		if (!(this.getPreventSelectionOnDisclose() && Ext.fly(d.target).hasCls(this.getBaseCls() + "-disclosure"))) {
			this.callParent(arguments)
		}
	},
	initialize : function () {
		var b = this,
		a;
		b.on(b.getTriggerCtEvent(), b.onContainerTrigger, b);
		a = b.container = this.add(new Ext.dataview.element.List({
					baseCls : this.getBaseCls()
				}));
		a.dataview = b;
		b.on(b.getTriggerEvent(), b.onItemTrigger, b);
		a.element.on({
			delegate : "." + this.getBaseCls() + "-disclosure",
			tap : "handleItemDisclosure",
			scope : b
		});
		a.on({
			itemtouchstart : "onItemTouchStart",
			itemtouchend : "onItemTouchEnd",
			itemtap : "onItemTap",
			itemtaphold : "onItemTapHold",
			itemtouchmove : "onItemTouchMove",
			itemsingletap : "onItemSingleTap",
			itemdoubletap : "onItemDoubleTap",
			itemswipe : "onItemSwipe",
			scope : b
		});
		if (this.getStore()) {
			this.refresh()
		}
	},
	updateInline : function (a) {
		this.callParent(arguments);
		if (a) {
			this.setOnItemDisclosure(false);
			this.setIndexBar(false);
			this.setGrouped(false)
		}
	},
	applyIndexBar : function (a) {
		return Ext.factory(a, Ext.dataview.IndexBar, this.getIndexBar())
	},
	updateIndexBar : function (a) {
		if (a && this.getScrollable()) {
			this.indexBarElement = this.getScrollableBehavior().getScrollView().getElement().appendChild(a.renderElement);
			a.on({
				index : "onIndex",
				scope : this
			});
			this.element.addCls(this.getBaseCls() + "-indexed")
		}
	},
	updateGrouped : function (c) {
		var b = this.getBaseCls(),
		a = b + "-grouped",
		d = b + "-ungrouped";
		if (c) {
			this.addCls(a);
			this.removeCls(d);
			this.doRefreshHeaders();
			this.updatePinHeaders(this.getPinHeaders())
		} else {
			this.addCls(d);
			this.removeCls(a);
			if (this.container) {
				this.container.doRemoveHeaders()
			}
			this.updatePinHeaders(null)
		}
	},
	updatePinHeaders : function (b) {
		var c = this.getScrollable(),
		a;
		if (c) {
			a = c.getScroller()
		}
		if (!c) {
			return
		}
		if (b && this.getGrouped()) {
			a.on({
				refresh : "doRefreshHeaders",
				scroll : "onScroll",
				scope : this
			});
			if (!this.header || !this.header.renderElement.dom) {
				this.createHeader()
			}
		} else {
			a.un({
				refresh : "doRefreshHeaders",
				scroll : "onScroll",
				scope : this
			});
			if (this.header) {
				this.header.destroy()
			}
		}
	},
	createHeader : function () {
		var e,
		d = this.getScrollable(),
		a,
		b,
		c;
		if (d) {
			a = d.getScroller();
			b = this.getScrollableBehavior().getScrollView();
			c = b.getElement()
		} else {
			return
		}
		this.header = e = Ext.create("Ext.dataview.ListItemHeader", {
				html : " ",
				cls : "x-list-header-swap"
			});
		c.dom.insertBefore(e.element.dom, a.getContainer().dom.nextSibling);
		this.translateHeader(1000)
	},
	refresh : function () {
		this.callParent();
		this.doRefreshHeaders()
	},
	onStoreAdd : function () {
		this.callParent(arguments);
		this.doRefreshHeaders()
	},
	onStoreRemove : function () {
		this.callParent(arguments);
		this.doRefreshHeaders()
	},
	onStoreUpdate : function () {
		this.callParent(arguments);
		this.doRefreshHeaders()
	},
	onStoreClear : function () {
		this.callParent();
		if (this.header) {
			this.header.destroy()
		}
		this.doRefreshHeaders()
	},
	getClosestGroups : function () {
		var a = this.pinHeaderInfo.offsets,
		e = this.getScrollable(),
		d = a.length,
		b = 0,
		h,
		g,
		f,
		c;
		if (e) {
			h = e.getScroller().position
		} else {
			return {
				current : 0,
				next : 0
			}
		}
		for (; b < d; b++) {
			g = a[b];
			if (g.offset > h.y) {
				c = g;
				break
			}
			f = g
		}
		return {
			current : f,
			next : c
		}
	},
	doRefreshHeaders : function () {
		if (!this.getGrouped() || !this.container) {
			return false
		}
		var l = this.findGroupHeaderIndices(),
		f = l.length,
		g = this.container.getViewItems(),
		j = this.pinHeaderInfo = {
			offsets : []
		},
		a = j.offsets,
		h = this.getScrollable(),
		e,
		k,
		b,
		d,
		c;
		if (f) {
			for (b = 0; b < f; b++) {
				d = g[l[b]];
				if (d) {
					c = this.getItemHeader(d);
					a.push({
						header : c,
						offset : d.offsetTop
					})
				}
			}
			j.closest = this.getClosestGroups();
			this.setActiveGroup(j.closest.current);
			if (c) {
				j.headerHeight = Ext.fly(c).getHeight()
			}
			if (h) {
				e = h.getScroller();
				k = e.position;
				this.onScroll(e, k.x, k.y)
			}
		}
	},
	getItemHeader : function (b) {
		var a = Ext.fly(b).down(this.container.headerClsCache);
		return a ? a.dom : null
	},
	onScroll : function (e, j, h) {
		var g = this,
		i = g.pinHeaderInfo,
		a = i.closest,
		b = g.activeGroup,
		c = i.headerHeight,
		d,
		f;
		if (!a) {
			return
		}
		d = a.next;
		f = a.current;
		if (!this.header || !this.header.renderElement.dom) {
			this.createHeader()
		}
		if (h <= 0) {
			if (b) {
				g.setActiveGroup(false);
				a.next = f
			}
			this.translateHeader(1000);
			return
		} else {
			if ((d && h > d.offset) || (f && h < f.offset)) {
				a = i.closest = this.getClosestGroups();
				d = a.next;
				f = a.current;
				this.setActiveGroup(f)
			}
		}
		if (d && h > 0 && d.offset - h <= c) {
			var k = c - (d.offset - h);
			this.translateHeader(k)
		} else {
			this.translateHeader(null)
		}
	},
	translateHeaderTransform : function (a) {
		this.header.renderElement.dom.style.webkitTransform = (a === null) ? null : "translate3d(0px, -" + a + "px, 0px)"
	},
	translateHeaderCssPosition : function (a) {
		this.header.renderElement.dom.style.top = (a === null) ? null : "-" + Math.round(a) + "px"
	},
	setActiveGroup : function (b) {
		var a = this,
		c = a.header;
		if (c) {
			if (b && b.header) {
				if (!a.activeGroup || a.activeGroup.header != b.header) {
					c.show();
					if (c.element) {
						c.setHtml(b.header.innerHTML)
					}
				}
			} else {
				if (c && c.element) {
					c.hide()
				}
			}
		}
		this.activeGroup = b
	},
	onIndex : function (o, c) {
		var r = this,
		s = c.toLowerCase(),
		b = r.getStore(),
		q = b.getGroups(),
		f = q.length,
		h = r.getScrollable(),
		n,
		e,
		m,
		g,
		k,
		p;
		if (h) {
			n = r.getScrollable().getScroller()
		} else {
			return
		}
		for (m = 0; m < f; m++) {
			e = q[m];
			k = e.name.toLowerCase();
			if (k == s || k > s) {
				g = e;
				break
			} else {
				g = e
			}
		}
		if (h && g) {
			p = r.container.getViewItems()[b.indexOf(g.children[0])];
			n.stopAnimation();
			var l = n.getContainerSize().y,
			j = n.getSize().y,
			d = j - l,
			a = (p.offsetTop > d) ? d : p.offsetTop;
			n.scrollTo(0, a)
		}
	},
	applyOnItemDisclosure : function (a) {
		if (Ext.isFunction(a)) {
			return {
				scope : this,
				handler : a
			}
		}
		return a
	},
	handleItemDisclosure : function (f) {
		var d = this,
		c = f.getTarget().parentNode,
		b = d.container.getViewItems().indexOf(c),
		a = d.getStore().getAt(b);
		d.fireAction("disclose", [d, a, c, b, f], "doDisclose")
	},
	doDisclose : function (f, a, d, c, g) {
		var b = f.getOnItemDisclosure();
		if (b && b.handler) {
			b.handler.call(b.scope || f, a, d, c, g)
		}
	},
	findGroupHeaderIndices : function () {
		if (!this.getGrouped()) {
			return []
		}
		var h = this,
		k = h.getStore();
		if (!k) {
			return []
		}
		var b = h.container,
		d = k.getGroups(),
		m = d.length,
		g = b.getViewItems(),
		c = [],
		l = b.footerClsShortCache,
		e,
		a,
		f,
		n,
		j;
		b.doRemoveHeaders();
		b.doRemoveFooterCls();
		if (g.length) {
			for (e = 0; e < m; e++) {
				a = d[e].children[0];
				f = k.indexOf(a);
				n = g[f];
				b.doAddHeader(n, k.getGroupString(a));
				if (e) {
					Ext.fly(n.previousSibling).addCls(l)
				}
				c.push(f)
			}
			j = d[--e].children;
			Ext.fly(g[k.indexOf(j[j.length - 1])]).addCls(l)
		}
		return c
	},
	destroy : function () {
		Ext.destroy(this.getIndexBar(), this.indexBarElement, this.header);
		this.callParent()
	}
});
Ext.define("Ext.data.Types", {
	singleton : true,
	requires : ["Ext.data.SortTypes"],
	stripRe : /[\$,%]/g,
	dashesRe : /-/g,
	iso8601TestRe : /\d\dT\d\d/,
	iso8601SplitRe : /[- :T\.Z\+]/
}, function () {
	var b = this,
	a = Ext.data.SortTypes;
	Ext.apply(b, {
		AUTO : {
			convert : function (c) {
				return c
			},
			sortType : a.none,
			type : "auto"
		},
		STRING : {
			convert : function (c) {
				return (c === undefined || c === null) ? (this.getAllowNull() ? null : "") : String(c)
			},
			sortType : a.asUCString,
			type : "string"
		},
		INT : {
			convert : function (c) {
				return (c !== undefined && c !== null && c !== "") ? ((typeof c === "number") ? parseInt(c, 10) : parseInt(String(c).replace(b.stripRe, ""), 10)) : (this.getAllowNull() ? null : 0)
			},
			sortType : a.none,
			type : "int"
		},
		FLOAT : {
			convert : function (c) {
				return (c !== undefined && c !== null && c !== "") ? ((typeof c === "number") ? c : parseFloat(String(c).replace(b.stripRe, ""), 10)) : (this.getAllowNull() ? null : 0)
			},
			sortType : a.none,
			type : "float"
		},
		BOOL : {
			convert : function (c) {
				if ((c === undefined || c === null || c === "") && this.getAllowNull()) {
					return null
				}
				return c !== "false" && !!c
			},
			sortType : a.none,
			type : "bool"
		},
		DATE : {
			convert : function (e) {
				var c = this.getDateFormat(),
				d;
				if (!e) {
					return null
				}
				if (Ext.isDate(e)) {
					return e
				}
				if (c) {
					if (c == "timestamp") {
						return new Date(e * 1000)
					}
					if (c == "time") {
						return new Date(parseInt(e, 10))
					}
					return Ext.Date.parse(e, c)
				}
				d = new Date(Date.parse(e));
				if (isNaN(d)) {
					if (b.iso8601TestRe.test(e)) {
						d = e.split(b.iso8601SplitRe);
						d = new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5])
					}
					if (isNaN(d)) {
						d = new Date(Date.parse(e.replace(this.dashesRe, "/")))
					}
				}
				return isNaN(d) ? null : d
			},
			sortType : a.asDate,
			type : "date"
		}
	});
	Ext.apply(b, {
		BOOLEAN : this.BOOL,
		INTEGER : this.INT,
		NUMBER : this.FLOAT
	})
});
Ext.define("Ext.data.Field", {
	requires : ["Ext.data.Types", "Ext.data.SortTypes"],
	alias : "data.field",
	isField : true,
	config : {
		name : null,
		type : "auto",
		convert : undefined,
		dateFormat : null,
		allowNull : true,
		defaultValue : undefined,
		mapping : null,
		sortType : undefined,
		sortDir : "ASC",
		allowBlank : true,
		persist : true,
		encode : null,
		decode : null,
		bubbleEvents : "action"
	},
	constructor : function (a) {
		if (Ext.isString(a)) {
			a = {
				name : a
			}
		}
		this.initConfig(a)
	},
	applyType : function (c) {
		var b = Ext.data.Types,
		a = b.AUTO;
		if (c) {
			if (Ext.isString(c)) {
				return b[c.toUpperCase()] || a
			} else {
				return c
			}
		}
		return a
	},
	updateType : function (a, b) {
		var c = this.getConvert();
		if (b && c === b.convert) {
			this.setConvert(a.convert)
		}
	},
	applySortType : function (d) {
		var c = Ext.data.SortTypes,
		a = this.getType(),
		b = a.sortType;
		if (d) {
			if (Ext.isString(d)) {
				return c[d] || b
			} else {
				return d
			}
		}
		return b
	},
	applyConvert : function (b) {
		var a = this.getType().convert;
		if (b && b !== a) {
			this._hasCustomConvert = true;
			return b
		} else {
			this._hasCustomConvert = false;
			return a
		}
	},
	hasCustomConvert : function () {
		return this._hasCustomConvert
	}
});
Ext.define("Ext.AbstractManager", {
	requires : ["Ext.util.HashMap"],
	typeName : "type",
	constructor : function (a) {
		Ext.apply(this, a || {});
		this.all = Ext.create("Ext.util.HashMap");
		this.types = {}
		
	},
	get : function (a) {
		return this.all.get(a)
	},
	register : function (a) {
		this.all.add(a)
	},
	unregister : function (a) {
		this.all.remove(a)
	},
	registerType : function (b, a) {
		this.types[b] = a;
		a[this.typeName] = b
	},
	isRegistered : function (a) {
		return this.types[a] !== undefined
	},
	create : function (a, d) {
		var b = a[this.typeName] || a.type || d,
		c = this.types[b];
		return new c(a)
	},
	onAvailable : function (e, c, b) {
		var a = this.all,
		d;
		if (a.containsKey(e)) {
			d = a.get(e);
			c.call(b || d, d)
		} else {
			a.on("add", function (h, f, g) {
				if (f == e) {
					c.call(b || g, g);
					a.un("add", c, b)
				}
			})
		}
	},
	each : function (b, a) {
		this.all.each(b, a || this)
	},
	getCount : function () {
		return this.all.getCount()
	}
});
Ext.define("Ext.data.ModelManager", {
	extend : "Ext.AbstractManager",
	alternateClassName : ["Ext.ModelMgr", "Ext.ModelManager"],
	singleton : true,
	modelNamespace : null,
	registerType : function (c, b) {
		var d = b.prototype,
		a;
		if (d && d.isModel) {
			a = b
		} else {
			b = {
				extend : b.extend || "Ext.data.Model",
				config : b
			};
			a = Ext.define(c, b)
		}
		this.types[c] = a;
		return a
	},
	onModelDefined : Ext.emptyFn,
	getModel : function (b) {
		var a = b;
		if (typeof a == "string") {
			a = this.types[a];
			if (!a && this.modelNamespace) {
				a = this.types[this.modelNamespace + "." + a]
			}
		}
		return a
	},
	create : function (c, b, d) {
		var a = typeof b == "function" ? b : this.types[b || c.name];
		return new a(c, d)
	}
}, function () {
	Ext.regModel = function () {
		return this.ModelManager.registerType.apply(this.ModelManager, arguments)
	}
});
Ext.define("Ext.Ajax", {
	extend : "Ext.data.Connection",
	singleton : true,
	autoAbort : false
});
Ext.define("Ext.data.association.Association", {
	alternateClassName : "Ext.data.Association",
	requires : ["Ext.data.ModelManager"],
	config : {
		ownerModel : null,
		ownerName : undefined,
		associatedModel : null,
		associatedName : undefined,
		associationKey : undefined,
		primaryKey : "id",
		reader : null,
		type : null,
		name : undefined
	},
	statics : {
		create : function (a) {
			if (!a.isAssociation) {
				if (Ext.isString(a)) {
					a = {
						type : a
					}
				}
				a.type = a.type.toLowerCase();
				return Ext.factory(a, Ext.data.association.Association, null, "association")
			}
			return a
		}
	},
	constructor : function (a) {
		this.initConfig(a)
	},
	applyName : function (a) {
		if (!a) {
			a = this.getAssociatedName()
		}
		return a
	},
	applyOwnerModel : function (a) {
		var b = Ext.data.ModelManager.getModel(a);
		if (b === undefined) {
			Ext.Logger.error("The configured ownerModel was not valid (you tried " + a + ")")
		}
		return b
	},
	applyOwnerName : function (a) {
		if (!a) {
			a = this.getOwnerModel().modelName
		}
		a = a.slice(a.lastIndexOf(".") + 1);
		return a
	},
	updateOwnerModel : function (a, b) {
		if (b) {
			this.setOwnerName(a.modelName)
		}
	},
	applyAssociatedModel : function (a) {
		var b = Ext.data.ModelManager.types[a];
		if (b === undefined) {
			Ext.Logger.error("The configured associatedModel was not valid (you tried " + a + ")")
		}
		return b
	},
	applyAssociatedName : function (a) {
		if (!a) {
			a = this.getAssociatedModel().modelName
		}
		a = a.slice(a.lastIndexOf(".") + 1);
		return a
	},
	updateAssociatedModel : function (b, a) {
		if (a) {
			this.setAssociatedName(b.modelName)
		}
	},
	applyReader : function (a) {
		if (a) {
			if (Ext.isString(a)) {
				a = {
					type : a
				}
			}
			if (!a.isReader) {
				Ext.applyIf(a, {
					type : "json"
				})
			}
		}
		return Ext.factory(a, Ext.data.Reader, this.getReader(), "reader")
	},
	updateReader : function (a) {
		a.setModel(this.getAssociatedModel())
	}
});
Ext.define("Ext.data.association.HasMany", {
	extend : "Ext.data.association.Association",
	alternateClassName : "Ext.data.HasManyAssociation",
	requires : ["Ext.util.Inflector"],
	alias : "association.hasmany",
	config : {
		foreignKey : undefined,
		store : undefined,
		storeName : undefined,
		filterProperty : null,
		autoLoad : false
	},
	constructor : function (a) {
		a = a || {};
		if (a.storeConfig) {
			a.store = a.storeConfig;
			delete a.storeConfig
		}
		this.callParent([a])
	},
	applyName : function (a) {
		if (!a) {
			a = Ext.util.Inflector.pluralize(this.getAssociatedName().toLowerCase())
		}
		return a
	},
	applyStoreName : function (a) {
		if (!a) {
			a = this.getName() + "Store"
		}
		return a
	},
	applyForeignKey : function (b) {
		if (!b) {
			var a = this.getInverseAssociation();
			if (a) {
				b = a.getForeignKey()
			} else {
				b = this.getOwnerName().toLowerCase() + "_id"
			}
		}
		return b
	},
	applyAssociationKey : function (a) {
		if (!a) {
			var b = this.getAssociatedName();
			a = Ext.util.Inflector.pluralize(b[0].toLowerCase() + b.slice(1))
		}
		return a
	},
	updateForeignKey : function (b, d) {
		var a = this.getAssociatedModel().getFields(),
		c = a.get(b);
		if (!c) {
			c = new Ext.data.Field({
					name : b
				});
			a.add(c);
			a.isDirty = true
		}
		if (d) {
			c = a.get(d);
			if (c) {
				a.remove(c);
				a.isDirty = true
			}
		}
	},
	applyStore : function (a) {
		var e = this,
		c = e,
		i = e.getAssociatedModel(),
		f = e.getStoreName(),
		d = e.getForeignKey(),
		h = e.getPrimaryKey(),
		g = e.getFilterProperty(),
		b = e.getAutoLoad();
		return function () {
			var m = this,
			k,
			l,
			j = {};
			if (m[f] === undefined) {
				if (g) {
					l = {
						property : g,
						value : m.get(g),
						exactMatch : true
					}
				} else {
					l = {
						property : d,
						value : m.get(h),
						exactMatch : true
					}
				}
				j[d] = m.get(h);
				k = Ext.apply({}, a, {
						model : i,
						filters : [l],
						remoteFilter : true,
						modelDefaults : j
					});
				m[f] = Ext.create("Ext.data.Store", k);
				if (b) {
					m[f].load(function (o, n) {
						c.updateInverseInstances(m)
					})
				}
			}
			return m[f]
		}
	},
	updateStore : function (a) {
		this.getOwnerModel().prototype[this.getName()] = a
	},
	read : function (b, a, e) {
		var d = b[this.getName()](),
		c = a.read(e).getRecords();
		d.add(c);
		this.updateInverseInstances(b)
	},
	updateInverseInstances : function (b) {
		var c = b[this.getName()](),
		a = this.getInverseAssociation();
		if (a) {
			c.each(function (d) {
				d[a.getInstanceName()] = b
			})
		}
	},
	getInverseAssociation : function () {
		var a = this.getOwnerModel().modelName;
		return this.getAssociatedModel().associations.findBy(function (b) {
			return b.getType().toLowerCase() === "belongsto" && b.getAssociatedModel().modelName === a
		})
	}
});
Ext.define("Ext.data.association.BelongsTo", {
	extend : "Ext.data.association.Association",
	alternateClassName : "Ext.data.BelongsToAssociation",
	alias : "association.belongsto",
	config : {
		foreignKey : undefined,
		getterName : undefined,
		setterName : undefined,
		instanceName : undefined
	},
	applyForeignKey : function (a) {
		if (!a) {
			a = this.getAssociatedName().toLowerCase() + "_id"
		}
		return a
	},
	updateForeignKey : function (b, d) {
		var a = this.getOwnerModel().getFields(),
		c = a.get(b);
		if (!c) {
			c = new Ext.data.Field({
					name : b
				});
			a.add(c);
			a.isDirty = true
		}
		if (d) {
			c = a.get(d);
			if (c) {
				a.isDirty = true;
				a.remove(c)
			}
		}
	},
	applyInstanceName : function (a) {
		if (!a) {
			a = this.getAssociatedName() + "BelongsToInstance"
		}
		return a
	},
	applyAssociationKey : function (a) {
		if (!a) {
			var b = this.getAssociatedName();
			a = b[0].toLowerCase() + b.slice(1)
		}
		return a
	},
	applyGetterName : function (a) {
		if (!a) {
			var b = this.getAssociatedName();
			a = "get" + b[0].toUpperCase() + b.slice(1)
		}
		return a
	},
	applySetterName : function (a) {
		if (!a) {
			var b = this.getAssociatedName();
			a = "set" + b[0].toUpperCase() + b.slice(1)
		}
		return a
	},
	updateGetterName : function (b, c) {
		var a = this.getOwnerModel().prototype;
		if (c) {
			delete a[c]
		}
		if (b) {
			a[b] = this.createGetter()
		}
	},
	updateSetterName : function (b, c) {
		var a = this.getOwnerModel().prototype;
		if (c) {
			delete a[c]
		}
		if (b) {
			a[b] = this.createSetter()
		}
	},
	createSetter : function () {
		var b = this,
		a = b.getForeignKey();
		return function (g, e, f) {
			var c = b.getInverseAssociation();
			if (g && g.isModel) {
				g = g.getId()
			}
			this.set(a, g);
			if (Ext.isFunction(e)) {
				e = {
					callback : e,
					scope : f || this
				}
			}
			if (c) {
				g = Ext.data.Model.cache[Ext.data.Model.generateCacheId(c.getOwnerModel().modelName, g)];
				if (g) {
					if (c.getType().toLowerCase() === "hasmany") {
						var d = g[c.getName()]();
						d.add(this)
					} else {
						g[c.getInstanceName()] = this
					}
				}
			}
			if (Ext.isObject(e)) {
				return this.save(e)
			}
		}
	},
	createGetter : function () {
		var c = this,
		d = c.getAssociatedModel(),
		b = c.getForeignKey(),
		a = c.getInstanceName();
		return function (h, i) {
			h = h || {};
			var g = this,
			j = g.get(b),
			k,
			e,
			f;
			e = g[a];
			if (!e) {
				e = Ext.data.Model.cache[Ext.data.Model.generateCacheId(d.modelName, j)];
				if (e) {
					g[a] = e
				}
			}
			if (h.reload === true || e === undefined) {
				if (typeof h == "function") {
					h = {
						callback : h,
						scope : i || g
					}
				}
				k = h.success;
				h.success = function (l) {
					g[a] = l;
					if (k) {
						k.call(this, arguments)
					}
				};
				d.load(j, h)
			} else {
				f = [e];
				i = i || g;
				Ext.callback(h, i, f);
				Ext.callback(h.success, i, f);
				Ext.callback(h.failure, i, f);
				Ext.callback(h.callback, i, f);
				return e
			}
		}
	},
	read : function (b, a, c) {
		b[this.getInstanceName()] = a.read([c]).getRecords()[0]
	},
	getInverseAssociation : function () {
		var b = this.getOwnerModel().modelName,
		a = this.getForeignKey();
		return this.getAssociatedModel().associations.findBy(function (d) {
			var c = d.getType().toLowerCase();
			return (c === "hasmany" || c === "hasone") && d.getAssociatedModel().modelName === b && d.getForeignKey() === a
		})
	}
});
Ext.define("Ext.data.association.HasOne", {
	extend : "Ext.data.association.Association",
	alternateClassName : "Ext.data.HasOneAssociation",
	alias : "association.hasone",
	config : {
		foreignKey : undefined,
		getterName : undefined,
		setterName : undefined,
		instanceName : undefined
	},
	applyForeignKey : function (b) {
		if (!b) {
			var a = this.getInverseAssociation();
			if (a) {
				b = a.getForeignKey()
			} else {
				b = this.getOwnerName().toLowerCase() + "_id"
			}
		}
		return b
	},
	updateForeignKey : function (b, d) {
		var a = this.getAssociatedModel().getFields(),
		c = a.get(b);
		if (!c) {
			c = new Ext.data.Field({
					name : b
				});
			a.add(c);
			a.isDirty = true
		}
		if (d) {
			c = a.get(d);
			if (c) {
				a.remove(c);
				a.isDirty = true
			}
		}
	},
	applyInstanceName : function (a) {
		if (!a) {
			a = this.getAssociatedName() + "BelongsToInstance"
		}
		return a
	},
	applyAssociationKey : function (a) {
		if (!a) {
			var b = this.getAssociatedName();
			a = b[0].toLowerCase() + b.slice(1)
		}
		return a
	},
	applyGetterName : function (a) {
		if (!a) {
			var b = this.getAssociatedName();
			a = "get" + b[0].toUpperCase() + b.slice(1)
		}
		return a
	},
	applySetterName : function (a) {
		if (!a) {
			var b = this.getAssociatedName();
			a = "set" + b[0].toUpperCase() + b.slice(1)
		}
		return a
	},
	updateGetterName : function (b, c) {
		var a = this.getOwnerModel().prototype;
		if (c) {
			delete a[c]
		}
		if (b) {
			a[b] = this.createGetter()
		}
	},
	updateSetterName : function (b, c) {
		var a = this.getOwnerModel().prototype;
		if (c) {
			delete a[c]
		}
		if (b) {
			a[b] = this.createSetter()
		}
	},
	createSetter : function () {
		var c = this,
		b = c.getForeignKey(),
		a = c.getInstanceName(),
		d = c.getAssociatedModel();
		return function (h, f, g) {
			var i = Ext.data.Model,
			e;
			if (h && h.isModel) {
				h = h.getId()
			}
			this.set(b, h);
			e = i.cache[i.generateCacheId(d.modelName, h)];
			if (e) {
				this[a] = e
			}
			if (Ext.isFunction(f)) {
				f = {
					callback : f,
					scope : g || this
				}
			}
			if (Ext.isObject(f)) {
				return this.save(f)
			}
		}
	},
	createGetter : function () {
		var c = this,
		d = c.getAssociatedModel(),
		b = c.getForeignKey(),
		a = c.getInstanceName();
		return function (h, i) {
			h = h || {};
			var g = this,
			j = g.get(b),
			k,
			e,
			f;
			if (h.reload === true || g[a] === undefined) {
				if (typeof h == "function") {
					h = {
						callback : h,
						scope : i || g
					}
				}
				k = h.success;
				h.success = function (l) {
					g[a] = l;
					if (k) {
						k.call(this, arguments)
					}
				};
				d.load(j, h)
			} else {
				e = g[a];
				f = [e];
				i = i || g;
				Ext.callback(h, i, f);
				Ext.callback(h.success, i, f);
				Ext.callback(h.failure, i, f);
				Ext.callback(h.callback, i, f);
				return e
			}
		}
	},
	read : function (c, a, e) {
		var b = this.getInverseAssociation(),
		d = a.read([e]).getRecords()[0];
		c[this.getInstanceName()] = d;
		if (b) {
			d[b.getInstanceName()] = c
		}
	},
	getInverseAssociation : function () {
		var a = this.getOwnerModel().modelName;
		return this.getAssociatedModel().associations.findBy(function (b) {
			return b.getType().toLowerCase() === "belongsto" && b.getAssociatedModel().modelName === a
		})
	}
});
Ext.define("Ext.data.writer.Json", {
	extend : "Ext.data.writer.Writer",
	alternateClassName : "Ext.data.JsonWriter",
	alias : "writer.json",
	config : {
		rootProperty : undefined,
		encode : false,
		allowSingle : true,
		encodeRequest : false
	},
	applyRootProperty : function (a) {
		if (!a && (this.getEncode() || this.getEncodeRequest())) {
			a = "data"
		}
		return a
	},
	writeRecords : function (d, e) {
		var a = this.getRootProperty(),
		f = d.getParams(),
		b = this.getAllowSingle(),
		c;
		if (this.getAllowSingle() && e && e.length == 1) {
			e = e[0]
		}
		if (this.getEncodeRequest()) {
			c = d.getJsonData() || {};
			if (e && (e.length || (b && Ext.isObject(e)))) {
				c[a] = e
			}
			d.setJsonData(Ext.apply(c, f || {}));
			d.setParams(null);
			d.setMethod("POST");
			return d
		}
		if (!e || !(e.length || (b && Ext.isObject(e)))) {
			return d
		}
		if (this.getEncode()) {
			if (a) {
				f[a] = Ext.encode(e)
			} else {}
			
		} else {
			c = d.getJsonData() || {};
			if (a) {
				c[a] = e
			} else {
				c = e
			}
			d.setJsonData(c)
		}
		return d
	}
});
Ext.define("Ext.data.reader.Reader", {
	requires : ["Ext.data.ResultSet"],
	alternateClassName : ["Ext.data.Reader", "Ext.data.DataReader"],
	mixins : ["Ext.mixin.Observable"],
	isReader : true,
	config : {
		idProperty : undefined,
		clientIdProperty : "clientId",
		totalProperty : "total",
		successProperty : "success",
		messageProperty : null,
		rootProperty : "",
		implicitIncludes : true,
		model : undefined
	},
	constructor : function (a) {
		this.initConfig(a)
	},
	fieldCount : 0,
	applyModel : function (a) {
		if (typeof a == "string") {
			a = Ext.data.ModelManager.getModel(a);
			if (!a) {
				Ext.Logger.error("Model with name " + arguments[0] + " doesnt exist.")
			}
		}
		if (a && !a.prototype.isModel && Ext.isObject(a)) {
			a = Ext.data.ModelManager.registerType(a.storeId || a.id || Ext.id(), a)
		}
		return a
	},
	applyIdProperty : function (a) {
		if (!a && this.getModel()) {
			a = this.getModel().getIdProperty()
		}
		return a
	},
	updateModel : function (a) {
		if (a) {
			if (!this.getIdProperty()) {
				this.setIdProperty(a.getIdProperty())
			}
			this.buildExtractors()
		}
	},
	createAccessor : Ext.emptyFn,
	createFieldAccessExpression : function () {
		return "undefined"
	},
	buildExtractors : function () {
		if (!this.getModel()) {
			return
		}
		var b = this,
		c = b.getTotalProperty(),
		a = b.getSuccessProperty(),
		d = b.getMessageProperty();
		if (c) {
			b.getTotal = b.createAccessor(c)
		}
		if (a) {
			b.getSuccess = b.createAccessor(a)
		}
		if (d) {
			b.getMessage = b.createAccessor(d)
		}
		b.extractRecordData = b.buildRecordDataExtractor()
	},
	buildRecordDataExtractor : function () {
		var k = this,
		e = k.getModel(),
		g = e.getFields(),
		j = g.length,
		a = [],
		h = k.getModel().getClientIdProperty(),
		f = "__field",
		b = ["var me = this,\n", "    fields = me.getModel().getFields(),\n", "    idProperty = me.getIdProperty(),\n", '    idPropertyIsFn = (typeof idProperty == "function"),', "    value,\n", "    internalId"],
		d,
		l,
		c,
		m;
		g = g.items;
		for (d = 0; d < j; d++) {
			l = g[d];
			m = l.getName();
			if (m === e.getIdProperty()) {
				a[d] = "idField"
			} else {
				a[d] = f + d
			}
			b.push(",\n    ", a[d], ' = fields.get("', l.getName(), '")')
		}
		b.push(";\n\n    return function(source) {\n        var dest = {};\n");
		b.push("        if (idPropertyIsFn) {\n");
		b.push("            idField.setMapping(idProperty);\n");
		b.push("        }\n");
		for (d = 0; d < j; d++) {
			l = g[d];
			c = a[d];
			m = l.getName();
			if (m === e.getIdProperty() && l.getMapping() === null && e.getIdProperty() !== this.getIdProperty()) {
				l.setMapping(this.getIdProperty())
			}
			b.push("        try {\n");
			b.push("            value = ", k.createFieldAccessExpression(l, c, "source"), ";\n");
			b.push("            if (value !== undefined) {\n");
			b.push('                dest["' + l.getName() + '"] = value;\n');
			b.push("            }\n");
			b.push("        } catch(e){}\n")
		}
		if (h) {
			b.push("        internalId = " + k.createFieldAccessExpression(Ext.create("Ext.data.Field", {
						name : h
					}), null, "source") + ";\n");
			b.push("        if (internalId !== undefined) {\n");
			b.push('            dest["_clientId"] = internalId;\n        }\n')
		}
		b.push("        return dest;\n");
		b.push("    };");
		return Ext.functionFactory(b.join("")).call(k)
	},
	getFields : function () {
		return this.getModel().getFields().items
	},
	getData : function (a) {
		return a
	},
	getResponseData : function (a) {
		return a
	},
	getRoot : function (a) {
		return a
	},
	read : function (c) {
		var g = c,
		h = this.getModel(),
		e,
		b,
		d,
		f,
		a;
		if (c) {
			g = this.getResponseData(c)
		}
		if (g) {
			e = this.readRecords(g);
			b = e.getRecords();
			for (d = 0, f = b.length; d < f; d++) {
				a = b[d];
				b[d] = new h(a.data, a.id, a.node)
			}
			return e
		} else {
			return this.nullResultSet
		}
	},
	process : function (a) {
		var b = a;
		if (a) {
			b = this.getResponseData(a)
		}
		if (b) {
			return this.readRecords(b)
		} else {
			return this.nullResultSet
		}
	},
	readRecords : function (c) {
		var d = this;
		d.rawData = c;
		c = d.getData(c);
		if (c.metaData) {
			d.onMetaChange(c.metaData)
		}
		var f = Ext.isArray(c) ? c : d.getRoot(c),
		h = true,
		b = 0,
		e,
		g,
		a,
		i;
		if (d.getTotalProperty()) {
			g = parseInt(d.getTotal(c), 10);
			if (!isNaN(g)) {
				e = g
			}
		}
		if (d.getSuccessProperty()) {
			g = d.getSuccess(c);
			if (g === false || g === "false") {
				h = false
			}
		}
		if (d.getMessageProperty()) {
			i = d.getMessage(c)
		}
		if (f) {
			a = d.extractData(f);
			b = a.length
		} else {
			b = 0;
			a = []
		}
		return new Ext.data.ResultSet({
			total : e,
			count : b,
			records : a,
			success : h,
			message : i
		})
	},
	extractData : function (l) {
		var j = this,
		e = [],
		c = l.length,
		h = j.getModel(),
		m = h.getIdProperty(),
		k = h.getFields(),
		d,
		g,
		f,
		b,
		a;
		if (k.isDirty) {
			j.buildExtractors(true);
			delete k.isDirty
		}
		if (!l.length && Ext.isObject(l)) {
			l = [l];
			c = 1
		}
		for (g = 0; g < c; g++) {
			a = null;
			b = null;
			d = l[g];
			if (d.isModel) {
				f = d.data
			} else {
				f = j.extractRecordData(d)
			}
			if (f._clientId !== undefined) {
				a = f._clientId;
				delete f._clientId
			}
			if (f[m] !== undefined) {
				b = f[m]
			}
			if (j.getImplicitIncludes()) {
				j.readAssociated(f, d)
			}
			e.push({
				clientId : a,
				id : b,
				data : f,
				node : d
			})
		}
		return e
	},
	readAssociated : function (h, g) {
		var e = this.getModel().associations.items,
		d = 0,
		f = e.length,
		a,
		c,
		b;
		for (; d < f; d++) {
			a = e[d];
			b = a.getAssociationKey();
			c = this.getAssociatedDataRoot(g, b);
			if (c) {
				h[b] = c
			}
		}
	},
	getAssociatedDataRoot : function (b, a) {
		return b[a]
	},
	onMetaChange : function (f) {
		var a = f.fields,
		e = this,
		d,
		c,
		b;
		e.metaData = f;
		if (f.rootProperty !== undefined) {
			e.setRootProperty(f.rootProperty)
		} else {
			if (f.root !== undefined) {
				e.setRootProperty(f.root)
			}
		}
		if (f.idProperty !== undefined) {
			e.setIdProperty(f.idProperty)
		}
		if (f.totalProperty !== undefined) {
			e.setTotalProperty(f.totalProperty)
		}
		if (f.successProperty !== undefined) {
			e.setSuccessProperty(f.successProperty)
		}
		if (f.messageProperty !== undefined) {
			e.setMessageProperty(f.messageProperty)
		}
		if (a) {
			if (e.getModel()) {
				e.getModel().setFields(a);
				e.buildExtractors()
			} else {
				b = e.getIdProperty();
				c = {
					fields : a
				};
				if (b) {
					c.idProperty = b
				}
				d = Ext.define("Ext.data.reader.MetaModel" + Ext.id(), {
						extend : "Ext.data.Model",
						config : c
					});
				e.setModel(d)
			}
		} else {
			e.buildExtractors()
		}
	}
}, function () {
	Ext.apply(this.prototype, {
		nullResultSet : new Ext.data.ResultSet({
			total : 0,
			count : 0,
			records : [],
			success : false
		})
	})
});
Ext.define("Ext.data.reader.Json", {
	extend : "Ext.data.reader.Reader",
	alternateClassName : "Ext.data.JsonReader",
	alias : "reader.json",
	config : {
		record : null,
		useSimpleAccessors : false
	},
	objectRe : /[\[\.]/,
	getResponseData : function (a) {
		var d = a;
		if (a && a.responseText) {
			d = a.responseText
		}
		if (typeof d !== "string") {
			return d
		}
		var c;
		try {
			c = Ext.decode(d)
		} catch (b) {
			this.fireEvent("exception", this, a, "Unable to parse the JSON returned by the server: " + b.toString());
			Ext.Logger.warn("Unable to parse the JSON returned by the server: " + b.toString())
		}
		return c
	},
	buildExtractors : function () {
		var b = this,
		a = b.getRootProperty();
		b.callParent(arguments);
		if (a) {
			b.rootAccessor = b.createAccessor(a)
		} else {
			delete b.rootAccessor
		}
	},
	getRoot : function (b) {
		var a = this.getModel().getFields();
		if (a.isDirty) {
			this.buildExtractors(true);
			delete a.isDirty
		}
		if (this.rootAccessor) {
			return this.rootAccessor.call(this, b)
		} else {
			return b
		}
	},
	extractData : function (a) {
		var e = this.getRecord(),
		d = [],
		c,
		b;
		if (e) {
			c = a.length;
			if (!c && Ext.isObject(a)) {
				c = 1;
				a = [a]
			}
			for (b = 0; b < c; b++) {
				d[b] = a[b][e]
			}
		} else {
			d = a
		}
		return this.callParent([d])
	},
	createAccessor : function () {
		var a = /[\[\.]/;
		return function (c) {
			if (Ext.isEmpty(c)) {
				return Ext.emptyFn
			}
			if (Ext.isFunction(c)) {
				return c
			}
			if (this.getUseSimpleAccessors() !== true) {
				var b = String(c).search(a);
				if (b >= 0) {
					return Ext.functionFactory("obj", "var value; try {value = obj" + (b > 0 ? "." : "") + c + "} catch(e) {}; return value;")
				}
			}
			return function (d) {
				return d[c]
			}
		}
	}
	(),
	createFieldAccessExpression : function (g, b, c) {
		var f = this,
		h = f.objectRe,
		e = (g.getMapping() !== null),
		a = e ? g.getMapping() : g.getName(),
		i,
		d;
		if (typeof a === "function") {
			i = b + ".getMapping()(" + c + ", this)"
		} else {
			if (f.getUseSimpleAccessors() === true || ((d = String(a).search(h)) < 0)) {
				if (!e || isNaN(a)) {
					a = '"' + a + '"'
				}
				i = c + "[" + a + "]"
			} else {
				i = c + (d > 0 ? "." : "") + a
			}
		}
		return i
	}
});
Ext.define("Ext.data.proxy.Proxy", {
	extend : "Ext.Evented",
	alias : "proxy.proxy",
	alternateClassName : ["Ext.data.DataProxy", "Ext.data.Proxy"],
	requires : ["Ext.data.reader.Json", "Ext.data.writer.Json", "Ext.data.Batch", "Ext.data.Operation"],
	config : {
		batchOrder : "create,update,destroy",
		batchActions : true,
		model : null,
		reader : {
			type : "json"
		},
		writer : {
			type : "json"
		}
	},
	isProxy : true,
	applyModel : function (a) {
		if (typeof a == "string") {
			a = Ext.data.ModelManager.getModel(a);
			if (!a) {
				Ext.Logger.error("Model with name " + arguments[0] + " doesnt exist.")
			}
		}
		if (a && !a.prototype.isModel && Ext.isObject(a)) {
			a = Ext.data.ModelManager.registerType(a.storeId || a.id || Ext.id(), a)
		}
		return a
	},
	updateModel : function (b) {
		if (b) {
			var a = this.getReader();
			if (a && !a.getModel()) {
				a.setModel(b)
			}
		}
	},
	applyReader : function (b, a) {
		return Ext.factory(b, Ext.data.Reader, a, "reader")
	},
	updateReader : function (a) {
		if (a) {
			var b = this.getModel();
			if (!b) {
				b = a.getModel();
				if (b) {
					this.setModel(b)
				}
			} else {
				a.setModel(b)
			}
			if (a.onMetaChange) {
				a.onMetaChange = Ext.Function.createSequence(a.onMetaChange, this.onMetaChange, this)
			}
		}
	},
	onMetaChange : function (b) {
		var a = this.getReader().getModel();
		if (!this.getModel() && a) {
			this.setModel(a)
		}
		this.fireEvent("metachange", this, b)
	},
	applyWriter : function (b, a) {
		return Ext.factory(b, Ext.data.Writer, a, "writer")
	},
	create : Ext.emptyFn,
	read : Ext.emptyFn,
	update : Ext.emptyFn,
	destroy : Ext.emptyFn,
	onDestroy : function () {
		Ext.destroy(this.getReader(), this.getWriter())
	},
	batch : function (e, f) {
		var g = this,
		d = g.getBatchActions(),
		c = this.getModel(),
		b,
		a;
		if (e.operations === undefined) {
			e = {
				operations : e,
				batch : {
					listeners : f
				}
			}
		}
		if (e.batch) {
			if (e.batch.isBatch) {
				e.batch.setProxy(g)
			} else {
				e.batch.proxy = g
			}
		} else {
			e.batch = {
				proxy : g,
				listeners : e.listeners || {}
				
			}
		}
		if (!b) {
			b = new Ext.data.Batch(e.batch)
		}
		b.on("complete", Ext.bind(g.onBatchComplete, g, [e], 0));
		Ext.each(g.getBatchOrder().split(","), function (h) {
			a = e.operations[h];
			if (a) {
				if (d) {
					b.add(new Ext.data.Operation({
							action : h,
							records : a,
							model : c
						}))
				} else {
					Ext.each(a, function (i) {
						b.add(new Ext.data.Operation({
								action : h,
								records : [i],
								model : c
							}))
					})
				}
			}
		}, g);
		b.start();
		return b
	},
	onBatchComplete : function (a, b) {
		var c = a.scope || this;
		if (b.hasException) {
			if (Ext.isFunction(a.failure)) {
				Ext.callback(a.failure, c, [b, a])
			}
		} else {
			if (Ext.isFunction(a.success)) {
				Ext.callback(a.success, c, [b, a])
			}
		}
		if (Ext.isFunction(a.callback)) {
			Ext.callback(a.callback, c, [b, a])
		}
	}
}, function () {});
Ext.define("Ext.data.proxy.Client", {
	extend : "Ext.data.proxy.Proxy",
	alternateClassName : "Ext.proxy.ClientProxy",
	clear : function () {}
	
});
Ext.define("Ext.data.proxy.Memory", {
	extend : "Ext.data.proxy.Client",
	alias : "proxy.memory",
	alternateClassName : "Ext.data.MemoryProxy",
	isMemoryProxy : true,
	config : {
		data : []
	},
	finishOperation : function (b, f, d) {
		if (b) {
			var c = 0,
			e = b.getRecords(),
			a = e.length;
			for (c; c < a; c++) {
				e[c].commit()
			}
			b.setSuccessful();
			Ext.callback(f, d || this, [b])
		}
	},
	create : function () {
		this.finishOperation.apply(this, arguments)
	},
	update : function () {
		this.finishOperation.apply(this, arguments)
	},
	destroy : function () {
		this.finishOperation.apply(this, arguments)
	},
	read : function (b, e, c) {
		var d = this,
		a = d.getReader();
		if (b.process("read", a.process(d.getData())) === false) {
			this.fireEvent("exception", this, null, b)
		}
		Ext.callback(e, c || d, [b])
	},
	clear : Ext.emptyFn
});
Ext.define("Ext.data.proxy.Server", {
	extend : "Ext.data.proxy.Proxy",
	alias : "proxy.server",
	alternateClassName : "Ext.data.ServerProxy",
	requires : ["Ext.data.Request"],
	config : {
		url : null,
		pageParam : "page",
		startParam : "start",
		limitParam : "limit",
		groupParam : "group",
		sortParam : "sort",
		filterParam : "filter",
		directionParam : "dir",
		enablePagingParams : true,
		simpleSortMode : false,
		noCache : true,
		cacheString : "_dc",
		timeout : 30000,
		api : {
			create : undefined,
			read : undefined,
			update : undefined,
			destroy : undefined
		},
		extraParams : {}
		
	},
	constructor : function (a) {
		a = a || {};
		if (a.nocache !== undefined) {
			a.noCache = a.nocache
		}
		this.callParent([a])
	},
	create : function () {
		return this.doRequest.apply(this, arguments)
	},
	read : function () {
		return this.doRequest.apply(this, arguments)
	},
	update : function () {
		return this.doRequest.apply(this, arguments)
	},
	destroy : function () {
		return this.doRequest.apply(this, arguments)
	},
	setExtraParam : function (a, b) {
		this.getExtraParams()[a] = b
	},
	buildRequest : function (a) {
		var c = this,
		d = Ext.applyIf(a.getParams() || {}, c.getExtraParams() || {}),
		b;
		d = Ext.applyIf(d, c.getParams(a));
		b = Ext.create("Ext.data.Request", {
				params : d,
				action : a.getAction(),
				records : a.getRecords(),
				url : a.getUrl(),
				operation : a,
				proxy : c
			});
		b.setUrl(c.buildUrl(b));
		a.setRequest(b);
		return b
	},
	processResponse : function (k, b, d, c, j, l) {
		var h = this,
		a = b.getAction(),
		f,
		i;
		if (k === true) {
			f = h.getReader();
			try {
				i = f.process(c)
			} catch (g) {
				b.setException(g.message);
				h.fireEvent("exception", this, c, b);
				return
			}
			if (!b.getModel()) {
				b.setModel(this.getModel())
			}
			if (b.process(a, i, d, c) === false) {
				this.fireEvent("exception", this, c, b)
			}
		} else {
			h.setException(b, c);
			h.fireEvent("exception", this, c, b)
		}
		if (typeof j == "function") {
			j.call(l || h, b)
		}
		h.afterRequest(d, k)
	},
	setException : function (b, a) {
		b.setException({
			status : a.status,
			statusText : a.statusText
		})
	},
	applyEncoding : function (a) {
		return Ext.encode(a)
	},
	encodeSorters : function (d) {
		var b = [],
		c = d.length,
		a = 0;
		for (; a < c; a++) {
			b[a] = {
				property : d[a].getProperty(),
				direction : d[a].getDirection()
			}
		}
		return this.applyEncoding(b)
	},
	encodeFilters : function (d) {
		var b = [],
		c = d.length,
		a = 0;
		for (; a < c; a++) {
			b[a] = {
				property : d[a].getProperty(),
				value : d[a].getValue()
			}
		}
		return this.applyEncoding(b)
	},
	getParams : function (i) {
		var n = this,
		h = {},
		a = i.getGrouper(),
		m = i.getSorters(),
		f = i.getFilters(),
		l = i.getPage(),
		d = i.getStart(),
		g = i.getLimit(),
		o = n.getSimpleSortMode(),
		q = n.getPageParam(),
		k = n.getStartParam(),
		p = n.getLimitParam(),
		j = n.getGroupParam(),
		e = n.getSortParam(),
		c = n.getFilterParam(),
		b = n.getDirectionParam();
		if (n.getEnablePagingParams()) {
			if (q && l !== null) {
				h[q] = l
			}
			if (k && d !== null) {
				h[k] = d
			}
			if (p && g !== null) {
				h[p] = g
			}
		}
		if (j && a) {
			h[j] = n.encodeSorters([a])
		}
		if (e && m && m.length > 0) {
			if (o) {
				h[e] = m[0].getProperty();
				h[b] = m[0].getDirection()
			} else {
				h[e] = n.encodeSorters(m)
			}
		}
		if (c && f && f.length > 0) {
			h[c] = n.encodeFilters(f)
		}
		return h
	},
	buildUrl : function (c) {
		var b = this,
		a = b.getUrl(c);
		if (b.getNoCache()) {
			a = Ext.urlAppend(a, Ext.String.format("{0}={1}", b.getCacheString(), Ext.Date.now()))
		}
		return a
	},
	getUrl : function (a) {
		return a ? a.getUrl() || this.getApi()[a.getAction()] || this._url : this._url
	},
	doRequest : function (a, c, b) {},
	afterRequest : Ext.emptyFn
});
Ext.define("Ext.data.proxy.Ajax", {
	extend : "Ext.data.proxy.Server",
	requires : ["Ext.util.MixedCollection", "Ext.Ajax"],
	alias : "proxy.ajax",
	alternateClassName : ["Ext.data.HttpProxy", "Ext.data.AjaxProxy"],
	config : {
		actionMethods : {
			create : "POST",
			read : "GET",
			update : "POST",
			destroy : "POST"
		},
		headers : {},
		withCredentials : false
	},
	doRequest : function (a, e, b) {
		var d = this.getWriter(),
		c = this.buildRequest(a);
		c.setConfig({
			headers : this.getHeaders(),
			timeout : this.getTimeout(),
			method : this.getMethod(c),
			callback : this.createRequestCallback(c, a, e, b),
			scope : this
		});
		if (a.getWithCredentials() || this.getWithCredentials()) {
			c.setWithCredentials(true)
		}
		c = d.write(c);
		Ext.Ajax.request(c.getCurrentConfig());
		return c
	},
	getMethod : function (a) {
		return this.getActionMethods()[a.getAction()]
	},
	createRequestCallback : function (d, a, e, b) {
		var c = this;
		return function (g, h, f) {
			c.processResponse(h, a, d, f, e, b)
		}
	}
});
Ext.define("Ext.data.Model", {
	alternateClassName : "Ext.data.Record",
	mixins : {
		observable : "Ext.mixin.Observable"
	},
	isModel : true,
	requires : ["Ext.util.Collection", "Ext.data.Field", "Ext.data.identifier.Simple", "Ext.data.ModelManager", "Ext.data.proxy.Ajax", "Ext.data.association.HasMany", "Ext.data.association.BelongsTo", "Ext.data.association.HasOne", "Ext.data.Errors"],
	config : {
		idProperty : "id",
		data : null,
		fields : undefined,
		validations : null,
		associations : null,
		hasMany : null,
		hasOne : null,
		belongsTo : null,
		proxy : null,
		identifier : {
			type : "simple"
		},
		clientIdProperty : "clientId",
		isErased : false
	},
	staticConfigs : ["idProperty", "fields", "validations", "associations", "hasMany", "hasOne", "belongsTo", "clientIdProperty", "identifier", "proxy"],
	statics : {
		EDIT : "edit",
		REJECT : "reject",
		COMMIT : "commit",
		cache : {},
		generateProxyMethod : function (a) {
			return function () {
				var b = this.prototype;
				return b[a].apply(b, arguments)
			}
		},
		generateCacheId : function (b, c) {
			var a;
			if (b && b.isModel) {
				a = b.modelName;
				if (c === undefined) {
					c = b.getId()
				}
			} else {
				a = b
			}
			return a.replace(/\./g, "-").toLowerCase() + "-" + c
		}
	},
	inheritableStatics : {
		load : function (a, b, h) {
			var f = this.getProxy(),
			i = this.getIdProperty(),
			e = null,
			d = {},
			g,
			c;
			h = h || (b && b.scope) || this;
			if (Ext.isFunction(b)) {
				b = {
					callback : b,
					scope : h
				}
			}
			d[i] = a;
			b = Ext.apply({}, b);
			b = Ext.applyIf(b, {
					action : "read",
					params : d,
					model : this
				});
			c = Ext.create("Ext.data.Operation", b);
			if (!f) {
				Ext.Logger.error("You are trying to load a model that doesn't have a Proxy specified")
			}
			g = function (j) {
				if (j.wasSuccessful()) {
					e = j.getRecords()[0];
					Ext.callback(b.success, h, [e, j])
				} else {
					Ext.callback(b.failure, h, [e, j])
				}
				Ext.callback(b.callback, h, [e, j])
			};
			f.read(c, g, this)
		}
	},
	editing : false,
	dirty : false,
	phantom : false,
	constructor : function (e, g, b, f) {
		var d = this,
		c = null,
		a = this.getIdProperty();
		d.modified = {};
		d.raw = b || e || {};
		d.stores = [];
		e = e || f || {};
		if (g || g === 0) {
			e[a] = d.internalId = g
		}
		g = e[a];
		if (g || g === 0) {
			c = Ext.data.Model.cache[Ext.data.Model.generateCacheId(this, g)];
			if (c) {
				return c.mergeData(f || e || {})
			}
		}
		if (f) {
			d.setConvertedData(e)
		} else {
			d.setData(e)
		}
		g = d.data[a];
		if (!g && g !== 0) {
			d.data[a] = d.internalId = d.id = d.getIdentifier().generate(d);
			d.phantom = true;
			if (this.associations.length) {
				this.handleInlineAssociationData(e)
			}
		} else {
			d.id = d.getIdentifier().generate(d)
		}
		Ext.data.Model.cache[Ext.data.Model.generateCacheId(d)] = d;
		if (this.init && typeof this.init == "function") {
			this.init()
		}
	},
	mergeData : function (a) {
		var g = this,
		d = g.getFields().items,
		e = d.length,
		b = g.data,
		c,
		h,
		k,
		j,
		f;
		for (c = 0; c < e; c++) {
			h = d[c];
			k = h.getName();
			f = h.getConvert();
			j = a[k];
			if (j !== undefined && !g.isModified(k)) {
				if (f) {
					j = f.call(h, j, g)
				}
				b[k] = j
			}
		}
		return this
	},
	setData : function (a) {
		var g = this.fields.items,
		h = g.length,
		f = Ext.isArray(a),
		d = this._data = this.data = {},
		e,
		k,
		b,
		l,
		j,
		c;
		if (!a) {
			return this
		}
		for (e = 0; e < h; e++) {
			k = g[e];
			b = k.getName();
			j = k.getConvert();
			if (f) {
				l = a[e]
			} else {
				l = a[b];
				if (typeof l == "undefined") {
					l = k.getDefaultValue()
				}
			}
			if (j) {
				l = j.call(k, l, this)
			}
			d[b] = l
		}
		c = this.getId();
		if (this.associations.length && (c || c === 0)) {
			this.handleInlineAssociationData(a)
		}
		return this
	},
	handleInlineAssociationData : function (e) {
		var d = this.associations.items,
		h = d.length,
		f,
		c,
		b,
		g,
		j,
		a;
		for (f = 0; f < h; f++) {
			c = d[f];
			a = c.getAssociationKey();
			b = e[a];
			if (b) {
				g = c.getReader();
				if (!g) {
					j = c.getAssociatedModel().getProxy();
					if (j) {
						g = j.getReader()
					} else {
						g = new Ext.data.JsonReader({
								model : c.getAssociatedModel()
							})
					}
				}
				c.read(this, g, b)
			}
		}
	},
	setId : function (b) {
		var a = this.getId();
		this.set(this.getIdProperty(), b);
		this.internalId = b;
		delete Ext.data.Model.cache[Ext.data.Model.generateCacheId(this, a)];
		Ext.data.Model.cache[Ext.data.Model.generateCacheId(this)] = this
	},
	getId : function () {
		return this.get(this.getIdProperty())
	},
	setConvertedData : function (a) {
		this._data = this.data = a;
		return this
	},
	get : function (a) {
		return this.data[a]
	},
	set : function (p, l) {
		var j = this,
		b = j.fields.map,
		o = j.modified,
		a = !j.editing,
		c = j.associations.items,
		f = 0,
		d = [],
		k,
		n,
		e,
		m,
		g,
		h;
		if (arguments.length == 1) {
			for (n in p) {
				if (p.hasOwnProperty(n)) {
					k = b[n];
					if (k && k.hasCustomConvert()) {
						d.push(n);
						continue
					}
					if (!f && a) {
						j.beginEdit()
					}
					++f;
					j.set(n, p[n])
				}
			}
			g = d.length;
			if (g) {
				if (!f && a) {
					j.beginEdit()
				}
				f += g;
				for (e = 0; e < g; e++) {
					k = d[e];
					j.set(k, p[k])
				}
			}
			if (a && f) {
				j.endEdit(false, d)
			}
		} else {
			k = b[p];
			h = k && k.getConvert();
			if (h) {
				l = h.call(k, l, j)
			}
			m = j.data[p];
			j.data[p] = l;
			if (k && !j.isEqual(m, l)) {
				if (o.hasOwnProperty(p)) {
					if (j.isEqual(o[p], l)) {
						delete o[p];
						j.dirty = false;
						for (n in o) {
							if (o.hasOwnProperty(n)) {
								j.dirty = true;
								break
							}
						}
					}
				} else {
					j.dirty = true;
					o[p] = m
				}
			}
			if (a) {
				j.afterEdit([p], o)
			}
		}
	},
	isEqual : function (d, c) {
		if (Ext.isDate(d) && Ext.isDate(c)) {
			return d.getTime() === c.getTime()
		}
		return d === c
	},
	beginEdit : function () {
		var a = this;
		if (!a.editing) {
			a.editing = true;
			a.dirtySave = a.dirty;
			a.dataSave = Ext.apply({}, a.data);
			a.modifiedSave = Ext.apply({}, a.modified)
		}
	},
	cancelEdit : function () {
		var a = this;
		if (a.editing) {
			a.editing = false;
			a.modified = a.modifiedSave;
			a.data = a.dataSave;
			a.dirty = a.dirtySave;
			delete a.modifiedSave;
			delete a.dataSave;
			delete a.dirtySave
		}
	},
	endEdit : function (a, c) {
		var b = this;
		if (b.editing) {
			b.editing = false;
			if (a !== true && (b.changedWhileEditing())) {
				b.afterEdit(c || Ext.Object.getKeys(this.modified), this.modified)
			}
			delete b.modifiedSave;
			delete b.dataSave;
			delete b.dirtySave
		}
	},
	changedWhileEditing : function () {
		var c = this,
		b = c.dataSave,
		d = c.data,
		a;
		for (a in d) {
			if (d.hasOwnProperty(a)) {
				if (!c.isEqual(d[a], b[a])) {
					return true
				}
			}
		}
		return false
	},
	getChanges : function () {
		var a = this.modified,
		b = {},
		c;
		for (c in a) {
			if (a.hasOwnProperty(c)) {
				b[c] = this.get(c)
			}
		}
		return b
	},
	isModified : function (a) {
		return this.modified.hasOwnProperty(a)
	},
	save : function (b, d) {
		var e = this,
		f = e.phantom ? "create" : "update",
		c = e.getProxy(),
		a,
		g;
		if (!c) {
			Ext.Logger.error("You are trying to save a model instance that doesn't have a Proxy specified")
		}
		b = b || {};
		d = d || e;
		if (Ext.isFunction(b)) {
			b = {
				callback : b,
				scope : d
			}
		}
		Ext.applyIf(b, {
			records : [e],
			action : f,
			model : e.self
		});
		a = Ext.create("Ext.data.Operation", b);
		g = function (h) {
			if (h.wasSuccessful()) {
				Ext.callback(b.success, d, [e, h])
			} else {
				Ext.callback(b.failure, d, [e, h])
			}
			Ext.callback(b.callback, d, [e, h])
		};
		c[f](a, g, e);
		return e
	},
	erase : function (b, d) {
		var e = this,
		c = this.getProxy(),
		a,
		f;
		if (!c) {
			Ext.Logger.error("You are trying to erase a model instance that doesn't have a Proxy specified")
		}
		b = b || {};
		d = d || e;
		if (Ext.isFunction(b)) {
			b = {
				callback : b,
				scope : d
			}
		}
		Ext.applyIf(b, {
			records : [e],
			action : "destroy",
			model : this.self
		});
		a = Ext.create("Ext.data.Operation", b);
		f = function (g) {
			if (g.wasSuccessful()) {
				Ext.callback(b.success, d, [e, g])
			} else {
				Ext.callback(b.failure, d, [e, g])
			}
			Ext.callback(b.callback, d, [e, g])
		};
		c.destroy(a, f, e);
		return e
	},
	reject : function (a) {
		var c = this,
		b = c.modified,
		d;
		for (d in b) {
			if (b.hasOwnProperty(d)) {
				if (typeof b[d] != "function") {
					c.data[d] = b[d]
				}
			}
		}
		c.dirty = false;
		c.editing = false;
		c.modified = {};
		if (a !== true) {
			c.afterReject()
		}
	},
	commit : function (a) {
		var c = this,
		b = this.modified;
		c.phantom = c.dirty = c.editing = false;
		c.modified = {};
		if (a !== true) {
			c.afterCommit(b)
		}
	},
	afterEdit : function (b, a) {
		this.notifyStores("afterEdit", b, a)
	},
	afterReject : function () {
		this.notifyStores("afterReject")
	},
	afterCommit : function (a) {
		this.notifyStores("afterCommit", Ext.Object.getKeys(a || {}), a)
	},
	notifyStores : function (e) {
		var c = Ext.Array.clone(arguments),
		a = this.stores,
		f = a.length,
		d,
		b;
		c[0] = this;
		for (d = 0; d < f; ++d) {
			b = a[d];
			if (b !== undefined && typeof b[e] == "function") {
				b[e].apply(b, c)
			}
		}
	},
	copy : function (c) {
		var d = this,
		b = d.getIdProperty(),
		a = Ext.apply({}, d.raw),
		e = Ext.apply({}, d.data);
		delete a[b];
		delete e[b];
		return new d.self(null, c, a, e)
	},
	getData : function (a) {
		var b = this.data;
		if (a === true) {
			Ext.apply(b, this.getAssociatedData())
		}
		return b
	},
	getAssociatedData : function () {
		return this.prepareAssociatedData(this, [], null)
	},
	prepareAssociatedData : function (o, a, n) {
		var h = o.associations.items,
		l = h.length,
		e = {},
		f,
		s,
		g,
		q,
		r,
		d,
		c,
		m,
		k,
		p,
		b;
		for (m = 0; m < l; m++) {
			d = h[m];
			s = d.getName();
			p = d.getType();
			b = true;
			if (n) {
				b = p == n
			}
			if (b && p.toLowerCase() == "hasmany") {
				f = o[d.getStoreName()];
				e[s] = [];
				if (f && f.getCount() > 0) {
					g = f.data.items;
					r = g.length;
					for (k = 0; k < r; k++) {
						q = g[k];
						c = q.id;
						if (Ext.Array.indexOf(a, c) == -1) {
							a.push(c);
							e[s][k] = q.getData();
							Ext.apply(e[s][k], this.prepareAssociatedData(q, a, n))
						}
					}
				}
			} else {
				if (b && (p.toLowerCase() == "belongsto" || p.toLowerCase() == "hasone")) {
					q = o[d.getInstanceName()];
					if (q !== undefined) {
						c = q.id;
						if (Ext.Array.indexOf(a, c) === -1) {
							a.push(c);
							e[s] = q.getData();
							Ext.apply(e[s], this.prepareAssociatedData(q, a, n))
						}
					}
				}
			}
		}
		return e
	},
	join : function (a) {
		Ext.Array.include(this.stores, a)
	},
	unjoin : function (a) {
		Ext.Array.remove(this.stores, a)
	},
	setDirty : function () {
		var b = this,
		a;
		b.dirty = true;
		b.fields.each(function (c) {
			if (c.getPersist()) {
				a = c.getName();
				b.modified[a] = b.get(a)
			}
		})
	},
	validate : function () {
		var j = Ext.create("Ext.data.Errors"),
		c = this.getValidations().items,
		e = Ext.data.Validations,
		b,
		d,
		h,
		a,
		g,
		f;
		if (c) {
			b = c.length;
			for (f = 0; f < b; f++) {
				d = c[f];
				h = d.field || d.name;
				g = d.type;
				a = e[g](d, this.get(h));
				if (!a) {
					j.add(Ext.create("Ext.data.Error", {
							field : h,
							message : d.message || e.getMessage(g)
						}))
				}
			}
		}
		return j
	},
	isValid : function () {
		return this.validate().isValid()
	},
	toUrl : function () {
		var b = this.$className.split("."),
		a = b[b.length - 1].toLowerCase();
		return a + "/" + this.getId()
	},
	destroy : function () {
		var a = this;
		a.notifyStores("afterErase", a);
		delete Ext.data.Model.cache[Ext.data.Model.generateCacheId(a)];
		a.raw = a.stores = a.modified = null;
		a.callParent(arguments)
	},
	applyProxy : function (b, a) {
		return Ext.factory(b, Ext.data.Proxy, a, "proxy")
	},
	updateProxy : function (a) {
		if (a) {
			a.setModel(this.self)
		}
	},
	applyAssociations : function (a) {
		if (a) {
			this.addAssociations(a, "hasMany")
		}
	},
	applyBelongsTo : function (a) {
		if (a) {
			this.addAssociations(a, "belongsTo")
		}
	},
	applyHasMany : function (a) {
		if (a) {
			this.addAssociations(a, "hasMany")
		}
	},
	applyHasOne : function (a) {
		if (a) {
			this.addAssociations(a, "hasOne")
		}
	},
	addAssociations : function (e, h) {
		var f,
		d,
		b,
		c = this.self.modelName,
		g = this.self.associations,
		a;
		e = Ext.Array.from(e);
		for (d = 0, f = e.length; d < f; d++) {
			b = e[d];
			if (!Ext.isObject(b)) {
				b = {
					model : b
				}
			}
			Ext.applyIf(b, {
				type : h,
				ownerModel : c,
				associatedModel : b.model
			});
			delete b.model;
			a = Ext.Function.bind(function (i) {
					g.add(Ext.data.association.Association.create(this))
				}, b);
			Ext.ClassManager.onCreated(a, this, (typeof b.associatedModel === "string") ? b.associatedModel : Ext.getClassName(b.associatedModel))
		}
	},
	applyValidations : function (a) {
		if (a) {
			if (!Ext.isArray(a)) {
				a = [a]
			}
			this.addValidations(a)
		}
	},
	addValidations : function (a) {
		this.self.validations.addAll(a)
	},
	applyFields : function (a) {
		var b = this.superclass.fields;
		if (b) {
			a = b.items.concat(a || [])
		}
		return a || []
	},
	updateFields : function (c) {
		var d = c.length,
		e = this,
		h = e.self.prototype,
		j = this.getIdProperty(),
		a,
		f,
		g,
		b;
		f = e._fields = e.fields = new Ext.util.Collection(h.getFieldName);
		for (b = 0; b < d; b++) {
			g = c[b];
			if (!g.isField) {
				g = new Ext.data.Field(c[b])
			}
			f.add(g)
		}
		a = f.get(j);
		if (!a) {
			f.add(new Ext.data.Field(j))
		} else {
			a.setType("auto")
		}
		f.addSorter(h.sortConvertFields)
	},
	applyIdentifier : function (a) {
		if (typeof a === "string") {
			a = {
				type : a
			}
		}
		return Ext.factory(a, Ext.data.identifier.Simple, this.getIdentifier(), "data.identifier")
	},
	getFieldName : function (a) {
		return a.getName()
	},
	sortConvertFields : function (a, d) {
		var c = a.hasCustomConvert(),
		b = d.hasCustomConvert();
		if (c && !b) {
			return 1
		}
		if (!c && b) {
			return -1
		}
		return 0
	},
	onClassExtended : function (k, d, j) {
		var f = j.onBeforeCreated,
		b = this,
		h = b.prototype,
		e = Ext.Class.configNameCache,
		g = h.staticConfigs.concat(d.staticConfigs || []),
		c = h.config,
		a = d.config || {},
		i;
		d.config = a;
		j.onBeforeCreated = function (A, t) {
			var v = [],
			x = A.prototype,
			w = {},
			m = x.config,
			n = g.length,
			q = ["set", "get"],
			s = q.length,
			o = m.associations || [],
			l = Ext.getClassName(A),
			z,
			y,
			r,
			p,
			u;
			for (r = 0; r < n; r++) {
				z = g[r];
				for (p = 0; p < s; p++) {
					y = e[z][q[p]];
					if (y in x) {
						w[y] = b.generateProxyMethod(y)
					}
				}
			}
			A.addStatics(w);
			A.modelName = l;
			x.modelName = l;
			if (m.belongsTo) {
				v.push("association.belongsto")
			}
			if (m.hasMany) {
				v.push("association.hasmany")
			}
			if (m.hasOne) {
				v.push("association.hasone")
			}
			for (r = 0, u = o.length; r < u; ++r) {
				v.push("association." + o[r].type.toLowerCase())
			}
			if (m.proxy) {
				if (typeof m.proxy === "string") {
					v.push("proxy." + m.proxy)
				} else {
					if (typeof m.proxy.type === "string") {
						v.push("proxy." + m.proxy.type)
					}
				}
			}
			if (m.validations) {
				v.push("Ext.data.Validations")
			}
			Ext.require(v, function () {
				Ext.Function.interceptBefore(j, "onCreated", function () {
					Ext.data.ModelManager.registerType(l, A);
					var B = A.prototype.superclass;
					A.prototype.associations = A.associations = A.prototype._associations = (B && B.associations) ? B.associations.clone() : new Ext.util.Collection(function (C) {
							return C.getName()
						});
					A.prototype.validations = A.validations = A.prototype._validations = (B && B.validations) ? B.validations.clone() : new Ext.util.Collection(function (C) {
							return C.field ? (C.field + "-" + C.type) : (C.name + "-" + C.type)
						});
					A.prototype = Ext.Object.chain(A.prototype);
					A.prototype.initConfig.call(A.prototype, m);
					delete A.prototype.initConfig
				});
				f.call(b, A, t, j)
			})
		}
	}
});
Ext.define("Ext.data.Store", {
	alias : "store.store",
	extend : "Ext.Evented",
	requires : ["Ext.util.Collection", "Ext.data.Operation", "Ext.data.proxy.Memory", "Ext.data.Model", "Ext.data.StoreManager", "Ext.util.Grouper"],
	statics : {
		create : function (a) {
			if (!a.isStore) {
				if (!a.type) {
					a.type = "store"
				}
				a = Ext.createByAlias("store." + a.type, a)
			}
			return a
		}
	},
	isStore : true,
	config : {
		storeId : undefined,
		data : null,
		autoLoad : null,
		autoSync : false,
		model : undefined,
		proxy : undefined,
		fields : null,
		remoteSort : false,
		remoteFilter : false,
		remoteGroup : false,
		filters : null,
		sorters : null,
		grouper : null,
		groupField : null,
		groupDir : null,
		getGroupString : null,
		pageSize : 25,
		totalCount : null,
		clearOnPageLoad : true,
		modelDefaults : {},
		autoDestroy : false,
		syncRemovedRecords : true,
		destroyRemovedRecords : true
	},
	currentPage : 1,
	constructor : function (a) {
		a = a || {};
		this.data = this._data = this.createDataCollection();
		this.data.setSortRoot("data");
		this.data.setFilterRoot("data");
		this.removed = [];
		if (a.id && !a.storeId) {
			a.storeId = a.id;
			delete a.id
		}
		this.initConfig(a)
	},
	createDataCollection : function () {
		return new Ext.util.Collection(function (a) {
			return a.getId()
		})
	},
	applyStoreId : function (a) {
		if (a === undefined || a === null) {
			a = this.getUniqueId()
		}
		return a
	},
	updateStoreId : function (a, b) {
		if (b) {
			Ext.data.StoreManager.unregister(this)
		}
		if (a) {
			Ext.data.StoreManager.register(this)
		}
	},
	applyModel : function (b) {
		if (typeof b == "string") {
			var d = Ext.data.ModelManager.getModel(b);
			if (!d) {
				Ext.Logger.error('Model with name "' + b + '" does not exist.')
			}
			b = d
		}
		if (b && !b.prototype.isModel && Ext.isObject(b)) {
			b = Ext.data.ModelManager.registerType(b.storeId || b.id || Ext.id(), b)
		}
		if (!b) {
			var a = this.getFields(),
			c = this.config.data;
			if (!a && c && c.length) {
				a = Ext.Object.getKeys(c[0])
			}
			if (a) {
				b = Ext.define("Ext.data.Store.ImplicitModel-" + (this.getStoreId() || Ext.id()), {
						extend : "Ext.data.Model",
						config : {
							fields : a,
							proxy : this.getProxy()
						}
					});
				this.implicitModel = true
			}
		}
		if (!b && this.getProxy()) {
			b = this.getProxy().getModel()
		}
		return b
	},
	updateModel : function (a) {
		var b = this.getProxy();
		if (b && !b.getModel()) {
			b.setModel(a)
		}
	},
	applyProxy : function (b, a) {
		b = Ext.factory(b, Ext.data.Proxy, a, "proxy");
		if (!b && this.getModel()) {
			b = this.getModel().getProxy()
		}
		if (!b) {
			b = new Ext.data.proxy.Memory({
					model : this.getModel()
				})
		}
		if (b.isMemoryProxy) {
			this.setSyncRemovedRecords(false)
		}
		return b
	},
	updateProxy : function (a) {
		if (a) {
			if (!a.getModel()) {
				a.setModel(this.getModel())
			}
			a.on("metachange", this.onMetaChange, this)
		}
	},
	applyData : function (c) {
		var b = this,
		a;
		if (c) {
			a = b.getProxy();
			if (a instanceof Ext.data.proxy.Memory) {
				a.setData(c);
				b.load()
			} else {
				b.removeAll(true);
				b.fireEvent("clear", b);
				b.suspendEvents();
				b.add(c);
				b.resumeEvents();
				b.dataLoaded = true
			}
		} else {
			b.removeAll(true);
			b.fireEvent("clear", b)
		}
		b.fireEvent("refresh", b, b.data)
	},
	clearData : function () {
		this.setData(null)
	},
	addData : function (d) {
		var a = this.getProxy().getReader(),
		c = a.read(d),
		b = c.getRecords();
		this.add(b)
	},
	updateAutoLoad : function (a) {
		var b = this.getProxy();
		if (a && (b && !b.isMemoryProxy)) {
			this.load(Ext.isObject(a) ? a : null)
		}
	},
	isAutoLoading : function () {
		var a = this.getProxy();
		return (this.getAutoLoad() || (a && a.isMemoryProxy) || this.dataLoaded)
	},
	updateGroupField : function (a) {
		var b = this.getGrouper();
		if (a) {
			if (!b) {
				this.setGrouper({
					property : a,
					direction : this.getGroupDir() || "ASC"
				})
			} else {
				b.setProperty(a)
			}
		} else {
			if (b) {
				this.setGrouper(null)
			}
		}
	},
	updateGroupDir : function (a) {
		var b = this.getGrouper();
		if (b) {
			b.setDirection(a)
		}
	},
	applyGetGroupString : function (b) {
		var a = this.getGrouper();
		if (b) {
			if (a) {
				a.setGroupFn(b)
			} else {
				this.setGrouper({
					groupFn : b
				})
			}
		} else {
			if (a) {
				this.setGrouper(null)
			}
		}
	},
	applyGrouper : function (a) {
		if (typeof a == "string") {
			a = {
				property : a
			}
		} else {
			if (typeof a == "function") {
				a = {
					groupFn : a
				}
			}
		}
		a = Ext.factory(a, Ext.util.Grouper, this.getGrouper());
		return a
	},
	updateGrouper : function (b, a) {
		var c = this.data;
		if (a) {
			c.removeSorter(a);
			if (!b) {
				c.getSorters().removeSorter("isGrouper")
			}
		}
		if (b) {
			c.insertSorter(0, b);
			if (!a) {
				c.getSorters().addSorter({
					direction : "DESC",
					property : "isGrouper",
					transform : function (d) {
						return (d === true) ? 1 : -1
					}
				})
			}
		}
	},
	isGrouped : function () {
		return !!this.getGrouped()
	},
	updateSorters : function (d) {
		var b = this.getGrouper(),
		c = this.data,
		a = c.getAutoSort();
		c.setAutoSort(false);
		c.setSorters(d);
		if (b) {
			c.insertSorter(0, b)
		}
		this.updateSortTypes();
		c.setAutoSort(a)
	},
	updateSortTypes : function () {
		var b = this.getModel(),
		a = b && b.getFields(),
		c = this.data;
		if (a) {
			c.getSorters().each(function (f) {
				var d = f.getProperty(),
				e;
				if (!f.isGrouper && d && !f.getTransform()) {
					e = a.get(d);
					if (e) {
						f.setTransform(e.getSortType())
					}
				}
			})
		}
	},
	updateFilters : function (a) {
		this.data.setFilters(a)
	},
	add : function (a) {
		if (!Ext.isArray(a)) {
			a = Array.prototype.slice.apply(arguments)
		}
		return this.insert(this.data.length, a)
	},
	insert : function (f, b) {
		if (!Ext.isArray(b)) {
			b = Array.prototype.slice.call(arguments, 1)
		}
		var j = this,
		l = false,
		d = this.data,
		g = b.length,
		a = this.getModel(),
		h = j.getModelDefaults(),
		k = false,
		c,
		e;
		b = b.slice();
		for (c = 0; c < g; c++) {
			e = b[c];
			if (!e.isModel) {
				e = new a(e)
			} else {
				if (this.removed.indexOf(e) != -1) {
					Ext.Array.remove(this.removed, e)
				}
			}
			e.set(h);
			e.join(j);
			b[c] = e;
			l = l || (e.phantom === true)
		}
		if (b.length === 1) {
			k = d.insert(f, b[0]);
			if (k) {
				k = [k]
			}
		} else {
			k = d.insertAll(f, b)
		}
		if (k) {
			j.fireEvent("addrecords", j, k)
		}
		if (j.getAutoSync() && l) {
			j.sync()
		}
		return b
	},
	remove : function (b) {
		if (b.isModel) {
			b = [b]
		}
		var m = this,
		n = false,
		e = 0,
		a = this.getAutoSync(),
		q = m.getSyncRemovedRecords(),
		c = this.getDestroyRemovedRecords(),
		l = b.length,
		p = [],
		h = [],
		o,
		k = m.data.items,
		f,
		g,
		d;
		for (; e < l; e++) {
			f = b[e];
			if (m.data.contains(f)) {
				o = (f.phantom === true);
				g = k.indexOf(f);
				if (g !== -1) {
					h.push(f);
					p.push(g)
				}
				f.unjoin(m);
				m.data.remove(f);
				if (c && !q && !f.stores.length) {
					f.destroy()
				} else {
					if (!o && q) {
						m.removed.push(f)
					}
				}
				n = n || !o
			}
		}
		m.fireEvent("removerecords", m, h, p);
		if (a && n) {
			m.sync()
		}
	},
	removeAt : function (b) {
		var a = this.getAt(b);
		if (a) {
			this.remove(a)
		}
	},
	removeAll : function (a) {
		if (a !== true) {
			this.fireAction("clear", [this], "doRemoveAll")
		} else {
			this.doRemoveAll.call(this, true)
		}
	},
	doRemoveAll : function (d) {
		var g = this,
		a = this.getDestroyRemovedRecords(),
		h = this.getSyncRemovedRecords(),
		c = g.data.all.slice(),
		f = c.length,
		e,
		b;
		for (e = 0; e < f; e++) {
			b = c[e];
			b.unjoin(g);
			if (a && !h && !b.stores.length) {
				b.destroy()
			} else {
				if (b.phantom !== true && h) {
					g.removed.push(b)
				}
			}
		}
		g.data.clear();
		if (d !== true) {
			g.fireEvent("refresh", g, g.data)
		}
		if (g.getAutoSync()) {
			this.sync()
		}
	},
	each : function (b, a) {
		this.data.each(b, a)
	},
	getCount : function () {
		return this.data.items.length || 0
	},
	getAllCount : function () {
		return this.data.all.length || 0
	},
	getAt : function (a) {
		return this.data.getAt(a)
	},
	getRange : function (b, a) {
		return this.data.getRange(b, a)
	},
	getById : function (a) {
		return this.data.findBy(function (b) {
			return b.getId() == a
		})
	},
	indexOf : function (a) {
		return this.data.indexOf(a)
	},
	indexOfId : function (a) {
		return this.data.indexOfKey(a)
	},
	afterEdit : function (c, g, d) {
		var f = this,
		h = f.data,
		a = d[c.getIdProperty()] || c.getId(),
		b = h.keys.indexOf(a),
		e;
		if (b === -1 && h.map[a] === undefined) {
			return
		}
		if (f.getAutoSync()) {
			f.sync()
		}
		if (a !== c.getId()) {
			h.replace(a, c)
		} else {
			h.replace(c)
		}
		e = h.indexOf(c);
		if (b === -1 && e !== -1) {
			f.fireEvent("addrecords", f, [c])
		} else {
			if (b !== -1 && e === -1) {
				f.fireEvent("removerecords", f, [c], [b])
			} else {
				if (e !== -1) {
					f.fireEvent("updaterecord", f, c, e, b, g, d)
				}
			}
		}
	},
	afterReject : function (a) {
		var b = this.data.indexOf(a);
		this.fireEvent("updaterecord", this, a, b, b, [], {})
	},
	afterCommit : function (c, g, d) {
		var f = this,
		h = f.data,
		a = d[c.getIdProperty()] || c.getId(),
		b = h.keys.indexOf(a),
		e;
		if (b === -1 && h.map[a] === undefined) {
			return
		}
		if (a !== c.getId()) {
			h.replace(a, c)
		} else {
			h.replace(c)
		}
		e = h.indexOf(c);
		if (b === -1 && e !== -1) {
			f.fireEvent("addrecords", f, [c])
		} else {
			if (b !== -1 && e === -1) {
				f.fireEvent("removerecords", f, [c], [b])
			} else {
				if (e !== -1) {
					f.fireEvent("updaterecord", f, c, e, b, g, d)
				}
			}
		}
	},
	afterErase : function (a) {
		var c = this,
		d = c.data,
		b = d.indexOf(a);
		if (b !== -1) {
			d.remove(a);
			c.fireEvent("removerecords", c, [a], [b])
		}
	},
	updateRemoteFilter : function (a) {
		this.data.setAutoFilter(!a)
	},
	updateRemoteSort : function (a) {
		this.data.setAutoSort(!a)
	},
	sort : function (f, d, c) {
		var e = this.data,
		b = this.getGrouper(),
		a = e.getAutoSort();
		if (f) {
			e.setAutoSort(false);
			if (typeof c === "string") {
				if (c == "prepend") {
					e.insertSorters(b ? 1 : 0, f, d)
				} else {
					e.addSorters(f, d)
				}
			} else {
				e.setSorters(null);
				if (b) {
					e.addSorters(b)
				}
				e.addSorters(f, d)
			}
			this.updateSortTypes();
			e.setAutoSort(a)
		}
		if (!this.getRemoteSort()) {
			if (!f) {
				this.data.sort()
			}
			this.fireEvent("sort", this, this.data, this.data.getSorters());
			if (e.length) {
				this.fireEvent("refresh", this, this.data)
			}
		}
	},
	filter : function (e, d, f, a) {
		var c = this.data,
		b = e ? ((Ext.isFunction(e) || e.isFilter) ? e : {
				property : e,
				value : d,
				anyMatch : f,
				caseSensitive : a,
				id : e
			}) : null;
		if (this.getRemoteFilter()) {
			if (e) {
				if (Ext.isString(e)) {
					c.addFilters(b)
				} else {
					if (Ext.isArray(e) || e.isFilter) {
						c.addFilters(e)
					}
				}
			}
		} else {
			c.filter(b);
			this.fireEvent("filter", this, c, c.getFilters());
			this.fireEvent("refresh", this, c)
		}
	},
	filterBy : function (b, a) {
		var d = this,
		e = d.data,
		c = e.length;
		e.filter({
			filterFn : b,
			scope : a
		});
		this.fireEvent("filter", this, e, e.getFilters());
		if (e.length !== c) {
			this.fireEvent("refresh", this, e)
		}
	},
	queryBy : function (b, a) {
		return this.data.filterBy(b, a || this)
	},
	clearFilter : function (a) {
		var b = this.data.length;
		if (a) {
			this.suspendEvents()
		}
		this.data.setFilters(null);
		if (a) {
			this.resumeEvents()
		} else {
			if (b !== this.data.length) {
				this.fireEvent("refresh", this, this.data)
			}
		}
	},
	isFiltered : function () {
		return this.data.filtered
	},
	getSorters : function () {
		var a = this.data.getSorters();
		return (a) ? a.items : []
	},
	getFilters : function () {
		var a = this.data.getFilters();
		return (a) ? a.items : []
	},
	getGroups : function (c) {
		var e = this.data.items,
		b = e.length,
		a = this.getGrouper(),
		d = [],
		k = {},
		g,
		h,
		j,
		f;
		for (f = 0; f < b; f++) {
			g = e[f];
			h = a.getGroupString(g);
			j = k[h];
			if (j === undefined) {
				j = {
					name : h,
					children : []
				};
				d.push(j);
				k[h] = j
			}
			j.children.push(g)
		}
		return c ? k[c] : d
	},
	getGroupString : function (a) {
		var b = this.getGrouper();
		if (b) {
			return b.getGroupString(a)
		}
		return null
	},
	find : function (g, d, e, f, a, c) {
		var b = Ext.create("Ext.util.Filter", {
				property : g,
				value : d,
				anyMatch : f,
				caseSensitive : a,
				exactMatch : c,
				root : "data"
			});
		return this.data.findIndexBy(b.getFilterFn(), null, e)
	},
	findRecord : function () {
		var b = this,
		a = b.find.apply(b, arguments);
		return a !== -1 ? b.getAt(a) : null
	},
	findExact : function (c, a, b) {
		return this.data.findIndexBy(function (d) {
			return d.get(c) === a
		}, this, b)
	},
	findBy : function (b, a, c) {
		return this.data.findIndexBy(b, a, c)
	},
	load : function (c, e) {
		var f = this,
		b,
		d = f.currentPage,
		a = f.getPageSize();
		c = c || {};
		if (Ext.isFunction(c)) {
			c = {
				callback : c,
				scope : e || this
			}
		}
		if (f.getRemoteSort()) {
			c.sorters = c.sorters || this.getSorters()
		}
		if (f.getRemoteFilter()) {
			c.filters = c.filters || this.getFilters()
		}
		if (f.getRemoteGroup()) {
			c.grouper = c.grouper || this.getGrouper()
		}
		Ext.applyIf(c, {
			page : d,
			start : (d - 1) * a,
			limit : a,
			addRecords : false,
			action : "read",
			model : this.getModel()
		});
		b = Ext.create("Ext.data.Operation", c);
		if (f.fireEvent("beforeload", f, b) !== false) {
			f.loading = true;
			f.getProxy().read(b, f.onProxyLoad, f)
		}
		return f
	},
	isLoading : function () {
		return Boolean(this.loading)
	},
	isLoaded : function () {
		return Boolean(this.loaded)
	},
	sync : function () {
		var d = this,
		b = {},
		e = d.getNewRecords(),
		c = d.getUpdatedRecords(),
		a = d.getRemovedRecords(),
		f = false;
		if (e.length > 0) {
			b.create = e;
			f = true
		}
		if (c.length > 0) {
			b.update = c;
			f = true
		}
		if (a.length > 0) {
			b.destroy = a;
			f = true
		}
		if (f && d.fireEvent("beforesync", this, b) !== false) {
			d.getProxy().batch({
				operations : b,
				listeners : d.getBatchListeners()
			})
		}
		return {
			added : e,
			updated : c,
			removed : a
		}
	},
	first : function () {
		return this.data.first()
	},
	last : function () {
		return this.data.last()
	},
	sum : function (e) {
		var d = 0,
		c = 0,
		b = this.data.items,
		a = b.length;
		for (; c < a; ++c) {
			d += b[c].get(e)
		}
		return d
	},
	min : function (f) {
		var d = 1,
		b = this.data.items,
		a = b.length,
		e,
		c;
		if (a > 0) {
			c = b[0].get(f)
		}
		for (; d < a; ++d) {
			e = b[d].get(f);
			if (e < c) {
				c = e
			}
		}
		return c
	},
	max : function (f) {
		var d = 1,
		c = this.data.items,
		b = c.length,
		e,
		a;
		if (b > 0) {
			a = c[0].get(f)
		}
		for (; d < b; ++d) {
			e = c[d].get(f);
			if (e > a) {
				a = e
			}
		}
		return a
	},
	average : function (e) {
		var c = 0,
		b = this.data.items,
		a = b.length,
		d = 0;
		if (b.length > 0) {
			for (; c < a; ++c) {
				d += b[c].get(e)
			}
			return d / a
		}
		return 0
	},
	getBatchListeners : function () {
		return {
			scope : this,
			exception : this.onBatchException,
			complete : this.onBatchComplete
		}
	},
	onBatchComplete : function (b) {
		var e = this,
		a = b.operations,
		d = a.length,
		c;
		for (c = 0; c < d; c++) {
			e.onProxyWrite(a[c])
		}
	},
	onBatchException : function (b, a) {},
	onProxyLoad : function (b) {
		var d = this,
		a = b.getRecords(),
		c = b.getResultSet(),
		e = b.wasSuccessful();
		if (c) {
			d.setTotalCount(c.getTotal())
		}
		if (e) {
			this.fireAction("datarefresh", [this, this.data, b], "doDataRefresh")
		}
		d.loaded = true;
		d.loading = false;
		d.fireEvent("load", this, a, e, b);
		Ext.callback(b.getCallback(), b.getScope() || d, [a, b, e])
	},
	doDataRefresh : function (l, f, b) {
		var a = b.getRecords(),
		k = this,
		d = k.getDestroyRemovedRecords(),
		m = k.getSyncRemovedRecords(),
		c = f.all.slice(),
		h = k.removed,
		j = c.length,
		e,
		g;
		if (b.getAddRecords() !== true) {
			for (e = 0; e < j; e++) {
				g = c[e];
				g.unjoin(k);
				if (a.indexOf(g) === -1) {
					if (m && g.phantom !== true) {
						h.push(g)
					} else {
						if (d && !m && !g.stores.length) {
							g.destroy()
						}
					}
				}
			}
			f.clear();
			k.fireEvent("clear", k)
		}
		if (a && a.length) {
			k.suspendEvents();
			k.add(a);
			k.resumeEvents()
		}
		k.fireEvent("refresh", k, f)
	},
	onProxyWrite : function (b) {
		var c = this,
		d = b.wasSuccessful(),
		a = b.getRecords();
		switch (b.getAction()) {
		case "create":
			c.onCreateRecords(a, b, d);
			break;
		case "update":
			c.onUpdateRecords(a, b, d);
			break;
		case "destroy":
			c.onDestroyRecords(a, b, d);
			break
		}
		if (d) {
			c.fireEvent("write", c, b)
		}
		Ext.callback(b.getCallback(), b.getScope() || c, [a, b, d])
	},
	onCreateRecords : function (b, a, c) {},
	onUpdateRecords : function (b, a, c) {},
	onDestroyRecords : function (b, a, c) {
		this.removed = []
	},
	onMetaChange : function (b) {
		var a = this.getProxy().getModel();
		if (!this.getModel() && a) {
			this.setModel(a)
		}
		this.fireEvent("metachange", this, b)
	},
	getNewRecords : function () {
		return this.data.filterBy(function (a) {
			return a.phantom === true && a.isValid()
		}).items
	},
	getUpdatedRecords : function () {
		return this.data.filterBy(function (a) {
			return a.dirty === true && a.phantom !== true && a.isValid()
		}).items
	},
	getRemovedRecords : function () {
		return this.removed
	},
	loadPage : function (f, c, d) {
		if (typeof c === "function") {
			c = {
				callback : c,
				scope : d || this
			}
		}
		var e = this,
		b = e.getPageSize(),
		a = e.getClearOnPageLoad();
		c = Ext.apply({}, c);
		e.currentPage = f;
		e.load(Ext.applyIf(c, {
				page : f,
				start : (f - 1) * b,
				limit : b,
				addRecords : !a
			}))
	},
	nextPage : function (a) {
		this.loadPage(this.currentPage + 1, a)
	},
	previousPage : function (a) {
		this.loadPage(this.currentPage - 1, a)
	}
});
Ext.define("Ext.picker.Slot", {
	extend : "Ext.dataview.DataView",
	xtype : "pickerslot",
	alternateClassName : "Ext.Picker.Slot",
	requires : ["Ext.XTemplate", "Ext.data.Store", "Ext.Component", "Ext.data.StoreManager"],
	isSlot : true,
	config : {
		title : null,
		showTitle : true,
		cls : Ext.baseCSSPrefix + "picker-slot",
		name : null,
		value : null,
		flex : 1,
		align : "left",
		displayField : "text",
		valueField : "value",
		scrollable : {
			direction : "vertical",
			indicators : false,
			momentumEasing : {
				minVelocity : 2
			},
			slotSnapEasing : {
				duration : 100
			}
		}
	},
	constructor : function () {
		this.selectedIndex = 0;
		this.callParent(arguments)
	},
	applyTitle : function (a) {
		if (a) {
			a = Ext.create("Ext.Component", {
					cls : Ext.baseCSSPrefix + "picker-slot-title",
					docked : "top",
					html : a
				})
		}
		return a
	},
	updateTitle : function (b, a) {
		if (b) {
			this.add(b);
			this.setupBar()
		}
		if (a) {
			this.remove(a)
		}
	},
	updateShowTitle : function (a) {
		var b = this.getTitle();
		if (b) {
			b[a ? "show" : "hide"]();
			this.setupBar()
		}
	},
	updateDisplayField : function (a) {
		this.setItemTpl('<div class="' + Ext.baseCSSPrefix + 'picker-item {cls} <tpl if="extra">' + Ext.baseCSSPrefix + 'picker-invalid</tpl>">{' + a + "}</div>")
	},
	updateAlign : function (a, c) {
		var b = this.element;
		b.addCls(Ext.baseCSSPrefix + "picker-" + a);
		b.removeCls(Ext.baseCSSPrefix + "picker-" + c)
	},
	applyData : function (d) {
		var f = [],
		c = d && d.length,
		a,
		b,
		e;
		if (d && Ext.isArray(d) && c) {
			for (a = 0; a < c; a++) {
				b = d[a];
				e = {};
				if (Ext.isArray(b)) {
					e[this.valueField] = b[0];
					e[this.displayField] = b[1]
				} else {
					if (Ext.isString(b)) {
						e[this.valueField] = b;
						e[this.displayField] = b
					} else {
						if (Ext.isObject(b)) {
							e = b
						}
					}
				}
				f.push(e)
			}
		}
		return d
	},
	updateData : function (a) {
		this.setStore(Ext.create("Ext.data.Store", {
				fields : ["text", "value"],
				data : a
			}))
	},
	initialize : function () {
		this.callParent();
		var a = this.getScrollable().getScroller();
		this.on({
			scope : this,
			painted : "onPainted",
			itemtap : "doItemTap"
		});
		a.on({
			scope : this,
			scrollend : "onScrollEnd"
		})
	},
	onPainted : function () {
		this.setupBar()
	},
	getPicker : function () {
		if (!this.picker) {
			this.picker = this.getParent()
		}
		return this.picker
	},
	setupBar : function () {
		if (!this.rendered) {
			return
		}
		var a = this.element,
		e = this.innerElement,
		f = this.getPicker(),
		g = f.bar,
		k = this.getValue(),
		b = this.getShowTitle(),
		j = this.getTitle(),
		h = this.getScrollable(),
		d = h.getScroller(),
		c = 0,
		l,
		i;
		l = g.getHeight();
		if (b && j) {
			c = j.element.getHeight()
		}
		i = Math.ceil((a.getHeight() - c - l) / 2);
		e.setStyle({
			padding : i + "px 0 " + (i) + "px"
		});
		d.refresh();
		d.setSlotSnapSize(l);
		this.setValue(k)
	},
	doItemTap : function (d, a, c, f) {
		var b = this;
		b.selectedIndex = a;
		b.selectedNode = c;
		b.scrollToItem(c, true);
		b.fireEvent("slotpick", b, b.getValue(true), b.selectedNode)
	},
	scrollToItem : function (e, d) {
		var h = e.getY(),
		c = e.parent(),
		f = c.getY(),
		b = this.getScrollable(),
		a = b.getScroller(),
		g;
		g = h - f;
		a.scrollTo(0, g, d)
	},
	onScrollEnd : function (b, a, g) {
		var f = this,
		d = Math.round(g / f.picker.bar.getHeight()),
		c = f.getViewItems(),
		e = c[d];
		if (e) {
			f.selectedIndex = d;
			f.selectedNode = e;
			f.fireEvent("slotpick", f, f.getValue(), f.selectedNode)
		}
	},
	getValue : function (c) {
		var b = this.getStore(),
		a,
		d;
		if (!b) {
			return
		}
		if (!this.rendered || !c) {
			return this._value
		}
		if (this._value === false) {
			return null
		}
		a = b.getAt(this.selectedIndex);
		d = a ? a.get(this.getValueField()) : null;
		return d
	},
	setValue : function (f) {
		if (!Ext.isDefined(f)) {
			return
		}
		if (!this.rendered || !f) {
			this._value = f;
			return
		}
		var b = this.getStore(),
		a = this.getViewItems(),
		d = this.getValueField(),
		c,
		e;
		c = b.find(d, f);
		if (c != -1) {
			e = Ext.get(a[c]);
			this.selectedIndex = c;
			this.scrollToItem(e);
			this._value = f
		}
	},
	setValueAnimated : function (f) {
		if (!f) {
			return
		}
		if (!this.rendered) {
			this._value = f;
			return
		}
		var b = this.getStore(),
		a = this.getViewItems(),
		d = this.getValueField(),
		c,
		e;
		c = b.find(d, f);
		if (c != -1) {
			e = Ext.get(a[c]);
			this.selectedIndex = c;
			this.scrollToItem(e, {
				duration : 100
			});
			this._value = f
		}
	}
});
Ext.define("Ext.picker.Picker", {
	extend : "Ext.Sheet",
	alias : "widget.picker",
	alternateClassName : "Ext.Picker",
	requires : ["Ext.picker.Slot", "Ext.Toolbar", "Ext.data.Model"],
	isPicker : true,
	config : {
		cls : Ext.baseCSSPrefix + "picker",
		doneButton : true,
		cancelButton : true,
		useTitles : false,
		slots : null,
		value : null,
		height : 220,
		layout : {
			type : "hbox",
			align : "stretch"
		},
		centered : false,
		left : 0,
		right : 0,
		bottom : 0,
		defaultType : "pickerslot",
		toolbar : true
	},
	initElement : function () {
		this.callParent(arguments);
		var b = this,
		a = Ext.baseCSSPrefix,
		c = this.innerElement;
		this.mask = c.createChild({
				cls : a + "picker-mask"
			});
		this.bar = this.mask.createChild({
				cls : a + "picker-bar"
			});
		b.on({
			scope : this,
			delegate : "pickerslot",
			slotpick : "onSlotPick"
		});
		b.on({
			scope : this,
			show : "onShow"
		})
	},
	applyToolbar : function (a) {
		if (a === true) {
			a = {}
			
		}
		Ext.applyIf(a, {
			docked : "top"
		});
		return Ext.factory(a, "Ext.TitleBar", this.getToolbar())
	},
	updateToolbar : function (a, b) {
		if (a) {
			this.add(a)
		}
		if (b) {
			this.remove(b)
		}
	},
	applyDoneButton : function (a) {
		if (a) {
			if (Ext.isBoolean(a)) {
				a = {}
				
			}
			if (typeof a == "string") {
				a = {
					text : a
				}
			}
			Ext.applyIf(a, {
				ui : "action",
				align : "right",
				text : "Done"
			})
		}
		return Ext.factory(a, "Ext.Button", this.getDoneButton())
	},
	updateDoneButton : function (c, a) {
		var b = this.getToolbar();
		if (c) {
			b.add(c);
			c.on("tap", this.onDoneButtonTap, this)
		} else {
			if (a) {
				b.remove(a)
			}
		}
	},
	applyCancelButton : function (a) {
		if (a) {
			if (Ext.isBoolean(a)) {
				a = {}
				
			}
			if (typeof a == "string") {
				a = {
					text : a
				}
			}
			Ext.applyIf(a, {
				align : "left",
				text : "Cancel"
			})
		}
		return Ext.factory(a, "Ext.Button", this.getCancelButton())
	},
	updateCancelButton : function (b, a) {
		var c = this.getToolbar();
		if (b) {
			c.add(b);
			b.on("tap", this.onCancelButtonTap, this)
		} else {
			if (a) {
				c.remove(a)
			}
		}
	},
	updateUseTitles : function (d) {
		var f = this.getInnerItems(),
		e = f.length,
		a = Ext.baseCSSPrefix + "use-titles",
		c,
		b;
		if (d) {
			this.addCls(a)
		} else {
			this.removeCls(a)
		}
		for (c = 0; c < e; c++) {
			b = f[c];
			if (b.isSlot) {
				b.setShowTitle(d)
			}
		}
	},
	applySlots : function (b) {
		if (b) {
			var c = b.length,
			a;
			for (a = 0; a < c; a++) {
				b[a].picker = this
			}
		}
		return b
	},
	updateSlots : function (a) {
		var b = Ext.baseCSSPrefix,
		c;
		this.removeAll();
		if (a) {
			this.add(a)
		}
		c = this.getInnerItems();
		if (c.length > 0) {
			c[0].addCls(b + "first");
			c[c.length - 1].addCls(b + "last")
		}
		this.updateUseTitles(this.getUseTitles())
	},
	onDoneButtonTap : function () {
		var a = this._value,
		b = this.getValue(true);
		if (b != a) {
			this.fireEvent("change", this, b)
		}
		this.hide()
	},
	onCancelButtonTap : function () {
		this.fireEvent("cancel", this);
		this.hide()
	},
	onSlotPick : function (a) {
		this.fireEvent("pick", this, this.getValue(true), a)
	},
	onShow : function () {
		if (!this.isHidden()) {
			this.setValue(this._value)
		}
	},
	setValue : function (k, a) {
		var f = this,
		d = f.getInnerItems(),
		e = d.length,
		j,
		h,
		c,
		b,
		g;
		if (!k) {
			k = {};
			for (b = 0; b < e; b++) {
				k[d[b].config.name] = null
			}
		}
		for (j in k) {
			g = k[j];
			for (b = 0; b < d.length; b++) {
				c = d[b];
				if (c.config.name == j) {
					h = c;
					break
				}
			}
			if (h) {
				if (a) {
					h.setValueAnimated(g)
				} else {
					h.setValue(g)
				}
			}
		}
		f._values = f._value = k;
		return f
	},
	setValueAnimated : function (a) {
		this.setValue(a, true)
	},
	getValue : function (c) {
		var b = {},
		a = this.getItems().items,
		f = a.length,
		e,
		d;
		if (c) {
			for (d = 0; d < f; d++) {
				e = a[d];
				if (e && e.isSlot) {
					b[e.getName()] = e.getValue(c)
				}
			}
			this._values = b
		}
		return this._values
	},
	getValues : function () {
		return this.getValue()
	},
	destroy : function () {
		this.callParent();
		Ext.destroy(this.mask, this.bar)
	}
}, function () {});
Ext.define("Ext.field.Select", {
	extend : "Ext.field.Text",
	xtype : "selectfield",
	alternateClassName : "Ext.form.Select",
	requires : ["Ext.Panel", "Ext.picker.Picker", "Ext.data.Store", "Ext.data.StoreManager", "Ext.dataview.List"],
	config : {
		ui : "select",
		valueField : "value",
		displayField : "text",
		store : null,
		options : null,
		hiddenName : null,
		component : {
			useMask : true
		},
		clearIcon : false,
		usePicker : "auto",
		defaultPhonePickerConfig : null,
		defaultTabletPickerConfig : null,
		name : "picker"
	},
	initialize : function () {
		var b = this,
		a = b.getComponent();
		b.callParent();
		a.on({
			scope : b,
			masktap : "onMaskTap"
		});
		a.input.dom.disabled = true
	},
	updateDefaultPhonePickerConfig : function (b) {
		var a = this.picker;
		if (a) {
			a.setConfig(b)
		}
	},
	updateDefaultTabletPickerConfig : function (a) {
		var b = this.listPanel;
		if (b) {
			b.setConfig(a)
		}
	},
	applyUsePicker : function (a) {
		if (a == "auto") {
			a = (Ext.os.deviceType == "Phone")
		}
		return Boolean(a)
	},
	syncEmptyCls : Ext.emptyFn,
	applyValue : function (d) {
		var a = d,
		c,
		b;
		this.getOptions();
		b = this.getStore();
		if ((d && !d.isModel) && b) {
			c = b.find(this.getValueField(), d, null, null, null, true);
			if (c == -1) {
				c = b.find(this.getDisplayField(), d, null, null, null, true)
			}
			a = b.getAt(c)
		}
		return a
	},
	updateValue : function (b, a) {
		this.previousRecord = a;
		this.record = b;
		this.callParent([(b && b.isModel) ? b.get(this.getDisplayField()) : ""])
	},
	getValue : function () {
		var a = this.record;
		return (a && a.isModel) ? a.get(this.getValueField()) : null
	},
	getRecord : function () {
		return this.record
	},
	getPhonePicker : function () {
		var a = this.getDefaultPhonePickerConfig();
		if (!this.picker) {
			this.picker = Ext.create("Ext.picker.Picker", Ext.apply({
						slots : [{
								align : "center",
								name : this.getName(),
								valueField : this.getValueField(),
								displayField : this.getDisplayField(),
								value : this.getValue(),
								store : this.getStore()
							}
						],
						listeners : {
							change : this.onPickerChange,
							scope : this
						}
					}, a))
		}
		return this.picker
	},
	getTabletPicker : function () {
		var a = this.getDefaultTabletPickerConfig();
		if (!this.listPanel) {
			this.listPanel = Ext.create("Ext.Panel", Ext.apply({
						centered : true,
						modal : true,
						cls : Ext.baseCSSPrefix + "select-overlay",
						layout : "fit",
						hideOnMaskTap : true,
						items : {
							xtype : "list",
							store : this.getStore(),
							itemTpl : '<span class="x-list-label">{' + this.getDisplayField() + ":htmlEncode}</span>",
							listeners : {
								select : this.onListSelect,
								itemtap : this.onListTap,
								scope : this
							}
						}
					}, a))
		}
		return this.listPanel
	},
	onMaskTap : function () {
		if (this.getDisabled()) {
			return false
		}
		this.showPicker();
		return false
	},
	showPicker : function () {
		var b = this.getStore();
		if (!b || b.getCount() === 0) {
			return
		}
		if (this.getReadOnly()) {
			return
		}
		this.isFocused = true;
		if (this.getUsePicker()) {
			var e = this.getPhonePicker(),
			d = this.getName(),
			h = {};
			h[d] = this.record.get(this.getValueField());
			e.setValue(h);
			if (!e.getParent()) {
				Ext.Viewport.add(e)
			}
			e.show()
		} else {
			var f = this.getTabletPicker(),
			g = f.down("list"),
			b = g.getStore(),
			c = b.find(this.getValueField(), this.getValue(), null, null, null, true),
			a = b.getAt((c == -1) ? 0 : c);
			if (!f.getParent()) {
				Ext.Viewport.add(f)
			}
			f.showBy(this.getComponent());
			g.select(a, null, true)
		}
	},
	onListSelect : function (c, a) {
		var b = this;
		if (a) {
			b.setValue(a)
		}
	},
	onListTap : function () {
		this.listPanel.hide({
			type : "fade",
			out : true,
			scope : this
		})
	},
	onPickerChange : function (d, f) {
		var e = this,
		g = f[e.getName()],
		b = e.getStore(),
		c = b.find(e.getValueField(), g, null, null, null, true),
		a = b.getAt(c);
		e.setValue(a)
	},
	onChange : function (f, h, e) {
		var g = this,
		b = g.getStore(),
		d = (b) ? b.find(g.getDisplayField(), e) : -1,
		c = g.getValueField(),
		a = (b) ? b.getAt(d) : null,
		e = (a) ? a.get(c) : null;
		g.fireEvent("change", g, g.getValue(), e)
	},
	updateOptions : function (b) {
		var a = this.getStore();
		if (!a) {
			this.setStore(true);
			a = this._store
		}
		if (!b) {
			a.clearData()
		} else {
			a.setData(b);
			this.onStoreDataChanged(a)
		}
	},
	applyStore : function (a) {
		if (a === true) {
			a = Ext.create("Ext.data.Store", {
					fields : [this.getValueField(), this.getDisplayField()]
				})
		}
		if (a) {
			a = Ext.data.StoreManager.lookup(a);
			a.on({
				scope : this,
				addrecords : this.onStoreDataChanged,
				removerecords : this.onStoreDataChanged,
				updaterecord : this.onStoreDataChanged,
				refresh : this.onStoreDataChanged
			})
		}
		return a
	},
	updateStore : function (a) {
		if (a) {
			this.onStoreDataChanged(a)
		}
	},
	onStoreDataChanged : function (a) {
		var c = this.getInitialConfig(),
		b = this.getValue();
		if (Ext.isDefined(b)) {
			this.updateValue(this.applyValue(b))
		}
		if (this.getValue() === null) {
			if (c.hasOwnProperty("value")) {
				this.setValue(c.value)
			}
			if (this.getValue() === null) {
				if (a.getCount() > 0) {
					this.setValue(a.getAt(0))
				}
			}
		}
	},
	doSetDisabled : function (a) {
		Ext.Component.prototype.doSetDisabled.apply(this, arguments)
	},
	setDisabled : function () {
		Ext.Component.prototype.setDisabled.apply(this, arguments)
	},
	reset : function () {
		var b = this.getStore(),
		a = (this.originalValue) ? this.originalValue : b.getAt(0);
		if (b && a) {
			this.setValue(a)
		}
		return this
	},
	onFocus : function (a) {
		this.fireEvent("focus", this, a);
		this.isFocused = true;
		this.showPicker()
	},
	destroy : function () {
		this.callParent(arguments);
		Ext.destroy(this.listPanel, this.picker, this.hiddenField)
	}
});
Ext.define("MyApp.model.TipoCasilla", {
	extend : "Ext.data.Model",
	config : {
		fields : [{
				name : "value",
				type : "int"
			}, {
				name : "desc",
				type : "string"
			}
		]
	}
});
Ext.define("MyApp.view.VotosPanel", {
	extend : "Ext.Panel",
	alias : "widget.votospanel",
	config : {
		items : [{
				xtype : "button",
				iconCls : "home",
				iconMask : true,
				text : "Party1 - 1"
			}, {
				xtype : "button",
				iconCls : "info",
				iconMask : true,
				text : "MyButton1"
			}, {
				xtype : "button",
				iconCls : "locate",
				iconMask : true,
				text : "MyButton2"
			}, {
				xtype : "button",
				iconCls : "download",
				iconMask : true,
				text : "MyButton3"
			}, {
				xtype : "button",
				iconCls : "maps",
				iconMask : true,
				text : "MyButton4"
			}, {
				xtype : "button",
				ui : "decline",
				iconCls : "time",
				iconMask : true,
				text : "MyButton5"
			}
		]
	}
});
Ext.define("MyApp.view.InfoPanel", {
	extend : "Ext.Panel",
	alias : "widget.infopanel",
	config : {
		items : [{
				xtype : "textfield",
				id : "estado",
				label : "Estado",
				name : "estado"
			}, {
				xtype : "textfield",
				label : "Ciudad",
				name : "ciudad"
			}, {
				xtype : "numberfield",
				label : "CP",
				name : "cp"
			}, {
				xtype : "textfield",
				label : "Distrito",
				name : "distrito"
			}, {
				xtype : "textfield",
				label : "Sección",
				name : "seccion"
			}, {
				xtype : "selectfield",
				label : "Tipo Casilla",
				name : "tipo-casilla",
				displayField : "desc",
				store : "tipoCasillaStore",
				valueField : "id"
			}
		]
	}
});
Ext.define("MyApp.view.FotoPanel", {
	extend : "Ext.Panel",
	alias : "widget.fotopanel",
	config : {
		items : [{
				xtype : "button",
				handler : function (a, b) {
					getPhoto(pictureSource.PHOTOLIBRARY)
				},
				iconCls : "organize",
				iconMask : true,
				text : "F"
			}, {
				xtype : "image",
				height : 201,
				id : "largeImage"
			}
		]
	}
});
Ext.define("MyApp.view.EnviarPanel", {
	extend : "Ext.Panel",
	alias : "widget.enviarpanel",
	config : {
		items : [{
				xtype : "button",
				text : "Send"
			}, {
				xtype : "label",
				html : "sdsdfsdfdfdsfsdf"
			}, {
				xtype : "toolbar",
				docked : "bottom",
				items : [{
						xtype : "button",
						docked : "right",
						iconCls : "maps",
						iconMask : true
					}, {
						xtype : "button",
						docked : "right",
						iconCls : "favorites",
						iconMask : true
					}
				]
			}
		]
	}
});
Ext.define("MyApp.view.ConfigPanel", {
	extend : "Ext.Panel",
	config : {
		items : [{
				xtype : "radiofield",
				label : "Field"
			}, {
				xtype : "togglefield",
				label : "Field"
			}, {
				xtype : "emailfield",
				label : "Field",
				placeHolder : "email@example.com"
			}
		]
	}
});
Ext.define("MyApp.store.TipoCasillaStore", {
	extend : "Ext.data.Store",
	requires : ["MyApp.model.TipoCasilla"],
	config : {
		data : [{
				id : "1",
				desc : "Basica"
			}, {
				id : "2",
				desc : "Contigua"
			}, {
				id : "3",
				desc : "Ext. Contigua"
			}, {
				id : "4",
				desc : "Especial"
			}
		],
		model : "MyApp.model.TipoCasilla",
		storeId : "tipoCasillaStore"
	}
});
Ext.define("Ext.tab.Tab", {
	extend : "Ext.Button",
	xtype : "tab",
	alternateClassName : "Ext.Tab",
	isTab : true,
	config : {
		baseCls : Ext.baseCSSPrefix + "tab",
		pressedCls : Ext.baseCSSPrefix + "tab-pressed",
		activeCls : Ext.baseCSSPrefix + "tab-active",
		active : false,
		title : "&nbsp;"
	},
	template : [{
			tag : "span",
			reference : "badgeElement",
			hidden : true
		}, {
			tag : "span",
			className : Ext.baseCSSPrefix + "button-icon",
			reference : "iconElement",
			style : "visibility: hidden !important"
		}, {
			tag : "span",
			reference : "textElement",
			hidden : true
		}
	],
	updateTitle : function (a) {
		this.setText(a)
	},
	hideIconElement : function () {
		this.iconElement.dom.style.setProperty("visibility", "hidden", "!important")
	},
	showIconElement : function () {
		this.iconElement.dom.style.setProperty("visibility", "visible", "!important")
	},
	updateActive : function (c, b) {
		var a = this.getActiveCls();
		if (c && !b) {
			this.element.addCls(a);
			this.fireEvent("activate", this)
		} else {
			if (b) {
				this.element.removeCls(a);
				this.fireEvent("deactivate", this)
			}
		}
	}
}, function () {
	this.override({
		activate : function () {
			this.setActive(true)
		},
		deactivate : function () {
			this.setActive(false)
		}
	})
});
Ext.define("Ext.tab.Bar", {
	extend : "Ext.Toolbar",
	alternateClassName : "Ext.TabBar",
	xtype : "tabbar",
	requires : ["Ext.tab.Tab"],
	config : {
		baseCls : Ext.baseCSSPrefix + "tabbar",
		defaultType : "tab",
		layout : {
			type : "hbox",
			align : "middle"
		}
	},
	eventedConfig : {
		activeTab : null
	},
	initialize : function () {
		var a = this;
		a.callParent();
		a.on({
			tap : "onTabTap",
			delegate : "> tab",
			scope : a
		})
	},
	onTabTap : function (a) {
		this.setActiveTab(a)
	},
	applyActiveTab : function (b, c) {
		if (!b && b !== 0) {
			return
		}
		var a = this.parseActiveTab(b);
		if (!a) {
			return
		}
		return a
	},
	doSetDocked : function (a) {
		var c = this.getLayout(),
		b = a == "bottom" ? "center" : "left";
		if (c.isLayout) {
			c.setPack(b)
		} else {
			c.pack = (c && c.pack) ? c.pack : b
		}
	},
	doSetActiveTab : function (b, a) {
		if (b) {
			b.setActive(true)
		}
		if (a) {
			a.setActive(false)
		}
	},
	parseActiveTab : function (a) {
		if (typeof a == "number") {
			return this.getInnerItems()[a]
		} else {
			if (typeof a == "string") {
				a = Ext.getCmp(a)
			}
		}
		return a
	}
});
Ext.define("Ext.tab.Panel", {
	extend : "Ext.Container",
	xtype : "tabpanel",
	alternateClassName : "Ext.TabPanel",
	requires : ["Ext.tab.Bar"],
	config : {
		ui : "dark",
		tabBar : true,
		tabBarPosition : "top",
		layout : {
			type : "card",
			animation : {
				type : "slide",
				direction : "left"
			}
		},
		cls : Ext.baseCSSPrefix + "tabpanel"
	},
	delegateListeners : {
		delegate : "> component",
		centeredchange : "onItemCenteredChange",
		dockedchange : "onItemDockedChange",
		floatingchange : "onItemFloatingChange",
		disabledchange : "onItemDisabledChange"
	},
	initialize : function () {
		this.callParent();
		this.on({
			order : "before",
			activetabchange : "doTabChange",
			delegate : "> tabbar",
			scope : this
		})
	},
	applyScrollable : function () {
		return false
	},
	updateUi : function (a, b) {
		this.callParent(arguments);
		if (this.initialized) {
			this.getTabBar().setUi(a)
		}
	},
	doSetActiveItem : function (d, j) {
		if (d) {
			var f = this.getInnerItems(),
			g = f.indexOf(j),
			i = f.indexOf(d),
			e = g > i,
			c = this.getLayout().getAnimation(),
			b = this.getTabBar(),
			h = b.parseActiveTab(g),
			a = b.parseActiveTab(i);
			if (c && c.setReverse) {
				c.setReverse(e)
			}
			this.callParent(arguments);
			if (i != -1) {
				this.forcedChange = true;
				b.setActiveTab(i);
				this.forcedChange = false;
				if (h) {
					h.setActive(false)
				}
				if (a) {
					a.setActive(true)
				}
			}
		}
	},
	doTabChange : function (a, d) {
		var b = this.getActiveItem(),
		c;
		this.setActiveItem(a.indexOf(d));
		c = this.getActiveItem();
		return this.forcedChange || b !== c
	},
	applyTabBar : function (a) {
		if (a === true) {
			a = {}
			
		}
		if (a) {
			Ext.applyIf(a, {
				ui : this.getUi(),
				docked : this.getTabBarPosition()
			})
		}
		return Ext.factory(a, Ext.tab.Bar, this.getTabBar())
	},
	updateTabBar : function (a) {
		if (a) {
			this.add(a);
			this.setTabBarPosition(a.getDocked())
		}
	},
	updateTabBarPosition : function (b) {
		var a = this.getTabBar();
		if (a) {
			a.setDocked(b)
		}
	},
	onItemAdd : function (e) {
		var k = this;
		if (!e.isInnerItem()) {
			return k.callParent(arguments)
		}
		var c = k.getTabBar(),
		o = e.getInitialConfig(),
		d = o.tab || {},
		g = (e.getTitle) ? e.getTitle() : o.title,
		i = (e.getIconCls) ? e.getIconCls() : o.iconCls,
		j = (e.getHidden) ? e.getHidden() : o.hidden,
		n = (e.getDisabled) ? e.getDisabled() : o.disabled,
		p = (e.getBadgeText) ? e.getBadgeText() : o.badgeText,
		b = k.getInnerItems(),
		h = b.indexOf(e),
		l = c.getItems(),
		a = c.getActiveTab(),
		m = (l.length >= b.length) && l.getAt(h),
		f;
		if (g && !d.title) {
			d.title = g
		}
		if (i && !d.iconCls) {
			d.iconCls = i
		}
		if (j && !d.hidden) {
			d.hidden = j
		}
		if (n && !d.disabled) {
			d.disabled = n
		}
		if (p && !d.badgeText) {
			d.badgeText = p
		}
		f = Ext.factory(d, Ext.tab.Tab, m);
		if (!m) {
			c.insert(h, f)
		}
		e.tab = f;
		k.callParent(arguments);
		if (!a && a !== 0) {
			c.setActiveTab(c.getActiveItem())
		}
	},
	onItemDisabledChange : function (a, b) {
		if (a && a.tab) {
			a.tab.setDisabled(b)
		}
	},
	onItemRemove : function (b, a) {
		this.getTabBar().remove(b.tab, this.getAutoDestroy());
		this.callParent(arguments)
	}
}, function () {});
Ext.define("MyApp.view.MainTabPanel", {
	extend : "Ext.tab.Panel",
	requires : ["MyApp.view.InfoPanel", "MyApp.view.VotosPanel", "MyApp.view.FotoPanel", "MyApp.view.EnviarPanel"],
	config : {
		items : [{
				xtype : "container",
				scrollable : "vertical",
				title : "Info",
				iconCls : "home",
				items : [{
						xtype : "infopanel"
					}
				]
			}, {
				xtype : "container",
				scrollable : "vertical",
				title : "Votos",
				iconCls : "compose",
				items : [{
						xtype : "votospanel"
					}
				]
			}, {
				xtype : "container",
				scrollable : "vertical",
				title : "Foto",
				iconCls : "user",
				items : [{
						xtype : "fotopanel"
					}
				]
			}, {
				xtype : "container",
				ui : "",
				scrollable : "vertical",
				title : "Send",
				iconCls : "action",
				items : [{
						xtype : "enviarpanel"
					}
				]
			}, {
				xtype : "toolbar",
				docked : "top",
				items : [{
						xtype : "button",
						docked : "right",
						iconCls : "settings",
						iconMask : true
					}
				]
			}
		],
		tabBar : {
			docked : "bottom"
		}
	}
});
Ext.define("Ext.data.ArrayStore", {
	extend : "Ext.data.Store",
	alias : "store.array",
	uses : ["Ext.data.reader.Array"],
	config : {
		proxy : {
			type : "memory",
			reader : "array"
		}
	},
	loadData : function (b, a) {
		this.callParent([b, a])
	}
}, function () {
	Ext.data.SimpleStore = Ext.data.ArrayStore
});
Ext.define("Ext.data.reader.Array", {
	extend : "Ext.data.reader.Json",
	alternateClassName : "Ext.data.ArrayReader",
	alias : "reader.array",
	config : {
		totalProperty : undefined,
		successProperty : undefined
	},
	createFieldAccessExpression : function (g, c, b) {
		var f = this,
		e = g.getMapping(),
		d = (e == null) ? f.getModel().getFields().indexOf(g) : e,
		a;
		if (typeof d === "function") {
			a = c + ".getMapping()(" + b + ", this)"
		} else {
			if (isNaN(d)) {
				d = '"' + d + '"'
			}
			a = b + "[" + d + "]"
		}
		return a
	}
});
Ext.Loader.setConfig({
	enabled : true
});
Ext.application({
	requires : ["Ext.field.Text", "Ext.field.Number", "Ext.field.Select", "Ext.Img", "Ext.Label"],
	models : ["TipoCasilla"],
	stores : ["TipoCasillaStore"],
	views : ["MainTabPanel", "VotosPanel", "InfoPanel", "FotoPanel", "EnviarPanel", "ConfigPanel"],
	name : "MyApp",
	launch : function () {
		Ext.create("MyApp.view.MainTabPanel", {
			fullscreen : true
		})
	}
});
