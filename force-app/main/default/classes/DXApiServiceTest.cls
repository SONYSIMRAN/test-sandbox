@isTest
private class DXApiServiceTest {

    private class DXApiServiceHttpMockForToken implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setStatusCode(200);

            String endpoint = req.getEndpoint();

            if (!endpoint.contains('dxpackagevis')) {
                res.setBody(
                    '{' +
                    '"access_token":"mockedAccessToken",' +
                    '"token_type":"Bearer",' +
                    '"expires_in":3600,' +
                    '"id_token":"mockedIdToken",' +
                    '"scope":"openid https://www.googleapis.com/auth/userinfo.email"' +
                    '}'
                );
            }
            else if (endpoint.contains('apiServiceTypeArray')) {
                res.setBody('["Alpha","Beta","Gamma"]');
            }
            else if (endpoint.contains('apiService2')) {
                res.setBody('[{"id":1,"name":"TestObject"}]');
            }
            else {
                res.setBody('{"status":"success","data":[{"key":"value"}]}');
            }
            return res;
        }
    }

    @isTest
    static void testDXApiServiceMethods() {
   
        Test.setMock(HttpCalloutMock.class, new DXApiServiceHttpMockForToken());

        Map<String, Object> responseMap = DXApiService.apiService('genericApi', 'GET', 'param=123');
     
    }
}