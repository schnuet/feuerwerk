<template>
  <div class="editor editor_page">
		<div class="inputgroup">
			<span class="inputlabel">Farbe</span>
			<div class="choicebox">
				<label 
					class="choicebox__choice"
					v-for="(choice, label) in colorChoices"
					:key="label"
					:style="{'background-color': choice.labelColor}"
					:class="{'active': page.color === label}"
				>
					<input 
						type="radio"
						v-model="page.color"
						:value="label"
					>
				</label>
			</div>
		</div>
	</div>
</template>
<script>
import colorChoices from '../data/pageColors.js';

export default {
  data () {
	  return {
		  colorChoices: colorChoices
	  };
  },

  props: ['page']
}
</script>
<style lang="scss">
@import "../scss/variables";

.editor {
	&_page {

	}
}
</style>
