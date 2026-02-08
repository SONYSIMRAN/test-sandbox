import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import logPageView from '@salesforce/apex/DXPageMetricController.logPageView';
import getPageViewMetrics from '@salesforce/apex/DXPageMetricController.getPageViewMetrics';

const COLUMNS = [
    { label: 'Page Name', fieldName: 'Page_Name__c' },
    { label: 'Views', fieldName: 'views', type: 'number' },
    //{ label: 'User ID', fieldName: 'User_ID__c' },
    { label: 'User Name', fieldName: 'User_Name__c' },
    { label: 'Time Spent (s)', fieldName: 'totalSeconds', type: 'number' }
];

export default class DxPageViewMetrics extends LightningElement {
    data = [];
    columns = COLUMNS;
    wiredMetrics;
    isLoading = true;
    refreshTimeout;

    connectedCallback() {
        // this.logPageView();
        window.addEventListener('beforeunload', this.handleNavigation.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('beforeunload', this.handleNavigation.bind(this));
    }

    handleNavigation() {
        this.refreshPageViewMetrics();
    }
    
    connectedCallback() {
        // Automatically refresh data when component is inserted into the DOM
        this.refreshPageViewMetrics();
    }
    // logPageView() {
    //     const pageName = this.getPageNameFromUrl();
    //     if (pageName) {
    //         logPageView({ pageName: pageName })
    //             .then(result => {
    //                 console.log('Page view logged successfully', result);
    //             })
    //             .catch(error => {
    //                 console.error('Error logging page view', error);
    //             });
    //     }
    // }

    getPageNameFromUrl() {
        const url = window.location.pathname;
        const pageName = url.substring(url.lastIndexOf('/') + 1);
        return pageName;
    }

    @wire(getPageViewMetrics)
    wiredMetricsResult(result) {
        this.isLoading = true;
        this.wiredMetrics = result;
        console.log('result', result);
        if (result.data) {
            this.data = result.data.map((item, index) => ({
                id: index,
                ...item
            }));
        } else if (result.error) {
            console.error('Error fetching page view metrics', result.error);
        }
        this.isLoading = false; // Hide loading indicator when data is loaded
    }

    refreshPageViewMetrics() {
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }
        this.isLoading = true; // Show loading indicator while refreshing
        this.refreshTimeout = setTimeout(() => {
            refreshApex(this.wiredMetrics)
                .then(() => {
                    console.log('Page view metrics refreshed successfully.');
                })
                .catch(error => {
                    console.error('Error refreshing page view metrics:', error);
                })
                .finally(() => {
                    this.isLoading = false; // Hide loading indicator after refresh
                });
        }, 300); // Adjust the debounce delay as needed
    }
}