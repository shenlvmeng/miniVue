import Watcher from './Watcher'

//compile.js部分
function Compile (el, vm) {
	this.$vm = vm;
	this.$el = this.isElementNode(el) ? el : document.querySelector(el);

	if (this.$el) {
		this.$fragment = this.node2fragment(this.$el);
		this.init(); // 模板编译
		this.$el.appendChild(this.$fragment);
	}
}

Compile.prototype = {
	init: function () {
		this.compileElement(this.$fragment);
	},

	node2fragment: function (el) {
		var fragment = document.createDocumentFragment(), 
			child;
		while (child = el.firstChild) {
			fragment.appendChild(child);
		}
		return fragment;
	},

	compileElement: function (el) {
		var childs = el.childNodes,
			self = this;
		Array.prototype.slice.call(childs).forEach(function (node) {
			var text = node.textContent,
				reg = /\{\{(.*)\}\}/; //匹配模型数据

			if (self.isElementNode(node)) {
				self.compile(node); //若子元素仍为元素类型则继续编译模板
			} else if (self.isTextNode(node) && reg.test(text)) {
				self.compileText(node, RegExp.$1);
			}

			//编译子节点
			if (node.childNodes && node.childNodes.length) {
				self.compileElement(node);
			}
		});
	},

	compileText: function(node, exp) {
		compileUtil.text(node, this.$vm, exp);
	},

	compile: function (node) {
		var nodeAttrs = node.attributes,
			self = this;

		Array.prototype.slice.call(nodeAttrs).forEach(function (attr) {
			//解析directives
			var attrName = attr.name;
			if (self.isDirective(attrName)) {
				var exp = attr.value;
				var dir = attrName.substring(2); //从第3位开始取
				//监听事件
				if (self.isEventDirective(dir)) {
					compileUtil.eventHandler(node, self.$vm, exp, dir);
				//普通属性
				} else {
					compileUtil[dir] && compileUtil[dir](node, self.$vm, exp);
				}
				//移除自定义属性
				node.removeAttribute(attr);
			}
		});
	},

	isElementNode: function(el) {
		return el.nodeType === 1;
	},

	isTextNode: function (el) {
		return el.nodeType === 3;
	},

	isDirective: function (attr) {
		return attr.indexOf('v-') == 0;
	},

	isEventDirective: function (dir) {
		return dir.indexOf('on') == 0;
	}
};

var compileUtil = {
	text: function (node, vm, exp) {
		this.bind(node, vm, exp, 'text');
	},

	html: function (node, vm, exp) {
		this.bind(node, vm, exp, 'html');
	},

	model: function (node, vm, exp) {
		this.bind(node, vm, exp, 'model');

		//伪双向绑定
		var self = this,
			val = this._getVMVal(vm, exp);
		node.addEventListener('input', function (e) {
			var newVal = e.target.value;
			if (val === newVal) {
				return;
			}
			self._setVMVal(vm, exp, newVal);
			val = newVal;
		});
	},

	class: function (node, vm, exp) {
		this.bind(node, vm, exp, 'class');
	},

	bind: function (node, vm, exp, dir) {
		var updaterFn = updater[dir + 'Updater'];
		//第一次初始化视图
		updaterFn && updaterFn(node, this._getVMVal(vm, exp));

		new Watcher(vm, exp, function (val, oldVal) {
			updaterFn && updaterFn(node, val, oldVal);
		});
	},

	eventHandler: function (node, vm, exp, dir) {
		var eventType = dir.split(':')[1],
			handler = vm.$options.methods && vm.$options.methods[exp];

		if (eventType, handler) {
			node.addEventListener(eventType, handler.bind(vm), false);
		}
	},

	_getVMVal: function (vm, exp) {
		var val = vm._data;
		exp = exp.split('.');
		exp.forEach(function (e) {
			val = val[e];
		});
		return val;
	},

	_setVMVal: function (vm, exp, newVal) {
		var val = vm._data;
		exp = exp.split('.');
		exp.forEach(function (e, i) {
			if (i < exp.length - 1) {
				val = val[e];
			} else {
				val[e] = newVal;
			}
		});
	}
}

var updater = {
	textUpdater: function (node, value) {
		node.textContent = typeof value == 'undefined' ? '' : value;
	},

	htmlUpdater: function (node, value) {
		node.innerHTML = typeof value == 'undefined' ? '' : value;
	},

	modelUpdater: function (node, value) {
		node.value = typeof value == 'undefined' ? '' : value;
	},

	classUpdater: function (node, value, oldValue) {
		var className = node.className;
		className = className.replace(oldValue, '').trim();

		var space = className && String(value).trim() ? ' ' : '';

		node.className = className + space + value;
	}
}

export default Compile;