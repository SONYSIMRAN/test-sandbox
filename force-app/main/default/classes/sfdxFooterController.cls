public with sharing class sfdxFooterController {
    public sfdxFooterController() {

    }

    @AuraEnabled
    public static void sendEmail(String toAddress, /*String subject,*/ String body) {
        // Create a new SingleEmailMessage object
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

        // Set the recipient's email address
        mail.setToAddresses(new List<String>{ 'oshernandez@allegisgroup.com','sdas@teksystems.com', 'ssimran@teksystems.com' });

        // Set the email subject
        //mail.setSubject(subject);

        //Pending to build a template
        String bodyEmail =
        '<h3>Hello, Salesforce Admins</h3>' +
        '<p>'+body+'</p>' +
        '<p>This is a request for providing access to this email:'+toAddress+'</p>' +
        '<p>Feel free to reach out if you have any questions.</p>' +
        '<p>Best Regards,</p>' +
        '<p>Dx Visualizer Team</p>';
        // Set the email body (HTML content)
        mail.setHtmlBody(bodyEmail);

        // Send the email using the Messaging.sendEmail method
        Messaging.sendEmail(new List<Messaging.Email> { mail });
    }
}