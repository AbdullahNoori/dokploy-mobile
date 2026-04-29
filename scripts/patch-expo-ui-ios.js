const fs = require('node:fs');
const path = require('node:path');

const pickerViewPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'ui',
  'ios',
  'Picker',
  'PickerView.swift'
);

const patch = `
extension Either: @retroactive Equatable where FirstType: Equatable, SecondType: Equatable {
  public static func == (lhs: Either<FirstType, SecondType>, rhs: Either<FirstType, SecondType>) -> Bool {
    if let leftValue: FirstType = lhs.get(), let rightValue: FirstType = rhs.get() {
      return leftValue == rightValue
    }
    if let leftValue: SecondType = lhs.get(), let rightValue: SecondType = rhs.get() {
      return leftValue == rightValue
    }
    return false
  }
}
`;

if (!fs.existsSync(pickerViewPath)) {
  console.warn('[patch-expo-ui-ios] PickerView.swift not found; skipping.');
  process.exit(0);
}

const source = fs.readFileSync(pickerViewPath, 'utf8');

if (source.includes('extension Either: @retroactive Equatable')) {
  process.exit(0);
}

const importAnchor = 'import SwiftUI\nimport ExpoModulesCore\n';

if (!source.includes(importAnchor)) {
  console.warn('[patch-expo-ui-ios] Expected import anchor not found; skipping.');
  process.exit(0);
}

fs.writeFileSync(
  pickerViewPath,
  source.replace(importAnchor, `${importAnchor}${patch}`),
  'utf8'
);

console.log('[patch-expo-ui-ios] Patched @expo/ui PickerView.swift.');
