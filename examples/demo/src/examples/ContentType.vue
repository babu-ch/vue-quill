<template>
  <h1>Content Type</h1>
  <QuillEditor
    v-model:content="contentDelta"
    content-type="delta"
  />
  <pre>{{ contentDelta }}</pre>
  <QuillEditor
    v-model:content="contentHTML"
    content-type="html"
  />
  <pre>{{ contentHTML }}</pre>
  <QuillEditor
    v-model:content="contentText"
    content-type="text"
  />
  <pre>{{ contentText }}</pre>
  <button
    type="button"
    @click="update"
  >
    Trigger external content update
  </button>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import { QuillEditor, Delta } from 'vue-quill-next'

export default defineComponent({
  components: {
    QuillEditor,
  },
  setup: () => {
    const contentDelta = ref<Delta>(
      new Delta([
        { insert: 'Gandalf', attributes: { bold: true } },
        { insert: ' the ' },
        { insert: 'Grey', attributes: { color: '#ccc' } },
      ])
    )
    // Quill v1 format HTML (without data-list attribute)
    const contentHTML = ref('<ul><li>test item 1</li><li>test item 2</li></ul>')
    const contentText = ref('This is just plain text')

    const update = () => {
      contentDelta.value = new Delta([
        { insert: 'Gandalf', attributes: { bold: true } },
        { insert: ' the ' },
        { insert: 'White', attributes: { color: '#fff', background: '#000' } },
      ]);
      contentHTML.value = '<h3>This is a different HTML header</h3>';
      contentText.value = 'This is some more plain text';

      setTimeout(() =>
          contentDelta.value.insert('\n I am also deeply reactive and a ref update works'), 200)
    }

    return { contentDelta, contentHTML, contentText, update }
  },
})
</script>
