import { Ionicons } from "@expo/vector-icons";
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type TextProps,
  type ViewProps,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { StyleSheet } from "@/src/styles/unistyles";

interface DialogProps extends ViewProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogTriggerProps extends PressableProps {
  children: ReactNode;
  disabled?: boolean;
  asChild?: boolean;
}

interface DialogContentProps extends ViewProps {
  children: ReactNode;
  showCloseButton?: boolean;
  onInteractOutside?: () => void;
}

interface DialogHeaderProps extends ViewProps {
  children: ReactNode;
}

interface DialogFooterProps extends ViewProps {
  children: ReactNode;
}

interface DialogTitleProps extends TextProps {
  children: ReactNode;
}

interface DialogDescriptionProps extends TextProps {
  children: ReactNode;
}

interface DialogCloseProps extends ViewProps {
  children: ReactElement<{
    onPress?: (e: GestureResponderEvent) => void;
    ref?: Ref<any>;
  }>;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_MODAL_HEIGHT = SCREEN_HEIGHT * 0.8;

const DialogContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  handleClose?: () => void;
}>({
  open: false,
  setOpen: () => {},
});

const Dialog = forwardRef<View, DialogProps>(
  ({ children, open, onOpenChange, style, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = useState(open ?? false);

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const setOpen = useCallback(
      (value: boolean) => {
        if (isControlled) {
          onOpenChange?.(value);
          return;
        }

        setInternalOpen(value);
        onOpenChange?.(value);
      },
      [isControlled, onOpenChange]
    );

    return (
      <DialogContext.Provider value={{ open: isOpen, setOpen }}>
        <View ref={ref} style={style} {...props}>
          {children}
        </View>
      </DialogContext.Provider>
    );
  }
);

Dialog.displayName = "Dialog";

const DialogTrigger = forwardRef<View, DialogTriggerProps>(
  ({ children, disabled = false, asChild = false, style, ...props }, ref) => {
    const { setOpen } = useContext(DialogContext);

    if (asChild) {
      const child = Children.only(children) as ReactElement<{
        onPress?: (e: GestureResponderEvent) => void;
        ref?: Ref<any>;
        disabled?: boolean;
      }>;
      return cloneElement(child, {
        ...props,
        ref,
        onPress: (e: GestureResponderEvent) => {
          child.props?.onPress?.(e);
          setOpen(true);
        },
        disabled,
      });
    }

    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={style}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
);

DialogTrigger.displayName = "DialogTrigger";

const DialogContent = forwardRef<View, DialogContentProps>(
  (
    { children, showCloseButton = true, onInteractOutside, style, ...props },
    ref
  ) => {
    const { open, setOpen } = useContext(DialogContext);
    const { theme } = useUnistyles();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const [isVisible, setIsVisible] = useState(open);

    useEffect(() => {
      if (open && !isVisible) {
        setIsVisible(true);
      }
    }, [open, isVisible]);

    useEffect(() => {
      if (isVisible) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            damping: 20,
            stiffness: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [isVisible, fadeAnim, scaleAnim]);

    const handleClose = useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
        setOpen(false);
      });
    }, [fadeAnim, scaleAnim, setOpen]);

    useEffect(() => {
      if (open === false && isVisible) {
        handleClose();
      }
    }, [open, isVisible, handleClose]);

    if (!isVisible) return null;

    return (
      <DialogContext.Provider value={{ open: isVisible, setOpen, handleClose }}>
        <Modal
          visible={isVisible}
          transparent
          statusBarTranslucent
          animationType="none"
          onRequestClose={handleClose}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              onInteractOutside?.();
              handleClose();
            }}
          >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
              <TouchableWithoutFeedback>
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                  keyboardVerticalOffset={
                    Platform.OS === "ios" ? -SCREEN_HEIGHT * 0.2 : 0
                  }
                >
                  <Animated.View
                    ref={ref}
                    style={[
                      styles.modal,
                      style,
                      { transform: [{ scale: scaleAnim }] },
                    ]}
                    {...props}
                  >
                    <ScrollView
                      bounces={false}
                      style={styles.scroll}
                      contentContainerStyle={styles.scrollContent}
                    >
                      {showCloseButton && (
                        <Pressable
                          onPress={handleClose}
                          style={styles.closeButton}
                        >
                          <Ionicons
                            name="close"
                            size={21}
                            color={theme.colors.accentForeground}
                          />
                        </Pressable>
                      )}
                      {children}
                    </ScrollView>
                  </Animated.View>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
      </DialogContext.Provider>
    );
  }
);

DialogContent.displayName = "DialogContent";

const DialogHeader = forwardRef<View, DialogHeaderProps>(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} style={[styles.header, style]} {...props}>
      {children}
    </View>
  )
);

DialogHeader.displayName = "DialogHeader";

const DialogFooter = forwardRef<View, DialogFooterProps>(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} style={[styles.footer, style]} {...props}>
      {children}
    </View>
  )
);

DialogFooter.displayName = "DialogFooter";

const DialogTitle = forwardRef<Text, DialogTitleProps>(
  ({ children, style, ...props }, ref) => (
    <Text ref={ref} style={[styles.title, style]} {...props}>
      {children}
    </Text>
  )
);

DialogTitle.displayName = "DialogTitle";

const DialogDescription = forwardRef<Text, DialogDescriptionProps>(
  ({ children, style, ...props }, ref) => (
    <Text ref={ref} style={[styles.description, style]} {...props}>
      {children}
    </Text>
  )
);

DialogDescription.displayName = "DialogDescription";

const DialogClose = forwardRef<View, DialogCloseProps>(
  ({ children, ...props }, ref) => {
    const { handleClose } = useContext(DialogContext);

    return cloneElement(children, {
      ...children.props,
      ...props,
      ref,
      onPress: (e: GestureResponderEvent) => {
        children.props?.onPress?.(e);
        handleClose?.();
      },
    });
  }
);

DialogClose.displayName = "DialogClose";

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.overlay,
  },
  modal: {
    backgroundColor: theme.colors.background,
    margin: theme.size[24],
    borderRadius: theme.radius.xl2,
    width: "90%",
    // maxWidth: theme.size[384],
    shadowColor: theme.shadows.shadow,
    shadowOpacity: theme.shadows.opacity,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  scroll: {
    maxHeight: MAX_MODAL_HEIGHT,
  },
  scrollContent: {
    paddingBottom: theme.size[12],
  },
  closeButton: {
    position: "absolute",
    right: theme.size["8"],
    top: theme.size["12"],
    zIndex: 10,
    borderRadius: theme.radius.full,
    padding: theme.size[8],
    // backgroundColor: theme.colors.mutedSurface,
    opacity: 0.5,
  },
  header: {
    gap: theme.size[8],
    padding: theme.size[24],
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: theme.size[12],
    paddingHorizontal: theme.size[24],
    paddingBottom: theme.size[24],
    paddingTop: 0,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.xl,
    fontWeight: theme.font.semiBold,
    lineHeight: theme.font.xl,
    letterSpacing: -0.25,
  },
  description: {
    color: theme.colors.muted,
    fontSize: theme.font.base,
    marginTop: theme.size[8],
    lineHeight: theme.font.base * 1.4,
  },
}));

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
