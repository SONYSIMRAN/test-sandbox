public class DXLogAPICallQueueable implements Queueable, Database.AllowsCallouts {
    private String apiEndpoint;
    private Long responseTime;
    private Integer statusCode;
    private String errorDetails;
    
    public DXLogAPICallQueueable(String apiEndpoint, Long responseTime, Integer statusCode, String errorDetails) {
        this.apiEndpoint = apiEndpoint;
        this.responseTime = responseTime;
        this.statusCode = statusCode;
        this.errorDetails = errorDetails;
    }
    
    public void execute(QueueableContext context) {
        API_Call_Metric__c log = new API_Call_Metric__c(
            API_Endpoint__c = apiEndpoint,
            User_ID__c = UserInfo.getUserId(),
            User_Name__c = UserInfo.getName(),
            Timestamp__c = System.now(),
            Response_Time_ms__c = responseTime,
            Status_Code__c = statusCode,
            Error_Details__c = errorDetails
        );
        
        insert log;
    }
}