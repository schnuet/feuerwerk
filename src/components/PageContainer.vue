<template>
	<div class="pagecontainer">
		<swiper
			class="pagecontainer"
			:options="options" 
			:not-next-tick="notNextTick" 
			ref="mySwiper">
			<swiper-slide
				v-for="page in pages"
				:key="page.id"
				class="page"
				:class="[{'swiper-no-swiping': swiperLocked}, page.class]"
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
			<!-- Optional controls -->
			<div class="swiper-pagination"  slot="pagination"></div>
			<div class="swiper-button-prev" slot="button-prev"></div>
			<div class="swiper-button-next" slot="button-next"></div>
			<div class="swiper-scrollbar"   slot="scrollbar"></div>
		</swiper>

		<editor 
			v-show="editorVisible" 
			:current-element="currentElement"
			:elements="elements"
			@created-element="addElement"
			@created-page="addPage"
			@stop-editing="deselectElement"
			@delete-element="deleteElement"
			@load="loadData"
			>
		</editor>
	</div>
</template>

<script>
import {bus} from '../services/eventBus';

import {elements} from '../data/elements';

import _ from 'lodash';

let pageC = null;

export default {
  	data() {
	  	return {
			notNextTick: true,
			options: {
				// swiper options
				autoplay: false,
				direction: 'horizontal',
				grabCursor: true,
				setWrapperSize: false,
				autoHeight: false,
				pagination: '.swiper-pagination',
				paginationClickable: true,
				prevButton: '.swiper-button-prev',
				nextButton: '.swiper-button-next',
				scrollbar: '.swiper-scrollbar',
				mousewheelControl: true,
				observeParents: true,
				// if you need use plugins in the swiper, you can config in here like this
				debugger: true,
				// swiper callbacks
				onTransitionStart (swiper) {
					console.log(swiper)
				},
				onSetTransition(swiper, transition) {
					console.log ('transition', transition);
				},
				onSetTranslate(swiper, translate) {
					console.log ('translate', translate);
				},
				onSlideChangeTransitionEnd(swiper, event) {
					console.log ('transition ended', event);
				},
				/*onSlideChangeEnd(swiper) {
					//console.log('change', swiper.realIndex);
				}*/
				// more Swiper configs and callbacks...
				// ...
			},
			swiperLocked: false,

			pages: [
				{
					id: 0,
					elements: [],
					class: 'page_red page_layout-text'
				},
				{
					id: 1,
					elements: elements,
					class: 'page_yellow page_layout-text'
				},
				{
					id: 2,
					elements: [],
					class: 'page_blue page_layout-text'
				}
			],
			elements: elements,

			editorVisible: true,
			currentElement: null
		}
	},

	// you can find current swiper instance object like this, 
  	// while the notNextTick property value must be true
	computed: {
		swiper() {
			return this.$refs.mySwiper.swiper;
    	}
	},

	methods: {
		lockSwiper () {
			this.swiperLocked = true;
			this.options.paginationClickable = false;
			this.options.simulateTouch  = false;
			this.options.allowSwipeToNext = false;
			this.options.allowSwipeToPrev = false;
			//this.options.loop = false;
			//this.options.loop = false;
			//this.options.loop = false;
		},
		unlockSwiper () {
			this.swiperLocked = false;
			this.options.paginationClickable = true;
			this.options.simulateTouch  = true;
			this.options.allowSwipeToNext = true;
			this.options.allowSwipeToPrev = true;
		},
		addElement(element) {
			let elements = this.pages[this.swiper.realIndex].elements;
			element.id = elements.length;
			elements.push(element);
			this.selectElement(element);
			this.saveData();
		},
		selectElement(element) {
			this.lockSwiper();
			console.log ('element selected', element);
			this.currentElement = element;
		},
		deselectElement () {
			this.unlockSwiper();
			this.currentElement = null;
			this.saveData();
		},
		deleteElement() {
			let element = this.currentElement;
			this.deselectElement();
			let index = _.findIndex(this.elements, ['id', element.id]);
			this.elements.splice(index, 1);
			this.saveData();
		},
		addPage(page) {
			page.id = this.pages.length;
			this.pages.push(page);
			setTimeout(function(context) {
				context.swiper.slideTo(context.pages.length);
			}, 10, this);
			//this.swiper.slideTo(this.pages.length);
			this.saveData();
		},
		saveData () {
			let pageData = JSON.stringify(this.pages);
			localStorage.setItem('pageData', pageData);
		},
		loadData () {
			let pageData = localStorage.getItem('pageData');
			let parsed = JSON.parse(pageData);
			this.pages = parsed;
		}
	},

	created () {
		pageC = this;
	},

	mounted () {
		// you can use current swiper instance object to do something(swiper methods)
    	//console.log('this is current swiper instance object', this.swiper);
    	//this.swiper.slideTo(3, 1000, false);
		this.swiper.on('onTransitionEnd', function (swiper) {
			bus.$emit('slideEntered', swiper.activeIndex);
		});
	}
}
</script>

<style lang="scss">
@import "../scss/variables";

.pagecontainer {
	height: 100%;
	width: 100%;
	overflow: hidden;
}

.page {
	height: 100%;
	padding: $size-padding-page;
	color: #fff;
	background-color: #555;
	display: grid;
	grid-template-columns: 10vmin 10vmin 10vmin 10vmin 10vmin 10vmin 10vmin 10vmin 10vmin 10vmin 10vmin 10vmin 1fr;
	grid-template-rows: 10vmin 10vmin 10vmin 10vmin 10vmin 10vmin 10vmin 10vmin;
	
	&_layout-text {
		grid-template-columns: 23vw 6vw 6vw 6vw 6vw 6vw 6vw 6vw 6vw 1fr;
		grid-template-rows: 4.1vw 3.3vw 2.6vw 6vw 6vw 6vw 1fr;
		grid-gap: 1.1vw;
	}

	&_red {
		background-color: $red-5;
	}
	&_yellow {
		background-color: $yellow-5;
	}
	&_blue {
		background-color: $blue-5;
	}
}
</style>
