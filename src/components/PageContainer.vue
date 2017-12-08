<template>
	<div class="pagecontainer" :style="styleList">
		<!--<div style="position: fixed; z-index: 4000; top: 0; left: 0;">
			
		</div>-->
		<div
			class="page-swiper">

			<div class="swiper-wrapper">
				<page 
					v-for="(page, index) in pages"
					:key="page.id"
					:index="index"
					:class="{'swiper-no-swiping': swiperLocked}"
					:page="page"
					:current-element="currentElement"
					:current-index="currentSlide"
					@select-element="selectElement"
				></page>
			</div>

			<!--<swiper-slide
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
			</swiper-slide>-->

			<!-- Optional controls -->
			<div class="swiper-pagination"  slot="pagination"></div>
			<!--
				<div class="swiper-button-prev" slot="button-prev"></div>
				<div class="swiper-button-next" slot="button-next"></div>
			-->
			<div class="swiper-scrollbar"   slot="scrollbar"></div>
		</div>

		<editor 
			:current-element="currentElement"
			@stop-editing="deselectElement"
			@delete-element="deleteElement"
			>
		</editor>
		<page-editor
			v-if="showPageEditor"
			:page="currentPage"
		>
		</page-editor>
		<div class="bottombar" v-show="!editorVisible">
			<div class="bottombar_buttonblock">
				<button class="button button_wide" @click="loadState">Laden</button>
				<button class="button button_wide" @click="saveData">Speichern</button>
				<button class="button button_wide" @click="saveFile">Export</button>
				<div class="form_hidden">
					<label for="import_file_field" class="button button_wide">Import</label>
					<input id="import_file_field" type="file" @change="importFile">
				</div>
				<button 
					class="button button_icon" 
					@click="showOverview = true"
				>
					<i class="fa fa-th-large" aria-hidden="true"></i>
				</button>
				<button 
					class="button button_icon" 
					@click="showPageEditor = !showPageEditor"
				>
					<i class="fa fa-cog" aria-hidden="true"></i>
				</button>
			</div>
			<div class="bottombar_buttonblock">
				<button class="button button_wide" @click="createElement">Neues Element</button>
				<button class="button button_wide" @click="createPage">Neue Seite</button>		
			</div>
		</div>
		<div
			v-if="showOverview" 
			class="pageoverview"
		>
			<div 
				v-for="page in pages" 
				:key="page.id"
				class="pageoverview__page"
				:class="['is-filled_' + page.color]"
				@click="gotoPage(page.id); showOverview = false;"
			>

			</div>
			<button 
				class="button button_icon pageoverview__button_close" 
				@click="showOverview = false"
			>
				<i class="fa fa-times" aria-hidden="true"></i>
			</button>
		</div>
	</div>
</template>

<script>
import Swiper from 'swiper';
import bus from '../services/eventBus';

import {pages} from '../data/pages';

import _ from 'lodash';

let pageContainer = null;

