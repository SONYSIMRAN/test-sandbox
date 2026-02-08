import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import bootstrap from '@salesforce/resourceUrl/bootstrap';
import D3Js from "@salesforce/resourceUrl/dxVisD3";
import dxVisStyle from '@salesforce/resourceUrl/dxVisStyle';
import IS_SALESFORCE_USER from '@salesforce/label/c.is_Salesforce_User';
import apiService from '@salesforce/apex/DXApiService.apiService';

export default class DxVisSearchHeader extends NavigationMixin(LightningElement) {
    d3Initialized = false;
    isSalesforceUser = IS_SALESFORCE_USER.toLowerCase() === 'true';


    renderedCallback() {
        Promise.all([
            loadScript(this, D3Js + "/dxVisD3/d3.v7.min.js"),
            loadScript(this, D3Js + "/dxVisD3/d3-tip.min.js"),
            loadStyle(this, bootstrap + '/bootstrap/bootstrap.css'),
            loadStyle(this, dxVisStyle + '/dxVisStyle/dx-vis-style.css')
        ]).then(() => {
            this.d3Initialized = true;
            console.log('CSS framework loaded.');
        })
            .catch(error => {
                console.log(error);
            });
    };
    // Navigate to search
    navigateToSearch(event) {
        console.log('isSalesforceUser--->', this.isSalesforceUser);
        if (this.isSalesforceUser) {
            this.navigateToSfdxSearch();
        } else {
            this.navigateToGcpSearch(event);
        }
    }
    navigateToGcpSearch(event) {
        let comInfo = {
            componentDef: "c:dxVisSearch"
        }
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodePackageInfo
            }
        })
    }
    navigateToSfdxSearch(event) {
        let comInfo = {
            componentDef: "c:sfdxSearchView"
        }
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodePackageInfo
            }
        })
    }
    //Navigate to home
    navigateToHome(event) {
        let comInfo = {
            componentDef: "c:dxApp"
        }
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodePackageInfo
            }
        })
    }
    //Refresh Cache
    refreshCacheHandler() {
        console.log('refreshCacheHandler');
        apiService({
            request: 'GET',
            apiName: 'getpackageinfo',
            apiParams: serializeParams({
                packagename: `${this.package}_${this.sandbox}`,
            })
        }).then(response => {
            console.log(response);
        }).catch(error => {
            console.log(error);
        })

    }
}