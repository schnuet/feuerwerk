<template>
	<div 
		class="page swiper-slide"
		:class="classList"
	>
		<page-element 
			v-for="element in page.elements" 
			:element="element"
			:key="element.id"
			:current-element="currentElement"
			:page-is-active="pageIsActive"
			:translate-progress="translateProgress"
			@selected="selectElement">
		</page-element>
  </div>
</template>

<script>
import pageColors from '../data/pageColors';
import pageLayouts from '../data/pageLayouts';

import bus from '../services/eventBus';


export default {
	data() {
		return {
			animation: null,
			translateProgress: 0
	  	};
	},

	props: ['page', 'currentElement', 'index', 'currentIndex'],
	  
	methods: {
		selectElement(element) {
			this.$emit('select-element', element);
		},
		setTranslate(translate) {
			this.translateProgress = (this.pageWidth + (-translate - this.pagePos )) / this.pageWidth;
		}
	},

	computed: {
		classList() {
			let classes = [];
			if (this.color) {
				classes.push(this.color.class);
			}
			if (this.layout) {
				classes.push(this.layout.class);
			}
			return classes;
		},
		color() {
			return pageColors[this.page.color];
		},
		layout() {
			return pageLayouts[this.page.layout];
		},
		pageWidth() {
			return this.$el.offsetWidth;
		},
		pagePos () {
			return this.pageWidth * this.index;
		},
		pageIsActive() {
			return this.currentIndex === this.index;
		}
	},

	mounted() {
		bus.$on('translatePresentation', translate => {
			this.setTranslate(translate);
		});
	}
}
</script>

<style lang="scss">

</style>
