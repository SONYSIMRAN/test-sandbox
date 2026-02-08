@isTest
public class TestChangeTest {
    @isTest
    static void testFMethod() {
        // Arrange
        Integer input = 5;

        // Act
        Integer result = TestChange.f(input);

        // Assert
        System.assertEquals(6, result, 'The method should return the input incremented by 1');
    }
}