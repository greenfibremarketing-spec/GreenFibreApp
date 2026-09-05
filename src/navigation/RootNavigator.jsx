import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

// Navigation
import { DrawerNavigator } from "./DrawerNavigator";

import { SplashScreen } from "../screens/SplashScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { ProductListingScreen } from "../screens/ProductListingScreen";
import { ProductDetailsScreen } from "../screens/ProductDetailsScreen";
import { CartScreen } from "../screens/CartScreen";
import { CheckoutScreen } from "../screens/CheckoutScreen";
import { BlogDetailsScreen } from "../screens/BlogDetailsScreen";
import { TrackOrderScreen } from "../screens/TrackOrderScreen";
import { EasebuzzPaymentScreen } from "../screens/EasebuzzPaymentScreen";
import { RazorpayPaymentScreen } from "../screens/RazorpayPaymentScreen";
import { OrderConfirmationScreen } from "../screens/OrderConfirmationScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { VerifyEmailScreen } from "../screens/VerifyEmailScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { WishlistScreen } from "../screens/WishlistScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";

// Debug - Check if all components are loaded

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />

      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: "#FFF8F0",
          },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            animation: "fade",
          }}
        />

        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            animation: "fade",
          }}
        />

        <Stack.Screen
          name="Main"
          component={DrawerNavigator}
          options={{
            animation: "fade",
          }}
        />

        <Stack.Screen name="ProductListing" component={ProductListingScreen} />

        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />

        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="Wishlist"
          component={WishlistScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />

        <Stack.Screen name="BlogDetails" component={BlogDetailsScreen} />

        <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />

        <Stack.Screen
          name="RazorpayPayment"
          component={RazorpayPaymentScreen}
          options={{ presentation: "fullScreenModal", headerShown: false }}
        />

        <Stack.Screen
          name="EasebuzzPayment"
          component={RazorpayPaymentScreen}
          options={{ presentation: "fullScreenModal", headerShown: false }}
        />

        <Stack.Screen
          name="OrderConfirmation"
          component={OrderConfirmationScreen}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="VerifyEmail"
          component={VerifyEmailScreen}
          options={{
            presentation: "modal",
          }}
        />

        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="RestPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
