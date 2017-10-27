<template>
	<swiper-slide 
		class="page"
		:class="classList"
	>
		<page-element 
			v-for="element in page.elements" 
			:element="element" 
			:type="element.type" 
			:key="element.id"
			:current-element="currentElement"
			@selected="selectElement">
		</page-element>
  </swiper-slide>
</template>

<script>
import pageColors from '../data/pageColors';
import pageLayouts from '../data/pageLayouts';

export default {
	data() {
		return {
			
	  	};
	},

	props: ['page', 'currentElement'],
	  
	methods: {
		selectElement(element) {
			this.$emit('select-element', element);
		},
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
		}
	}
}
</script>

<style lang="scss">

</style>
