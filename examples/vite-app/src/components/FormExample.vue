<script setup lang="ts">
import { ref } from 'vue'
import { QuillEditor } from 'vue-quill-next'
const inputValue = ref('<h1>This is header</h1><p>This is paragraph</p>')
</script>

<template>
  <QuillEditor v-model:content="inputValue" content-type="html" theme="snow" />
</template>

<style scoped></style>
