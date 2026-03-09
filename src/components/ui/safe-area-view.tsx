import { SafeAreaView as RNSafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

const StyledSafeAreaView = withUniwind(RNSafeAreaView);

type Props = SafeAreaViewProps;

function SafeAreaView(props: Props) {
  return <StyledSafeAreaView {...props} />;
}

export { SafeAreaView };
export type { Props as SafeAreaViewProps };
