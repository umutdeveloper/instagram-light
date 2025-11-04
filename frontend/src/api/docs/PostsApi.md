# PostsApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiPostsGet**](PostsApi.md#apipostsget) | **GET** /api/posts | List posts |
| [**apiPostsIdDelete**](PostsApi.md#apipostsiddelete) | **DELETE** /api/posts/{id} | Delete post by ID |
| [**apiPostsIdGet**](PostsApi.md#apipostsidget) | **GET** /api/posts/{id} | Get post by ID |
| [**apiPostsPost**](PostsApi.md#apipostspost) | **POST** /api/posts | Create a post |



## apiPostsGet

> ModelsPostsResponse apiPostsGet(page, limit)

List posts

Get a paginated list of posts

### Example

```ts
import {
  Configuration,
  PostsApi,
} from '';
import type { ApiPostsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new PostsApi(config);

  const body = {
    // number | Page number (optional)
    page: 56,
    // number | Page size (optional)
    limit: 56,
  } satisfies ApiPostsGetRequest;

  try {
    const data = await api.apiPostsGet(body);
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
| **page** | `number` | Page number | [Optional] [Defaults to `undefined`] |
| **limit** | `number` | Page size | [Optional] [Defaults to `undefined`] |

### Return type

[**ModelsPostsResponse**](ModelsPostsResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiPostsIdDelete

> string apiPostsIdDelete(id)

Delete post by ID

Delete a post by its ID

### Example

```ts
import {
  Configuration,
  PostsApi,
} from '';
import type { ApiPostsIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new PostsApi(config);

  const body = {
    // number | Post ID
    id: 56,
  } satisfies ApiPostsIdDeleteRequest;

  try {
    const data = await api.apiPostsIdDelete(body);
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
| **id** | `number` | Post ID | [Defaults to `undefined`] |

### Return type

**string**

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
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiPostsIdGet

> ModelsPost apiPostsIdGet(id)

Get post by ID

Get a single post by its ID

### Example

```ts
import {
  Configuration,
  PostsApi,
} from '';
import type { ApiPostsIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new PostsApi(config);

  const body = {
    // number | Post ID
    id: 56,
  } satisfies ApiPostsIdGetRequest;

  try {
    const data = await api.apiPostsIdGet(body);
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
| **id** | `number` | Post ID | [Defaults to `undefined`] |

### Return type

[**ModelsPost**](ModelsPost.md)

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
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiPostsPost

> ModelsPost apiPostsPost(post)

Create a post

Create a new post

### Example

```ts
import {
  Configuration,
  PostsApi,
} from '';
import type { ApiPostsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new PostsApi(config);

  const body = {
    // ModelsPost | Post data
    post: ...,
  } satisfies ApiPostsPostRequest;

  try {
    const data = await api.apiPostsPost(body);
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
| **post** | [ModelsPost](ModelsPost.md) | Post data | |

### Return type

[**ModelsPost**](ModelsPost.md)

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
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

