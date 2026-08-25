import { Keyboard, TouchableWithoutFeedback, View, type ViewProps } from 'react-native';

// RN doesn't dismiss the keyboard on an outside tap by default — nothing
// does that unless a screen wires it up itself. This wraps a screen's
// content so tapping anywhere that isn't an input or button closes the
// keyboard, the behavior every native form already has for free.
export function DismissKeyboardView({ children, ...rest }: ViewProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View {...rest}>{children}</View>
    </TouchableWithoutFeedback>
  );
}
