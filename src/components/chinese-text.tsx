import { Text, type TextProps } from 'react-native';

export function ChineseText({ style, ...props }: TextProps) {
  return <Text {...props} style={[{ fontFamily: 'noto_sans_sc' }, style]} />;
}
