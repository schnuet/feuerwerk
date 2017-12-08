let value = 0;

export default {
	'fall-in': [
		{
			prop: 'transform',
			from: -100,
			to: 0,
			content: 'translate3d(0, ${value}%, 0)'
		},
		{
			prop: 'transform',
			from: 2,
			to: 1,
			content: 'scale3d(${value}, ${value}, 1)'
		},
		{
			prop: 'opacity',
			from: 0,
			to: 1,
			content: '${value}'
		}
	],
	'fade-out': [
		{
			prop: 'opacity',
			from: 1,
			to: 0,
			content: '${value}'
		},
		{
			prop: 'transform',
			from: 1,
			to: 0,
			content: 'scale3d(${value}, ${value}, 1)'
		},
		{
			prop: 'transform',
			from: 0,
			to: -100,
			content: 'translate3d(${value}%, 0, 0)'
		},
	]
};