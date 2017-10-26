<template>
  <div id="app">
    <page-container>
      <!-- slides -->
      
    </page-container>
  </div>
</template>

<script>

export default {
  name: 'app',
  data () {
    return {
      
    };
  },

  mounted() {
    
  }
}
</script>

<style lang="scss">
@import "./scss/main";
@import "./scss/variables";

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 56.25vw;
  width: 100vw;
  padding: 2rem;
  box-sizing: border-box;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
