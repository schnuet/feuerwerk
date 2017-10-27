<template>
	<div 
		class="pageelement"
		:class="[element.class, {
			'selected': isSelected, 
			'resizable': (isSelected && !element.inGrid),
			'is-free': !element.inGrid,
			'dragging': dragging
		}]"
		:style="styleList"
		@click="makeActive"
		@mousedown="onDragStart"
	>
		<template v-if="isTextElement">
			<div
				v-if="split"
				v-html="splitLetters"
			>
			</div>
			<div 
				v-else-if="element.type === 'paragraph'" 
				v-html="formattedText"
			>
			</div>
			<template v-else>
				{{element.content}}
			</template>
		</template>
		<img
			v-if="type === 'image'" 
			draggable="false"
			:src="getImgUrl(element.url)" 
			:alt="element.content"
			:style="{'object-fit': element.fit}"
		>
	</div>
</template>

<script>
import {bus} from '../services/eventBus';
import {markdown} from 'markdown';

export default {
	props: ['type', 'element', 'currentElement'],

	data () {
		return {
			active: false,
			dragging: false,
			dragPos: {
				startX: 0,
				startY: 0,
				deltaX: 0,
				deltaY: 0
			},

			// bound event functions
			boundOnDragEnd: null,
			boundOnDrag: null,

			parent: null,
			split: false
		};
	},

	mounted () {
		bus.$on('slideEntered', pageId => {
			if (pageId === this.element.page) {
				this.onSlideEntered();
			}
		});

		this.boundOnDragEnd = this.onDragEnd.bind(this);
		this.boundOnDrag = this.onDrag.bind(this);
	},

	methods: {
		makeActive () {
			if (this.isSelected) return;
			console.log ('selecting element');
			this.$emit('selected', this.element);
		},
		getImgUrl(url) {
			return '.' + url;
			//var images = require.context('../assets/', false, /\.(png|jpg)$/);
			//return images('./' + url);
		},
		takeOffGrid () {
			//if (this.element.inGrid === false) return;

			console.log ('taking off grid.');

			this.element.inGrid = false;

			let pos = this.getCurrentPosition();
			this.setPosition(pos);

			let size = this.getSize();
			this.setSize(size);
		},
		onDragStart(event) {
			if (!this.isSelected) return false;

			// if we try to resize, do not drag.
			var tagName;
			try {
				tagName = event.originalTarget.nodeName
			} catch (error) {
				//console.log (error);
				tagName = 'resizer';
			}
			if (tagName === 'resizer') {
				console.log ('ok...');
			}
			else {
				event.preventDefault();
				// there is no dragging in the grid
				if (this.element.inGrid) {
					//this.takeOffGrid();
				}
				
				//console.log(event);
				this.dragging = true;
				this.dragPos.startX = event.pageX;
				this.dragPos.startY = event.pageY;
			}

			window.addEventListener('mousemove', this.boundOnDrag, false);
			window.addEventListener('mouseup', this.boundOnDragEnd, false);
		
		},
		onDrag(event) {
			if (this.dragging) {
				//console.log (event.pageX, event.pageY);
				this.dragPos.deltaX = event.pageX - this.dragPos.startX;
				this.dragPos.deltaY = event.pageY - this.dragPos.startY;
			}
		},
		onDragEnd (event) {
			window.removeEventListener('mousemove', this.boundOnDrag);
			window.removeEventListener('mouseup', this.boundOnDragEnd);
			

			// if we are not dragging, we are resizing.
			if (!this.dragging) {
				let size = this.getSize();
				this.setSize(size);
				return;
			}

			this.dragging = false;

			let pos = this.getCurrentPosition();
			this.setPosition(pos);
			
		},
		getParentDimensions () {

			// get the dimensions of the parent node.
			if (this.parent === null) {
				this.parent = this.$el.parentElement;
			}
			if (this.parent === null) {
				console.log ('no parent', this.$el);
				return;
			}
			return {
				width: this.parent.clientWidth,
				height: this.parent.clientHeight
			}
		},
		getCurrentPosition (noTranslate) {

			var deltaX, deltaY;
			if (noTranslate) {
				deltaX = 0;
				deltaY = 0;
			}
			else {
				deltaX = this.dragPos.deltaX;
				deltaY = this.dragPos.deltaY;
			}

			let parent = this.getParentDimensions();

			let startLeft = this.$el.offsetLeft;
			let startTop = this.$el.offsetTop;
			let left = (startLeft + deltaX) / parent.width * 100;
			let top = (startTop + deltaY) / parent.height * 100;
			
			return {
				left: left,
				top: top
			};
		},
		setPosition (pos) {
			this.element.left = pos.left;
			this.element.top = pos.top;
			this.dragPos.deltaX = 0;
			this.dragPos.deltaY = 0;
		},
		getSize () {
			let parent = this.getParentDimensions();
			return {
				width: (this.$el.offsetWidth / parent.width) * 100,
				height: (this.$el.offsetHeight / parent.height) * 100
			};
		},
		setSize (size) {
			this.element.width = size.width;
			this.element.height = size.height;
		},
		onSlideEntered () {
			console.log ('slide entered!');
		}
	},

 	computed: {
	  	isTextElement() {
			return (this.type==='heading_main' || this.type === 'heading_sub' || this.type==='paragraph');
	  	},
	  	isSelected () {
		  	if (!this.currentElement) return false;
		  	return (this.element.id === this.currentElement.id);
	  	},
	  	styleList() {
			let styles = {
				transform: `translate3d(${this.dragPos.deltaX}px, ${this.dragPos.deltaY}px, 0)`
			};
			if (this.element.inGrid) {
				styles['grid-column-start'] = this.element.gridColumnStart,
				styles['grid-column-end'] = this.element.gridColumnStart + this.element.gridWidth,
				styles['grid-row-start'] = this.element.gridRowStart,
				styles['grid-row-end'] = this.element.gridRowStart + this.element.gridHeight
			}
			else {
				styles['left'] = this.element.left + '%';
				styles['top'] = this.element.top + '%';
				styles['width'] = this.element.width + '%';
				styles['height'] = this.element.height + '%';
			}
			return styles;
		},
		realText () {
			if (this.type === 'paragraph') {
				return this.formattedText;
			}
			else return this.element.content;
		},
		formattedText() {
			return markdown.toHTML( this.element.content );
		},
		splitLetters () {
			let letters = this.realText.split('');
			return '<span>' + letters.join('</span><span>') + '</span>';
		}
  	}, 
	watch: {
		'element.inGrid': function (isNowInGrid, wasInGrid) {
			if (wasInGrid && isNowInGrid === false) {
				this.takeOffGrid();
			}
		}
	}
}
</script>

<style lang="scss">
.pageelement {
	overflow: visible;
	position: relative;
	height: auto;

	text-align: left;

	&.selected {
		outline: 2px solid cyan;
		user-select: none;
		cursor: default;

		img, p {
			user-select: none;
			cursor: default;
		}
		
		&.resizable {
			resize: both; 
		}
	}

	&.is-free {
		position: absolute;
		overflow: hidden;
	}

	&.image {
		img {
			pointer-events: none;
			width: 100%;
			height: 100%;
			object-position: top left;
		}
	}

	&.dragging {
		z-index: 100;
	}
}
</style>
