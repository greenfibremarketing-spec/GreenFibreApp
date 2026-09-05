import React from "react";
import { privacyPolicy } from "../data/legalContent";
import { LegalPageView } from "../components/common/LegalPageView";

export function PrivacyPolicyScreen({ navigation }) {
  return <LegalPageView page={privacyPolicy} navigation={navigation} />;
}
