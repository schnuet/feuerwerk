<template>
	<div 
		class="editor" 
		:class="{'editor_hidden': !isOpen, 'on-left': isOnLeftSide}"
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


			<!-- IMAGE -->

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

			<div v-if="currentElement.type==='image'" class="inputgroup">
				<span class="inputlabel">Platzmodus</span>
				<div class="choicebox">
					<label class="choicebox__choice" :class="{'active': currentElement.fit === 'contain'}">
						<span class="choicebox__label" >Einbetten</span>
						<input type="radio" v-model="currentElement.fit" value="contain">
					</label>
					<label class="choicebox__choice" :class="{'active': currentElement.fit === 'cover'}">
						<span class="choicebox__label">Ausfüllen</span>
						<input type="radio" v-model="currentElement.fit" value="cover">
					</label>
				</div>
			</div>


			<!-- PARAGRAPH -->

			<label v-if="currentElement.type==='paragraph'" class="inputgroup">
				<span class="inputlabel">Inhalt</span>
				<textarea class="inputgroup__input inputgroup__area" v-model="currentElement.content"></textarea>
			</label>


			<!-- POSITIONING -->

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



			<!-- MENU BUTTONS -->

			<button
				class="button button_icon editor__button_toggle"
			>
				<i class="fa fa-bars" aria-hidden="true"></i>
			</button>
			<button 
				class="button button_icon editor__button_done" 
				@click="stopEditing"
			>
				<i class="fa fa-check" aria-hidden="true"></i>
			</button>
			<button 
				class="button editor__button_move" 
				@click="isOnLeftSide = !isOnLeftSide"
			>
				<i class="fa fa-arrows" aria-hidden="true"></i>
			</button>
			<button
				class="button button_icon editor__button_delete"
				@click="deleteElement()"
			>
				<i class="fa fa-trash" aria-hidden="true"></i>
			</button>
		</div>
  	</div>
</template>

<script>
const _ = require('lodash');
import elementTypes from '../data/elementTypes';

let editorElement = null;

export default {
	data() {
		return {
			images: [],
			elementTypes: elementTypes,
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

	props: ['currentElement'],

	created () {
		this.images = this.getImages();
		editorElement = this;
	},

	methods: {
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
				images.push('.' + context(key));
			});
			console.log (images);
			return images;
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

	&__button {

		&_done, &_move, &_delete, &_toggle {
			position: absolute;
			top: 0;
		}

		&_move, &_toggle {
			&:hover {
				color: #ccc;
			}
		}

		&_toggle {
			left: 0;
		}

		&_done {
			right: 0;
			height: 44px;
			width: 44px;
			border: none;
			
			&:hover {
				color: #5C5;
			}

			/*&::after, &::before {
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
			}*/
		}
		&_move {
			left: $size-button-height;
		}
		&_delete {
			right: $size-button-height;

			&:hover {
				color: #C55;
			}

			/*&::after, &::before {
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
			}*/
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
}
</style>
