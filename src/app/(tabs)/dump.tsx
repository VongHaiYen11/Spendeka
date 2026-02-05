import { View } from '@/components/Themed';

// Dummy screen for the center Dump tab.
// We always navigate directly to /add-transaction from the custom tab button,
// so this screen is never actually shown.
export default function DumpTabPlaceholder() {
  return <View />;
}

