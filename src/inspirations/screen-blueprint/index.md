import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
Keyboard,
KeyboardAvoidingView,
Platform,
ScrollView,
StatusBar,
Text,
TouchableWithoutFeedback,
View,
} from "react-native";
import Animated, {
FadeInDown,
FadeInUp,
useAnimatedStyle,
useSharedValue,
withTiming,
} from "react-native-reanimated";

import { signup as signupRequest } from "@/api/auth";
import { Button } from "@/components/ui/button";
import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { HttpError } from "@/lib/http-error";
import { theme } from "@/lib/theme";
import { toast } from "sonner-native";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type SignupFormValues = {
name: string;
email: string;
username: string;
password: string;
confirmPassword: string;
};

export default function SignupScreen() {
const router = useRouter();
const {
control,
handleSubmit,
setError,
watch,
formState: { errors, isSubmitting },
} = useForm<SignupFormValues>({
defaultValues: {
name: "",
email: "",
username: "",
password: "",
confirmPassword: "",
},
});
const passwordValue = watch("password");
const buttonScale = useSharedValue(1);

const buttonAnimatedStyle = useAnimatedStyle(() => ({
transform: [{ scale: buttonScale.value }],
}));

const onSubmit = async ({ confirmPassword, ...values }: SignupFormValues) => {
try {
const response = await signupRequest(values);

      // show("Account created! Enter the code we emailed you.", "success");
      // router.push({
      //   pathname: "/(auth)/OtpVerificationScreen",
      //   params: { email: values.email },
      // });

      if (response) {
        toast.info(`An OTP code has been sent to ${values.email}`);
        router.push({
          pathname: "/(auth)/OtpVerificationScreen",
          params: { email: values.email },
        });
      }
    } catch (error) {
      if (error instanceof HttpError) {
        error.applyValidations(setError);
        toast.error(error.message ?? "Unable to create your account");
      } else {
        toast.error("Unable to create your account");
      }
    }

};

return (
<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
<View className="flex-1 bg-background">
<StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
<KeyboardAvoidingView
className="flex-1"
behavior={Platform.select({ ios: "padding", android: undefined })} >
<AnimatedScrollView
entering={FadeInUp.duration(500)}
keyboardShouldPersistTaps="handled"
contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingVertical: 48,
            }}
