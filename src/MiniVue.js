import Compile from './Compile'
import observe from './Observer'

//入口部分
function MiniVue (options) {
	this.$options = options;
	var data = this._data = this.$options.data,
		self = this;

	//数据代理
	Object.keys(data).forEach(function (key) {
		self._proxy(key);
	});

	//监听变化
	observe(data);

	this.$compile = new Compile(options.el || document.body, this);
}

MiniVue.prototype = {
	_proxy: function (key) {
		var self = this;
		Object.defineProperty(self, key, {
			configurable: false,
			enumerable: true,
			get: function () {
				return self._data[key];
			},
			set: function (newVal) {
				self._data[key] = newVal;
			}
		});
	}
};

export default MiniVue;