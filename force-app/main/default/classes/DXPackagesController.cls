public class DXPackagesController {

  // Define classes to represent Tooling API response structure
  public class ToolingAPIResponse {
    @AuraEnabled
    public List<ToolingAPIPackage> records { get; set; }
  }
  public class ToolingAPIPackage {
    @AuraEnabled public String Id { get; set; }
    @AuraEnabled public String SubscriberPackageId { get; set; }
    @AuraEnabled public ToolingAPISubscriberPackage SubscriberPackage { get; set; }
    @AuraEnabled public ToolingAPISubscriberPackageVersion SubscriberPackageVersion { get; set; }
    @AuraEnabled public String SubscriberPackageVersionId { get; set; }
  }

  public class ToolingAPISubscriberPackage {
    @AuraEnabled public String NamespacePrefix { get; set; }
    @AuraEnabled public String Name { get; set; }
  }

  public class ToolingAPISubscriberPackageVersion {
    @AuraEnabled public String Name { get; set; }
    @AuraEnabled public Integer MajorVersion { get; set; }
    @AuraEnabled public Integer MinorVersion { get; set; }
    @AuraEnabled public Integer PatchVersion { get; set; }
    @AuraEnabled public Integer BuildNumber { get; set; }
    @AuraEnabled public Boolean IsOrgDependent { get; set; }
    @AuraEnabled public String  Description { get; set; }
    @AuraEnabled public String  InstallValidationStatus { get; set; }
    @AuraEnabled public Boolean IsBeta { get; set; }
    @AuraEnabled public Boolean IsDeprecated { get; set; }
    @AuraEnabled public Boolean IsManaged { get; set; }
    @AuraEnabled public Boolean IsPasswordProtected { get; set; }
    @AuraEnabled public Boolean IsSecurityReviewed { get; set; }
    @AuraEnabled public String Package2ContainerOptions { get; set; }
  }

  @AuraEnabled(cacheable=true)
  public static List<Sandbox_Credentials__mdt> fetchSandboxData() {
      return [SELECT Label, Sandbox_Name__c, Named_Credential__c, IsDefault__c FROM Sandbox_Credentials__mdt];
  }

  @AuraEnabled(cacheable=false)
  public static List<Map<String, Object>> getInstalledPackages(String namedCredential) {
    System.debug('namedCredential at beginning ::' + namedCredential);
      List<Map<String, Object>> installedPackages = new List<Map<String, Object>>();


      // Configure the Tooling API endpoint using the named credential if provided
      String endpointUrl;
      System.debug('endpointUrl at beginning ::' + endpointUrl);
      
      if (namedCredential == 'Visualizer') {
          endpointUrl = URL.getOrgDomainUrl().toExternalForm() + '/services/data/v60.0/tooling/query?q=';
      } else {
          endpointUrl = 'callout:' + namedCredential + '/services/data/v60.0/tooling/query?q=';
      }
      System.debug('endpointUrl is ::' + endpointUrl);

      // Retrieve all installed packages
      String toolingQuery = 'SELECT Id, SubscriberPackageId, SubscriberPackage.NamespacePrefix, ' +
      'SubscriberPackage.Name, SubscriberPackageVersion.Name, ' +
      'SubscriberPackageVersion.IsOrgDependent,SubscriberPackageVersion.IsDeprecated,SubscriberPackageVersion.IsBeta,SubscriberPackageVersion.Description,SubscriberPackageVersion.IsManaged,SubscriberPackageVersion.IsPasswordProtected,SubscriberPackageVersion.IsSecurityReviewed,SubscriberPackageVersion.Package2ContainerOptions,SubscriberPackageVersion.MajorVersion, SubscriberPackageVersion.MinorVersion, ' +
      'SubscriberPackageVersion.PatchVersion, SubscriberPackageVersion.BuildNumber, ' +
      'SubscriberPackageVersionId ' +
      'FROM InstalledSubscriberPackage ORDER BY SubscriberPackageId';

      // Make Tooling API request and process the response
      ToolingAPIResponse apiResponse = makeToolingAPICall(toolingQuery, endpointUrl);
  
      if (apiResponse != null && apiResponse.records != null) {
        System.debug('apiResponse.records--->>'+ apiResponse.records);
          for (ToolingAPIPackage pkg : apiResponse.records) {
              // Check if package name starts with 'dx'
             if (pkg.SubscriberPackage != null && pkg.SubscriberPackage.Name != null) {
                  Map<String, Object> packageDetails = new Map<String, Object>();
                  packageDetails.put('Id', pkg.Id);
                  packageDetails.put('SubscriberPackageId', pkg.SubscriberPackageId);
                  packageDetails.put('NamespacePrefix', pkg.SubscriberPackage.NamespacePrefix);
                  packageDetails.put('PackageName', pkg.SubscriberPackage.Name);
                  packageDetails.put('PackageVersionName', pkg.SubscriberPackageVersion.Name);
                  packageDetails.put('SubscriberPackageVersionId', pkg.SubscriberPackageVersionId);
                  packageDetails.put('IsOrgDependent', pkg.SubscriberPackageVersion.IsOrgDependent);
                  packageDetails.put('Description', pkg.SubscriberPackageVersion.Description);
                  packageDetails.put('InstallValidationStatus', pkg.SubscriberPackageVersion.InstallValidationStatus);
                  packageDetails.put('IsBeta', pkg.SubscriberPackageVersion.IsBeta);
                  packageDetails.put('IsDeprecated', pkg.SubscriberPackageVersion.IsDeprecated);
                  packageDetails.put('IsManaged', pkg.SubscriberPackageVersion.IsManaged);
                  packageDetails.put('IsPasswordProtected', pkg.SubscriberPackageVersion.IsPasswordProtected);
                  packageDetails.put('IsSecurityReviewed', pkg.SubscriberPackageVersion.IsSecurityReviewed);
                  packageDetails.put('Package2ContainerOptions', pkg.SubscriberPackageVersion.Package2ContainerOptions);
                  packageDetails.put('Version', pkg.SubscriberPackageVersion.MajorVersion + '.' +
                                                pkg.SubscriberPackageVersion.MinorVersion + '.' +
                                                pkg.SubscriberPackageVersion.PatchVersion + '.' +
                                                pkg.SubscriberPackageVersion.BuildNumber);
                  System.debug('packageDetails--->>'+ packageDetails);
                  installedPackages.add(packageDetails);
             }
          }
      }
      System.debug('installedPackages--->>'+ installedPackages);
      return installedPackages;
  }
   
  // public static void getApexClassesCoverageByPackage(){
  //   List<Map<String, Object>> installedPackages = getInstalledPackages();
  //   String toolingQuery = 'SELECT Id,Name, Body FROM ApexClass WHERE NamespacePrefix = null';
  //   ApexClassWrap apiResponse = makeApexClassToolingAPICall(toolingQuery);
  //   Map<String,List<String>> mapp = new Map<String,List<String>>();
  //   system.debug(apiResponse.records.size());
  //   for(Map<String, Object> installedPackage : installedPackages){
  //     String packageName = String.ValueOf(installedPackage.get('PackageName'));
  //     List<String> apexClassNames = new List<String>();
  //     for(records apexclass : apiResponse.records){
  //       if(apexclass.body.contains('UsedApex.registerMethodCalls(\''+packageName+'\'')){
  //         apexClassNames.add(apexclass.Name);
  //       }
  //     }
  //     mapp.put(packageName,apexClassNames);
  //   }
  //   system.debug('package namess:'+mapp);
  // }

  // private static ApexClassWrap makeApexClassToolingAPICall(String query) {
  //   HttpRequest request = new HttpRequest();
  //   request.setEndpoint(URL.getOrgDomainUrl().toExternalForm() + '/services/data/v60.0/tooling/query?q=' +
  //                       EncodingUtil.urlEncode(query, 'UTF-8'));
  //   request.setMethod('GET');
  //   request.setHeader('Authorization', 'Bearer ' + Page.sessionId.getContent().toString());

  //   Http http = new Http();
  //   HttpResponse response = http.send(request);

  //   if (response.getStatusCode() == 200) {
  //       return (ApexClassWrap) JSON.deserialize(response.getBody(), ApexClassWrap.class);
  //   }

  //   return null;
  // }

  // public class ApexClassWrap{
  //   public list<records> records;
  // }

  // public class records{
  //   public string id;
  //   public string body;
  //   public string Name;
  // }
  

  // Helper method to make Tooling API call and deserialize the response
  // private static ToolingAPIResponse makeToolingAPICall(String query) {
  //     HttpRequest request = new HttpRequest();
  //     request.setEndpoint(URL.getOrgDomainUrl().toExternalForm() + '/services/data/v60.0/tooling/query?q=' +
  //                         EncodingUtil.urlEncode(query, 'UTF-8'));
  //     request.setMethod('GET');
  //     request.setHeader('Authorization', 'Bearer ' + Page.sessionId.getContent().toString());

  //     Http http = new Http();
  //     HttpResponse response = http.send(request);

  //     if (response.getStatusCode() == 200) {
  //         return (ToolingAPIResponse) JSON.deserialize(response.getBody(), ToolingAPIResponse.class);
  //     }

  //     return null;
  // }

   // Updated makeToolingAPICall method to accept the endpointUrl
   private static ToolingAPIResponse makeToolingAPICall(String query, String endpointUrl) {
    HttpRequest request = new HttpRequest();
    request.setEndpoint(endpointUrl + EncodingUtil.urlEncode(query, 'UTF-8'));
    request.setMethod('GET');
    request.setHeader('Authorization', 'Bearer ' + Page.sessionId.getContent().toString());

    Http http = new Http();
    HttpResponse response = http.send(request);

    if (response.getStatusCode() == 200) {
        return (ToolingAPIResponse) JSON.deserialize(response.getBody(), ToolingAPIResponse.class);
    }

    return null;
  }
}