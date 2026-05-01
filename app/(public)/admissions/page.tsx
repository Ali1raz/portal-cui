import { Metadata } from "next";
import { AdmissionPageComp } from "../_components/AdmissionPageComp";

export const metadata: Metadata = {
  title: "Admissions",
  description:
    "Explore COMSATS University Islamabad admissions information and start your application.",
};

export default function AdmissionsPage() {
  return <AdmissionPageComp />;
}