className="flex-1" >
<AnimatedView className="flex-1 items-center justify-center">
<Animated.View
entering={FadeInDown.delay(140).duration(500)}
className="w-full max-w-md items-stretch gap-10" >
<View className="items-center gap-3">
<Text className="text-sm uppercase tracking-[0.3em] text-primary">
Join Tarkeeb
</Text>
<Text className="text-3xl font-semibold text-foreground text-center">
Create your account
</Text>
<Text className="text-base text-muted-foreground text-center">
Set up your workspace to collaborate, plan, and grow with
clarity.
</Text>
</View>

                <Card>
                  <CardHeader className="mb-8">
                    <CardTitle>Tell us about you</CardTitle>
                    <CardDescription>
                      We&apos;ll personalize your experience based on your
                      account details.
                    </CardDescription>
                  </CardHeader>

                  <Animated.View
                    entering={FadeInDown.delay(260).duration(500)}
                    className="gap-6"
                  >
                    <CardContent>
                      <View>
                        <Controller
                          control={control}
                          name="name"
                          rules={{
                            required: "Please tell us your name.",
                            minLength: {
                              value: 2,
                              message: "Use at least 2 characters.",
                            },
                          }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                              value={value}
                              onBlur={onBlur}
                              onChangeText={onChange}
                              placeholder="Full name"
                              autoCapitalize="words"
                              textContentType="name"
                              returnKeyType="next"
                            />
                          )}
                        />
                        {errors.name ? (
                          <Text className="mt-1 text-sm text-destructive">
                            {errors.name.message}
                          </Text>
                        ) : null}
                      </View>

                      <View>
                        <Controller
                          control={control}
                          name="email"
                          rules={{
                            required: "Email is required",
                            pattern: {
                              value: emailRegex,
                              message: "Please enter a valid email address.",
                            },
                          }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                              value={value}
                              onBlur={onBlur}
                              onChangeText={onChange}
                              placeholder="Email"
                              keyboardType="email-address"
                              autoCapitalize="none"
                              autoComplete="email"
                              textContentType="emailAddress"
                              returnKeyType="next"
                            />
                          )}
                        />
                        {errors.email ? (
                          <Text className="mt-1 text-sm text-destructive">
                            {errors.email.message}
                          </Text>
                        ) : null}
                      </View>

                      <View>
                        <Controller
                          control={control}
                          name="username"
                          rules={{
                            required: "Username is required",
                            minLength: {
                              value: 3,
                              message:
                                "Usernames must be at least 3 characters.",
                            },
                          }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                              value={value}
                              onBlur={onBlur}
                              onChangeText={(text) =>
                                onChange(text.trimStart())
                              }
                              placeholder="Username"
                              autoCapitalize="none"
                              autoComplete="username"
                              textContentType="username"
                              returnKeyType="next"
                            />
                          )}
                        />
                        {errors.username ? (
                          <Text className="mt-1 text-sm text-destructive">
                            {errors.username.message}
                          </Text>
                        ) : null}
                      </View>

                      <View>
                        <Controller
                          control={control}
                          name="password"
                          rules={{
                            required: "Password is required",
                            minLength: {
                              value: 8,
                              message:
                                "Use at least 8 characters for a strong password.",
                            },
                          }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                              value={value}
                              onBlur={onBlur}
                              onChangeText={onChange}
                              placeholder="Password"
                              secureTextEntry
                              autoCapitalize="none"
                              autoComplete="password"
                              textContentType="newPassword"
                              returnKeyType="next"
                            />
                          )}
                        />
                        {errors.password ? (
                          <Text className="mt-1 text-sm text-destructive">
                            {errors.password.message}
                          </Text>
                        ) : null}
                      </View>

                      <View>
                        <Controller
                          control={control}
                          name="confirmPassword"
                          rules={{
                            required: "Please confirm your password",
                            validate: (value) =>
                              value === passwordValue ||
                              "Passwords need to match.",
                          }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                              value={value}
                              onBlur={onBlur}
                              onChangeText={onChange}
                              placeholder="Confirm password"
                              secureTextEntry
                              autoCapitalize="none"
                              textContentType="newPassword"
                              returnKeyType="done"
                            />
                          )}
                        />
                        {errors.confirmPassword ? (
                          <Text className="mt-1 text-sm text-destructive">
                            {errors.confirmPassword.message}
                          </Text>
                        ) : null}
                      </View>
                    </CardContent>
                  </Animated.View>

                  <Animated.View
                    entering={FadeInDown.delay(380).duration(500)}
                    style={buttonAnimatedStyle}
                  >
                    <Button
                      className="mt-8 bg-primary"
                      onPressIn={() => {
                        buttonScale.value = withTiming(0.97, { duration: 120 });
                      }}
                      onPressOut={() => {
                        buttonScale.value = withTiming(1, { duration: 120 });
                      }}
                      onPress={handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <View className="flex-row items-center justify-center gap-2">
                          <Loader
                            size="small"
                            color={theme.colors.primaryForeground}
                          />
                          <Text className="text-base font-semibold text-primary-foreground">
                            Creating account...
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-base font-semibold text-primary-foreground">
                          Create account
                        </Text>
                      )}
                    </Button>
                  </Animated.View>
                </Card>

                <Animated.View
                  entering={FadeInDown.delay(480).duration(500)}
                  className="flex-row items-center justify-center"
                >
                  <Text className="text-base text-muted-foreground">
                    Already have an account?
                  </Text>
                  <Button
                    variant="link"
                    className="ml-1"
                    onPress={() => router.push("/(auth)/LoginScreen")}
                  >
                    Sign in
                  </Button>
                </Animated.View>
              </Animated.View>
            </AnimatedView>
          </AnimatedScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>

);
}
