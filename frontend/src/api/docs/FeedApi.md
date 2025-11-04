# FeedApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiFeedGet**](FeedApi.md#apifeedget) | **GET** /api/feed | Get user feed |



## apiFeedGet

> ModelsFeedResponse apiFeedGet(userId, page, limit)

Get user feed

Get a paginated feed for a user (posts from followed users)

### Example

```ts
import {
  Configuration,
  FeedApi,
} from '';
import type { ApiFeedGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new FeedApi(config);

  const body = {
    // number | User ID
    userId: 56,
    // number | Page number (optional)
    page: 56,
    // number | Page size (optional)
    limit: 56,
  } satisfies ApiFeedGetRequest;

  try {
    const data = await api.apiFeedGet(body);
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
| **userId** | `number` | User ID | [Defaults to `undefined`] |
| **page** | `number` | Page number | [Optional] [Defaults to `undefined`] |
| **limit** | `number` | Page size | [Optional] [Defaults to `undefined`] |

### Return type

[**ModelsFeedResponse**](ModelsFeedResponse.md)

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

