# Usage

## In The Browser

Register the component in your javascript:

```js
Vue.component('QuillEditor', VueQuill.QuillEditor);
```

Basic Usage:

``` html
<div id="app">
  <quill-editor theme="snow"></quill-editor>
</div>
```
::: tip INFO
We're showing you a simple example here, but in a typical Vue application, we use Single File Components instead of a string template. You can find **SFC implementation** in [this section](usage.md#in-single-file-component).
:::

## In Single File Component

**Global Registration:**

``` javascript
import { createApp } from 'vue'
import { QuillEditor } from 'vue-quill-next'
import 'vue-quill-next/dist/vue-quill.snow.css';

const app = createApp()
app.component('QuillEditor', QuillEditor)
```

**or Local Registration:**

``` javascript
import { QuillEditor } from 'vue-quill-next'
import 'vue-quill-next/dist/vue-quill.snow.css';

export default {
  components: {
    QuillEditor
  }
}
```

**Basic Usage:**

``` vue
<template>
  <QuillEditor theme="snow" />
</template>
```

::: tip NOTE
The component itself does not include any CSS theme. You'll need to include it separately:
`import 'vue-quill-next/dist/vue-quill.snow.css'` or `import 'vue-quill-next/dist/vue-quill.bubble.css'`
:::

## Using v-model:content

Use `v-model:content` for two-way binding of the editor content. The content type must match the `contentType` prop.

**With HTML (recommended for simplicity):**

``` vue
<script setup>
import { ref } from 'vue'
import { QuillEditor } from 'vue-quill-next'

const content = ref('<p>Hello World</p>')
</script>

<template>
  <QuillEditor v-model:content="content" content-type="html" theme="snow" />
</template>
```

**With Delta (default):**

When using the default `contentType="delta"`, you must pass a `Delta` instance — not a plain object.

``` vue
<script setup>
import { ref } from 'vue'
import Delta from 'quill-delta'
import { QuillEditor } from 'vue-quill-next'

const content = ref(new Delta({ ops: [{ insert: 'Hello World\n' }] }))
</script>

<template>
  <QuillEditor v-model:content="content" theme="snow" />
</template>
```

::: warning
Passing a plain object `{ ops: [...] }` instead of a `Delta` instance when `contentType="delta"` will cause a runtime error. Always use `new Delta(...)` or switch to `content-type="html"`.
:::

**With plain text:**

``` vue
<script setup>
import { ref } from 'vue'
import { QuillEditor } from 'vue-quill-next'

const content = ref('Hello World')
</script>

<template>
  <QuillEditor v-model:content="content" content-type="text" theme="snow" />
</template>
```
