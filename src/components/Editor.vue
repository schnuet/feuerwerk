<template>
	<div 
		class="editor" 
		:class="{'open': isOpen, 'on-left': isOnLeftSide}"
	>
		<div v-if="currentElement">

			<label class="inputgroup">
				<span class="inputlabel">Typ</span>
				<select 
					class="inputgroup__input" 
					v-model="currentElement.type"
				>
					<option 
						v-for="(etype, index) in elementTypes" 
						:value="index"
						:key="etype.value">
						{{etype.label}}
					</option>
				</select>
			</label>

			<label 
				v-if="currentElement.type==='heading_main' || currentElement.type === 'heading_sub'" 
				class="inputgroup">
				<span class="inputlabel">Inhalt</span>
				<input class="inputgroup__input" type="text" v-model="currentElement.content">
			</label>

			<label v-if="currentElement.type==='image'" class="inputgroup">
				<span class="inputlabel">Bild</span>
				<div
					v-show="choosingImage == true"
				>
					<swiper 
						class="swiper_image-chooser"
						:options="imageChoseSliderOptions"
					>
						<swiper-slide 
							v-for="image in images" 
							:key="image"
						>
							<img 
								:src="image" 
								@click="choosingImage = false"
							>
						</swiper-slide>
					</swiper>
				</div>
				<div 
					v-show="choosingImage == false"
				>
					<img 
						class="chosen-image" 
						:src="currentElement.url" 
						@click="choosingImage = true; currentElement.url = images[0]"
					>
				</div>
				<!--<input type="text" v-model="currentElement.url">-->
			</label>

			<label v-if="currentElement.type==='paragraph'" class="inputgroup">
				<span class="inputlabel">Inhalt</span>
				<textarea class="inputgroup__input inputgroup__area" v-model="currentElement.content"></textarea>
			</label>

			<label class="inputgroup">
				<span class="inputlabel">Im Raster</span>
				<input type="checkbox" v-model="currentElement.inGrid">
			</label>

			<template v-if="currentElement.inGrid">
				<label class="inputgroup">
					<span class="inputlabel">Position</span>
					<input class="inputgroup__input half" type="number" min="1" max="16" v-model.number="currentElement.gridColumnStart">
					<input class="inputgroup__input half" type="number" min="1" max="8" v-model.number="currentElement.gridRowStart">				
				</label>
				<label class="inputgroup">
					<span class="inputlabel">Größe</span>
					<input class="inputgroup__input half" type="number" min="1" v-model.number="currentElement.gridWidth">
					<input class="inputgroup__input half" type="number" min="1" v-model.number="currentElement.gridHeight">
				</label>
			</template>
			

			<button 
				class="button button_done-editing" 
				@click="stopEditing"
			></button>
			<button 
				class="button button_change-side" 
				@click="isOnLeftSide = !isOnLeftSide"
			></button>
			<button
				class="button button_delete"
				@click="deleteElement()"
			></button>
		</div>
		<div class="editor__bottombar" v-else>
			<button class="button button_wide" @click="createElement">Neues Element</button>
			<button class="button button_wide" @click="createPage">Neue Seite</button>
			<button class="button button_wide" @click="load">Laden</button>
		</div>
  	</div>
</template>

<script>
const _ = require('lodash');

let editorElement = null;
export default {
	data() {
		return {
			images: [],
			elementTypes: {
				image: 			{label: 'Bild', class: 'image'},
				heading_main: 	{label: 'Überschrift', class: 'heading heading_main'},
				heading_sub: 	{label: 'Unterüberschrift', class: 'heading heading_sub'},
				paragraph: 		{label: 'Absatz', class: 'paragraph'},
				
			},
			choosingImage: false,
			imageChoseSliderOptions: {
				autoplay: false,
				onSlideChangeEnd(swiper) {
					console.log (editorElement);
					editorElement.currentElement.url = editorElement.images[swiper.realIndex];
					//console.log('change', swiper.realIndex);
				}
			},
			isOnLeftSide: false
		};
	},

	props: ['currentElement', 'elements'],

	created () {
		this.images = this.getImages();
		editorElement = this;
	},

	methods: {
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
			this.$emit ('created-element', element);
		},
		createPage () {
			let page = {
				elements: [],
				class: 'page_layout-text'
			};
			this.$emit ('created-page', page);
		},
		deleteElement() {
			if (confirm('Möchtest du das Element wirklich löschen?')) {
				this.$emit('delete-element');
			}
		},
		stopEditing() {
			this.$emit('stop-editing');
		},
		getImages() {
			var context = require.context("../assets/", true, /\.(png|jpg)$/);
			console.log ('loading imgs');
			let images = [];
			context.keys().forEach(function (key) {
				images.push(context(key));
			});
			console.log (images);
			return images;
		},
		load () {
			this.$emit('load');
		}
	},

	computed: {
		isOpen () {
			return !!(this.currentElement);
		}
	},

	watch: {
		'currentElement.type': function (val) {
			if (this.currentElement === null) return;
			this.currentElement.class = this.elementTypes[val].class;
		}
	}
}
</script>

