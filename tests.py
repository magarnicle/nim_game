import sys
import unittest
import haystack.classes as hs
import mocker.mock_classes as mk

mk.check_connection()

class Test(unittest.TestCase):

    def setUp(self) -> None:
        """Get ready."""
        mk.check_connection()

    def tearDown(self) -> None:
        """Clean up."""
        mk.clean_up()

    def test(self) -> None:
        """Test something."""
        pass

if __name__ == "__main__":
    unittest.main()

