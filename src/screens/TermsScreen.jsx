// src/screens/TermsScreen.jsx
import React from "react";
import { termsAndConditions } from "../data/legalContent";
import { LegalPageView } from "../components/common/LegalPageView";

export function TermsScreen({ navigation }) {
  return <LegalPageView page={termsAndConditions} navigation={navigation} />;
}
