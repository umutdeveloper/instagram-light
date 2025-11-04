# UsersApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiUsersIdFollowersGet**](UsersApi.md#apiusersidfollowersget) | **GET** /api/users/{id}/followers | Get followers |
| [**apiUsersIdFollowingGet**](UsersApi.md#apiusersidfollowingget) | **GET** /api/users/{id}/following | Get following |
| [**apiUsersIdGet**](UsersApi.md#apiusersidget) | **GET** /api/users/{id} | Get user by ID |



## apiUsersIdFollowersGet

> Array&lt;ModelsUser&gt; apiUsersIdFollowersGet(id)

Get followers

Get a list of followers for a user

### Example

```ts
import {
  Configuration,
  UsersApi,
} from '';
import type { ApiUsersIdFollowersGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new UsersApi(config);

  const body = {
    // number | User ID
    id: 56,
  } satisfies ApiUsersIdFollowersGetRequest;

  try {
    const data = await api.apiUsersIdFollowersGet(body);
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
| **id** | `number` | User ID | [Defaults to `undefined`] |

### Return type

[**Array&lt;ModelsUser&gt;**](ModelsUser.md)

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


## apiUsersIdFollowingGet

> Array&lt;ModelsUser&gt; apiUsersIdFollowingGet(id)

Get following

Get a list of users this user is following

### Example

```ts
import {
  Configuration,
  UsersApi,
} from '';
import type { ApiUsersIdFollowingGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new UsersApi(config);

  const body = {
    // number | User ID
    id: 56,
  } satisfies ApiUsersIdFollowingGetRequest;

  try {
    const data = await api.apiUsersIdFollowingGet(body);
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
| **id** | `number` | User ID | [Defaults to `undefined`] |

### Return type

[**Array&lt;ModelsUser&gt;**](ModelsUser.md)

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


## apiUsersIdGet

> ModelsUser apiUsersIdGet(id)

Get user by ID

Get a user by their ID

### Example

```ts
import {
  Configuration,
  UsersApi,
} from '';
import type { ApiUsersIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new UsersApi(config);

  const body = {
    // number | User ID
    id: 56,
  } satisfies ApiUsersIdGetRequest;

  try {
    const data = await api.apiUsersIdGet(body);
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
| **id** | `number` | User ID | [Defaults to `undefined`] |

### Return type

[**ModelsUser**](ModelsUser.md)

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

