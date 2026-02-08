public with sharing class DXPageMetricController {
    @AuraEnabled
    public static void logPageView(String pageName, Decimal timeSpentInSeconds) {
        Page_Metric__c metric = new Page_Metric__c(
            Page_Name__c = pageName,
            User_ID__c = UserInfo.getUserId(), 
            User_Name__c = UserInfo.getName(),
            Timestamp__c = System.now(),
            Action_Taken__c = 'Page View',
            Time_Spent_Seconds__c = timeSpentInSeconds
        );
        insert metric;
    }

    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getPageViewMetrics() {
        return [
            SELECT Page_Name__c, COUNT(Id) views,  User_Name__c,  SUM(Time_Spent_Seconds__c) totalSeconds
            FROM Page_Metric__c
            WHERE Action_Taken__c = 'Page View'
            GROUP BY Page_Name__c,  User_Name__c
            ORDER BY COUNT(Id) DESC
        ];
    }

    // @AuraEnabled
    // public static void deleteAllPageMetrics() {
    //     List<Page_Metric__c> metricsToDelete = [
    //         SELECT Id
    //         FROM Page_Metric__c
    //     ];
    //     if (!metricsToDelete.isEmpty()) {
    //         delete metricsToDelete;
    //     }
    // }


    // @AuraEnabled
    // public static void logAPICall(String apiEndpoint, Long responseTime, Integer statusCode, String errorDetails) {
    //     System.debug('API Endpoint: ' + apiEndpoint);
    //     System.debug('Response Time: ' + responseTime);
    //     System.debug('Status Code: ' + statusCode);
    //     System.debug('Error Details: ' + errorDetails);
    //     List<API_Call_Metric__c> logsToInsert = new List<API_Call_Metric__c>();
    //     // Create the log entry
    //     API_Call_Metric__c log = new API_Call_Metric__c(
    //         API_Endpoint__c = apiEndpoint,
    //         User_ID__c = UserInfo.getUserId(),
    //         User_Name__c = UserInfo.getName(),
    //         Timestamp__c = System.now(),
    //         Response_Time_ms__c = responseTime,
    //         Status_Code__c = statusCode,
    //         Error_Details__c = errorDetails
    //     );
    //     logsToInsert.add(log);

    //     // Define a batch size for bulk processing
    //     Integer batchSize = 200;
    //     Integer totalLogs = logsToInsert.size();
    
    //     // Insert logs in batches
    //     for (Integer i = 0; i < totalLogs; i += batchSize) {
    //         Integer batchEnd = Math.min(i + batchSize, totalLogs);
    //         List<API_Call_Metric__c> batchLogs = new List<API_Call_Metric__c>();
            
    //         for (Integer j = i; j < batchEnd; j++) {
    //             batchLogs.add(logsToInsert[j]);
    //         }
            
    //         insert batchLogs;
    //     }

    // }

    @AuraEnabled
    public static void logAPICall(String apiEndpoint, Long responseTime, Integer statusCode, String errorDetails) {
        DXLogAPICallQueueable logJob = new DXLogAPICallQueueable(apiEndpoint, responseTime, statusCode, errorDetails);
        System.enqueueJob(logJob);
    }


    @AuraEnabled(cacheable=true)
    public static  List<AggregateResult> getAPICallMetrics() {
        // List<API_Call_Metric__c> apiCallMetrics = new List<API_Call_Metric__c>();
        List<AggregateResult> groupedMetrics = new List<AggregateResult>();
        System.debug('groupedMetrics: ' + groupedMetrics);
        try {
            groupedMetrics = [
                SELECT API_Endpoint__c, COUNT(Id) apiCallCount, AVG(Response_Time_ms__c) avgResponseTime,
                       MAX(Response_Time_ms__c) maxResponseTime, MIN(Response_Time_ms__c) minResponseTime,
                       User_Name__c
                FROM API_Call_Metric__c
                GROUP BY API_Endpoint__c, User_Name__c
                ORDER BY COUNT(Id) DESC
            ];
       
        } catch (Exception e) {
            // Handle exception
            System.debug('Error fetching API call metrics: ' + e.getMessage());
        }
        
        return groupedMetrics;
    }
}