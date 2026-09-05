import React from "react";
import { shippingPolicy } from "../data/legalContent";
import { LegalPageView } from "../components/common/LegalPageView";

export function ShippingPolicyScreen({ navigation }) {
  return <LegalPageView page={shippingPolicy} navigation={navigation} />;
}
