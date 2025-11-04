# UploadApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiUploadPost**](UploadApi.md#apiuploadpost) | **POST** /api/upload | Upload media file |



## apiUploadPost

> ModelsUploadResponse apiUploadPost(file)

Upload media file

Uploads a media file and returns its storage path

### Example

```ts
import {
  Configuration,
  UploadApi,
} from '';
import type { ApiUploadPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new UploadApi(config);

  const body = {
    // Blob | Media file to upload
    file: BINARY_DATA_HERE,
  } satisfies ApiUploadPostRequest;

  try {
    const data = await api.apiUploadPost(body);
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
| **file** | `Blob` | Media file to upload | [Defaults to `undefined`] |

### Return type

[**ModelsUploadResponse**](ModelsUploadResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