<style lang="scss">
@import "../scss/variables";

.editor {
	position: fixed;
	z-index: 10;
	text-align: left;
	bottom: 0;

	&.on-left {
		left: 0;
	}
	&:not(.on-left) {
		right: 0;
	}
	

	&.open {
		bottom: auto;
		top: 0;
		padding: 1rem 0;
		padding-top: $size-button-height;
		min-height: 50vh;
		max-height: 100vh;
		overflow: auto;
		width: 300px;
		background-color: #333;
	}

	.button {
		min-height: $size-button-height;
		min-width: $size-button-height;
		background-color: #222;
		color: #fff;
		border: none;

		&_wide {
			padding: 0 1rem;
		}
		&_done-editing {
			position: absolute;
			top: 0;
			right: 0;
			height: 44px;
			width: 44px;
			color: #fff;
			border: none;

			&::after, &::before {
				content: '';
				position: absolute;
				display: block;
				width: 6px;
				bottom: 12px;
				background-color: #666;
				transition: background-color 0.12s;
			}
			&::after {
				left: 16px;
				height: 25px;
				transform-origin: bottom left;
				transform: rotate(45deg);
			}
			&::before {
				left: 19px;
				height: 20px;
				transform-origin: bottom right;
				transform: rotate(-45deg);
			}
			&:hover::before, &:hover::after {
				background-color: #5C5;
			}
		}
		&_change-side {
			position: absolute;
			top: 0;
			left: 0;
		}
		&_delete {
			position: absolute;
			top: 0;
			right: $size-button-height;

			&::after, &::before {
				content: '';
				position: absolute;
				display: block;
				height: 30px;
				width: 6px;
				left: 19px;
				bottom: 7px;
				background-color: #666;
			}
			&::after {
				transform: rotate(45deg);
			}
			&::before {
				transform: rotate(-45deg);
			}
			&:hover::before, &:hover::after {
				background-color: #C55;
			}
		}

		&:hover {
			background-color: #444;
		}
	}

	.inputgroup {
		padding: 0.5em 1rem;
		display: block;
		overflow: hidden;

		&__input {
			background-color: #333;
			color: #eee;
			border: 1px solid $color-editor-neutral;
			border-radius: 2px;
			padding: 7px;
			box-sizing: border-box;
			display: block;
			width: 100%;

			&:focus {
				border-color: $color-editor-highlight;
			}

			&.half {
				float: left;
				width: 50%;
				& + & {
					border-left: none;
				}
			}
		}
		&__area {
			resize: vertical;
		}

		.inputlabel {
			display: block;
			margin: 0.25em 0;
			color: $color-editor-neutral;
			transition: color 0.12s;
		}

		&:hover {
			background-color: #444;
		}
		&:hover .inputlabel {
			color: $color-editor-highlight;
		}
		&:hover .inputgroup__input {
			border-color: $color-editor-highlight;
		}

	}

	.swiper_image-chooser {
		width: 100%;
		position: relative;
		border: 1px solid $color-dark-2;
		img {
			position: relative;
			display: block;
			margin: 0 auto;
			max-width: 100%;
		}
	}
	.chosen-image {
		object-fit: contain;
		object-position: center;
		height: 3rem;
		width: 100%;
		cursor: pointer;
	}

	&__bottombar {
		position: fixed;
		bottom: 0;
		right: 0;
		padding-right: 2rem;
		display: flex;
		flex-direction: row-reverse;
	}
}
</style>
