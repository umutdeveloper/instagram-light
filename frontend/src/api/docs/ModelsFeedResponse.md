
# ModelsFeedResponse


## Properties

Name | Type
------------ | -------------
`limit` | number
`page` | number
`posts` | [Array&lt;ModelsPostWithLikes&gt;](ModelsPostWithLikes.md)

## Example

```typescript
import type { ModelsFeedResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "limit": null,
  "page": null,
  "posts": null,
} satisfies ModelsFeedResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ModelsFeedResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


