import { createApp } from 'vue'
// VueQuill
import { QuillEditor } from 'vue-quill-next'
import 'vue-quill-next/dist/vue-quill.snow.css'
// VueHighlightJS
import VueHighlightJS from 'vue3-highlightjs'
import 'highlight.js/styles/solarized-light.css'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)
app.component('QuillEditor', QuillEditor)
app.use(VueHighlightJS)
app.use(router)

app.mount('#app')
