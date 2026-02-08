/**
 * @description
 * This class provides methods to interact with an external API for various data retrieval purposes.
 */
public with sharing class DXApiService {
    /**
     * @description
     * The base URL for the external API.
     */
    public static final String BASE_URL = 'https://dx-package-oauth-test-dot-connected-dev-237103.uk.r.appspot.com/dxpackagevis/';
    private static final Integer TIMEOUT_MS = 120000; // 2 minutes timeout

    /**
     * @description
     * Retrieves an access token from the external authentication service.
     * @return The access token to use in subsequent API requests.
     */
  //  public static String getAccessToken() {
  //      DXVisAuthTokenService authService = new DXVisAuthTokenService();
  //      return authService.getGoogleAccessToken();
 //   }
    public static String getAccessToken() {
        DXVisAuthTokenService authService = new DXVisAuthTokenService();
        String accessToken = authService.getGoogleAccessToken();
    
        // Log the retrieved token
        System.debug(' Retrieved Access Token: ' + accessToken);
    
        if (String.isBlank(accessToken)) {
            System.debug(' Access token is empty! Check DXVisAuthTokenService.');
            throw new CalloutException('Failed to retrieve access token');
        }
    
        return accessToken;
    }

    /**
     * @description
     * Executes an API callout and returns the response as a string.
     * @param apiName The API endpoint.
     * @param requestMethod The HTTP method (e.g., GET, POST).
     * @param apiParams The query parameters.
     * @return API response body as a string.
     */
    private static String executeApiCall(String apiName, String requestMethod, String apiParams) {
        Long startTime = System.currentTimeMillis();
        String endpoint = BASE_URL + apiName + '?' + apiParams;
        Integer statusCode = 0;
        String responseBody = null;

        HttpRequest httpRequest = new HttpRequest();
        httpRequest.setEndpoint(endpoint);
        httpRequest.setMethod(requestMethod);

        String accessToken = getAccessToken();

        httpRequest.setHeader('Authorization', 'Bearer ' + getAccessToken());
        httpRequest.setTimeout(TIMEOUT_MS);

        // Log request details
        System.debug('API Call: ' + requestMethod + ' ' + endpoint);
        System.debug('Auth Header: Bearer ' + accessToken);

        try {
            Http http = new Http();
            HttpResponse httpResponse = http.send(httpRequest);
            statusCode = httpResponse.getStatusCode();
            responseBody = httpResponse.getBody();

            // Log response details
            System.debug('API Response Status: ' + statusCode);
            System.debug('API Response Body: ' + responseBody);

            if (statusCode == 200) {
              //  responseBody = httpResponse.getBody();
              return responseBody;
            } else {
                System.debug('API Call Failed: ' + httpResponse.getBody());
                throw new CalloutException('API Call Failed: ' + httpResponse.getBody());
            }
        } catch (Exception ex) {
            System.debug('API Call Exception: ' + ex.getMessage());
            throw new CalloutException('API Call Exception: ' + ex.getMessage());
        } finally {
            Long responseTime = System.currentTimeMillis() - startTime;
            DXPageMetricController.logAPICall(apiName, responseTime, statusCode, null);
        }

       // return responseBody;
    }

    /**
    * @description
    * Calls an API and returns a List of Objects parsed from the response.
    * This method is designed to make a generic API call, and the response body should be an array of objects.
    * @param apiName The name of the API to be called.
    * @param request The request data to be sent in the API call.
    * @param apiParams Additional query parameters required for the API call, formatted as a query string.
    * @return A List of Objects parsed from the API response, or null if the response is blank or empty.
    */
    @AuraEnabled(cacheable=true)
    public static List<Object> apiService2(String apiName, String request, String apiParams) {
        String response = executeApiCall(apiName, request, apiParams);
        return String.isBlank(response) ? null : (List<Object>) JSON.deserializeUntyped(response);
    }

    /**
    * @description
    * Calls an API and returns a Map<String, Object> parsed from the response.
    * This method is designed to make an API call and deserialize the response into a Map.
    * @param apiName The name of the API to be called.
    * @param request The request data to be sent in the API call.
    * @param apiParams Additional parameters required for the API call, formatted as a query string.
    * @return A Map<String, Object> parsed from the API response, or null if the response is blank or empty.
    */
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> apiService(String apiName, String request, String apiParams) {
        String response = executeApiCall(apiName, request, apiParams);
        
        if (String.isBlank(response)) {
            return null;
        }

        if (response.startsWith('[') && response.endsWith(']')) {
            response = response.substring(1, response.length() - 1);
        }

        return (Map<String, Object>) JSON.deserializeUntyped(response);
    }

    /**
    * @description
    * Calls an API and returns a List of Strings parsed from the response.
    * This method is designed to make an API call and deserialize the response into a List of Strings.
    * @param apiName The name of the API to be called.
    * @param request The request data to be sent in the API call.
    * @param apiParams Additional query parameters required for the API call, formatted as a query string.
    * @return A List of Strings parsed from the API response, or null if the response is blank or empty.
    */
    @AuraEnabled(cacheable=true)
    public static List<String> apiServiceTypeArray(String apiName, String request, String apiParams) {
        String response = executeApiCall(apiName, request, apiParams);
        return String.isBlank(response) ? null : (List<String>) JSON.deserialize(response, List<String>.class);
    }

    /**
     * @description
     * Calls an API and returns a List of Objects parsed from the response.
     * @param apiName The name of the API to be called.
     * @param request The request data to be sent in the API call.
     * @param apiParams Additional parameters required for the API call.
     * @return A List of Objects parsed from the API response, or null if the response is blank..
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> apiServiceTypeArrayObj(String apiName, String request, String apiParams) {
        String response = executeApiCall(apiName, request, apiParams);
        return String.isBlank(response) ? null : (List<Object>) JSON.deserializeUntyped(response);
    }

    /**
     * @description
     * Calls an API and caches the response.
     * @param apiName The name of the API to be called.
     * @param request The request data to be sent in the API call.
     * @param apiParams Additional parameters required for the API call.
     * @return A Map<String, Object> containing the parsed API response.
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> apiCacheService(String apiName, String request, String apiParams) {
        return apiService(apiName, request, apiParams);
    }
}