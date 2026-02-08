@isTest
public class DXDummyDevTest {
    
    // Test method for the getGreeting method in MyDummyClass
    @isTest
    static void testGetGreeting() {
        // Arrange
        String name = 'SalesforceUser';
        
        // Act
        String result = DXDummyDev.getGreeting(name);
        
        // Assert
        System.assertEquals('Hello, SalesforceUser!', result, 'The greeting message should be correct');
    }
}