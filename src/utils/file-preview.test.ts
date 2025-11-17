import { getFilePreviewType, isImageFile, isPdfFile, isWordFile, formatFileSize } from './file-preview';

// Test getFilePreviewType
console.log('Testing getFilePreviewType:');
console.log(getFilePreviewType('image/jpeg')); // Should return 'image'
console.log(getFilePreviewType('application/pdf')); // Should return 'pdf'
console.log(getFilePreviewType('application/msword')); // Should return 'word'
console.log(getFilePreviewType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')); // Should return 'word'
console.log(getFilePreviewType('text/plain')); // Should return 'other'

// Test isImageFile
console.log('\nTesting isImageFile:');
console.log(isImageFile('image/jpeg')); // Should return true
console.log(isImageFile('image/png')); // Should return true
console.log(isImageFile('application/pdf')); // Should return false

// Test isPdfFile
console.log('\nTesting isPdfFile:');
console.log(isPdfFile('application/pdf')); // Should return true
console.log(isPdfFile('image/jpeg')); // Should return false

// Test isWordFile
console.log('\nTesting isWordFile:');
console.log(isWordFile('application/msword')); // Should return true
console.log(isWordFile('application/vnd.openxmlformats-officedocument.wordprocessingml.document')); // Should return true
console.log(isWordFile('application/pdf')); // Should return false

// Test formatFileSize
console.log('\nTesting formatFileSize:');
console.log(formatFileSize(0)); // Should return '0 Bytes'
console.log(formatFileSize(1024)); // Should return '1 KB'
console.log(formatFileSize(1048576)); // Should return '1 MB'
console.log(formatFileSize(1073741824)); // Should return '1 GB'
console.log(formatFileSize(1500)); // Should return '1.46 KB'