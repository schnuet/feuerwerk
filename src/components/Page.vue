<template>
  <div class="page">
      <slot>
         <p>I am the default content.</p>
      </slot>
  </div>
</template>

<script>
export default {
  data() {
      return {

      };
  }
}
</script>

<style lang="scss">
.page {
    display: block;
    background-color: red;
    height: 100vh;
    width: 100%;
}
</style>
