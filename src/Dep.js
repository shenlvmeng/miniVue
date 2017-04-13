//Dep.js 部分
var uid = 0;

function Dep () {
	this.depId = uid++;
	this.subs = [];
}

Dep.prototype = {
	addSub: function (sub) {
		this.subs.push(sub);
	},

	depend: function () {
		//在Watcher中添加依赖ID，避免重复添加
		Dep.target.addDep(this);
	},

	removeSub: function (sub) {
		var index = this.subs.indexOf(sub);
		if (index != -1) {
			this.subs.splice(index, 1);
		}
	},

	notify: function () {
		this.subs.forEach(function (sub) {
			sub.update();
		});
	}
};

Dep.target = null;

export default Dep;