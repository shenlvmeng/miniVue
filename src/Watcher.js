import Dep from './Dep';

//Watcher.js部分
function Watcher (vm, exp, cb) {
	this.cb = cb;
	this.vm = vm;
	this.exp = exp;
	this.depIds = {};
	this.value = this.get(); //触发属性getter函数
}

Watcher.prototype = {
	get: function () {
		Dep.target = this; //添加订阅者
		var value = this._getVMVal(); //触发getter函数
		Dep.target = null; //重置target
		return value;
	},
	update: function () {
		this.run();
	},
	run: function () {
		var value = this.get();
		var oldValue = this.value;
		if (value !== oldValue) {
			this.value = value;
			this.cb.call(this.vm, value, oldValue);
		}
	},
	addDep: function (dep) {
		// 调用run()时，会去触发相应属性的getter函数
		// 从而触发dep.depend()收集依赖，并触发Watcher.prototype.addDep
		// 之后检查dep.id是否出现在Watcher的dep list中
		// 如果已有则只是属性修改，不必再次添加到属性的dep中
		if (!this.depIds.hasOwnProperty(dep.id)) {
			dep.addSub(this);
			this.depIds[dep.id] = dep;
		}
	},
	_getVMVal: function () {
		// 在嵌套寻找中会在属性的父属性中依次添加这个Watcher对象
		var val = this.vm._data,
			exp = this.exp.split('.');
		exp.forEach(function (e) {
			val = val[e];
		});
		return val;
	}
}

export default Watcher;