export default {
	data() {
		return {
			swiperElement: null,
			swiper: null,
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

				//prevButton: '.swiper-button-prev',
				//nextButton: '.swiper-button-next',
				scrollbar: '.swiper-scrollbar',
				mousewheelControl: true,
				observeParents: true,

				speed: 1000,

				// if you need use plugins in the swiper, you can config in here like this
				debugger: true,

				// swiper callbacks
				// "this" in the functions refers to the swiper.
				on: {
					transitionStart () {
						console.log('Transition started.');
					},
					setTranslate (translate) {
						bus.$emit('translatePresentation', translate);
					},
					setTransition (duration) {
						bus.$emit('setDuration', duration);
						console.log ('duration', duration);
					},
					slideChangeTransitionStart () {
						pageContainer.currentSlide = null;
					},
					slideChangeTransitionEnd() {
						pageContainer.currentSlide = this.realIndex;
					}
				},

				//onSlideChangeTransitionEnd(swiper, event) {
				//	console.log ('transition ended', event);
				//},
				
				// more Swiper configs and callbacks...
				// ...
			},
			swiperLocked: false,
			currentSlide: 0,

			showOverview: false,
			showPageEditor: false,

			pages: pages,

			currentElement: null
		}
	},

	created () {
		pageContainer = this;
	},

	mounted () {
		// you can use current swiper instance object to do something(swiper methods)
    	//console.log('this is current swiper instance object', this.swiper);
		//this.swiper.slideTo(3, 1000, false);

		this.swiperElement = this.$el.querySelector('.page-swiper');
		let slides = this.$el.querySelectorAll('.swiper-slide');
		
		this.swiper = new Swiper(this.swiperElement, this.options);
		
		console.log ('Created Swiper', this.swiper, this.swiperElement, this.swiper.slides);
		console.log (slides);

		this.swiper.on('onTransitionEnd', function (swiper) {
			bus.$emit('slideEntered', swiper.activeIndex);
		});
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

		createElement() {
			let element = {
				type: 'paragraph',
				class: '',
				content: '',
				url: '',
				inGrid: true,
				gridColumnStart: 1,
				gridWidth: 2,
				gridRowStart: 1,
				gridHeight: 1,
				left: 0,
				top: 0,
				width: 30,
				height: 20
			}
			let elements = this.currentPage.elements;
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
			let elements = this.currentPage.elements;
			let index = _.findIndex(elements, ['id', element.id]);
			elements.splice(index, 1);
			this.saveData();
		},
		createPage () {
			let page = {
				id: this.pages.length,
				elements: [],
				layout: 'text',
				color: 'grey'
			};
			this.pages.push(page);
			setTimeout(function(context) {
				context.swiper.slideTo(context.pages.length);
			}, 10, this);
			//this.swiper.slideTo(this.pages.length);
			this.saveData();
		},


		saveData () {
			console.log ('daten speichern.');
			let pageData = JSON.stringify(this.pages);
			localStorage.setItem('pageData', pageData);
			return pageData;
		},
		saveFile () {
			let data = this.saveData();
			var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(data);
			var dlAnchorElem = document.createElement('a');
			dlAnchorElem.setAttribute("href", dataStr);
			dlAnchorElem.setAttribute("download", "leuchtkoerper.feuerwerk");
			document.body.appendChild(dlAnchorElem);
			console.log (dlAnchorElem);
			dlAnchorElem.click();
			setTimeout(function () {
				dlAnchorElem.remove();
			});
		},
		loadState () {
			let pageData = localStorage.getItem('pageData');			
			this.loadData(pageData);
		},
		loadData (pageData) {
			let parsed = JSON.parse(pageData);
			this.pages = parsed;
			return parsed;
		},
		importFile (event) {
			var file = event.target.files[0];
			if (!file) {
				return;
			}
			var reader = new FileReader();
			reader.onload = (function(event) {
				var contents = event.target.result;
				//console.log(contents);
				this.loadData(contents);
			}).bind(this);
			reader.readAsText(file);
		},

		gotoPage(pageId) {
			let index = _.findIndex(this.pages, ['id', pageId]);
			this.swiper.slideTo(index);
		}
	},

	computed: {
		editorVisible () {
			return (this.currentElement !== null);
		},
		currentPage () {
			return this.pages[this.currentSlide];
		},
		styleList () {
			let styles = {};
			/*if (this.swiper.animating === true) {
				styles.opacity = 0.5;
			}*/
			return styles;
		}
	}
}
</script>

<style lang="scss">
@import "../scss/variables";

.pagecontainer {
	height: 100%;
	width: 100%;
	padding: $size-page-border;
}

.page-swiper {
	height: 100%;
	width: 100%;
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

.bottombar {
	position: fixed;
	bottom: 0;
	right: 0;
	z-index: 10;

	padding: 0 2rem;
	width: 100%;

	display: flex;
	justify-content: space-between;

	background-color: $color-ui-background;

	&_buttonblock {
		display: flex;
		flex-direction: row;
	}
}

.pageoverview {
	position: fixed;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	z-index: 12;

	background-color: #333;

	padding: 4rem;

	display: grid;
	grid-template-columns: 25% 25% 25% 25%;
	grid-gap: 1rem;

	&__page {
		background-color: #666;
	}

	&__button {
		&_close {
			position: absolute;
			top: 0;
			right: 0;
		}
	}
}
</style>
