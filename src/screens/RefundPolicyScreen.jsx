
import React from "react";
import { refundPolicy } from "../data/legalContent";
import { LegalPageView } from "../components/common/LegalPageView";

export function RefundPolicyScreen({ navigation }) {
  return <LegalPageView page={refundPolicy} navigation={navigation} />;
}
