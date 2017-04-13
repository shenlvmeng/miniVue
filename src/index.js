import MiniVue from './MiniVue';

new MiniVue({
	el: "#app",
	data: {
		word: 'Hello world!'
	},
	methods: {
		sayHi: function () {
			this.word = 'Hi, everyone!';
		}
	}
});
