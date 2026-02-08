public class DXInstalledPackageDetail {
    @AuraEnabled(cacheable=true)
    public static String getInstalledSubscriberPackageById(String packageId) {
        // Construct the query
        String query = 'SELECT Id, SubscriberPackageId, SubscriberPackage.NamespacePrefix, ' +
                       'SubscriberPackage.Name, SubscriberPackageVersion.Id, ' +
                       'SubscriberPackageVersion.Name, SubscriberPackageVersion.MajorVersion, ' +
                       'SubscriberPackageVersion.MinorVersion, SubscriberPackageVersion.PatchVersion, ' +
                       'SubscriberPackageVersion.IsOrgDependent, SubscriberPackageVersion.Description, ' +
                       'SubscriberPackageVersion.InstallValidationStatus, ' +
                       'SubscriberPackageVersion.IsBeta, SubscriberPackageVersion.IsDeprecated, ' +
                       'SubscriberPackageVersion.IsManaged, SubscriberPackageVersion.IsPasswordProtected, ' +
                       'SubscriberPackageVersion.IsSecurityReviewed, SubscriberPackageVersion.Package2ContainerOptions, ' +
                       'SubscriberPackageVersion.Profiles, SubscriberPackageVersion.ReleaseState, ' +
                       'SubscriberPackageVersion.RemoteSiteSettings, ' +
                       'SubscriberPackageVersion.BuildNumber ' +
                       'FROM InstalledSubscriberPackage WHERE Id = \'' + packageId + '\' ' +
                       'ORDER BY SubscriberPackageId';

        // Create the HTTP request
        HttpRequest req = new HttpRequest();
        req.setEndpoint(URL.getOrgDomainUrl().toExternalForm() + '/services/data/v60.0/tooling/query/?q=' + EncodingUtil.urlEncode(query, 'UTF-8'));
        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' +  Page.sessionId.getContent().toString());
        req.setHeader('Content-Type', 'application/json');

        // Send the request
        Http http = new Http();
        HttpResponse res = http.send(req);

        // Check the response
        if (res.getStatusCode() == 200) {
            String responseBody = res.getBody();
            if (responseBody != null) {
                // Parse the JSON response directly into the InstalledSubscriberPackageModel object
                Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
                List<Object> records = (List<Object>) result.get('records');
                
                if (records != null && !records.isEmpty()) {
                    // Deserialize the first record into InstalledSubscriberPackageModel
                    String recordJson = JSON.serialize(records[0]);
                    System.debug('recordJson= ' + recordJson);
                    InstalledSubscriberPackageModel packageData = (InstalledSubscriberPackageModel) JSON.deserialize(recordJson, InstalledSubscriberPackageModel.class);
                    System.debug('packageDetail=' + packageData);

                    // Serialize packageData back into JSON
                    String packageDataJson = JSON.serialize(packageData);
                    System.debug('packageDataJson=' + packageDataJson);
                    return packageDataJson;
                } else {
                    // Handle no records found
                    return '{}';  // Return an empty JSON object if no records are found
                }
            } else {
                // Handle null response body
                return '{}';  // Return an empty JSON object if response body is null
            }
        } else {
            // Handle HTTP error
            throw new CalloutException('HTTP request failed with status code ' + res.getStatusCode() + ' and message: ' + res.getStatus());
        }
    }
}