import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAPICallMetrics from '@salesforce/apex/DXPageMetricController.getAPICallMetrics';

const API_CALL_COLUMNS = [
    // { label: 'API Endpoint', fieldName: 'API_Endpoint__c' },
    // { label: 'User ID', fieldName: 'User_ID__c' },
    // { label: 'Timestamp', fieldName: 'Timestamp__c', type: 'date' },
    // { label: 'Response Time (ms)', fieldName: 'Response_Time_ms__c', type: 'number' },
    // { label: 'Status Code', fieldName: 'Status_Code__c', type: 'number' },
    // { label: 'Error Details', fieldName: 'Error_Details__c', type: 'text' }
    { label: 'API Endpoint', fieldName: 'API_Endpoint__c' },
    { label: 'Number of Calls', fieldName: 'apiCallCount', type: 'number' },
    { label: 'Average Response Time (ms)', fieldName: 'avgResponseTime', type: 'number' },
    { label: 'Maximum Response Time (ms)', fieldName: 'maxResponseTime', type: 'number' },
    { label: 'Minimum Response Time (ms)', fieldName: 'minResponseTime', type: 'number' },
    { label: 'User Name', fieldName: 'User_Name__c' }
    // { label: 'Status Code', fieldName: 'Status_Code__c', type: 'number' }
];

export default class DxApiCallMetrics extends LightningElement {
    apiCallMetrics = [];
    statusCodes = [];
    apiCallColumns = API_CALL_COLUMNS;
    wiredAPICallMetrics;
    isLoading = true;
    refreshTimeout;

    @wire(getAPICallMetrics)
    wiredAPICallMetricsResult(result) {
        this.isLoading = true;
        console.log('result---->', result);
        this.wiredAPICallMetrics = result;
        // this.statusCodes = result.statusCodes;
        
        if (result.data) {
            // this.apiCallMetrics = result.data.map(item => ({ ...item }));
            this.apiCallMetrics = result.data.map((item, index) => ({
                id: index,
                ...item
            }));
        } else if (result.error) {
            console.error('Error fetching API call metrics:', result.error);
        }
        this.isLoading = false;
    }

    connectedCallback() {
        // Automatically refresh data when component is inserted into the DOM
        this.refreshAPICallMetrics();
    }

    // refreshAPICallMetrics() {
    //     if (this.wiredAPICallMetrics) {
    //         refreshApex(this.wiredAPICallMetrics)
    //             .then(() => {
    //                 console.log('API call metrics refreshed successfully.');
    //             })
    //             .catch(error => {
    //                 console.error('Error refreshing API call metrics:', error);
    //             });
    //     }
    // }
    refreshAPICallMetrics() {
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }
        this.isLoading = true; // Show loading indicator while refreshing
        this.refreshTimeout = setTimeout(() => {
            refreshApex(this.wiredAPICallMetrics)
                .then(() => {
                    console.log('API call metrics refreshed successfully.');
                })
                .catch(error => {
                    console.error('Error refreshing API call metrics:', error);
                })
                .finally(() => {
                    this.isLoading = false; // Hide loading indicator after refresh
                });
        }, 300); // Adjust the debounce delay as needed
    }

}