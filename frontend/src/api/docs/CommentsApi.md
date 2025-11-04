# CommentsApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiPostsPostIdCommentsCommentIdDelete**](CommentsApi.md#apipostspostidcommentscommentiddelete) | **DELETE** /api/posts/{post_id}/comments/{comment_id} | Delete a comment |
| [**apiPostsPostIdCommentsGet**](CommentsApi.md#apipostspostidcommentsget) | **GET** /api/posts/{post_id}/comments | Get comments for a post |
| [**apiPostsPostIdCommentsPost**](CommentsApi.md#apipostspostidcommentspost) | **POST** /api/posts/{post_id}/comments | Create a comment for a post |



## apiPostsPostIdCommentsCommentIdDelete

> apiPostsPostIdCommentsCommentIdDelete(postId, commentId)

Delete a comment

Delete a comment by its ID (only by the comment owner)

### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '';
import type { ApiPostsPostIdCommentsCommentIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new CommentsApi(config);

  const body = {
    // number | Post ID
    postId: 56,
    // number | Comment ID
    commentId: 56,
  } satisfies ApiPostsPostIdCommentsCommentIdDeleteRequest;

  try {
    const data = await api.apiPostsPostIdCommentsCommentIdDelete(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **postId** | `number` | Post ID | [Defaults to `undefined`] |
| **commentId** | `number` | Comment ID | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Not Found |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiPostsPostIdCommentsGet

> Array&lt;ModelsComment&gt; apiPostsPostIdCommentsGet(postId)

Get comments for a post

Get all comments for a specific post

### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '';
import type { ApiPostsPostIdCommentsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new CommentsApi(config);

  const body = {
    // number | Post ID
    postId: 56,
  } satisfies ApiPostsPostIdCommentsGetRequest;

  try {
    const data = await api.apiPostsPostIdCommentsGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **postId** | `number` | Post ID | [Defaults to `undefined`] |

### Return type

[**Array&lt;ModelsComment&gt;**](ModelsComment.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiPostsPostIdCommentsPost

> ModelsComment apiPostsPostIdCommentsPost(postId, body)

Create a comment for a post

Create a new comment for a specific post

### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '';
import type { ApiPostsPostIdCommentsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new CommentsApi(config);

  const body = {
    // number | Post ID
    postId: 56,
    // object | Comment body (text only)
    body: Object,
  } satisfies ApiPostsPostIdCommentsPostRequest;

  try {
    const data = await api.apiPostsPostIdCommentsPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **postId** | `number` | Post ID | [Defaults to `undefined`] |
| **body** | `object` | Comment body (text only) | |

### Return type

[**ModelsComment**](ModelsComment.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Created |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

