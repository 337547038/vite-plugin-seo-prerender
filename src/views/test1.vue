<template>
  <div class="index">
    this is test1 page
    <div v-for="(item,index) in list" :key="index">
      <p>{{item.name}}</p>
    </div>
    <div>end</div>
  </div>
</template>
<script setup>
  import {ref, onMounted} from 'vue'
  
  const list=ref([{name:'test1'},{name:'test1 test1'}])
  
  onMounted(() => {
  
  })
</script>
<style>
.index {
  color: antiquewhite;
  font-size: 16px
}
</style>
