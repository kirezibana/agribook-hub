import { formatImagePath } from './imageUtils';

// Simple test to verify the image utility function
console.log('Testing formatImagePath function:');

// Test cases
const testCases = [
  { input: null, expectedContains: 'placehold.co' },
  { input: undefined, expectedContains: 'placehold.co' },
  { input: '', expectedContains: 'placehold.co' },
  { input: 'https://example.com/image.jpg', expected: 'https://example.com/image.jpg' },
  { input: 'http://example.com/image.png', expected: 'http://example.com/image.png' },
  { input: '/assets/images/test.jpg', expected: '/assets/images/test.jpg' },
  { input: 'C:\\Users\\hp\\Downloads\\tractor.jpg', expectedContains: 'placehold.co' },
  { input: '/home/user/pictures/image.png', expectedContains: 'placehold.co' },
  { input: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...', expected: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...' },
];

testCases.forEach((testCase, index) => {
  const result = formatImagePath(testCase.input as any);
  const passed = testCase.expected 
    ? result === testCase.expected 
    : testCase.expectedContains 
      ? result.includes(testCase.expectedContains) 
      : false;
      
  console.log(`Test ${index + 1}: ${passed ? 'PASS' : 'FAIL'}`);
  console.log(`  Input: ${testCase.input}`);
  console.log(`  Result: ${result}`);
  console.log('');
});

console.log('Test completed!');