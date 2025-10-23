<template>
  <h1>Basic Example</h1>
  <QuillEditor v-model:content="content" />
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import { QuillEditor, Delta } from 'vue-quill-next'

export default defineComponent({
  components: {
    QuillEditor,
  },
  setup: () => {
    const content = ref<Delta | null>(null)

    return { content }
  },
})
</script>
