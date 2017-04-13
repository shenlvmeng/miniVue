import Dep from './Dep'

// Observer.js部分
function observe (data) {
	//未考虑数组的情况
	if (!data || typeof data !== 'object') {
		return;
	}
	return new Observer(data);
}

function Observer (data) {
	this.data = data;
	this.walk(data);
}

Observer.prototype = {
	walk: function (data) {
		Object.keys(data).forEach(function (key) {
			defineReactive(data, key, data[key]);
		});
	}
};

function defineReactive(data, key, val) {
	var dep = new Dep(),
	//监听子属性
		child = observe(val);

	Object.defineProperty(data, key, {
		enumerable: true,
		configurable: false,
		get: function () {
			//添加订阅者
			if (Dep.target) {
				dep.depend();
				if (child) {
					child.dep.depend();
				}
			}
			return val;
		},
		set: function (newVal) {
			if (newVal === val) return;
			val = newVal; // tricky 闭包
			child = observe(newVal); // 新的属性为对象时继续监听
			dep.notify(); // 通知订阅者
		}
	});
}

export default observe;