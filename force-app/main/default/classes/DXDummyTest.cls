@isTest
public class DXDummyTest {
    
    // Test method for the getGreeting method in MyDummyClass
    @isTest
    static void testGetGreeting() {
        // Arrange
        String name = 'SalesforceUser';
        
        // Act
        String result = DXDummy.getGreeting(name);
        
        // Assert
        System.assertEquals('Hello, SalesforceUser!', result, 'The greeting message should be correct');
    }
}