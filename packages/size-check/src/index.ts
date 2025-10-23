import { h, createApp } from 'vue'
import { QuillEditor } from 'vue-quill-next'

// The bare minimum code required for rendering something to the screen
const app = createApp({
  render: () => h('div', 'hello world!'),
})
app.component('Editor', QuillEditor)
app.mount('#app')
