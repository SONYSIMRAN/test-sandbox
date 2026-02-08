import { LightningElement,track } from 'lwc';
import images from '@salesforce/resourceUrl/visualizer_images';
import sendEmail from '@salesforce/apex/sfdxFooterController.sendEmail';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SfdxFooter extends LightningElement {

    logoFooter = images + '/ag-horizontal-logo.png';

    @track emailAddress;
    @track userObjective;

    handleEmailAddress(event){
        console.log(event.detail.value)
        this.emailAddress = event.detail.value;
    }

    handleUserObjective(event){
        console.log(event.detail.value)
        this.userObjective = event.detail.value;
    }

    sendEmail() {
        sendEmail({ toAddress: this.emailAddress, body: this.userObjective })
            .then(() => {
                // Show success toast notification
                this.showToast('Success', 'Email sent successfully', 'success');
                // Clear input fields
                this.clearFields();
            })
            .catch(error => {
                // Show error toast notification
                this.showToast('Error', 'Failed to send email', 'error');
                console.error(error);
            });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    clearFields() {
        this.emailAddress = '';
        this.userObjective = '';
    }


}