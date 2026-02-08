public class DXVisAuthTokenService {

    private boolean isTokenExpired(String token) {
        if (token == null) {
            return true; // Token is considered expired if it's null
        }
    
        // Split the token into its three parts: header, payload, and signature
        String[] parts = token.split('\\.');
        if (parts.size() != 3) {
            return true; // Invalid token format
        }
    
        // Decode the payload (second part of the token)
        String payload = parts[1];
        String decodedPayload = EncodingUtil.base64Decode(payload).toString();
        Map<String, Object> payloadMap;
    
        try {
            payloadMap = (Map<String, Object>) JSON.deserializeUntyped(decodedPayload);
        } catch (Exception e) {
            System.debug('Error parsing token payload: ' + e.getMessage());
            return true; // Error while parsing JSON, consider token expired
        }
    
        // Check if the token has an expiration time claim ('exp')
        if (payloadMap.containsKey('exp')) {
            // Get the expiration timestamp from the token payload
            Long expirationTime = (Long) payloadMap.get('exp');
            // Convert the expiration timestamp to milliseconds
            Long expirationMillis = expirationTime * 1000;
    
            // Get the current time in milliseconds
            Long currentTimeMillis = System.now().getTime();
    
            // Compare the current time with the expiration time
            return expirationMillis <= currentTimeMillis; // Token is expired if true
        } else {
            return true; // Token is considered expired if it doesn't have an expiration claim
        }
    }
    

     
    // Method to clear the entire cache partition
    public void clearCachePartition() {
        List<String> keysToRemove = new List<String>();
        for (String key : Cache.Org.getKeys()) {
            if (key.startsWith('local.Ingest10x.')) {
                keysToRemove.add(key);
            }
        }
        for (String keyToRemove : keysToRemove) {
            Cache.Org.remove(keyToRemove);
        }
        System.debug('Cache partition "Ingest10x" cleared.');
    }

    public String getGoogleAccessToken(){
        String cachedToken = (String) Cache.Org.get('local.Ingest10x.GoogleIngestPubSubToken');
        if (cachedToken != null && !isTokenExpired(cachedToken)) {
            System.debug('Token found in cache and not expired.');
            return cachedToken;
        } else {
            System.debug('Token not found in cache. Fetching new token.');
            // Clear the entire cache partition before fetching a new token
            clearCachePartition();
            String resToken = [SELECT token__c FROM IngestPubSub__mdt where label = 'Prod'].token__c;
            JSONParser tokenParser = JSON.createParser(resToken);
            Map<String,String> tokenMap = new Map<String,String>();
            while (tokenParser.nextToken() != null) {
                if (tokenParser.getCurrentToken() == JSONToken.FIELD_NAME) {
                    String key = tokenParser.getText();
                    tokenParser.nextToken();
                    tokenMap.put(key,tokenParser.getText());
                }
            }
            String requestBody = buildGoogleRequestBody(tokenMap);
            HttpResponse response = sendGoogleRequest(requestBody);
            String accessToken = handleGoogleResponse(response);
            return accessToken;
        }
    }

    public String buildGoogleRequestBody(Map<String,String> tokenMap){
        //Create header
        String header = '{"alg":"RS256","typ":"JWT"}';
        String header_encoded = EncodingUtil.base64Encode(blob.valueof(header));
        system.debug('Service account details= '+tokenMap);

        //Create claim
        String claim_set = '{"iss":"' +tokenMap.get('client_email') +'"';
        claim_set += ',"scope":"'+tokenMap.get('scope')+'"';
        claim_set += ',"aud":"https://oauth2.googleapis.com/token"';
        claim_set += ',"type":"' +tokenMap.get('type') +'"';
        claim_set += ',"token_uri":"' +tokenMap.get('token_uri') +'"';
        claim_set += ',"exp":"' + datetime.now().addHours(1).getTime()/1000;
        claim_set += '","iat":"' + datetime.now().getTime()/1000 + '"}';
        String claim_set_encoded = EncodingUtil.base64Encode(blob.valueof(claim_set));

        
        //Create private key
        String key = tokenMap.get('private_key').remove('-----BEGIN PRIVATE KEY-----\n').remove('\n-----END PRIVATE KEY-----\n');
        blob private_key = EncodingUtil.base64Decode(key);

        //Create signature
        String signature_encoded = header_encoded + '.' + claim_set_encoded;
        signature_encoded = signature_encoded.replaceAll('=','');
        String signature_encoded_url = EncodingUtil.urlEncode(signature_encoded,'UTF-8');
        blob signature_blob =   blob.valueof(signature_encoded_url);
        String signature_blob_string = EncodingUtil.base64Encode(Crypto.sign('RSA-SHA256', signature_blob, private_key));
        String JWT = signature_encoded + '.' + signature_blob_string;
        JWT = JWT.replaceAll('=','');
        String grant_string= 'urn:ietf:params:oauth:grant-type:jwt-bearer';

        //Create request body
        String requestBody = 'grant_type=' + EncodingUtil.urlEncode(grant_string, 'UTF-8') + '&assertion=' + EncodingUtil.urlEncode(JWT, 'UTF-8');
        return requestBody;
    }

    public HttpResponse sendGoogleRequest(String requestBody){
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://oauth2.googleapis.com/token');
        request.setMethod('POST');
        request.setHeader('ContentType','application/x-www-form-urlencoded');

        String bodyWithAudience = requestBody;

        request.setBody(bodyWithAudience);
        //This is ai
        return new Http().send(request);
    }

    public String handleGoogleResponse(HttpResponse response){
        if(response.getStatusCode() == 200) {
            JSONParser parser = JSON.createParser(response.getBody());
            while (parser.nextToken() != null) {
                if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && (parser.getText() == 'id_token')) {
                    // Move to the value.
                    parser.nextToken();
                    if (!Test.isRunningTest()) {
                        Cache.Org.put('local.Ingest10x.GoogleIngestPubSubToken', parser.getText(), 1800); //ttl  1/2 hour (can be an hour - but this give good margin for error)
                        System.debug('Token cached successfully.');
                    }
                    system.debug('id_token='+parser.getText());
                    return parser.getText();
                }
            }
        } else {
            throw new GoogleGCPGenericAuthServiceException('HTTP error response in get_access_token. Status code ' + response.getStatusCode());
        }
        return 'error';
    }

    public class GoogleGCPGenericAuthServiceException extends Exception{}

}