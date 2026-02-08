@isTest
public class DXFailedChangeSetCompTest {
	@isTest
    static void testFailDuringValidation() {
        // This will cause the test to fail in the target org during validation
        System.assert(false, 'Intentional failure during validation');
    }
}